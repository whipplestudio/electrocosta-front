"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import customReportsService from "@/services/custom-reports.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Download, Save, Edit, Trash2, ChevronDown, Settings, FileText, Loader2, Eye } from "lucide-react"
import * as XLSX from 'xlsx'

const reportesGuardados = [
  {
    id: 1,
    nombre: "Flujo de Efectivo Semanal",
    descripcion: "Reporte de ingresos y egresos por semana",
    fechaCreacion: "2024-01-10",
    ultimaEjecucion: "2024-01-15",
    frecuencia: "Semanal",
    estado: "activo",
  },
  {
    id: 2,
    nombre: "Clientes Morosos",
    descripcion: "Listado de clientes con facturas vencidas > 60 días",
    fechaCreacion: "2024-01-05",
    ultimaEjecucion: "2024-01-14",
    frecuencia: "Mensual",
    estado: "activo",
  },
  {
    id: 3,
    nombre: "Análisis de Rentabilidad por Producto",
    descripcion: "Margen de ganancia por línea de productos",
    fechaCreacion: "2023-12-20",
    ultimaEjecucion: "2024-01-01",
    frecuencia: "Trimestral",
    estado: "inactivo",
  },
]

const camposDisponibles = [
  { id: "cliente", nombre: "Cliente", tabla: "clientes" },
  { id: "factura", nombre: "Número de Factura", tabla: "facturas" },
  { id: "fecha", nombre: "Fecha", tabla: "facturas" },
  { id: "monto", nombre: "Monto", tabla: "facturas" },
  { id: "estado", nombre: "Estado", tabla: "facturas" },
  { id: "vendedor", nombre: "Vendedor", tabla: "usuarios" },
  { id: "categoria", nombre: "Categoría", tabla: "productos" },
  { id: "proveedor", nombre: "Proveedor", tabla: "proveedores" },
  { id: "fechaVencimiento", nombre: "Fecha Vencimiento", tabla: "facturas" },
  { id: "diasVencido", nombre: "Días Vencido", tabla: "calculado" },
]

export default function ReportesPersonalizadosPage() {
  const { toast } = useToast()
  const [camposSeleccionados, setCamposSeleccionados] = useState<string[]>([])
  const [nombreReporte, setNombreReporte] = useState("")
  const [descripcionReporte, setDescripcionReporte] = useState("")
  const [reportesGuardadosData, setReportesGuardadosData] = useState<any[]>([])
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("")
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [agrupacion, setAgrupacion] = useState("none")
  const [ordenamiento, setOrdenamiento] = useState("fecha_desc")
  const [cargando, setCargando] = useState(false)
  const [ejecutando, setEjecutando] = useState(false)
  const [reporteEjecutandoId, setReporteEjecutandoId] = useState<string | null>(null)
  const [descargando, setDescargando] = useState(false)
  
  // Estados para visualización de reportes
  const [mostrarModalVisualizacion, setMostrarModalVisualizacion] = useState(false)
  const [reporteVisualizando, setReporteVisualizando] = useState<any>(null)
  const [datosReporteVisualizacion, setDatosReporteVisualizacion] = useState<any>(null)
  const [cargandoVisualizacion, setCargandoVisualizacion] = useState(false)

  const toggleCampo = (campoId: string) => {
    setCamposSeleccionados((prev) =>
      prev.includes(campoId) ? prev.filter((id) => id !== campoId) : [...prev, campoId],
    )
  }

  useEffect(() => {
    cargarReportesGuardados()
  }, [])

  const cargarReportesGuardados = async () => {
    try {
      const data = await customReportsService.getReportes()
      // Mapear datos del backend al formato esperado por la tabla
      const reportesMapeados = (data.data || []).map((reporte: any) => ({
        id: reporte.id,
        nombre: reporte.nombre,
        descripcion: reporte.descripcion || 'Sin descripción',
        tipoBase: reporte.tipoBase,
        configuracion: reporte.configuracion,
        esPublico: reporte.esPublico,
        autor: reporte.autor,
        frecuencia: reporte.vecesEjecutado > 0 ? `${reporte.vecesEjecutado}x ejecutado` : 'Sin ejecutar',
        ultimaEjecucion: reporte.ultimaEjecucion 
          ? new Date(reporte.ultimaEjecucion).toLocaleDateString('es-MX', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Nunca',
        estado: reporte.vecesEjecutado > 0 ? 'activo' : 'pendiente',
        fechaCreacion: reporte.fechaCreacion
      }))
      setReportesGuardadosData(reportesMapeados)
    } catch (error) {
      console.error('Error al cargar reportes:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los reportes guardados"
      })
    }
  }

  const handleGuardarReporte = async () => {
    if (!nombreReporte) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes ingresar un nombre para el reporte"
      })
      return
    }

    if (camposSeleccionados.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes seleccionar al menos un campo"
      })
      return
    }

    try {
      setCargando(true)
      await customReportsService.crearReporte({
        nombre: nombreReporte,
        descripcion: descripcionReporte,
        tipoBase: 'cuentas_cobrar',
        configuracion: {
          campos: camposSeleccionados,
          filtros: {
            fechaDesde: filtroFechaDesde,
            fechaHasta: filtroFechaHasta,
            estado: filtroEstado
          },
          agrupacion: agrupacion === 'none' ? null : agrupacion,
          ordenamiento
        }
      })

      toast({
        title: "Reporte guardado",
        description: `El reporte "${nombreReporte}" se ha guardado exitosamente`
      })

      // Limpiar formulario
      setNombreReporte('')
      setDescripcionReporte('')
      setCamposSeleccionados([])
      setFiltroFechaDesde('')
      setFiltroFechaHasta('')
      setFiltroEstado('todos')
      setAgrupacion('none')
      setOrdenamiento('fecha_desc')

      // Recargar lista
      cargarReportesGuardados()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el reporte"
      })
    } finally {
      setCargando(false)
    }
  }

  const handleEjecutarReporte = async (reporteId?: string) => {
    try {
      setEjecutando(true)
      if (reporteId) {
        setReporteEjecutandoId(reporteId)
      }
      
      if (reporteId) {
        const resultado = await customReportsService.ejecutarReporte(reporteId)
        toast({
          title: "✅ Reporte ejecutado exitosamente",
          description: `${resultado.nombre} - ${resultado.totalRegistros} registros obtenidos`,
        })
        
        // Mostrar datos en consola para debugging
        console.log('📊 Resultados del reporte:', {
          nombre: resultado.nombre,
          totalRegistros: resultado.totalRegistros,
          fechaEjecucion: resultado.fechaEjecucion,
          datos: resultado.resultados
        })

        // Recargar lista para actualizar contador de ejecuciones
        await cargarReportesGuardados()
      } else {
        toast({
          title: "Reporte ejecutado",
          description: "Vista previa del reporte generada"
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al ejecutar",
        description: error.response?.data?.message || "No se pudo ejecutar el reporte"
      })
    } finally {
      setEjecutando(false)
      setReporteEjecutandoId(null)
    }
  }

  const handleEliminarReporte = async (reporteId: string) => {
    const reporte = reportesGuardadosData.find(r => r.id === reporteId)
    const nombreReporte = reporte?.nombre || 'este reporte'
    
    if (!confirm(`¿Estás seguro de eliminar "${nombreReporte}"? Esta acción no se puede deshacer.`)) return

    try {
      setCargando(true)
      await customReportsService.eliminarReporte(reporteId)
      toast({
        title: "🗑️ Reporte eliminado",
        description: `"${nombreReporte}" se ha eliminado exitosamente`
      })
      // Recargar lista
      await cargarReportesGuardados()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: error.response?.data?.message || "No se pudo eliminar el reporte"
      })
    } finally {
      setCargando(false)
    }
  }

  const handleDescargarReporteGuardado = async (reporteId: string) => {
    try {
      setDescargando(true)
      setReporteEjecutandoId(reporteId)

      // Obtener datos del reporte
      const reporteInfo = await customReportsService.getReportePorId(reporteId)
      
      // Ejecutar el reporte para obtener datos reales
      const resultado = await customReportsService.ejecutarReporte(reporteId)
      
      // Crear un nuevo libro de Excel
      const wb = XLSX.utils.book_new()

      // Información del reporte
      const infoData = [
        ['REPORTE PERSONALIZADO'],
        ['Nombre:', reporteInfo.nombre],
        ['Descripción:', reporteInfo.descripcion || 'Sin descripción'],
        ['Fecha de generación:', new Date().toLocaleDateString('es-MX')],
        ['Total de registros:', resultado.totalRegistros || 0],
        ['Autor:', reporteInfo.autor],
        []
      ]

      // Obtener configuración del reporte
      const config = reporteInfo.configuracion || {}
      const camposConfig = config.campos || []

      // Crear encabezados basados en campos del reporte
      const headers = camposConfig.map((campoId: string) => {
        const campo = camposDisponibles.find(c => c.id === campoId)
        return campo?.nombre || campoId
      })

      // Convertir datos reales del backend a formato de Excel
      const datosReales = resultado.resultados || []
      const datosExcel = datosReales.map((registro: any) => {
        return camposConfig.map((campoId: string) => {
          const valor = registro[campoId]
          if (valor === null || valor === undefined) return '-'
          if (valor instanceof Date) return valor.toLocaleDateString('es-MX')
          if (typeof valor === 'number') return valor
          return String(valor)
        })
      })

      // Combinar información y datos
      const reporteCompleto = [
        ...infoData, 
        ['DATOS DEL REPORTE'], 
        [],
        headers,
        ...datosExcel
      ]

      // Crear hoja
      const ws = XLSX.utils.aoa_to_sheet(reporteCompleto)

      // Ajustar ancho de columnas
      const colWidths = headers.map(() => ({ wch: 20 }))
      ws['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, 'Reporte Personalizado')

      // Generar nombre de archivo
      const nombreArchivo = `${reporteInfo.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`

      // Descargar archivo
      XLSX.writeFile(wb, nombreArchivo)

      toast({
        title: "Reporte descargado",
        description: `${reporteInfo.nombre} - ${resultado.totalRegistros || 0} registros`
      })
    } catch (error: any) {
      console.error('Error al descargar reporte:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo descargar el reporte"
      })
    } finally {
      setDescargando(false)
      setReporteEjecutandoId(null)
    }
  }

  const handleVisualizarReporte = async (reporteId: string) => {
    try {
      setCargandoVisualizacion(true)
      setMostrarModalVisualizacion(true)

      // Obtener información del reporte
      const reporteInfo = await customReportsService.getReportePorId(reporteId)
      console.log('📋 Info del reporte:', reporteInfo)
      setReporteVisualizando(reporteInfo)

      // Ejecutar el reporte para obtener datos
      const resultado = await customReportsService.ejecutarReporte(reporteId)
      console.log('📊 Resultado de ejecutar reporte:', resultado)
      setDatosReporteVisualizacion(resultado)

      if (!resultado.resultados || resultado.resultados.length === 0) {
        console.warn('⚠️ No se obtuvieron resultados del reporte')
      }

    } catch (error: any) {
      console.error('❌ Error al visualizar reporte:', error)
      toast({
        variant: "destructive",
        title: "Error al cargar datos",
        description: error.message || "No se pudo cargar la visualización del reporte"
      })
      setMostrarModalVisualizacion(false)
    } finally {
      setCargandoVisualizacion(false)
    }
  }

  const handleDescargarReporte = async () => {
    if (camposSeleccionados.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes seleccionar al menos un campo para generar el reporte"
      })
      return
    }

    try {
      setDescargando(true)

      // Crear reporte temporal o usar existente
      const reporteData = {
        nombre: nombreReporte || 'Reporte Temporal',
        descripcion: descripcionReporte,
        tipoBase: 'cuentas_cobrar',
        configuracion: {
          campos: camposSeleccionados,
          filtros: {
            fechaDesde: filtroFechaDesde,
            fechaHasta: filtroFechaHasta,
            estado: filtroEstado
          },
          agrupacion: agrupacion === 'none' ? null : agrupacion,
          ordenamiento
        }
      }

      // Guardar el reporte
      const reporteCreado = await customReportsService.crearReporte(reporteData)
      
      // Ejecutar el reporte para obtener datos reales
      const resultado = await customReportsService.ejecutarReporte(reporteCreado.id)
      
      // Crear un nuevo libro de Excel
      const wb = XLSX.utils.book_new()

      // Información del reporte
      const infoData = [
        ['REPORTE PERSONALIZADO'],
        ['Nombre:', nombreReporte || 'Reporte sin nombre'],
        ['Descripción:', descripcionReporte || 'Sin descripción'],
        ['Fecha de generación:', new Date().toLocaleDateString('es-MX')],
        ['Total de registros:', resultado.totalRegistros || 0],
        [],
        ['CONFIGURACIÓN'],
        ['Campos incluidos:', camposSeleccionados.length],
        ['Filtro fecha desde:', filtroFechaDesde || 'Sin filtro'],
        ['Filtro fecha hasta:', filtroFechaHasta || 'Sin filtro'],
        ['Estado:', filtroEstado],
        ['Agrupación:', agrupacion === 'none' ? 'Sin agrupación' : agrupacion],
        ['Ordenamiento:', ordenamiento],
        []
      ]

      // Crear encabezados basados en campos seleccionados
      const headers = camposSeleccionados.map(campoId => {
        const campo = camposDisponibles.find(c => c.id === campoId)
        return campo?.nombre || campoId
      })

      // Convertir datos reales del backend a formato de Excel
      const datosReales = resultado.resultados || []
      const datosExcel = datosReales.map((registro: any) => {
        return camposSeleccionados.map(campoId => {
          const valor = registro[campoId]
          if (valor === null || valor === undefined) return '-'
          if (valor instanceof Date) return valor.toLocaleDateString('es-MX')
          if (typeof valor === 'number') return valor
          return String(valor)
        })
      })

      // Combinar información y datos
      const reporteCompleto = [
        ...infoData, 
        ['DATOS DEL REPORTE'], 
        [],
        headers,
        ...datosExcel
      ]

      // Crear hoja
      const ws = XLSX.utils.aoa_to_sheet(reporteCompleto)

      // Ajustar ancho de columnas
      const colWidths = headers.map(() => ({ wch: 20 }))
      ws['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, 'Reporte Personalizado')

      // Generar nombre de archivo
      const nombreArchivo = nombreReporte 
        ? `${nombreReporte.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
        : `reporte_personalizado_${new Date().toISOString().split('T')[0]}.xlsx`

      // Descargar archivo
      XLSX.writeFile(wb, nombreArchivo)

      toast({
        title: "Reporte descargado",
        description: `Reporte generado con ${resultado.totalRegistros || 0} registros`
      })

      // Recargar lista de reportes
      await cargarReportesGuardados()
    } catch (error: any) {
      console.error('Error al descargar reporte:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo descargar el reporte"
      })
    } finally {
      setDescargando(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    return estado === "activo" ? (
      <Badge className="bg-green-100 text-green-800">Activo</Badge>
    ) : (
      <Badge variant="secondary">Inactivo</Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes Personalizados</h1>
        <p className="text-muted-foreground">Crea y gestiona reportes adaptados a tus necesidades</p>
      </div>

      <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Constructor de Reportes</CardTitle>
                  <CardDescription>Selecciona los campos y filtros para tu reporte personalizado</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Información básica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre">Nombre del Reporte</Label>
                      <Input
                        id="nombre"
                        placeholder="Ej: Ventas por Vendedor"
                        value={nombreReporte}
                        onChange={(e) => setNombreReporte(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Input
                        id="descripcion"
                        placeholder="Breve descripción del reporte"
                        value={descripcionReporte}
                        onChange={(e) => setDescripcionReporte(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Selección de campos */}
                  <div>
                    <Label className="text-base font-semibold">Campos a Incluir</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                      {camposDisponibles.map((campo) => (
                        <div key={campo.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={campo.id}
                            checked={camposSeleccionados.includes(campo.id)}
                            onCheckedChange={() => toggleCampo(campo.id)}
                          />
                          <Label htmlFor={campo.id} className="text-sm">
                            {campo.nombre}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filtros */}
                  <div>
                    <Label className="text-base font-semibold">Filtros</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <div>
                        <Label htmlFor="fechaDesde">Fecha Desde</Label>
                        <Input id="fechaDesde" type="date" value={filtroFechaDesde} onChange={(e) => setFiltroFechaDesde(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="fechaHasta">Fecha Hasta</Label>
                        <Input id="fechaHasta" type="date" value={filtroFechaHasta} onChange={(e) => setFiltroFechaHasta(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="estado">Estado</Label>
                        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="pagado">Pagado</SelectItem>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="vencido">Vencido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Agrupación y ordenamiento */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="agrupar">Agrupar por</Label>
                      <Select value={agrupacion} onValueChange={setAgrupacion}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin agrupación" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin agrupación</SelectItem>
                          <SelectItem value="cliente">Cliente</SelectItem>
                          <SelectItem value="vendedor">Vendedor</SelectItem>
                          <SelectItem value="mes">Mes</SelectItem>
                          <SelectItem value="categoria">Categoría</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="ordenar">Ordenar por</Label>
                      <Select value={ordenamiento} onValueChange={setOrdenamiento}>
                        <SelectTrigger>
                          <SelectValue placeholder="Fecha (desc)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fecha_desc">Fecha (más reciente)</SelectItem>
                          <SelectItem value="fecha_asc">Fecha (más antigua)</SelectItem>
                          <SelectItem value="monto_desc">Monto (mayor a menor)</SelectItem>
                          <SelectItem value="monto_asc">Monto (menor a mayor)</SelectItem>
                          <SelectItem value="cliente">Cliente (A-Z)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Botón de descarga */}
                  <div className="flex gap-3">
                    <Button 
                      className="bg-green-600 hover:bg-green-700" 
                      onClick={handleDescargarReporte}
                      disabled={descargando || camposSeleccionados.length === 0}
                    >
                      {descargando ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Descargando...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Descargar Reporte
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Vista Previa</CardTitle>
                  <CardDescription>Campos seleccionados: {camposSeleccionados.length}</CardDescription>
                </CardHeader>
                <CardContent>
                  {camposSeleccionados.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Campos incluidos:</p>
                      <div className="space-y-1">
                        {camposSeleccionados.map((campoId) => {
                          const campo = camposDisponibles.find((c) => c.id === campoId)
                          return (
                            <Badge key={campoId} variant="outline" className="mr-1 mb-1">
                              {campo?.nombre}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Selecciona campos para ver la vista previa</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reportes Guardados */}
          {reportesGuardadosData.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Reportes Guardados</CardTitle>
                <CardDescription>Tus reportes personalizados disponibles</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Última Ejecución</TableHead>
                      <TableHead>Frecuencia</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportesGuardadosData.map((reporte) => (
                      <TableRow key={reporte.id}>
                        <TableCell className="font-medium">{reporte.nombre}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{reporte.descripcion}</TableCell>
                        <TableCell className="text-sm">{reporte.ultimaEjecucion}</TableCell>
                        <TableCell className="text-sm">{reporte.frecuencia}</TableCell>
                        <TableCell>
                          <Badge variant={reporte.estado === 'activo' ? 'default' : 'secondary'}>
                            {reporte.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVisualizarReporte(reporte.id)}
                              disabled={cargandoVisualizacion}
                              title="Ver reporte"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDescargarReporteGuardado(reporte.id)}
                              disabled={descargando && reporteEjecutandoId === reporte.id}
                              title="Descargar reporte"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              {descargando && reporteEjecutandoId === reporte.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEliminarReporte(reporte.id)}
                              disabled={cargando}
                              title="Eliminar reporte"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Modal para Visualizar Reporte */}
          <Dialog open={mostrarModalVisualizacion} onOpenChange={(open) => {
            setMostrarModalVisualizacion(open)
            if (!open) {
              setReporteVisualizando(null)
              setDatosReporteVisualizacion(null)
              setCargandoVisualizacion(false)
            }
          }}>
            <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {reporteVisualizando?.nombre || 'Visualización de Reporte'}
                </DialogTitle>
                <DialogDescription>
                  {reporteVisualizando?.descripcion || 'Datos del reporte personalizado'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                {cargandoVisualizacion ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2">Cargando datos...</span>
                  </div>
                ) : datosReporteVisualizacion?.resultados ? (
                  <div className="space-y-4">
                    {/* Información del reporte */}
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Total de Registros</p>
                            <p className="text-2xl font-bold text-blue-900">{datosReporteVisualizacion.totalRegistros || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Campos</p>
                            <p className="text-lg font-semibold">{reporteVisualizando?.configuracion?.campos?.length || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Tipo Base</p>
                            <p className="text-sm font-medium capitalize">{reporteVisualizando?.tipoBase || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Autor</p>
                            <p className="text-sm font-medium">{reporteVisualizando?.autor || 'N/A'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tabla de datos */}
                    {datosReporteVisualizacion.resultados.length > 0 ? (
                      <div className="max-h-96 overflow-auto border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {Object.keys(datosReporteVisualizacion.resultados[0]).map((key) => (
                                <TableHead key={key} className="capitalize">{key}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {datosReporteVisualizacion.resultados.map((registro: any, index: number) => (
                              <TableRow key={index}>
                                {Object.values(registro).map((valor: any, idx: number) => (
                                  <TableCell key={idx}>
                                    {valor instanceof Date 
                                      ? valor.toLocaleDateString('es-MX')
                                      : typeof valor === 'number'
                                      ? valor.toLocaleString('es-MX')
                                      : String(valor)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">No hay datos para mostrar</p>
                    )}
                  </div>
                ) : datosReporteVisualizacion ? (
                  <div className="space-y-4">
                    <Card className="bg-amber-50 border-amber-300">
                      <CardContent className="p-6 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="rounded-full bg-amber-100 p-3">
                            <FileText className="h-8 w-8 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-amber-900">No se encontraron datos</p>
                            <p className="text-sm text-amber-700 mt-1">
                              El reporte se ejecutó correctamente pero no hay registros que coincidan con los filtros aplicados
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 space-y-1">
                            <p><strong>Tipo:</strong> {reporteVisualizando?.tipoBase}</p>
                            {reporteVisualizando?.configuracion?.filtros && (
                              <div className="mt-2">
                                <p className="font-medium">Filtros aplicados:</p>
                                <pre className="text-left bg-white p-2 rounded mt-1 max-w-md">
                                  {JSON.stringify(reporteVisualizando.configuracion.filtros, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                          <details className="mt-3 w-full">
                            <summary className="text-xs cursor-pointer text-blue-600 hover:text-blue-800">Ver respuesta completa de la API</summary>
                            <pre className="mt-2 text-xs bg-white p-3 rounded overflow-auto max-h-40 text-left border">
                              {JSON.stringify(datosReporteVisualizacion, null, 2)}
                            </pre>
                          </details>
                          <p className="text-xs text-muted-foreground mt-4 max-w-lg">
                            💡 <strong>Sugerencia:</strong> Verifica que haya datos en la base de datos para el tipo de reporte "{reporteVisualizando?.tipoBase}" 
                            o ajusta los filtros del reporte.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No hay datos disponibles</p>
                )}
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setMostrarModalVisualizacion(false)}
                >
                  Cerrar
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    if (reporteVisualizando?.id) {
                      handleDescargarReporteGuardado(reporteVisualizando.id)
                    }
                  }}
                  disabled={!reporteVisualizando?.id || (descargando && reporteEjecutandoId === reporteVisualizando?.id)}
                >
                  {descargando && reporteEjecutandoId === reporteVisualizando?.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Descargando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Excel
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </div>
    </div>
  )
}
