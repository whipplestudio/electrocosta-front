"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { reportsService } from "@/services/reports.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, Settings, Play, Pause, Trash2, Loader2, Eye } from "lucide-react"

export default function ReportesDescargablesPage() {
  const { toast } = useToast()
  const [formatoSeleccionado, setFormatoSeleccionado] = useState("excel")
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("mes-actual")
  const [incluirGraficos, setIncluirGraficos] = useState("si")
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState("todos")
  const [progreso, setProgreso] = useState(0)
  const [generando, setGenerando] = useState(false)

  // Estados para datos del backend
  const [tiposReporte, setTiposReporte] = useState<any[]>([])
  const [tiposSeleccionados, setTiposSeleccionados] = useState<string[]>(["cuentas-cobrar", "cuentas-pagar"])
  const [reportesProgramados, setReportesProgramados] = useState<any[]>([])
  const [reportesGenerados, setReportesGenerados] = useState<any[]>([])
  const [proyectos, setProyectos] = useState<any[]>([])
  
  // Estados para modal de nuevo reporte programado
  const [mostrarModalProgramado, setMostrarModalProgramado] = useState(false)
  const [nombreProgramado, setNombreProgramado] = useState('')
  const [tiposProgramados, setTiposProgramados] = useState<string[]>([])
  const [frecuenciaProgramada, setFrecuenciaProgramada] = useState('mensual')
  const [formatoProgramado, setFormatoProgramado] = useState('excel')
  
  // Estados para modal de editar reporte programado
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
  const [reporteEditando, setReporteEditando] = useState<any>(null)
  
  // Estado para descarga en progreso
  const [descargandoReporteId, setDescargandoReporteId] = useState<string | null>(null)
  
  // Estados para visualización de reportes
  const [mostrarModalVisualizacion, setMostrarModalVisualizacion] = useState(false)
  const [reporteVisualizando, setReporteVisualizando] = useState<any>(null)
  const [datosReporteVisualizacion, setDatosReporteVisualizacion] = useState<any>(null)
  const [cargandoVisualizacion, setCargandoVisualizacion] = useState(false)

  // Cargar tipos de reporte disponibles
  useEffect(() => {
    cargarTiposReporte()
    cargarReportesProgramados()
    cargarReportesGenerados()
    cargarProyectos()
  }, [])

  const cargarTiposReporte = async () => {
    // Tipos de reporte disponibles (datos estáticos)
    const tiposDisponibles = [
      {
        id: 'cuentas-cobrar',
        nombre: 'Cuentas por Cobrar',
        descripcion: 'Reporte de facturas pendientes de cobro'
      },
      {
        id: 'cuentas-pagar',
        nombre: 'Cuentas por Pagar',
        descripcion: 'Reporte de facturas pendientes de pago'
      },
      {
        id: 'flujo-efectivo',
        nombre: 'Flujo de Efectivo',
        descripcion: 'Análisis de ingresos y egresos'
      },
      {
        id: 'estado-resultados',
        nombre: 'Estado de Resultados',
        descripcion: 'Resumen de ingresos, gastos y utilidad'
      }
    ]
    
    setTiposReporte(tiposDisponibles.map((tipo: any) => ({
      ...tipo,
      seleccionado: tiposSeleccionados.includes(tipo.id)
    })))
  }

  const cargarReportesProgramados = async () => {
    try {
      const data = await reportsService.getReportesProgramados()
      setReportesProgramados(data.data || [])
    } catch (error) {
      console.error('Error al cargar reportes programados:', error)
    }
  }

  const cargarReportesGenerados = async () => {
    try {
      const data = await reportsService.getReportesGenerados({ take: 50 })
      setReportesGenerados(data.data || [])
    } catch (error) {
      console.error('Error al cargar reportes generados:', error)
    }
  }

  const cargarProyectos = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      const response = await fetch(`${apiUrl}/carga/proyectos/listado?limit=100`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('📂 Proyectos cargados:', data)
        setProyectos(data.data || [])
      } else {
        console.error('Error al cargar proyectos, status:', response.status)
      }
    } catch (error) {
      console.error('Error al cargar proyectos:', error)
    }
  }

  const toggleTipoReporte = (tipoId: string) => {
    if (tiposSeleccionados.includes(tipoId)) {
      setTiposSeleccionados(tiposSeleccionados.filter(id => id !== tipoId))
    } else {
      setTiposSeleccionados([...tiposSeleccionados, tipoId])
    }
  }

  const estadoColors = {
    // Estados en español (legacy)
    activo: "bg-green-100 text-green-800",
    pausado: "bg-yellow-100 text-yellow-800",
    inactivo: "bg-gray-100 text-gray-800",
    completado: "bg-blue-100 text-blue-800",
    error: "bg-red-100 text-red-800",
    procesando: "bg-purple-100 text-purple-800",
    sugerido: "bg-orange-100 text-orange-800",
    // Estados en inglés (backend)
    active: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800",
    inactive: "bg-gray-100 text-gray-800",
  }

  const traducirEstado = (estado: string) => {
    const traducciones: Record<string, string> = {
      active: "Activo",
      paused: "Pausado",
      inactive: "Inactivo",
      completado: "Completado",
      error: "Error",
      procesando: "Procesando",
      sugerido: "Sugerido",
    }
    return traducciones[estado] || estado
  }

  const handleGenerarReporte = async () => {
    if (tiposSeleccionados.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes seleccionar al menos un tipo de reporte"
      })
      return
    }

    try {
      setGenerando(true)
      setProgreso(0)

      // Simular progreso mientras se genera
      const interval = setInterval(() => {
        setProgreso((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 15
        })
      }, 200)

      // Generar el reporte
      const resultado = await reportsService.generarReporte({
        tipos: tiposSeleccionados,
        formato: formatoSeleccionado,
        periodo: periodoSeleccionado,
        incluirGraficos: incluirGraficos === 'si'
      })

      clearInterval(interval)
      setProgreso(100)

      // Descargar reportes desde el backend con autenticación
      const token = localStorage.getItem('accessToken')
      
      if (!token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se encontró el token de autenticación. Por favor, inicia sesión nuevamente."
        })
        setGenerando(false)
        return
      }
      
      for (const tipo of tiposSeleccionados) {
        let endpoint = ''
        let fileName = ''
        
        switch (tipo) {
          case 'cuentas-cobrar':
            endpoint = 'cuentas-cobrar'
            fileName = 'cuentas_por_cobrar'
            break
          case 'cuentas-pagar':
            endpoint = 'cuentas-pagar'
            fileName = 'cuentas_por_pagar'
            break
          case 'flujo-efectivo':
            endpoint = 'flujo-efectivo'
            fileName = 'flujo_efectivo'
            break
          case 'estado-resultados':
            endpoint = 'estado-resultados'
            fileName = 'estado_resultados'
            break
          default:
            continue
        }

        // Agregar parámetros de período
        const params = new URLSearchParams()
        if (periodoSeleccionado === 'mes-actual') {
          const hoy = new Date()
          const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
          params.append('fechaInicio', primerDia.toISOString().split('T')[0])
          params.append('fechaFin', hoy.toISOString().split('T')[0])
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
        const url = `${apiUrl}/reports/downloadable/export/${endpoint}${params.toString() ? `?${params.toString()}` : ''}`
        
        // Descargar con autenticación
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            throw new Error('Error al descargar el reporte')
          }

          const blob = await response.blob()
          const downloadUrl = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = downloadUrl
          link.download = `${fileName}_${new Date().getTime()}.xlsx`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(downloadUrl)
        } catch (error) {
          console.error(`Error descargando ${tipo}:`, error)
        }
      }

      setTimeout(() => {
        setGenerando(false)
        toast({
          title: "Reportes descargados",
          description: `Se han descargado ${tiposSeleccionados.length} reporte(s) exitosamente`
        })
        cargarReportesGenerados()
      }, 500)

    } catch (error) {
      setGenerando(false)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo generar el reporte"
      })
    }
  }

  const handleCrearReporteProgramado = async () => {
    // Validación con mensajes específicos
    if (!nombreProgramado.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes ingresar un nombre para el reporte"
      })
      return
    }

    if (tiposProgramados.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes seleccionar al menos un tipo de reporte"
      })
      return
    }

    // Debug: ver qué se está enviando
    console.log('Datos a enviar:', {
      nombre: nombreProgramado,
      tipos: tiposProgramados,
      frecuencia: frecuenciaProgramada,
      formato: formatoProgramado
    })

    try {
      await reportsService.crearReporteProgramado({
        nombre: nombreProgramado,
        tipos: tiposProgramados,
        frecuencia: frecuenciaProgramada,
        formato: formatoProgramado
      })

      toast({
        title: "Reporte programado creado",
        description: `El reporte "${nombreProgramado}" se ha creado exitosamente`
      })

      // Limpiar formulario y cerrar modal
      setNombreProgramado('')
      setTiposProgramados([])
      setFrecuenciaProgramada('mensual')
      setFormatoProgramado('excel')
      setMostrarModalProgramado(false)

      // Recargar lista
      cargarReportesProgramados()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el reporte programado"
      })
    }
  }

  const handleToggleReporte = async (id: string) => {
    try {
      await reportsService.toggleReporteProgramado(id)
      toast({
        title: "Estado actualizado",
        description: "El estado del reporte programado se ha actualizado"
      })
      cargarReportesProgramados()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el estado"
      })
    }
  }

  const handleEditarReporte = (reporte: any) => {
    setReporteEditando(reporte)
    setNombreProgramado(reporte.nombre)
    setTiposProgramados(reporte.tipos || [])
    setFrecuenciaProgramada(reporte.frecuencia)
    setFormatoProgramado(reporte.formato)
    setMostrarModalEditar(true)
  }

  const handleGuardarEdicion = async () => {
    if (!nombreProgramado || tiposProgramados.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes completar todos los campos"
      })
      return
    }

    try {
      await reportsService.actualizarReporteProgramado(reporteEditando.id, {
        nombre: nombreProgramado,
        tipos: tiposProgramados,
        frecuencia: frecuenciaProgramada,
        formato: formatoProgramado
      })

      toast({
        title: "Reporte actualizado",
        description: `El reporte "${nombreProgramado}" se ha actualizado exitosamente`
      })

      // Limpiar y cerrar
      setMostrarModalEditar(false)
      setReporteEditando(null)
      setNombreProgramado('')
      setTiposProgramados([])
      setFrecuenciaProgramada('mensual')
      setFormatoProgramado('excel')

      // Recargar lista
      cargarReportesProgramados()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el reporte programado"
      })
    }
  }

  const handleEliminarReporteProgramado = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este reporte programado?')) {
      return
    }

    try {
      await reportsService.eliminarReporteProgramado(id)
      toast({
        title: "Reporte eliminado",
        description: "El reporte programado se ha eliminado exitosamente"
      })
      cargarReportesProgramados()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el reporte programado"
      })
    }
  }

  const handleDescargarReporte = async (reporteId: string) => {
    try {
      setDescargandoReporteId(reporteId)
      
      // Encontrar el reporte en la lista
      const reporte = reportesGenerados.find(r => r.id === reporteId)
      if (!reporte) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Reporte no encontrado"
        })
        return
      }

      // Determinar el endpoint y nombre de archivo según el tipo de reporte
      const tipoReporte = reporte.tipos?.[0] || reporte.tipo || 'general'
      console.log('Reporte completo:', reporte)
      console.log('Tipo de reporte detectado:', tipoReporte)
      
      let endpoint = ''
      let fileName = ''
      
      // Mapeo de tipos de reporte a endpoints
      const tipoToEndpoint: Record<string, { endpoint: string, fileName: string }> = {
        'cuentas-cobrar': { endpoint: 'cuentas-cobrar', fileName: 'cuentas_por_cobrar' },
        'cuentas-pagar': { endpoint: 'cuentas-pagar', fileName: 'cuentas_por_pagar' },
        'flujo-efectivo': { endpoint: 'flujo-efectivo', fileName: 'flujo_efectivo' },
        'estado-resultados': { endpoint: 'estado-resultados', fileName: 'estado_resultados' },
        'gastos': { endpoint: 'estado-resultados', fileName: 'estado_resultados' }, // Mapear gastos a estado-resultados
        'ingresos': { endpoint: 'flujo-efectivo', fileName: 'flujo_efectivo' },
      }
      
      const mapping = tipoToEndpoint[tipoReporte]
      
      if (mapping) {
        endpoint = mapping.endpoint
        fileName = mapping.fileName
      } else {
        // Si no se encuentra en el mapeo, usar el tipo directamente
        endpoint = tipoReporte
        fileName = tipoReporte.replace(/-/g, '_')
      }
      
      console.log('Endpoint a usar:', endpoint)
      console.log('Nombre de archivo:', fileName)

      const token = localStorage.getItem('accessToken')
      
      if (!token) {
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: "Por favor, inicia sesión nuevamente."
        })
        return
      }
      
      // Construir URL con parámetros si existen
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      const url = `${apiUrl}/reports/downloadable/export/${endpoint}`

      // Descargar con autenticación
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      // Obtener el tipo de contenido y extensión
      const contentType = response.headers.get('content-type')
      let extension = 'xlsx'
      if (contentType?.includes('pdf')) {
        extension = 'pdf'
      } else if (contentType?.includes('csv')) {
        extension = 'csv'
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      toast({
        title: "Descarga completada",
        description: `El reporte "${reporte.nombre}" se ha descargado exitosamente`
      })

      // Recargar la lista para actualizar contador de descargas
      setTimeout(() => cargarReportesGenerados(), 1000)
      
    } catch (error: any) {
      console.error('Error al descargar reporte:', error)
      toast({
        variant: "destructive",
        title: "Error al descargar",
        description: error.message || "No se pudo descargar el reporte. Por favor, intenta nuevamente."
      })
    } finally {
      setDescargandoReporteId(null)
    }
  }

  const handleVisualizarReporte = async (reporteId: string) => {
    try {
      setCargandoVisualizacion(true)
      setMostrarModalVisualizacion(true)
      
      // Encontrar el reporte en la lista
      const reporte = reportesGenerados.find(r => r.id === reporteId)
      if (!reporte) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Reporte no encontrado"
        })
        setMostrarModalVisualizacion(false)
        return
      }

      setReporteVisualizando(reporte)

      // Determinar el tipo de reporte
      const tipoReporte = reporte.tipos?.[0] || reporte.tipo || 'general'
      
      const token = localStorage.getItem('accessToken')
      
      if (!token) {
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: "Por favor, inicia sesión nuevamente."
        })
        setMostrarModalVisualizacion(false)
        return
      }

      // Mapeo de tipos a endpoints para obtener datos JSON
      let endpoint = ''
      
      switch (tipoReporte) {
        case 'cuentas-cobrar':
          endpoint = '/accounts-receivable/reports/due-dates'
          break
        case 'cuentas-pagar':
          endpoint = '/accounts-payable/reports/due-dates'
          break
        case 'flujo-efectivo':
          endpoint = '/accounts-payable/reports/cash-flow'
          break
        case 'estado-resultados':
          endpoint = '/accounts-payable/reports/dashboard'
          break
        default:
          endpoint = '/accounts-payable/reports/dashboard'
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      const url = `${apiUrl}${endpoint}`

      // Obtener datos en formato JSON
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const datos = await response.json()
      setDatosReporteVisualizacion(datos)

    } catch (error: any) {
      console.error('Error al visualizar reporte:', error)
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

  const renderizarDatosReporte = () => {
    if (cargandoVisualizacion) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Cargando datos...</span>
        </div>
      )
    }

    if (!datosReporteVisualizacion) {
      return <p className="text-center py-4 text-muted-foreground">No hay datos disponibles</p>
    }

    const datos = datosReporteVisualizacion

    // Detectar si tiene estructura de cuentas (overdue, upcoming, summary)
    const esCuentas = datos.overdue || datos.upcoming || datos.summary

    // Detectar si tiene estructura de dashboard/métricas (keyMetrics, categoryBreakdown, etc.)
    const esDashboard = datos.keyMetrics || datos.categoryBreakdown || datos.agingDistribution || datos.upcomingPayments

    // Renderizar UI para reportes de cuentas (cobrar/pagar)
    if (esCuentas && !esDashboard) {
      const cuentas = [...(datos.overdue || []), ...(datos.upcoming || [])]

      return (
        <div className="space-y-4">
          {/* Resumen */}
          {datos.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Total Vencido</p>
                <p className="text-lg font-bold text-red-600">{datos.summary.totalOverdue || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monto Vencido</p>
                <p className="text-lg font-bold">${typeof datos.summary.overdueAmount === 'number' ? datos.summary.overdueAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 }) : datos.summary.overdueAmount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Próximo</p>
                <p className="text-lg font-bold text-blue-600">{datos.summary.totalUpcoming || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monto Próximo</p>
                <p className="text-lg font-bold">${typeof datos.summary.upcomingAmount === 'number' ? datos.summary.upcomingAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 }) : datos.summary.upcomingAmount}</p>
              </div>
            </div>
          )}

          {/* Tabla de cuentas */}
          {cuentas.length > 0 ? (
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Factura</TableHead>
                    <TableHead>Cliente/Proveedor</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha Vencimiento</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cuentas.map((cuenta: any, index: number) => (
                    <TableRow key={cuenta.id || index}>
                      <TableCell className="font-medium">{cuenta.invoiceNumber}</TableCell>
                      <TableCell>{cuenta.supplierName || cuenta.supplier?.name || cuenta.clientName || 'N/A'}</TableCell>
                      <TableCell className="font-semibold">${typeof cuenta.amount === 'number' ? cuenta.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 }) : cuenta.amount}</TableCell>
                      <TableCell>{new Date(cuenta.dueDate).toLocaleDateString('es-MX')}</TableCell>
                      <TableCell>
                        <Badge variant={cuenta.daysOverdue > 0 ? 'destructive' : 'default'}>
                          {cuenta.daysOverdue > 0 ? `${cuenta.daysOverdue} días vencido` : cuenta.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">No hay cuentas para mostrar</p>
          )}
        </div>
      )
    }

    // Si tiene estructura de dashboard, usar la UI mejorada
    if (esDashboard) {
      return (
        <div className="space-y-6 max-h-[600px] overflow-y-auto">
          {/* Métricas Clave */}
          {datos.keyMetrics && (
            <div>
              <h3 className="text-lg font-semibold mb-3">📊 Métricas Clave</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 overflow-hidden">
                  <CardContent className="p-4">
                    <p className="text-xs text-blue-700 font-medium mb-2">Total por Pagar</p>
                    <p className="text-base sm:text-lg font-bold text-blue-900 break-words leading-tight">
                      ${typeof datos.keyMetrics.totalPayable === 'number' 
                        ? datos.keyMetrics.totalPayable.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : datos.keyMetrics.totalPayable}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 overflow-hidden">
                  <CardContent className="p-4">
                    <p className="text-xs text-red-700 font-medium mb-2">Total Vencido</p>
                    <p className="text-base sm:text-lg font-bold text-red-900 break-words leading-tight">
                      ${typeof datos.keyMetrics.totalOverdue === 'number' 
                        ? datos.keyMetrics.totalOverdue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : datos.keyMetrics.totalOverdue}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 overflow-hidden">
                  <CardContent className="p-4">
                    <p className="text-xs text-orange-700 font-medium mb-2">Crítico Vencido</p>
                    <p className="text-2xl font-bold text-orange-900 leading-tight">{datos.keyMetrics.criticalOverdue || 0}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 overflow-hidden">
                  <CardContent className="p-4">
                    <p className="text-xs text-green-700 font-medium mb-2">Próximos Esta Semana</p>
                    <p className="text-2xl font-bold text-green-900 leading-tight">{datos.keyMetrics.upcomingThisWeek || 0}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 overflow-hidden">
                  <CardContent className="p-4">
                    <p className="text-xs text-purple-700 font-medium mb-2">Promedio Días Vencido</p>
                    <p className="text-2xl font-bold text-purple-900 leading-tight">{datos.keyMetrics.avgOverdueDays || 0}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Próximos Pagos */}
          {datos.upcomingPayments && datos.upcomingPayments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">📅 Próximos Pagos</h3>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Proveedor</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Fecha Vencimiento</TableHead>
                        <TableHead>Días</TableHead>
                        <TableHead>Programado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {datos.upcomingPayments.map((pago: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{pago.supplier}</TableCell>
                          <TableCell className="text-green-700 font-semibold">
                            ${typeof pago.amount === 'number' 
                              ? pago.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })
                              : pago.amount}
                          </TableCell>
                          <TableCell>{new Date(pago.dueDate).toLocaleDateString('es-MX')}</TableCell>
                          <TableCell>
                            <Badge variant={pago.daysUntilDue === 0 ? 'destructive' : 'default'}>
                              {pago.daysUntilDue === 0 ? 'Hoy' : `${pago.daysUntilDue} días`}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {pago.scheduled ? (
                              <Badge className="bg-green-100 text-green-800">✓ Sí</Badge>
                            ) : (
                              <Badge variant="secondary">No</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cuentas Vencidas */}
          {datos.overdueAccounts && datos.overdueAccounts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-600">⚠️ Cuentas Vencidas</h3>
              <Card className="border-red-200">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Proveedor</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Fecha Vencimiento</TableHead>
                        <TableHead>Días Vencido</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {datos.overdueAccounts.map((cuenta: any, index: number) => (
                        <TableRow key={index} className="bg-red-50">
                          <TableCell className="font-medium">{cuenta.supplier}</TableCell>
                          <TableCell className="text-red-700 font-semibold">
                            ${typeof cuenta.amount === 'number' 
                              ? cuenta.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })
                              : cuenta.amount}
                          </TableCell>
                          <TableCell>{new Date(cuenta.dueDate).toLocaleDateString('es-MX')}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">{cuenta.daysOverdue} días</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Desglose por Categoría */}
          {datos.categoryBreakdown && datos.categoryBreakdown.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">📁 Desglose por Categoría</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {datos.categoryBreakdown.map((categoria: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{categoria.category}</span>
                            <Badge variant="outline">{categoria.count} {categoria.count === 1 ? 'cuenta' : 'cuentas'}</Badge>
                          </div>
                          <span className="text-lg font-bold">
                            ${typeof categoria.amount === 'number' 
                              ? categoria.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })
                              : categoria.amount}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full transition-all"
                              style={{ width: `${categoria.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground min-w-[60px] text-right">
                            {typeof categoria.percentage === 'number' 
                              ? categoria.percentage.toFixed(2)
                              : categoria.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Distribución de Antigüedad */}
          {datos.agingDistribution && datos.agingDistribution.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">⏱️ Distribución de Antigüedad</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {datos.agingDistribution.map((rango: any, index: number) => (
                  <Card key={index} className="border-2">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-muted-foreground mb-1">{rango.label}</p>
                      <p className="text-xl font-bold mb-1">
                        ${typeof rango.value === 'number' 
                          ? rango.value.toLocaleString('es-MX', { minimumFractionDigits: 2 })
                          : rango.value}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{rango.count} cuentas</span>
                        <span>{typeof rango.percentage === 'number' ? rango.percentage.toFixed(1) : rango.percentage}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    // Para otros tipos de reportes, mostrar estructura JSON
    return (
      <div className="max-h-96 overflow-auto">
        <pre className="bg-gray-50 p-4 rounded-lg text-xs">
          {JSON.stringify(datosReporteVisualizacion, null, 2)}
        </pre>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes Descargables</h1>
        <p className="text-gray-600">Genera y descarga reportes en múltiples formatos</p>
      </div>

      {/* Generación de Reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Generar Nuevo Reporte</CardTitle>
          <CardDescription>Selecciona los tipos de reporte y formato para generar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selección de Reportes */}
          <div>
            <h4 className="font-medium mb-3">Tipos de Reporte</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tiposReporte.map((tipo) => (
                <div key={tipo.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox 
                    id={tipo.id} 
                    checked={tiposSeleccionados.includes(tipo.id)} 
                    onCheckedChange={() => toggleTipoReporte(tipo.id)} 
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tipo.icono}</span>
                      <label htmlFor={tipo.id} className="font-medium cursor-pointer">
                        {tipo.nombre}
                      </label>
                    </div>
                    <p className="text-sm text-gray-600">{tipo.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuración */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Formato</label>
              <Select value={formatoSeleccionado} onValueChange={setFormatoSeleccionado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                  <SelectItem value="todos">Todos los formatos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Período</label>
              <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes-actual">Mes Actual</SelectItem>
                  <SelectItem value="mes-anterior">Mes Anterior</SelectItem>
                  <SelectItem value="trimestre">Trimestre</SelectItem>
                  <SelectItem value="año">Año Completo</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Incluir Gráficos</label>
              <Select value={incluirGraficos} onValueChange={setIncluirGraficos}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="si">Sí, incluir gráficos</SelectItem>
                  <SelectItem value="no">Solo datos</SelectItem>
                  <SelectItem value="separado">Archivo separado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Proyecto</label>
              <Select value={proyectoSeleccionado} onValueChange={setProyectoSeleccionado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los Proyectos</SelectItem>
                  {proyectos.map((proyecto) => (
                    <SelectItem key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombreProyecto || proyecto.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botón de Generación y Progreso */}
          <div className="space-y-4">
            <Button onClick={handleGenerarReporte} disabled={generando} className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              {generando ? "Generando..." : "Generar Reporte"}
            </Button>

            {generando && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generando reporte...</span>
                  <span>{progreso}%</span>
                </div>
                <Progress value={progreso} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reportes Programados */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Programados</CardTitle>
          <CardDescription>Configura reportes automáticos que se generen periódicamente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="outline" className="mb-4 bg-transparent" onClick={() => setMostrarModalProgramado(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Nuevo Reporte Programado
            </Button>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Frecuencia</TableHead>
                  <TableHead>Próxima Ejecución</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportesProgramados.map((reporte) => (
                  <TableRow key={reporte.id}>
                    <TableCell className="font-medium">{reporte.nombre}</TableCell>
                    <TableCell>{reporte.frecuencia}</TableCell>
                    <TableCell>{reporte.proximaEjecucion}</TableCell>
                    <TableCell>{reporte.formato}</TableCell>
                    <TableCell>
                      <Badge className={estadoColors[reporte.estado as keyof typeof estadoColors]}>
                        {traducirEstado(reporte.estado)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleToggleReporte(reporte.id)}
                          title={reporte.estado === "active" ? "Pausar reporte" : "Activar reporte"}
                        >
                          {reporte.estado === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEditarReporte(reporte)}
                          title="Configurar reporte"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleEliminarReporteProgramado(reporte.id)}
                          title="Eliminar reporte"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Reportes Generados */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Disponibles para Descarga</CardTitle>
          <CardDescription>Historial de reportes generados y disponibles para descarga</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Reporte</TableHead>
                <TableHead>Fecha de Generación</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Descargas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportesGenerados.map((reporte) => (
                <TableRow key={reporte.id}>
                  <TableCell className="font-medium">{reporte.nombre}</TableCell>
                  <TableCell>{reporte.fechaGeneracion}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{reporte.formato}</Badge>
                  </TableCell>
                  <TableCell>{reporte.tamaño}</TableCell>
                  <TableCell>{reporte.descargas}</TableCell>
                  <TableCell>
                    <Badge className={estadoColors[reporte.estado as keyof typeof estadoColors]}>
                      {reporte.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {reporte.estado === "disponible" || reporte.estado === "completado" ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                            onClick={() => handleVisualizarReporte(reporte.id)}
                            title="Ver reporte en pantalla"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleDescargarReporte(reporte.id)}
                            disabled={descargandoReporteId === reporte.id}
                            title="Descargar reporte"
                          >
                            {descargandoReporteId === reporte.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Descargando...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-1" />
                                Descargar
                              </>
                            )}
                          </Button>
                        </>
                      ) : reporte.estado === "procesando" ? (
                        <Button size="sm" variant="outline" disabled>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Procesando...
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          No disponible
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal para Crear Reporte Programado */}
      <Dialog open={mostrarModalProgramado} onOpenChange={setMostrarModalProgramado}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nuevo Reporte Programado</DialogTitle>
            <DialogDescription>
              Configura un reporte que se genere automáticamente de forma periódica
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Nombre del Reporte */}
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre del Reporte</Label>
              <Input
                id="nombre"
                placeholder="Ej: Reporte Mensual de Cuentas por Cobrar"
                value={nombreProgramado}
                onChange={(e) => setNombreProgramado(e.target.value)}
              />
            </div>

            {/* Tipos de Reporte */}
            <div className="grid gap-2">
              <Label>Tipos de Reporte a Incluir</Label>
              <div className="space-y-2">
                {tiposReporte.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Cargando tipos de reporte...</p>
                ) : (
                  tiposReporte.map((tipo) => (
                    <div key={tipo.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`programado-${tipo.id}`}
                        checked={tiposProgramados.includes(tipo.id)}
                        onCheckedChange={(checked) => {
                          console.log(`Checkbox ${tipo.id} changed to:`, checked)
                          if (checked) {
                            setTiposProgramados([...tiposProgramados, tipo.id])
                          } else {
                            setTiposProgramados(tiposProgramados.filter(t => t !== tipo.id))
                          }
                        }}
                      />
                      <label
                        htmlFor={`programado-${tipo.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {tipo.nombre}
                      </label>
                    </div>
                  ))
                )}
              </div>
              {tiposProgramados.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Seleccionados: {tiposProgramados.join(', ')}
                </p>
              )}
            </div>

            {/* Frecuencia */}
            <div className="grid gap-2">
              <Label htmlFor="frecuencia">Frecuencia</Label>
              <Select value={frecuenciaProgramada} onValueChange={setFrecuenciaProgramada}>
                <SelectTrigger id="frecuencia">
                  <SelectValue placeholder="Selecciona la frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diaria">Diaria</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Formato */}
            <div className="grid gap-2">
              <Label htmlFor="formato">Formato de Exportación</Label>
              <Select value={formatoProgramado} onValueChange={setFormatoProgramado}>
                <SelectTrigger id="formato">
                  <SelectValue placeholder="Selecciona el formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMostrarModalProgramado(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCrearReporteProgramado}>
              Crear Reporte Programado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Editar Reporte Programado */}
      <Dialog open={mostrarModalEditar} onOpenChange={(open) => {
        setMostrarModalEditar(open)
        if (!open) {
          // Limpiar al cerrar
          setReporteEditando(null)
          setNombreProgramado('')
          setTiposProgramados([])
          setFrecuenciaProgramada('mensual')
          setFormatoProgramado('excel')
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Reporte Programado</DialogTitle>
            <DialogDescription>
              Modifica la configuración de tu reporte automático
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Nombre del Reporte */}
            <div className="grid gap-2">
              <Label htmlFor="nombre-editar">Nombre del Reporte</Label>
              <Input
                id="nombre-editar"
                placeholder="Ej: Reporte Mensual de Cuentas por Cobrar"
                value={nombreProgramado}
                onChange={(e) => setNombreProgramado(e.target.value)}
              />
            </div>

            {/* Tipos de Reporte */}
            <div className="grid gap-2">
              <Label>Tipos de Reporte a Incluir</Label>
              <div className="space-y-2">
                {tiposReporte.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Cargando tipos de reporte...</p>
                ) : (
                  tiposReporte.map((tipo) => (
                    <div key={tipo.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`editar-${tipo.id}`}
                        checked={tiposProgramados.includes(tipo.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setTiposProgramados([...tiposProgramados, tipo.id])
                          } else {
                            setTiposProgramados(tiposProgramados.filter(t => t !== tipo.id))
                          }
                        }}
                      />
                      <label
                        htmlFor={`editar-${tipo.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {tipo.nombre}
                      </label>
                    </div>
                  ))
                )}
              </div>
              {tiposProgramados.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Seleccionados: {tiposProgramados.join(', ')}
                </p>
              )}
            </div>

            {/* Frecuencia */}
            <div className="grid gap-2">
              <Label htmlFor="frecuencia-editar">Frecuencia</Label>
              <Select value={frecuenciaProgramada} onValueChange={setFrecuenciaProgramada}>
                <SelectTrigger id="frecuencia-editar">
                  <SelectValue placeholder="Selecciona la frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diaria">Diaria</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Formato */}
            <div className="grid gap-2">
              <Label htmlFor="formato-editar">Formato de Exportación</Label>
              <Select value={formatoProgramado} onValueChange={setFormatoProgramado}>
                <SelectTrigger id="formato-editar">
                  <SelectValue placeholder="Selecciona el formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMostrarModalEditar(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarEdicion}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Visualizar Reporte */}
      <Dialog open={mostrarModalVisualizacion} onOpenChange={(open) => {
        setMostrarModalVisualizacion(open)
        if (!open) {
          setReporteVisualizando(null)
          setDatosReporteVisualizacion(null)
          setCargandoVisualizacion(false)
        }
      }}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {reporteVisualizando?.nombre || 'Visualización de Reporte'}
            </DialogTitle>
            <DialogDescription>
              {reporteVisualizando?.fechaGeneracion && `Generado el ${reporteVisualizando.fechaGeneracion}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {renderizarDatosReporte()}
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
                  handleDescargarReporte(reporteVisualizando.id)
                }
              }}
              disabled={!reporteVisualizando?.id || descargandoReporteId === reporteVisualizando?.id}
            >
              {descargandoReporteId === reporteVisualizando?.id ? (
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
  )
}
