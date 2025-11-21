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
import { Plus, Download, Play, Save, Edit, Trash2, ChevronDown, Settings, FileText, Loader2 } from "lucide-react"
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
          title: "✅ Reporte ejecutado",
          description: `Se obtuvieron ${resultado.totalRegistros} registros`,
        })
        
        // Opcional: Abrir modal o descargar resultados
        console.log('Datos del reporte:', resultado.datos)
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

      // Crear un nuevo libro de Excel
      const wb = XLSX.utils.book_new()

      // Información del reporte
      const infoData = [
        ['REPORTE PERSONALIZADO'],
        ['Nombre:', nombreReporte || 'Reporte sin nombre'],
        ['Descripción:', descripcionReporte || 'Sin descripción'],
        ['Fecha de generación:', new Date().toLocaleDateString('es-MX')],
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

      // Agregar datos de ejemplo (en producción estos vendrían del backend)
      const datosEjemplo = [
        headers,
        ...Array(10).fill(null).map((_, i) => 
          camposSeleccionados.map(campoId => {
            switch(campoId) {
              case 'cliente': return `Cliente ${i + 1}`
              case 'factura': return `FAC-2024-${String(i + 1).padStart(4, '0')}`
              case 'fecha': return new Date(2024, 0, i + 1).toLocaleDateString('es-MX')
              case 'monto': return `$${(Math.random() * 10000).toFixed(2)}`
              case 'estado': return ['Pagado', 'Pendiente', 'Vencido'][Math.floor(Math.random() * 3)]
              case 'vendedor': return `Vendedor ${i + 1}`
              case 'categoria': return ['Producto A', 'Producto B', 'Servicio C'][Math.floor(Math.random() * 3)]
              case 'proveedor': return `Proveedor ${i + 1}`
              case 'fechaVencimiento': return new Date(2024, 0, i + 15).toLocaleDateString('es-MX')
              case 'diasVencido': return Math.floor(Math.random() * 30)
              default: return '-'
            }
          })
        )
      ]

      // Combinar información y datos
      const reporteCompleto = [...infoData, ['DATOS DEL REPORTE'], [], ...datosEjemplo]

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
        description: "El reporte se ha descargado exitosamente"
      })
    } catch (error) {
      console.error('Error al descargar reporte:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo descargar el reporte"
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

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Formatos de Exportación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="excel" defaultChecked />
                    <Label htmlFor="excel">Excel (.xlsx)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="csv" />
                    <Label htmlFor="csv">CSV (.csv)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pdf" />
                    <Label htmlFor="pdf">PDF (.pdf)</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
      </div>
    </div>
  )
}
