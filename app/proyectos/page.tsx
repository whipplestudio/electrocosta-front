"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, Download, Plus, Search, FileText, Calendar as CalendarIcon, Loader2, Eye, Edit, AlertCircle, Check, ChevronsUpDown, Info, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { projectsUploadService, type CrearProyectoData } from "@/services/projects-upload.service"
import { clientsService, type ClientSimple } from "@/services/clients.service"
import { areasService, type AreaSimple } from "@/services/areas.service"
import { BulkUploadDialog } from "@/components/bulk-upload-dialog"

// Helper para convertir string YYYY-MM-DD a Date local sin problemas de zona horaria
const stringToLocalDate = (dateString: string | undefined): Date | undefined => {
  if (!dateString) return undefined
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export default function ProyectosPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estados básicos
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(false)
  
  // Estados para proyectos
  const [proyectos, setProyectos] = useState<any[]>([])
  const [loadingProyectos, setLoadingProyectos] = useState(false)
  
  // Estados para usuarios
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  const [showTemplateInfoDialog, setShowTemplateInfoDialog] = useState(false)
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false)
  
  // Estados para clientes
  const [clientes, setClientes] = useState<ClientSimple[]>([])
  const [loadingClientes, setLoadingClientes] = useState(false)
  const [openClientePopover, setOpenClientePopover] = useState(false)
  const [openClientePopoverEdit, setOpenClientePopoverEdit] = useState(false)
  
  // Estados para áreas
  const [areas, setAreas] = useState<AreaSimple[]>([])
  const [loadingAreas, setLoadingAreas] = useState(false)
  const [openAreaPopover, setOpenAreaPopover] = useState(false)
  const [openAreaPopoverEdit, setOpenAreaPopoverEdit] = useState(false)
  
  // Estados para carga masiva
  const [archivo, setArchivo] = useState<File | null>(null)
  const [uploadResponse, setUploadResponse] = useState<any>(null)
  const [validacionResultado, setValidacionResultado] = useState<any>(null)
  const [importacionResultado, setImportacionResultado] = useState<any>(null)
  
  // Estados para formulario manual
  const [openDialog, setOpenDialog] = useState(false)
  const [modoFormulario, setModoFormulario] = useState<'crear' | 'editar'>('crear')
  const [nuevoProyecto, setNuevoProyecto] = useState({
    id: '',
    nombreProyecto: '',
    clientId: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFinEstimada: '',
    iva: '16',
    subtotalVenta: '',
    valorVenta: '',
    presupuestoTotal: '',
    presupuestoMateriales: '',
    presupuestoManoObra: '',
    presupuestoOtros: '',
    responsableEmail: '',
    areaId: '',
    estado: 'planificacion',
    prioridad: 'media',
    descripcion: '',
    observaciones: ''
  })

  // Estado para Ver proyecto
  const [verModalOpen, setVerModalOpen] = useState(false)
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<any>(null)

  // Estados para validación de formulario
  const [formErrors, setFormErrors] = useState({
    nombreProyecto: '',
    fechaFinEstimada: '',
    subtotalVenta: '',
    presupuestos: '',
    responsableEmail: ''
  })

  // Cargar proyectos desde la BD
  const cargarProyectos = useCallback(async () => {
    try {
      setLoadingProyectos(true)
      const response = await projectsUploadService.obtenerListadoProyectos({ limit: 50 })
      setProyectos(response.data || [])
    } catch (error) {
      console.error('Error al cargar proyectos:', error)
      toast.error('No se pudieron cargar los proyectos')
    } finally {
      setLoadingProyectos(false)
    }
  }, [])

  // Cargar usuarios
  const cargarUsuarios = useCallback(async () => {
    try {
      setLoadingUsuarios(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/simple/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUsuarios(data)
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    } finally {
      setLoadingUsuarios(false)
    }
  }, [])

  // Cargar clientes
  const cargarClientes = useCallback(async () => {
    try {
      setLoadingClientes(true)
      const data = await clientsService.getSimpleList()
      setClientes(data)
    } catch (error) {
      console.error('Error al cargar clientes:', error)
      toast.error('No se pudieron cargar los clientes')
    } finally {
      setLoadingClientes(false)
    }
  }, [])

  // Cargar áreas
  const cargarAreas = useCallback(async () => {
    try {
      setLoadingAreas(true)
      const data = await areasService.getSimpleList()
      setAreas(data)
    } catch (error) {
      console.error('Error al cargar áreas:', error)
      toast.error('No se pudieron cargar las áreas')
    } finally {
      setLoadingAreas(false)
    }
  }, [])

  useEffect(() => {
    cargarProyectos()
    cargarUsuarios()
    cargarClientes()
    cargarAreas()
  }, [cargarProyectos, cargarUsuarios, cargarClientes, cargarAreas])

  // Formatear número con separadores de miles
  const formatNumber = (value: string): string => {
    const num = value.replace(/,/g, '')
    if (!num || isNaN(Number(num))) return ''
    return Number(num).toLocaleString('en-US')
  }

  // Remover formato para obtener el valor numérico
  const unformatNumber = (value: string): string => {
    return value.replace(/,/g, '')
  }

  // Función para resetear el formulario
  const resetFormulario = () => {
    setNuevoProyecto({
      id: '',
      nombreProyecto: '',
      clientId: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFinEstimada: '',
      iva: '16',
      subtotalVenta: '',
      valorVenta: '',
      presupuestoTotal: '',
      presupuestoMateriales: '',
      presupuestoManoObra: '',
      presupuestoOtros: '',
      responsableEmail: '',
      areaId: '',
      estado: 'planificacion',
      prioridad: 'media',
      descripcion: '',
      observaciones: ''
    })
    setFormErrors({
      nombreProyecto: '',
      fechaFinEstimada: '',
      subtotalVenta: '',
      presupuestos: '',
      responsableEmail: ''
    })
    setModoFormulario('crear')
  }

  const handlePresupuestoChange = (field: string, value: string) => {
    const unformatted = unformatNumber(value)
    setNuevoProyecto((prev) => {
      const updated = { ...prev, [field]: unformatted }
      
      const iva = parseFloat(updated.iva) || 0
      
      // Si se modificó subtotalVenta o iva, calcular valorVenta con IVA
      if (field === 'subtotalVenta' || field === 'iva') {
        const subtotal = parseFloat(field === 'subtotalVenta' ? unformatted : updated.subtotalVenta) || 0
        const ivaPercent = parseFloat(field === 'iva' ? unformatted : updated.iva) || 0
        const ivaAmount = subtotal * (ivaPercent / 100)
        updated.valorVenta = (subtotal + ivaAmount).toString()
      }
      
      // Si se modificó alguno de los 3 campos de desglose, calcular el presupuestoTotal con IVA
      if (field === 'presupuestoMateriales' || field === 'presupuestoManoObra' || field === 'presupuestoOtros' || field === 'iva') {
        const materiales = parseFloat(field === 'presupuestoMateriales' ? unformatted : updated.presupuestoMateriales) || 0
        const manoObra = parseFloat(field === 'presupuestoManoObra' ? unformatted : updated.presupuestoManoObra) || 0
        const otros = parseFloat(field === 'presupuestoOtros' ? unformatted : updated.presupuestoOtros) || 0
        const subtotalPresupuesto = materiales + manoObra + otros
        const ivaPercent = parseFloat(field === 'iva' ? unformatted : updated.iva) || 0
        const ivaAmount = subtotalPresupuesto * (ivaPercent / 100)
        updated.presupuestoTotal = (subtotalPresupuesto + ivaAmount).toString()
      }
      
      return updated
    })
  }

  // Función unificada para crear/editar proyecto
  const crearNuevoProyecto = async () => {
    try {
      setLoading(true)
      
      // Resetear errores
      const errors = {
        nombreProyecto: '',
        fechaFinEstimada: '',
        subtotalVenta: '',
        presupuestos: '',
        responsableEmail: ''
      }

      let hasErrors = false

      // Validación básica
      if (!nuevoProyecto.nombreProyecto) {
        errors.nombreProyecto = 'El nombre del proyecto es obligatorio'
        hasErrors = true
      }

      if (!nuevoProyecto.fechaFinEstimada) {
        errors.fechaFinEstimada = 'La fecha fin estimada es obligatoria'
        hasErrors = true
      }

      if (!nuevoProyecto.subtotalVenta || parseFloat(nuevoProyecto.subtotalVenta) <= 0) {
        errors.subtotalVenta = 'El subtotal de venta es obligatorio y debe ser mayor a 0'
        hasErrors = true
      }

      if (!nuevoProyecto.presupuestoMateriales && !nuevoProyecto.presupuestoManoObra && !nuevoProyecto.presupuestoOtros) {
        errors.presupuestos = 'Debes ingresar al menos un presupuesto (Materiales, Mano de Obra u Otros)'
        hasErrors = true
      }

      if (!nuevoProyecto.responsableEmail) {
        errors.responsableEmail = 'Debes seleccionar un responsable del proyecto'
        hasErrors = true
      }

      if (hasErrors) {
        setFormErrors(errors)
        setLoading(false)
        return
      }

      // Limpiar errores si todo está bien
      setFormErrors({
        nombreProyecto: '',
        fechaFinEstimada: '',
        subtotalVenta: '',
        presupuestos: '',
        responsableEmail: ''
      })

      const data: CrearProyectoData = {
        nombreProyecto: nuevoProyecto.nombreProyecto,
        clientId: nuevoProyecto.clientId || undefined,
        fechaInicio: nuevoProyecto.fechaInicio,
        fechaFinEstimada: nuevoProyecto.fechaFinEstimada,
        iva: parseFloat(nuevoProyecto.iva) || 16,
        subtotalVenta: parseFloat(nuevoProyecto.subtotalVenta) || 0,
        valorVenta: parseFloat(nuevoProyecto.valorVenta) || 0,
        presupuestoMateriales: parseFloat(nuevoProyecto.presupuestoMateriales) || 0,
        presupuestoManoObra: parseFloat(nuevoProyecto.presupuestoManoObra) || 0,
        presupuestoOtros: parseFloat(nuevoProyecto.presupuestoOtros) || 0,
        presupuestoTotal: parseFloat(nuevoProyecto.presupuestoTotal),
        responsableEmail: nuevoProyecto.responsableEmail,
        areaId: nuevoProyecto.areaId,
        estado: nuevoProyecto.estado,
        prioridad: nuevoProyecto.prioridad,
        descripcion: nuevoProyecto.descripcion,
        observaciones: nuevoProyecto.observaciones,
      }

      if (modoFormulario === 'editar') {
        // Actualizar proyecto existente
        await projectsUploadService.actualizarProyecto(nuevoProyecto.id, data)
        toast.success('Los cambios se han guardado exitosamente')
      } else {
        // Crear nuevo proyecto
        await projectsUploadService.crearProyecto(data)
        toast.success('El proyecto se ha creado exitosamente')
      }

      // Resetear formulario y cerrar dialog
      resetFormulario()
      setOpenDialog(false)
      cargarProyectos()
    } catch (error: any) {
      const mensaje = modoFormulario === 'editar' ? 'Error al actualizar proyecto' : 'Error al crear proyecto'
      toast.error(error.message || mensaje)
    } finally {
      setLoading(false)
    }
  }

  // Funciones para carga masiva
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivo(e.target.files[0])
      setUploadResponse(null)
      setValidacionResultado(null)
      setImportacionResultado(null)
    }
  }

  const subirArchivo = async () => {
    if (!archivo) return

    try {
      setLoading(true)
      const response = await projectsUploadService.uploadFile(archivo)
      setUploadResponse(response)
      
      toast.success(`${response.registrosDetectados} registros detectados`)
    } catch (error: any) {
      toast.error(error.message || 'Error al subir archivo')
    } finally {
      setLoading(false)
    }
  }

  const validarDatos = async () => {
    if (!uploadResponse) return

    try {
      setLoading(true)
      const resultado = await projectsUploadService.validarDatos(uploadResponse.uploadId)
      setValidacionResultado(resultado)
      
      toast.success(`${resultado.registrosValidos} registros válidos, ${resultado.registrosInvalidos} con errores`)
    } catch (error: any) {
      toast.error(error.message || 'Error al validar datos')
    } finally {
      setLoading(false)
    }
  }

  const importarDatos = async () => {
    if (!uploadResponse) return

    try {
      setLoading(true)
      const resultado = await projectsUploadService.importarDatos(uploadResponse.uploadId)
      setImportacionResultado(resultado)
      
      toast.success(`${resultado.registrosImportados} proyectos importados`)

      cargarProyectos()
    } catch (error: any) {
      toast.error(error.message || 'Error al importar datos')
    } finally {
      setLoading(false)
    }
  }

  const descargarPlantilla = async () => {
    try {
      setDownloadingTemplate(true)
      
      // Mostrar toast de inicio
      toast.loading('Preparando plantilla Excel...', { id: 'download-template' })
      
      const blob = await projectsUploadService.descargarPlantilla()
      
      // Validar que el blob tenga contenido
      if (!blob || blob.size === 0) {
        throw new Error('La plantilla descargada está vacía')
      }
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Nombre de archivo con fecha para mejor organización
      const fecha = new Date().toISOString().split('T')[0]
      link.download = `plantilla_proyectos_${fecha}.xlsx`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      // Actualizar toast a éxito
      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-semibold">✓ Plantilla descargada exitosamente</p>
          <p className="text-xs text-muted-foreground">Archivo: plantilla_proyectos_{fecha}.xlsx</p>
        </div>,
        { id: 'download-template', duration: 4000 }
      )
      
      // Mostrar diálogo informativo automáticamente la primera vez
      const hasSeenInfo = localStorage.getItem('hasSeenTemplateInfo')
      if (!hasSeenInfo) {
        setTimeout(() => {
          setShowTemplateInfoDialog(true)
          localStorage.setItem('hasSeenTemplateInfo', 'true')
        }, 500)
      }
    } catch (error: any) {
      console.error('Error al descargar plantilla:', error)
      
      // Toast de error con más detalles
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Error al descargar la plantilla</p>
          <p className="text-xs text-muted-foreground">
            {error?.message || 'Por favor, intenta nuevamente o contacta a soporte'}
          </p>
        </div>,
        { id: 'download-template', duration: 5000 }
      )
    } finally {
      setDownloadingTemplate(false)
    }
  }

  const handleResetBulkUpload = () => {
    setArchivo(null)
    setUploadResponse(null)
    setValidacionResultado(null)
    setImportacionResultado(null)
  }

  // Función para ver detalle de proyecto
  const verDetalleProyecto = async (id: string) => {
    try {
      setLoading(true)
      const proyecto = await projectsUploadService.obtenerProyectoPorId(id)
      setProyectoSeleccionado(proyecto)
      setVerModalOpen(true)
    } catch (error: any) {
      toast.error(error.message || 'No se pudo cargar el proyecto')
    } finally {
      setLoading(false)
    }
  }

  // Función para abrir modal de edición
  const abrirEditarProyecto = async (id: string) => {
    try {
      setLoading(true)
      const proyecto = await projectsUploadService.obtenerProyectoPorId(id)
      
      // Mapear datos del backend al formato del formulario unificado
      setNuevoProyecto({
        id: proyecto.id,
        nombreProyecto: proyecto.nombreProyecto || '',
        clientId: proyecto.clientId || proyecto.cliente?.id || '',
        fechaInicio: proyecto.fechaInicio ? proyecto.fechaInicio.split('T')[0] : '',
        fechaFinEstimada: proyecto.fechaFinEstimada ? proyecto.fechaFinEstimada.split('T')[0] : '',
        iva: proyecto.iva?.toString() || '16',
        subtotalVenta: proyecto.subtotalVenta?.toString() || '',
        valorVenta: proyecto.valorVenta?.toString() || '',
        presupuestoMateriales: proyecto.presupuestoMateriales?.toString() || '',
        presupuestoManoObra: proyecto.presupuestoManoObra?.toString() || '',
        presupuestoOtros: proyecto.presupuestoOtros?.toString() || '',
        presupuestoTotal: proyecto.presupuestoTotal?.toString() || '',
        responsableEmail: proyecto.responsable?.email || '',
        areaId: proyecto.areaId || '',
        estado: proyecto.estado || 'planificacion',
        prioridad: proyecto.prioridad || 'media',
        descripcion: proyecto.descripcion || '',
        observaciones: proyecto.observaciones || ''
      })
      
      setModoFormulario('editar')
      setOpenDialog(true)
    } catch (error: any) {
      toast.error(error.message || 'No se pudo cargar el proyecto')
    } finally {
      setLoading(false)
    }
  }

  // Mapear proyectos del backend al formato de la UI
  const proyectosFormateados = proyectos.map((p: any) => ({
    id: p.id,
    nombre: p.nombreProyecto,
    cliente: p.cliente?.name || 'Cliente',
    valorContrato: Number(p.presupuestoTotal) || 0,
    valorVenta: Number(p.valorVenta) || 0,
    fechaInicio: new Date(p.fechaInicio).toLocaleDateString('es-MX'),
    fechaFin: new Date(p.fechaFinEstimada).toLocaleDateString('es-MX'),
    estado: p.estado === 'en_progreso' ? 'En Progreso' : 
            p.estado === 'planificacion' ? 'Planificación' : 
            p.estado === 'completado' ? 'Completado' : 
            p.estado === 'pausado' ? 'Pausado' : 'Otro',
    responsable: p.responsable ? `${p.responsable.firstName} ${p.responsable.lastName}` : 'N/A',
    categoria: p.area?.name || 'General',
  }))

  const filteredProyectos = proyectosFormateados.filter((proyecto) => {
    const matchesSearch =
      proyecto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || proyecto.estado.toLowerCase().replace(" ", "") === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalValor = filteredProyectos.reduce((sum, proyecto) => sum + proyecto.valorContrato, 0)

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "En Progreso":
        return <Badge className="bg-blue-50 text-blue-700">En Progreso</Badge>
      case "Planificación":
        return <Badge className="bg-yellow-50 text-yellow-700">Planificación</Badge>
      case "Completado":
        return <Badge className="bg-green-50 text-green-700">Completado</Badge>
      case "Pausado":
        return <Badge className="bg-red-50 text-red-700">Pausado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carga de Proyectos</h1>
          <p className="text-muted-foreground">Gestión de proyectos y contratos</p>
        </div>
        <div className="flex gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={descargarPlantilla} 
                  disabled={downloadingTemplate}
                  className="gap-2"
                >
                  {downloadingTemplate ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Descargando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Plantilla Excel
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs bg-slate-700 dark:bg-slate-200 border-slate-600 dark:border-slate-300">
                <div className="space-y-1">
                  <p className="font-semibold text-white dark:text-slate-900">Plantilla para carga masiva</p>
                  <p className="text-xs text-slate-200 dark:text-slate-700">
                    Descarga el archivo Excel con el formato correcto para importar múltiples proyectos a la vez
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowTemplateInfoDialog(true)}
                  className="h-10 w-10"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Cómo usar la plantilla Excel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  onClick={() => setShowBulkUploadDialog(true)}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Carga Masiva
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs bg-slate-700 dark:bg-slate-200 border-slate-600 dark:border-slate-300">
                <div className="space-y-1">
                  <p className="font-semibold text-white dark:text-slate-900">Importación masiva de proyectos</p>
                  <p className="text-xs text-slate-200 dark:text-slate-700">
                    Sube un archivo Excel con múltiples proyectos a la vez
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Dialog open={openDialog} onOpenChange={(open) => {
            setOpenDialog(open)
            if (!open) {
              resetFormulario()
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proyecto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{modoFormulario === 'editar' ? 'Editar Proyecto' : 'Registrar Nuevo Proyecto'}</DialogTitle>
                <DialogDescription>
                  {modoFormulario === 'editar' ? 'Modifica los datos del proyecto' : 'Crea un nuevo proyecto en el sistema'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nombre del Proyecto *</Label>
                  <Input 
                    placeholder="Ej: Instalación eléctrica Planta Norte" 
                    value={nuevoProyecto.nombreProyecto}
                    onChange={(e) => setNuevoProyecto({...nuevoProyecto, nombreProyecto: e.target.value})}
                    className={formErrors.nombreProyecto ? 'border-red-500' : ''}
                  />
                  {formErrors.nombreProyecto && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.nombreProyecto}</p>
                  )}
                </div>
                
                <div>
                  <Label>Cliente</Label>
                  <Popover open={openClientePopover} onOpenChange={setOpenClientePopover}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openClientePopover}
                        className="w-full justify-between"
                      >
                        {nuevoProyecto.clientId
                          ? clientes.find((c) => c.id === nuevoProyecto.clientId)?.name
                          : "Seleccionar cliente..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar cliente por nombre o RFC..." />
                        <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="sin-cliente"
                            onSelect={() => {
                              setNuevoProyecto({...nuevoProyecto, clientId: ''})
                              setOpenClientePopover(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                nuevoProyecto.clientId === "" ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Sin cliente
                          </CommandItem>
                          {clientes.map((cliente) => (
                            <CommandItem
                              key={cliente.id}
                              value={`${cliente.name} ${cliente.taxId}`}
                              onSelect={() => {
                                setNuevoProyecto({...nuevoProyecto, clientId: cliente.id})
                                setOpenClientePopover(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  nuevoProyecto.clientId === cliente.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{cliente.name}</span>
                                <span className="text-xs text-muted-foreground">RFC: {cliente.taxId}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground mt-1">
                    Busca y selecciona un cliente existente o déjalo vacío
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Fecha Inicio *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {nuevoProyecto.fechaInicio ? format(stringToLocalDate(nuevoProyecto.fechaInicio)!, "PPP", { locale: es }) : "Seleccionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar 
                          mode="single" 
                          selected={stringToLocalDate(nuevoProyecto.fechaInicio)}
                          defaultMonth={stringToLocalDate(nuevoProyecto.fechaInicio)}
                          onSelect={(d) => setNuevoProyecto({...nuevoProyecto, fechaInicio: d ? format(d, 'yyyy-MM-dd') : ''})} 
                          locale={es} 
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label>Fecha Fin Estimada *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("justify-start text-left font-normal", formErrors.fechaFinEstimada && "border-red-500")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {nuevoProyecto.fechaFinEstimada ? format(stringToLocalDate(nuevoProyecto.fechaFinEstimada)!, "PPP", { locale: es }) : "Seleccionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar 
                          mode="single" 
                          selected={stringToLocalDate(nuevoProyecto.fechaFinEstimada)}
                          defaultMonth={stringToLocalDate(nuevoProyecto.fechaFinEstimada)}
                          onSelect={(d) => setNuevoProyecto({...nuevoProyecto, fechaFinEstimada: d ? format(d, 'yyyy-MM-dd') : ''})} 
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    {formErrors.fechaFinEstimada && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.fechaFinEstimada}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-primary">💰 Venta</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>IVA (%) *</Label>
                      <Input 
                        type="text" 
                        placeholder="Ej: 16"
                        value={nuevoProyecto.iva}
                        onChange={(e) => handlePresupuestoChange('iva', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Porcentaje de IVA
                      </p>
                    </div>
                    <div>
                      <Label>Subtotal de Venta (sin IVA) *</Label>
                      <Input 
                        type="text" 
                        placeholder="Ej: 100,000"
                        value={formatNumber(nuevoProyecto.subtotalVenta)}
                        onChange={(e) => handlePresupuestoChange('subtotalVenta', e.target.value)}
                        className={formErrors.subtotalVenta ? 'border-red-500' : ''}
                      />
                      {formErrors.subtotalVenta ? (
                        <p className="text-sm text-red-500 mt-1">{formErrors.subtotalVenta}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          Precio sin IVA
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Total de Venta (con IVA)</Label>
                      <Input 
                        type="text" 
                        value={formatNumber(nuevoProyecto.valorVenta)}
                        readOnly
                        className="bg-muted font-semibold text-green-600"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Subtotal + IVA (calculado)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-primary">📊 Costos Estimados</h3>
                  {formErrors.presupuestos && (
                    <p className="text-sm text-red-500">{formErrors.presupuestos}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Presupuesto Materiales *</Label>
                      <Input 
                        type="text" 
                        placeholder="Ej: 20,000"
                        value={formatNumber(nuevoProyecto.presupuestoMateriales)}
                        onChange={(e) => handlePresupuestoChange('presupuestoMateriales', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Presupuesto Mano de Obra *</Label>
                      <Input 
                        type="text" 
                        placeholder="Ej: 25,000"
                        value={formatNumber(nuevoProyecto.presupuestoManoObra)}
                        onChange={(e) => handlePresupuestoChange('presupuestoManoObra', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Presupuesto Otros *</Label>
                      <Input 
                        type="text" 
                        placeholder="Ej: 5,000"
                        value={formatNumber(nuevoProyecto.presupuestoOtros)}
                        onChange={(e) => handlePresupuestoChange('presupuestoOtros', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Presupuesto Total (con IVA)</Label>
                      <Input 
                        type="text" 
                        value={formatNumber(nuevoProyecto.presupuestoTotal)}
                        readOnly
                        className="bg-muted font-semibold"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Suma de costos + IVA (calculado)
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Responsable del Proyecto *</Label>
                  <Select 
                    value={nuevoProyecto.responsableEmail} 
                    onValueChange={(value) => setNuevoProyecto({...nuevoProyecto, responsableEmail: value})}
                    disabled={loadingUsuarios}
                  >
                    <SelectTrigger className={formErrors.responsableEmail ? 'border-red-500' : ''}>
                      <SelectValue placeholder={loadingUsuarios ? "Cargando usuarios..." : "Selecciona un responsable"} />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.length === 0 ? (
                        <SelectItem value="sin-usuarios" disabled>
                          No hay usuarios disponibles
                        </SelectItem>
                      ) : (
                        usuarios.map((usuario) => (
                          <SelectItem key={usuario.id} value={usuario.email}>
                            {usuario.fullName} ({usuario.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {formErrors.responsableEmail && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.responsableEmail}</p>
                  )}
                </div>

                <div>
                  <Label>Descripción</Label>
                  <Textarea 
                    placeholder="Ingrese una descripción detallada del proyecto (opcional)"
                    value={nuevoProyecto.descripcion}
                    onChange={(e) => setNuevoProyecto({...nuevoProyecto, descripcion: e.target.value})}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)} disabled={loading}>
                  Cancelar
                </Button>
                <Button onClick={crearNuevoProyecto} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {modoFormulario === 'editar' ? 'Guardando...' : 'Creando...'}
                    </>
                  ) : (
                    modoFormulario === 'editar' ? 'Guardar Cambios' : 'Crear Proyecto'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValor.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredProyectos.length} proyectos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {proyectosFormateados.filter((p) => p.estado === "En Progreso").length}
            </div>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {proyectosFormateados.filter((p) => p.estado === "Completado").length}
            </div>
            <p className="text-xs text-muted-foreground">Finalizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Carga Masiva */}
      <BulkUploadDialog
        open={showBulkUploadDialog}
        onOpenChange={setShowBulkUploadDialog}
        title="Carga Masiva de Proyectos"
        description="Importa múltiples proyectos desde un archivo Excel. Sigue el formato de la plantilla descargable."
        archivo={archivo}
        uploadResponse={uploadResponse}
        validacionResultado={validacionResultado}
        importacionResultado={importacionResultado}
        loading={loading}
        onFileChange={handleFileChange}
        onUpload={subirArchivo}
        onValidate={validarDatos}
        onImport={importarDatos}
        onReset={handleResetBulkUpload}
      />

      <Card>
        <CardHeader>
          <CardTitle>Listado de Proyectos</CardTitle>
          <CardDescription>Proyectos registrados y su estado actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar proyectos por nombre, cliente o ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="enprogreso">En Progreso</SelectItem>
                <SelectItem value="planificacion">Planificación</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Valor Venta</TableHead>
                  <TableHead>Presupuesto</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProyectos.map((proyecto) => (
                  <TableRow key={proyecto.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{proyecto.nombre}</div>
                        <div className="text-sm text-muted-foreground">{proyecto.responsable}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{proyecto.cliente}</div>
                        <div className="text-sm text-muted-foreground">{proyecto.categoria}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {proyectos.find(p => p.id === proyecto.id)?.area?.name || 'Sin área'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">${proyecto.valorVenta.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">${proyecto.valorContrato.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <span>{proyecto.fechaInicio}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Fin: {proyecto.fechaFin}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(proyecto.estado)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => verDetalleProyecto(proyecto.id)}
                          disabled={loading}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => abrirEditarProyecto(proyecto.id)}
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
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

      {/* Modal Ver Detalle */}
      <Dialog open={verModalOpen} onOpenChange={setVerModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Proyecto</DialogTitle>
          </DialogHeader>
          {proyectoSeleccionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                  <p className="text-sm font-medium">{proyectoSeleccionado.estado}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nombre del Proyecto</Label>
                <p className="text-sm font-medium">{proyectoSeleccionado.nombreProyecto}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
                  <p className="text-sm">{proyectoSeleccionado.cliente?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">RUC Cliente</Label>
                  <p className="text-sm">{proyectoSeleccionado.cliente?.taxId || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha Inicio</Label>
                  <p className="text-sm">{new Date(proyectoSeleccionado.fechaInicio).toLocaleDateString('es-MX')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha Fin Estimada</Label>
                  <p className="text-sm">{proyectoSeleccionado.fechaFinEstimada ? new Date(proyectoSeleccionado.fechaFinEstimada).toLocaleDateString('es-MX') : 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Presupuesto Total</Label>
                  <p className="text-sm font-medium">${Number(proyectoSeleccionado.presupuestoTotal || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Prioridad</Label>
                  <p className="text-sm">{proyectoSeleccionado.prioridad}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Materiales</Label>
                  <p className="text-sm">${Number(proyectoSeleccionado.presupuestoMateriales || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Mano de Obra</Label>
                  <p className="text-sm">${Number(proyectoSeleccionado.presupuestoManoObra || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Otros</Label>
                  <p className="text-sm">${Number(proyectoSeleccionado.presupuestoOtros || 0).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Responsable</Label>
                <p className="text-sm">{proyectoSeleccionado.responsable ? `${proyectoSeleccionado.responsable.firstName} ${proyectoSeleccionado.responsable.lastName} (${proyectoSeleccionado.responsable.email})` : 'N/A'}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Área</Label>
                <p className="text-sm">{proyectoSeleccionado.area?.name || 'N/A'}</p>
              </div>

              {proyectoSeleccionado.descripcion && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
                  <p className="text-sm">{proyectoSeleccionado.descripcion}</p>
                </div>
              )}

              {proyectoSeleccionado.observaciones && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Observaciones</Label>
                  <p className="text-sm">{proyectoSeleccionado.observaciones}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <Label className="text-xs">Origen de Carga</Label>
                  <p>{proyectoSeleccionado.origenCarga}</p>
                </div>
                <div>
                  <Label className="text-xs">Creado</Label>
                  <p>{new Date(proyectoSeleccionado.createdAt).toLocaleString('es-MX')}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo informativo sobre la plantilla Excel */}
      <Dialog open={showTemplateInfoDialog} onOpenChange={setShowTemplateInfoDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">  
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Guía de Uso: Plantilla Excel</DialogTitle>
                <DialogDescription>
                  Aprende a importar múltiples proyectos de forma rápida y eficiente
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-1">
            <div className="space-y-6 py-4">
            {/* Paso 1 */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-300">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Descarga la plantilla</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Haz clic en el botón "Plantilla Excel" para descargar el archivo con el formato correcto. 
                    La plantilla incluye dos hojas:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-sm">Proyectos</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Hoja principal con datos de ejemplo</p>
                    </div>
                    <div className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 mb-1">
                        <Info className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">Instrucciones</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Guía detallada de campos y validaciones</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-purple-700 dark:text-purple-300">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Completa los datos</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Llena la información de tus proyectos siguiendo el formato de ejemplo. Los campos obligatorios son:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Nombre del proyecto</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>RFC del cliente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Fechas (inicio y fin)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>IVA y Subtotal de Venta</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Presupuestos (desglose)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Email del responsable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-orange-700 dark:text-orange-300">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Sube el archivo</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Arrastra el archivo Excel completado al área de carga o haz clic para seleccionarlo. 
                    El sistema validará automáticamente los datos antes de importarlos.
                  </p>
                </div>
              </div>
            </div>

            {/* Consejos importantes */}
            <div className="rounded-lg border-2 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100">Consejos importantes</h4>
                  <ul className="space-y-1.5 text-sm text-amber-800 dark:text-amber-200">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">•</span>
                      <span>No modifiques los nombres de las columnas (encabezados)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">🔍</span>
                      <span className="font-semibold">Usa el RFC del cliente para identificación precisa y evitar errores de tipeo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">•</span>
                      <span>Alternativa: Puedes usar el email del cliente en lugar del RFC</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">•</span>
                      <span>Usa el formato de fecha YYYY-MM-DD (ej: 2024-12-31)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">💡</span>
                      <span className="font-semibold">Las columnas valorVenta y presupuestoTotal tienen fórmulas de Excel que calculan automáticamente en TIEMPO REAL</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">•</span>
                      <span>valorVenta = subtotalVenta + (subtotalVenta × iva/100). Ej: iva=16, subtotal=100,000 → 116,000</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">•</span>
                      <span>presupuestoTotal = (materiales + manoObra + otros) + IVA aplicado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">•</span>
                      <span>NO modifiques las fórmulas en las columnas valorVenta y presupuestoTotal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">•</span>
                      <span>El RFC/email del cliente y el email del responsable deben estar registrados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">•</span>
                      <span>El código del proyecto se genera automáticamente al importar</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Ejemplo visual */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Ejemplo de datos (campos de la plantilla Excel)
              </h4>
              <div className="rounded-lg border bg-muted/50 overflow-auto max-h-60" style={{maxWidth: '100%'}}>
                <table className="w-full text-xs" style={{minWidth: '1200px'}}>
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold whitespace-nowrap">nombreProyecto</th>
                      <th className="text-left p-2 font-semibold whitespace-nowrap">clienteRfc</th>
                      <th className="text-left p-2 font-semibold whitespace-nowrap">fechaInicio</th>
                      <th className="text-left p-2 font-semibold whitespace-nowrap">fechaFinEstimada</th>
                      <th className="text-left p-2 font-semibold whitespace-nowrap">iva</th>
                      <th className="text-left p-2 font-semibold whitespace-nowrap">subtotalVenta</th>
                      <th className="text-left p-2 font-semibold whitespace-nowrap bg-blue-50 dark:bg-blue-950">valorVenta 💡</th>
                      <th className="text-left p-2 font-semibold whitespace-nowrap">presupuestoMateriales</th>
                      <th className="text-left p-2 font-semibold whitespace-nowrap">presupuestoManoObra</th>
                      <th className="text-left p-2 font-semibold whitespace-nowrap">presupuestoOtros</th>
                      <th className="text-left p-2 font-semibold whitespace-nowrap bg-blue-50 dark:bg-blue-950">presupuestoTotal 💡</th>
                      <th className="text-left p-2 font-semibold whitespace-nowrap">responsableEmail</th>
                      <th className="text-left p-2 font-semibold whitespace-nowrap">descripcion</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 whitespace-nowrap">Implementación Sistema ERP</td>
                      <td className="p-2 whitespace-nowrap">20123456789</td>
                      <td className="p-2 whitespace-nowrap">2024-02-01</td>
                      <td className="p-2 whitespace-nowrap">2024-06-30</td>
                      <td className="p-2 whitespace-nowrap">16</td>
                      <td className="p-2 whitespace-nowrap">100,000</td>
                      <td className="p-2 whitespace-nowrap bg-blue-50 dark:bg-blue-950 font-medium">116,000</td>
                      <td className="p-2 whitespace-nowrap">20,000</td>
                      <td className="p-2 whitespace-nowrap">25,000</td>
                      <td className="p-2 whitespace-nowrap">5,000</td>
                      <td className="p-2 whitespace-nowrap bg-blue-50 dark:bg-blue-950 font-medium">58,000</td>
                      <td className="p-2 whitespace-nowrap">gerente@empresa.com</td>
                      <td className="p-2">Proyecto estratégico ERP</td>
                    </tr>
                    <tr>
                      <td className="p-2 whitespace-nowrap">Instalación Eléctrica Norte</td>
                      <td className="p-2 whitespace-nowrap">20987654321</td>
                      <td className="p-2 whitespace-nowrap">2024-03-15</td>
                      <td className="p-2 whitespace-nowrap">2024-08-30</td>
                      <td className="p-2 whitespace-nowrap">16</td>
                      <td className="p-2 whitespace-nowrap">250,000</td>
                      <td className="p-2 whitespace-nowrap bg-blue-50 dark:bg-blue-950 font-medium">290,000</td>
                      <td className="p-2 whitespace-nowrap">80,000</td>
                      <td className="p-2 whitespace-nowrap">60,000</td>
                      <td className="p-2 whitespace-nowrap">10,000</td>
                      <td className="p-2 whitespace-nowrap bg-blue-50 dark:bg-blue-950 font-medium">174,000</td>
                      <td className="p-2 whitespace-nowrap">jefe@empresa.com</td>
                      <td className="p-2">Sistema eléctrico completo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="inline-block w-3 h-3 bg-blue-50 dark:bg-blue-950 border rounded"></span>
                Las columnas resaltadas se calculan automáticamente con fórmulas de Excel
              </p>
            </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowTemplateInfoDialog(false)}
              className="w-full sm:w-auto"
            >
              Cerrar
            </Button>
            <Button 
              onClick={() => {
                setShowTemplateInfoDialog(false)
                descargarPlantilla()
              }}
              className="w-full sm:w-auto gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar Plantilla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
