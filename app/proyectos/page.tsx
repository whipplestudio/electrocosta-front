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
import { Upload, Download, Plus, Search, FileText, Calendar as CalendarIcon, Loader2, Eye, Edit, AlertCircle, Check, ChevronsUpDown, Info, CheckCircle2, XCircle, Save, FileSpreadsheet, TrendingUp, TrendingDown, DollarSign, Briefcase, Percent, HelpCircle, Building2, User, Wallet, Users, HardHat, Package, FolderOpen, FileClock, ClipboardList, StickyNote, Flag } from "lucide-react"
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
import { projectsService } from "@/services/projects.service"
import { handleApiError } from "@/lib/api-client"
import { clientsService, type ClientSimple } from "@/services/clients.service"
import { areasService, type AreaSimple } from "@/services/areas.service"
import { BulkUploadDialog } from "@/components/bulk-upload-dialog"
import { BulkUploadGuideDialogProyectos } from "@/components/bulk-upload-guide-dialog-proyectos"
import { CreateButton, ActionButton, DataTable, Column, Action, KpiCard } from "@/components/ui"
import { FloatingInput } from "@/components/ui/floating-input"
import { FloatingSelect } from "@/components/ui/floating-select"
import { FloatingDatePicker } from "@/components/ui/floating-date-picker"
import { DynamicForm, FormSection, useDynamicForm } from "@/components/ui/dynamic-form"
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
  const [guideOpen, setGuideOpen] = useState(false)
  
  // Estados para clientes
  const [clientes, setClientes] = useState<ClientSimple[]>([])
  const [loadingClientes, setLoadingClientes] = useState(false)
  const [openClientePopover, setOpenClientePopover] = useState(false)
  const [openClientePopoverEdit, setOpenClientePopoverEdit] = useState(false)
  
  // Estados para áreas
  const [areas, setAreas] = useState<AreaSimple[]>([])
  const [loadingAreas, setLoadingAreas] = useState(false)
  
  // Estado para datos financieros consolidados
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalProfit: 0,
    profitMargin: 0,
  })
  const [loadingFinancial, setLoadingFinancial] = useState(false)
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

  // Cargar datos financieros consolidados
  const cargarDatosFinancieros = useCallback(async () => {
    try {
      setLoadingFinancial(true)
      const data = await projectsService.getConsolidatedIncomeStatement()
      setFinancialData({
        totalIncome: data.totals.totalIncome,
        totalExpenses: data.totals.totalExpenses,
        totalProfit: data.totals.totalProfit,
        profitMargin: data.profitMargin,
      })
    } catch (error) {
      console.error('Error al cargar datos financieros:', error)
      // No mostrar toast para no ser intrusivo
    } finally {
      setLoadingFinancial(false)
    }
  }, [])

  useEffect(() => {
    cargarProyectos(searchTerm, page, limit)
    cargarUsuarios()
    cargarClientes()
    cargarAreas()
    cargarDatosFinancieros()
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
    // Campos financieros reales
    totalIncome: Number(p.totalIncome) || 0,
    totalExpenses: Number(p.totalExpenses) || 0,
    netProfit: Number(p.netProfit) || 0,
    profitMargin: Number(p.profitMargin) || 0,
    fechaInicio: formatDateWithoutTimezone(p.fechaInicio),
    fechaFin: formatDateWithoutTimezone(p.fechaFinEstimada),
    estado: p.estado === 'en_progreso' ? 'En Progreso' : 
            p.estado === 'planificacion' ? 'Planificación' : 
            p.estado === 'completado' ? 'Completado' : 
            p.estado === 'pausado' ? 'Pausado' : 'Otro',
    responsable: p.responsable ? `${p.responsable.firstName} ${p.responsable.lastName}` : 'N/A',
    categoria: p.area?.name || 'General',
  }))

  // Calcular KPIs financieros reales
  const totalPresupuesto = proyectosFormateados.reduce((sum, p) => sum + p.valorContrato, 0)
  const totalIngresos = proyectosFormateados.reduce((sum, p) => sum + p.totalIncome, 0)
  const totalGastos = proyectosFormateados.reduce((sum, p) => sum + p.totalExpenses, 0)
  const totalGanancia = proyectosFormateados.reduce((sum, p) => sum + p.netProfit, 0)
  const margenPromedio = proyectosFormateados.length > 0 
    ? proyectosFormateados.reduce((sum, p) => sum + p.profitMargin, 0) / proyectosFormateados.length 
    : 0

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
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header - Mobile First */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Carga de Proyectos</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gestión de proyectos y contratos</p>
        </div>
        {/* Toolbar buttons - 2 cols on mobile, horizontal on desktop */}
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-nowrap md:justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <ActionButton 
                  variant="ghost"
                  onClick={() => setGuideOpen(true)}
                  size="sm"
                  className="w-full md:w-auto md:h-9 md:px-3"
                  startIcon={<HelpCircle className="h-4 w-4" />}
                >
                  Guía
                </ActionButton>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs bg-slate-700 dark:bg-slate-200 border-slate-600 dark:border-slate-300">
                <div className="space-y-1">
                  <p className="font-semibold text-white dark:text-slate-900">Guía de carga masiva</p>
                  <p className="text-xs text-slate-200 dark:text-slate-700">
                    Ver instrucciones detalladas sobre cómo usar la plantilla Excel
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
                  onClick={descargarPlantilla} 
                  disabled={downloadingTemplate}
                  size="sm"
                  className="w-full md:w-auto md:h-9 md:px-3"
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
                  size="sm"
                  className="w-full md:w-auto md:h-9 md:px-3"
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
          {/* Botón Nuevo Proyecto */}
          <ActionButton onClick={() => setOpenDialog(true)} size="sm" className="w-full md:w-auto md:h-9 md:px-3">
            Nuevo Proyecto
          </ActionButton>

          {/* Formulario de Proyecto usando DynamicForm */}
          <DynamicForm
            isOpen={openDialog}
            onOpenChange={(open) => {
              setOpenDialog(open)
              if (!open) resetFormulario()
            }}
            title={modoFormulario === 'editar' ? 'Editar Proyecto' : 'Registrar Nuevo Proyecto'}
            description={modoFormulario === 'editar' ? 'Modifica los datos del proyecto' : 'Crea un nuevo proyecto en el sistema'}
            mode={modoFormulario}
            maxWidth="full"
            dialogClassName="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto"
            data={nuevoProyecto}
            onChange={setNuevoProyecto}
            onSubmit={crearNuevoProyecto}
            loading={loading}
            errors={formErrors}
            sections={[
              {
                columns: 2,
                fields: [
                  {
                    name: 'nombreProyecto',
                    type: 'text',
                    label: 'Nombre del Proyecto',
                    required: true,
                    placeholder: 'Ej: Instalación eléctrica Planta Norte',
                    colSpan: 1,
                  },
                  {
                    name: 'clientId',
                    type: 'select',
                    label: 'Cliente',
                    placeholder: 'Selecciona un cliente',
                    options: [
                      { label: 'Sin cliente', value: '' },
                      ...clientes.map((c) => ({ 
                        label: `${c.name} (RFC: ${c.taxId})`, 
                        value: c.id 
                      }))
                    ],
                    searchable: true,
                    required: true,
                    searchPlaceholder: 'Buscar por nombre o RFC...',
                    helperText: 'Busca y selecciona un cliente existente o déjalo vacío',
                    colSpan: 1,
                  },
                ],
              },
              {
                columns: 2,
                fields: [
                  {
                    name: 'fechaInicio',
                    type: 'custom',
                    label: 'Fecha Inicio',
                    required: true,
                    render: ({ value, onChange }) => (
                      <FloatingDatePicker
                        label="Fecha Inicio *"
                        value={stringToLocalDate(value as string)}
                        onChange={(date) => onChange(date instanceof Date ? format(date, 'yyyy-MM-dd') : '')}
                        placeholder="Seleccionar fecha"
                      />
                    ),
                    colSpan: 1,
                  },
                  {
                    name: 'fechaFinEstimada',
                    type: 'custom',
                    label: 'Fecha Fin Estimada',
                    render: ({ value, onChange }) => (
                      <FloatingDatePicker
                        label="Fecha Fin Estimada"
                        value={stringToLocalDate(value as string)}
                        onChange={(date) => onChange(date instanceof Date ? format(date, 'yyyy-MM-dd') : '')}
                        placeholder="Seleccionar fecha (opcional)"
                      />
                    ),
                    colSpan: 1,
                  },
                ],
              },
              {
                fields: [
                  {
                    name: 'ventaSection',
                    type: 'custom',
                    label: '',
                    colSpan: 'full',
                    render: () => (
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
                    ),
                  },
                ],
              },
              {
                title: '📊 Costos Estimados',
                description: formErrors.presupuestos,
                columns: 4,
                fields: [
                  {
                    name: 'presupuestoMateriales',
                    type: 'custom',
                    label: 'Materiales',
                    required: true,
                    render: ({ value, onChange }) => (
                      <FloatingInput
                        label="Materiales *"
                        placeholder="Ej: 20,000"
                        value={formatNumber(value as string)}
                        onChange={(e) => handlePresupuestoChange('presupuestoMateriales', e.target.value)}
                      />
                    ),
                    colSpan: 1,
                  },
                  {
                    name: 'presupuestoManoObra',
                    type: 'custom',
                    label: 'Mano de Obra',
                    required: true,
                    render: ({ value, onChange }) => (
                      <FloatingInput
                        label="Mano de Obra *"
                        placeholder="Ej: 25,000"
                        value={formatNumber(value as string)}
                        onChange={(e) => handlePresupuestoChange('presupuestoManoObra', e.target.value)}
                      />
                    ),
                    colSpan: 1,
                  },
                  {
                    name: 'presupuestoOtros',
                    type: 'custom',
                    label: 'Otros',
                    required: true,
                    render: ({ value, onChange }) => (
                      <FloatingInput
                        label="Otros *"
                        placeholder="Ej: 5,000"
                        value={formatNumber(value as string)}
                        onChange={(e) => handlePresupuestoChange('presupuestoOtros', e.target.value)}
                      />
                    ),
                    colSpan: 1,
                  },
                  {
                    name: 'presupuestoTotal',
                    type: 'custom',
                    label: 'Total Costos (con IVA)',
                    render: ({ value }) => (
                      <FloatingInput
                        label="Total Costos (con IVA)"
                        placeholder="Calculado automáticamente"
                        value={formatNumber(value as string)}
                        readOnly
                        helperText="Suma de costos + IVA"
                        className="bg-[#f9fafb]"
                      />
                    ),
                    colSpan: 1,
                  },
                ],
              },
              {
                fields: [
                  {
                    name: 'responsableEmail',
                    type: 'select',
                    label: 'Responsable del Proyecto',
                    required: true,
                    placeholder: loadingUsuarios ? "Cargando usuarios..." : "Selecciona un responsable",
                    options: usuarios.length === 0 ? [
                      { label: 'No hay usuarios disponibles', value: '', disabled: true }
                    ] : usuarios.map((u) => ({
                      label: `${u.fullName} (${u.email})`,
                      value: u.email
                    })),
                    disabled: loadingUsuarios,
                    colSpan: 'full',
                  },
                ],
              },
              {
                fields: [
                  {
                    name: 'descripcion',
                    type: 'textarea',
                    label: 'Descripción',
                    placeholder: 'Ingrese una descripción detallada del proyecto (opcional)',
                    rows: 4,
                    colSpan: 'full',
                  },
                ],
              },
            ]}
            submitLabel="Crear Proyecto"
            submitLabelEditing="Guardar Cambios"
            loadingLabel="Creando..."
            loadingLabelEditing="Guardando..."
          />
        </div>
      </div>

      {/* KPI Cards - Reusables - Métricas Financieras Reales - Mobile First */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Ingresos Totales"
          value={`$${financialData.totalIncome.toLocaleString()}`}
          subtitle={`${total} proyectos`}
          icon={<DollarSign className="h-4 w-4" />}
          variant="success"
          loading={loadingFinancial}
        />
        <KpiCard
          title="Gastos Totales"
          value={`$${financialData.totalExpenses.toLocaleString()}`}
          subtitle="Cuentas por pagar"
          icon={<TrendingDown className="h-4 w-4" />}
          variant="danger"
          loading={loadingFinancial}
        />
        <KpiCard
          title="Ganancia Neta"
          value={`$${financialData.totalProfit.toLocaleString()}`}
          subtitle="Ingresos - Gastos"
          icon={<TrendingUp className="h-4 w-4" />}
          variant={financialData.totalProfit >= 0 ? "info" : "danger"}
          loading={loadingFinancial}
        />
        <KpiCard
          title="Margen Promedio"
          value={`${financialData.profitMargin.toFixed(1)}%`}
          subtitle="Rentabilidad"
          icon={<Percent className="h-4 w-4" />}
          variant={financialData.profitMargin >= 20 ? "success" : financialData.profitMargin >= 10 ? "info" : "warning"}
          loading={loadingFinancial}
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

      {/* Modal Ver Detalle - Mobile First with Enhanced UI */}
      <Dialog open={verModalOpen} onOpenChange={setVerModalOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-[#164e63] to-[#0e3a4a] p-4 sm:p-6">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                <FolderOpen className="h-4 w-4" />
                <span>Detalle de Proyecto</span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                {proyectoSeleccionado?.nombreProyecto}
              </DialogTitle>
              {proyectoSeleccionado?.cliente && (
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <Building2 className="h-4 w-4" />
                  <span>{proyectoSeleccionado.cliente.name}</span>
                </div>
              )}
            </DialogHeader>
          </div>

          {proyectoSeleccionado && (
            <div className="p-4 sm:p-6 space-y-5">
              {/* Status Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "px-3 py-1 text-xs font-medium",
                    proyectoSeleccionado.estado === 'activo' && "bg-green-50 text-green-700 border-green-200",
                    proyectoSeleccionado.estado === 'pendiente' && "bg-amber-50 text-amber-700 border-amber-200",
                    proyectoSeleccionado.estado === 'completado' && "bg-blue-50 text-blue-700 border-blue-200",
                    proyectoSeleccionado.estado === 'cancelado' && "bg-red-50 text-red-700 border-red-200"
                  )}
                >
                  <Flag className="h-3 w-3 mr-1.5" />
                  {proyectoSeleccionado.estado}
                </Badge>
                <Badge variant="outline" className="px-3 py-1 text-xs">
                  <Wallet className="h-3 w-3 mr-1.5 text-[#164e63]" />
                  Prioridad: {proyectoSeleccionado.prioridad}
                </Badge>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fechas */}
                <div className="bg-slate-50 rounded-lg p-3 space-y-3">
                  <div className="flex items-center gap-2 text-[#164e63] font-medium text-sm">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Fechas</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inicio:</span>
                      <span className="font-medium">{formatDateWithoutTimezone(proyectoSeleccionado.fechaInicio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fin estimada:</span>
                      <span className="font-medium">{formatDateWithoutTimezone(proyectoSeleccionado.fechaFinEstimada)}</span>
                    </div>
                  </div>
                </div>

                {/* Presupuesto */}
                <div className="bg-[#f0fdf4] rounded-lg p-3 space-y-3">
                  <div className="flex items-center gap-2 text-[#166534] font-medium text-sm">
                    <DollarSign className="h-4 w-4" />
                    <span>Presupuesto</span>
                  </div>
                  <div className="text-2xl font-bold text-[#166534]">
                    ${Number(proyectoSeleccionado.presupuestoTotal || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-[#15803d]">Total estimado</div>
                </div>
              </div>

              {/* Desglose del Presupuesto */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="text-sm font-semibold text-[#374151] mb-3 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-[#164e63]" />
                  Desglose del Presupuesto
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <Package className="h-4 w-4 mx-auto mb-1.5 text-[#6b7280]" />
                    <div className="text-xs text-muted-foreground">Materiales</div>
                    <div className="font-semibold text-sm">${Number(proyectoSeleccionado.presupuestoMateriales || 0).toLocaleString()}</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <HardHat className="h-4 w-4 mx-auto mb-1.5 text-[#6b7280]" />
                    <div className="text-xs text-muted-foreground">Mano de Obra</div>
                    <div className="font-semibold text-sm">${Number(proyectoSeleccionado.presupuestoManoObra || 0).toLocaleString()}</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg col-span-2 sm:col-span-1">
                    <FileClock className="h-4 w-4 mx-auto mb-1.5 text-[#6b7280]" />
                    <div className="text-xs text-muted-foreground">Otros</div>
                    <div className="font-semibold text-sm">${Number(proyectoSeleccionado.presupuestoOtros || 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Responsable y Área */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-[#164e63]/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-[#164e63]" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Responsable</div>
                    <div className="text-sm font-medium">
                      {proyectoSeleccionado.responsable 
                        ? `${proyectoSeleccionado.responsable.firstName} ${proyectoSeleccionado.responsable.lastName}`
                        : 'Sin asignar'
                      }
                    </div>
                    {proyectoSeleccionado.responsable?.email && (
                      <div className="text-xs text-muted-foreground">{proyectoSeleccionado.responsable.email}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-[#84cc16]/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-4 w-4 text-[#65a30d]" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Área</div>
                    <div className="text-sm font-medium">{proyectoSeleccionado.area?.name || 'Sin área'}</div>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              {proyectoSeleccionado.descripcion && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-[#374151] font-medium text-sm mb-2">
                    <StickyNote className="h-4 w-4 text-[#164e63]" />
                    <span>Descripción</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {proyectoSeleccionado.descripcion}
                  </p>
                </div>
              )}

              {/* Observaciones */}
              {proyectoSeleccionado.observaciones && (
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                  <div className="flex items-center gap-2 text-amber-700 font-medium text-sm mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Observaciones</span>
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    {proyectoSeleccionado.observaciones}
                  </p>
                </div>
              )}

              {/* Footer info */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  <span>Origen: <span className="font-medium">{proyectoSeleccionado.origenCarga}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>Creado: <span className="font-medium">{formatDateWithoutTimezone(proyectoSeleccionado.createdAt)}</span></span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3 p-4 sm:p-6 bg-slate-50 border-t">
            <ActionButton 
              variant="cancel" 
              onClick={() => setVerModalOpen(false)} 
              className="w-full sm:w-auto"
              size="md"
            >
              Cerrar
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Guía de Carga Masiva */}
      <BulkUploadGuideDialogProyectos
        open={guideOpen}
        onOpenChange={setGuideOpen}
      />
    </div>
  )
}
