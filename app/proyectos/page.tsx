"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, Download, Plus, Search, FileText, Calendar as CalendarIcon, Loader2, Eye, Edit, AlertCircle, Check, ChevronsUpDown, Info, CheckCircle2, XCircle, Save, FileSpreadsheet, TrendingUp, DollarSign, Briefcase } from "lucide-react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { projectsUploadService, type CrearProyectoData } from "@/services/projects-upload.service"
import { handleApiError } from "@/lib/api-client"
import { clientsService, type ClientSimple } from "@/services/clients.service"
import { areasService, type AreaSimple } from "@/services/areas.service"
import { BulkUploadDialog } from "@/components/bulk-upload-dialog"
import { CreateButton, ActionButton, DataTable, Column, Action, KpiCard } from "@/components/ui"
import { FloatingInput } from "@/components/ui/floating-input"
import { FloatingSelect } from "@/components/ui/floating-select"
import { FloatingDatePicker } from "@/components/ui/floating-date-picker"
import { FinancialAmountSection } from "@/components/financial"
import type { IvaType } from "@/components/financial"

// Helper para convertir string YYYY-MM-DD a Date local sin problemas de zona horaria
const stringToLocalDate = (dateString: string | undefined): Date | undefined => {
  if (!dateString) return undefined
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Helper para formatear fechas ISO sin conversión de zona horaria
const formatDateWithoutTimezone = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()
  
  const localDate = new Date(year, month, day)
  return localDate.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
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
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  
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
    ivaType: 'percentage' as 'percentage' | 'amount',
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

  // Cargar proyectos desde la BD con paginación y búsqueda
  const cargarProyectos = useCallback(async (
    search?: string,
    currentPage?: number,
    currentLimit?: number
  ) => {
    try {
      setLoadingProyectos(true)
      const response = await projectsUploadService.obtenerListadoProyectos({ 
        page: currentPage || page,
        limit: currentLimit || limit,
        search: search || undefined,
      })
      setProyectos(response.data || [])
      setTotal(response.total || 0)
      setPages(response.totalPages || 1)
    } catch (error) {
      console.error('Error al cargar proyectos:', error)
      toast.error('No se pudieron cargar los proyectos')
    } finally {
      setLoadingProyectos(false)
    }
  }, [page, limit])

  // Cargar usuarios
  const cargarUsuarios = useCallback(async () => {
    try {
      setLoadingUsuarios(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/simple/list`, {
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
    cargarProyectos(searchTerm, page, limit)
    cargarUsuarios()
    cargarClientes()
    cargarAreas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handlers para paginación y búsqueda
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    cargarProyectos(searchTerm, newPage, limit)
  }, [searchTerm, limit, cargarProyectos])

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
    cargarProyectos(searchTerm, 1, newLimit)
  }, [searchTerm, cargarProyectos])

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    setPage(1)
    cargarProyectos(value, 1, limit)
  }, [limit, cargarProyectos])

  // Formatear número con separadores de miles (permite punto decimal mientras se escribe)
  const formatNumber = (value: string): string => {
    const num = value.replace(/,/g, '')
    if (!num) return ''
    
    // Si termina en punto decimal, mantenerlo para permitir escribir decimales
    if (num.endsWith('.')) return num
    
    // Si tiene punto pero no es un número válido completo, mantener como está
    if (num.includes('.') && num.split('.')[1] !== undefined) {
      const [integer, decimal] = num.split('.')
      if (isNaN(Number(integer))) return ''
      return `${Number(integer).toLocaleString('en-US')}.${decimal}`
    }
    
    if (isNaN(Number(num))) return ''
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
      ivaType: 'percentage' as 'percentage' | 'amount',
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
      const ivaType = updated.ivaType
      
      // Si se modificó subtotalVenta, iva o ivaType, calcular valorVenta con IVA
      if (field === 'subtotalVenta' || field === 'iva' || field === 'ivaType') {
        const subtotal = parseFloat(field === 'subtotalVenta' ? unformatted : updated.subtotalVenta) || 0
        const ivaValue = parseFloat(field === 'iva' ? unformatted : updated.iva) || 0
        const ivaAmount = ivaType === 'percentage' ? subtotal * (ivaValue / 100) : ivaValue
        updated.valorVenta = (subtotal + ivaAmount).toString()
      }
      
      // Si se modificó alguno de los 3 campos de desglose, calcular el presupuestoTotal con IVA
      if (field === 'presupuestoMateriales' || field === 'presupuestoManoObra' || field === 'presupuestoOtros' || field === 'iva' || field === 'ivaType') {
        const materiales = parseFloat(field === 'presupuestoMateriales' ? unformatted : updated.presupuestoMateriales) || 0
        const manoObra = parseFloat(field === 'presupuestoManoObra' ? unformatted : updated.presupuestoManoObra) || 0
        const otros = parseFloat(field === 'presupuestoOtros' ? unformatted : updated.presupuestoOtros) || 0
        const subtotalPresupuesto = materiales + manoObra + otros
        const ivaValue = parseFloat(field === 'iva' ? unformatted : updated.iva) || 0
        const ivaAmount = ivaType === 'percentage' ? subtotalPresupuesto * (ivaValue / 100) : ivaValue
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
        ivaType: nuevoProyecto.ivaType,
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
      const defaultMensaje = modoFormulario === 'editar' ? 'Error al actualizar proyecto' : 'Error al crear proyecto'
      const errorMessage = handleApiError(error)
      toast.error(errorMessage || defaultMensaje)
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
        ivaType: (proyecto as any).ivaType || 'percentage',
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
    fechaInicio: formatDateWithoutTimezone(p.fechaInicio),
    fechaFin: formatDateWithoutTimezone(p.fechaFinEstimada),
    estado: p.estado === 'en_progreso' ? 'En Progreso' : 
            p.estado === 'planificacion' ? 'Planificación' : 
            p.estado === 'completado' ? 'Completado' : 
            p.estado === 'pausado' ? 'Pausado' : 'Otro',
    responsable: p.responsable ? `${p.responsable.firstName} ${p.responsable.lastName}` : 'N/A',
    categoria: p.area?.name || 'General',
  }))

  // Use backend data directly - no local filtering
  const totalValor = proyectosFormateados.reduce((sum, proyecto) => sum + proyecto.valorContrato, 0)

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "En Progreso":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">En Progreso</span>
      case "Planificación":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-yellow-50 text-yellow-700 border-yellow-200">Planificación</span>
      case "Completado":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">Completado</span>
      case "Pausado":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">Pausado</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-700 border-gray-200">{estado}</span>
    }
  }

  // DataTable columns configuration
  const proyectoColumns: Column<typeof proyectosFormateados[0]>[] = useMemo(() => [
    {
      key: 'nombre',
      header: 'Proyecto',
      render: (proyecto) => (
        <div>
          <div className="font-medium text-[#374151]">{proyecto.nombre}</div>
          <div className="text-sm text-[#6b7280]">{proyecto.responsable}</div>
        </div>
      ),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      render: (proyecto) => (
        <div>
          <div className="font-medium text-[#374151]">{proyecto.cliente}</div>
          <div className="text-sm text-[#6b7280]">{proyecto.categoria}</div>
        </div>
      ),
    },
    {
      key: 'categoria',
      header: 'Área',
      render: (proyecto) => (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs border border-[#e5e7eb] bg-white text-[#374151]">
          {proyecto.categoria}
        </span>
      ),
    },
    {
      key: 'valorVenta',
      header: 'Valor Venta',
      render: (proyecto) => (
        <span className="font-medium text-green-600">${proyecto.valorVenta.toLocaleString()}</span>
      ),
    },
    {
      key: 'valorContrato',
      header: 'Presupuesto',
      render: (proyecto) => (
        <span className="font-medium text-[#374151]">${proyecto.valorContrato.toLocaleString()}</span>
      ),
    },
    {
      key: 'fechas',
      header: 'Fechas',
      render: (proyecto) => (
        <div className="text-sm">
          <div className="text-[#374151]">{proyecto.fechaInicio}</div>
          <div className="text-[#6b7280] text-xs">Fin: {proyecto.fechaFin}</div>
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (proyecto) => getStatusBadge(proyecto.estado),
    },
  ], [])

  // DataTable actions configuration
  const proyectoActions = useMemo((): Action<typeof proyectosFormateados[0]>[] => [
    {
      label: 'Ver',
      icon: <Eye size={16} />,
      onClick: (proyecto) => verDetalleProyecto(proyecto.id),
    },
    {
      label: 'Editar',
      icon: <Edit size={16} />,
      onClick: (proyecto) => abrirEditarProyecto(proyecto.id),
    },
  ], [])

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
                <ActionButton 
                  variant="outline" 
                  onClick={descargarPlantilla} 
                  disabled={downloadingTemplate}
                  startIcon={downloadingTemplate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                >
                  {downloadingTemplate ? 'Descargando...' : 'Plantilla Excel'}
                </ActionButton>
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
                <ActionButton 
                  variant="outline"
                  onClick={() => setShowBulkUploadDialog(true)}
                  startIcon={<Upload className="h-4 w-4" />}
                >
                  Carga Masiva
                </ActionButton>
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
              <CreateButton>
                Nuevo Proyecto
              </CreateButton>
            </DialogTrigger>
            <DialogContent className="w-[90vw] max-w-[1200px] max-h-[90vh] overflow-y-auto p-6">
              <DialogHeader>
                <DialogTitle>{modoFormulario === 'editar' ? 'Editar Proyecto' : 'Registrar Nuevo Proyecto'}</DialogTitle>
                <DialogDescription>
                  {modoFormulario === 'editar' ? 'Modifica los datos del proyecto' : 'Crea un nuevo proyecto en el sistema'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Fila 1: Nombre del Proyecto + Cliente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FloatingInput
                    label="Nombre del Proyecto *"
                    placeholder="Ej: Instalación eléctrica Planta Norte"
                    value={nuevoProyecto.nombreProyecto}
                    onChange={(e) => setNuevoProyecto({...nuevoProyecto, nombreProyecto: e.target.value})}
                    error={formErrors.nombreProyecto}
                  />
                  
                  <FloatingSelect
                    label="Cliente"
                    value={nuevoProyecto.clientId}
                    onChange={(value) => setNuevoProyecto({...nuevoProyecto, clientId: value as string})}
                    options={[
                      { label: 'Sin cliente', value: '' },
                      ...clientes.map((c) => ({ 
                        label: `${c.name} (RFC: ${c.taxId})`, 
                        value: c.id 
                      }))
                    ]}
                    placeholder="Selecciona un cliente"
                    searchable
                    searchPlaceholder="Buscar por nombre o RFC..."
                    helperText="Busca y selecciona un cliente existente o déjalo vacío"
                  />
                </div>

                {/* Fila 2: Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FloatingDatePicker
                    label="Fecha Inicio *"
                    value={stringToLocalDate(nuevoProyecto.fechaInicio)}
                    onChange={(date) => setNuevoProyecto({...nuevoProyecto, fechaInicio: date instanceof Date ? format(date, 'yyyy-MM-dd') : ''})}
                    placeholder="Seleccionar fecha"
                  />
                  <FloatingDatePicker
                    label="Fecha Fin Estimada"
                    value={stringToLocalDate(nuevoProyecto.fechaFinEstimada)}
                    onChange={(date) => setNuevoProyecto({...nuevoProyecto, fechaFinEstimada: date instanceof Date ? format(date, 'yyyy-MM-dd') : ''})}
                    placeholder="Seleccionar fecha (opcional)"
                  />
                </div>

                {/* Sección Venta - Usando componente reutilizable */}
                <FinancialAmountSection
                  title="💰 Venta"
                  iva={nuevoProyecto.ivaType === 'percentage' ? nuevoProyecto.iva : formatNumber(nuevoProyecto.iva)}
                  ivaType={nuevoProyecto.ivaType}
                  subtotal={formatNumber(nuevoProyecto.subtotalVenta)}
                  total={formatNumber(nuevoProyecto.valorVenta)}
                  onIvaChange={(value) => handlePresupuestoChange('iva', value)}
                  onIvaTypeChange={(type) => handlePresupuestoChange('ivaType', type)}
                  onSubtotalChange={(value) => handlePresupuestoChange('subtotalVenta', value)}
                  subtotalLabel="Subtotal Venta (sin IVA) *"
                  totalLabel="Total Venta (con IVA)"
                  subtotalPlaceholder="Ej: 100,000"
                  subtotalError={formErrors.subtotalVenta}
                  subtotalHelperText="Monto sin IVA"
                />

                {/* Sección Costos Estimados */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-[#164e63]">📊 Costos Estimados</h3>
                  {formErrors.presupuestos && (
                    <p className="text-sm text-red-500">{formErrors.presupuestos}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FloatingInput
                      label="Materiales *"
                      placeholder="Ej: 20,000"
                      value={formatNumber(nuevoProyecto.presupuestoMateriales)}
                      onChange={(e) => handlePresupuestoChange('presupuestoMateriales', e.target.value)}
                    />
                    <FloatingInput
                      label="Mano de Obra *"
                      placeholder="Ej: 25,000"
                      value={formatNumber(nuevoProyecto.presupuestoManoObra)}
                      onChange={(e) => handlePresupuestoChange('presupuestoManoObra', e.target.value)}
                    />
                    <FloatingInput
                      label="Otros *"
                      placeholder="Ej: 5,000"
                      value={formatNumber(nuevoProyecto.presupuestoOtros)}
                      onChange={(e) => handlePresupuestoChange('presupuestoOtros', e.target.value)}
                    />
                    <FloatingInput
                      label="Total Costos (con IVA)"
                      placeholder="Calculado automáticamente"
                      value={formatNumber(nuevoProyecto.presupuestoTotal)}
                      readOnly
                      helperText="Suma de costos + IVA"
                      className="bg-[#f9fafb]"
                    />
                  </div>
                </div>

                {/* Responsable - solo */}
                <FloatingSelect
                  label="Responsable del Proyecto *"
                  value={nuevoProyecto.responsableEmail}
                  onChange={(value) => setNuevoProyecto({...nuevoProyecto, responsableEmail: value as string})}
                  options={usuarios.length === 0 ? [
                    { label: 'No hay usuarios disponibles', value: '', disabled: true }
                  ] : usuarios.map((u) => ({
                    label: `${u.fullName} (${u.email})`,
                    value: u.email
                  }))}
                  placeholder={loadingUsuarios ? "Cargando usuarios..." : "Selecciona un responsable"}
                  disabled={loadingUsuarios}
                  error={formErrors.responsableEmail}
                />

                {/* Descripción - al final, ancho completo */}
                <div>
                  <Label className="text-sm font-medium text-[#374151]">Descripción</Label>
                  <Textarea 
                    placeholder="Ingrese una descripción detallada del proyecto (opcional)"
                    value={nuevoProyecto.descripcion}
                    onChange={(e) => setNuevoProyecto({...nuevoProyecto, descripcion: e.target.value})}
                    rows={4}
                    className="mt-1.5 border-[#e5e7eb] focus:border-[#164e63] focus:ring-[#164e63] rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter>
                <ActionButton 
                  variant="cancel" 
                  onClick={() => setOpenDialog(false)} 
                  disabled={loading}
                >
                  Cancelar
                </ActionButton>
                <ActionButton 
                  variant="save" 
                  onClick={crearNuevoProyecto} 
                  disabled={loading}
                  loading={loading}
                  loadingText={modoFormulario === 'editar' ? 'Guardando...' : 'Creando...'}
                >
                  {modoFormulario === 'editar' ? 'Guardar Cambios' : 'Crear Proyecto'}
                </ActionButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards - Reusables */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Valor Total"
          value={`$${totalValor.toLocaleString()}`}
          subtitle={`${total} proyectos`}
          icon={<DollarSign className="h-4 w-4" />}
          variant="info"
        />
        <KpiCard
          title="En Progreso"
          value={proyectosFormateados.filter((p) => p.estado === "En Progreso").length}
          subtitle="Activos"
          icon={<TrendingUp className="h-4 w-4" />}
          variant="info"
        />
        <KpiCard
          title="Completados"
          value={proyectosFormateados.filter((p) => p.estado === "Completado").length}
          subtitle="Finalizados"
          icon={<Briefcase className="h-4 w-4" />}
          variant="success"
        />
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

      {/* DataTable con paginación y búsqueda */}
      <DataTable
        title="Listado de Proyectos"
        columns={proyectoColumns}
        data={proyectosFormateados}
        keyExtractor={(proyecto) => proyecto.id}
        actions={proyectoActions}
        loading={loadingProyectos}
        emptyMessage="No se encontraron proyectos. Intenta con otra búsqueda o crea un nuevo proyecto."
        
        // Search filter
        searchFilter={{ placeholder: 'Buscar por nombre, cliente o ID...', debounceMs: 1000 }}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        
        // Pagination
        pagination={{
          page,
          limit,
          total,
          totalPages: pages,
        }}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleLimitChange}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />

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
                  <p className="text-sm">{formatDateWithoutTimezone(proyectoSeleccionado.fechaInicio)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha Fin Estimada</Label>
                  <p className="text-sm">{formatDateWithoutTimezone(proyectoSeleccionado.fechaFinEstimada)}</p>
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
                  <p>{formatDateWithoutTimezone(proyectoSeleccionado.createdAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
