"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  CalendarIcon,
  Plus,
  Edit,
  Eye,
  Download,
  Filter,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  Loader2,
  ChevronDown,
  Trash2,
  Users,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Info,
  History,
  Receipt,
  CreditCard,
  DollarSign,
  FileText,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Helper para parsear fecha sin timezone (evita que se muestre un día atrasado)
const parseDateWithoutTimezone = (dateStr: string | Date): Date => {
  if (dateStr instanceof Date) return dateStr
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number)
  return new Date(year, month - 1, day)
}
import { toast } from "sonner"
import { useAccountsReceivable } from "@/hooks/use-accounts-receivable"
import { AccountReceivable, AccountReceivableStatus } from "@/types/accounts-receivable"
import { clientsService, type Client } from "@/services/clients.service"
import { categoriesService, type Category } from "@/services/categories.service"
import { projectsService, type Project } from "@/services/projects.service"
import { accountsReceivableUploadService } from "@/services/accounts-receivable-upload.service"
import { accountsReceivableService } from "@/services/accounts-receivable.service"
import apiClient from "@/lib/api-client"
import { RouteProtection } from "@/components/route-protection"
import { BulkUploadDialog } from "@/components/bulk-upload-dialog"

// Helper para mapear estados del backend al frontend
const mapEstado = (status: AccountReceivableStatus): string => {
  switch (status) {
    case AccountReceivableStatus.PENDING:
      return "vigente"
    case AccountReceivableStatus.PARTIAL:
      return "vigente"
    case AccountReceivableStatus.PAID:
      return "pagado"
    case AccountReceivableStatus.OVERDUE:
      return "vencido"
    case AccountReceivableStatus.CANCELLED:
      return "pagado"
    default:
      return "vigente"
  }
}

export default function CuentasCobrarPage() {
  return (
    <RouteProtection requiredPermissions={["cuentas_cobrar.registro.ver"]}>
      <CuentasCobrarPageContent />
    </RouteProtection>
  )
}

function CuentasCobrarPageContent() {
  const {
    accounts,
    dashboard,
    isLoading,
    error,
    fetchAccounts,
    fetchDashboard,
    createAccount,
    updateAccount,
    deleteAccount,
    pagination,
  } = useAccountsReceivable()
  
  // Estados para diálogos
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetalleDialogOpen, setIsDetalleDialogOpen] = useState(false)
  const [selectedCuenta, setSelectedCuenta] = useState<AccountReceivable | null>(null)
  const [cuentaDetalle, setCuentaDetalle] = useState<AccountReceivable | null>(null)
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    search: "",
    clientId: "all",
    projectId: "all",
    categoryId: "all",
    status: "all" as AccountReceivableStatus | "all",
    invoiceNumber: "",
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    dueDateFrom: undefined as Date | undefined,
    dueDateTo: undefined as Date | undefined,
    minAmount: "",
    maxAmount: "",
    minBalance: "",
    maxBalance: "",
  })
  const [isFilterExpanded, setIsFilterExpanded] = useState(true)

  // Totales calculados desde el backend (con filtros aplicados)
  const [totals, setTotals] = useState({
    totalAmount: 0,
    totalPaid: 0,
    totalBalance: 0,
    totalCount: 0,
  })
  const [filterProjects, setFilterProjects] = useState<any[]>([])
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)
  
  // Estados para clientes, categorías y proyectos
  const [clients, setClients] = useState<Client[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [projects, setProjects] = useState<any[]>([]) // Guardar proyectos completos
  const [loadingSelects, setLoadingSelects] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Estados para carga masiva
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [uploadResponse, setUploadResponse] = useState<any>(null)
  const [validacionResultado, setValidacionResultado] = useState<any>(null)
  const [importacionResultado, setImportacionResultado] = useState<any>(null)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Estados para historial de pagos
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [selectedAccountForHistory, setSelectedAccountForHistory] = useState<AccountReceivable | null>(null)
  const [accountPayments, setAccountPayments] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    invoiceNumber: '',
    iva: '16',
    ivaType: 'percentage' as 'percentage' | 'amount', // Nuevo: tipo de IVA
    subtotal: '',
    amount: '',
    categoryId: '',
    issueDate: undefined as Date | undefined,
    dueDate: undefined as Date | undefined,
    description: '',
  })

  // Cargar proyectos cuando cambie el cliente
  useEffect(() => {
    if (formData.clientId) {
      loadProjectsByClient(formData.clientId)
    } else {
      setProjects([])
      // Solo limpiar proyecto si no estamos editando
      if (!selectedCuenta) {
        setFormData(prev => ({ ...prev, projectId: '' }))
      }
    }
  }, [formData.clientId, selectedCuenta])

  // Auto-completar campos cuando se selecciona un proyecto (solo al crear, no al editar)
  useEffect(() => {
    if (formData.projectId && projects.length > 0 && !selectedCuenta) {
      const selectedProject = projects.find(p => p.id === formData.projectId)
      if (selectedProject) {
        console.log("Auto-completando con proyecto:", selectedProject)
        setFormData(prev => ({
          ...prev,
          amount: selectedProject.presupuestoTotal ? String(selectedProject.presupuestoTotal) : prev.amount,
          issueDate: selectedProject.fechaInicio ? new Date(selectedProject.fechaInicio) : prev.issueDate,
          dueDate: selectedProject.fechaFinEstimada ? new Date(selectedProject.fechaFinEstimada) : prev.dueDate,
          description: prev.description || selectedProject.nombreProyecto || '',
        }))
      }
    }
  }, [formData.projectId, projects, selectedCuenta])

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

  // Manejar cambios en campos de presupuesto con cálculo de IVA
  const handlePresupuestoChange = (field: string, value: string) => {
    const unformatted = unformatNumber(value)
    setFormData((prev) => {
      const updated = { ...prev, [field]: unformatted }
      
      // Si se modificó subtotal o iva, calcular amount con IVA
      if (field === 'subtotal' || field === 'iva' || field === 'ivaType') {
        const subtotal = parseFloat(field === 'subtotal' ? unformatted : updated.subtotal) || 0
        const ivaValue = parseFloat(field === 'iva' ? unformatted : updated.iva) || 0
        const ivaType = field === 'ivaType' ? value : updated.ivaType
        
        let ivaAmount = 0
        if (ivaType === 'percentage') {
          // IVA como porcentaje
          ivaAmount = subtotal * (ivaValue / 100)
        } else {
          // IVA como monto fijo en pesos
          ivaAmount = ivaValue
        }
        
        updated.amount = (subtotal + ivaAmount).toString()
      }
      
      return updated
    })
  }

  // Cargar clientes y categorías (sin proyectos)
  const loadClientsAndCategories = async () => {
    setLoadingSelects(true)
    try {
      const [clientsResponse, categoriesData] = await Promise.all([
        clientsService.list(),
        categoriesService.list(),
      ])
      setClients(clientsResponse.data) // Extraer el array de data
      
      // Filtrar solo categorías de tipo "income" (ingresos)
      const incomeCategories = categoriesData.filter(cat => cat.type === 'income')
      console.log('📊 Total de categorías:', categoriesData.length)
      console.log('💰 Categorías de ingreso:', incomeCategories.length)
      
      if (incomeCategories.length === 0 && categoriesData.length > 0) {
        console.warn('⚠️ Hay categorías creadas pero ninguna es de tipo "Ingreso"')
        toast.warning("No hay categorías de tipo 'Ingreso'. Crea categorías de ingreso en el módulo de Categorías.")
      }
      
      setCategories(incomeCategories)
    } catch (error) {
      console.error('Error al cargar clientes y categorías:', error)
      toast.error("Error al cargar opciones del formulario")
    } finally {
      setLoadingSelects(false)
    }
  }

  // Cargar proyectos del cliente seleccionado
  const loadProjectsByClient = async (clientId: string) => {
    if (!clientId) {
      setProjects([])
      return
    }

    setLoadingProjects(true)
    try {
      // Obtener proyectos completos del cliente
      const response = await apiClient.get<any>('/carga/proyectos/listado', { 
        params: { clientId } 
      })
      const proyectos = response.data.data || response.data || []
      setProjects(proyectos) // Guardar proyectos completos
    } catch (error) {
      console.error('Error al cargar proyectos:', error)
      toast.error("Error al cargar proyectos del cliente")
    } finally {
      setLoadingProjects(false)
    }
  }

  // Cargar proyectos cuando cambie el cliente en filtros
  useEffect(() => {
    if (filters.clientId && filters.clientId !== "all") {
      loadProjectsForFilter(filters.clientId)
    } else {
      loadAllProjectsForFilter()
    }
  }, [filters.clientId])

  // Cargar proyectos para filtros (filtrados por cliente si se proporciona)
  const loadProjectsForFilter = async (clientId: string) => {
    try {
      const response = await apiClient.get<any>('/carga/proyectos/listado', { 
        params: { clientId } 
      })
      const proyectos = response.data.data || response.data || []
      setFilterProjects(proyectos)
    } catch (error) {
      console.error('Error al cargar proyectos para filtros:', error)
    }
  }

  // Cargar todos los proyectos sin filtro de cliente
  const loadAllProjectsForFilter = async () => {
    try {
      const response = await apiClient.get<any>('/carga/proyectos/listado')
      const proyectos = response.data.data || response.data || []
      setFilterProjects(proyectos)
    } catch (error) {
      console.error('Error al cargar todos los proyectos:', error)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    handleApplyFilters()
    fetchDashboard()
    loadClientsAndCategories()
  }, [])

  // Aplicar filtros y recargar datos del backend
  const handleApplyFilters = async () => {
    const filterDto: any = {}
    
    if (filters.search) filterDto.search = filters.search
    if (filters.clientId && filters.clientId !== "all") filterDto.clientId = filters.clientId
    if (filters.projectId && filters.projectId !== "all") filterDto.projectId = filters.projectId
    if (filters.categoryId && filters.categoryId !== "all") filterDto.categoryId = filters.categoryId
    if (filters.status && filters.status !== "all") filterDto.status = filters.status
    if (filters.invoiceNumber) filterDto.invoiceNumber = filters.invoiceNumber
    if (filters.dateFrom) filterDto.dateFrom = filters.dateFrom.toISOString()
    if (filters.dateTo) filterDto.dateTo = filters.dateTo.toISOString()
    if (filters.dueDateFrom) filterDto.dueDateFrom = filters.dueDateFrom.toISOString()
    if (filters.dueDateTo) filterDto.dueDateTo = filters.dueDateTo.toISOString()
    if (filters.minAmount) filterDto.minAmount = parseFloat(filters.minAmount)
    if (filters.maxAmount) filterDto.maxAmount = parseFloat(filters.maxAmount)
    if (filters.minBalance) filterDto.minBalance = parseFloat(filters.minBalance)
    if (filters.maxBalance) filterDto.maxBalance = parseFloat(filters.maxBalance)
    
    await fetchAccounts(filterDto)
    await fetchTotals(filterDto)
    await fetchDashboard()
  }

  // Cargar totales desde el backend (con filtros)
  const fetchTotals = async (filterDto?: any) => {
    try {
      const totalsData = await accountsReceivableService.getTotals(filterDto)
      setTotals(totalsData)
    } catch (error) {
      console.error('Error al cargar totales:', error)
    }
  }

  // Limpiar filtros
  const handleClearFilters = async () => {
    setFilters({
      search: "",
      clientId: "all",
      projectId: "all",
      categoryId: "all",
      status: "all",
      invoiceNumber: "",
      dateFrom: undefined,
      dateTo: undefined,
      dueDateFrom: undefined,
      dueDateTo: undefined,
      minAmount: "",
      maxAmount: "",
      minBalance: "",
      maxBalance: "",
    })
    setFilterProjects([])
    await fetchAccounts()
    await fetchDashboard()
  }

  // Cálculos basados en los datos del backend
  const totalPorCobrar = accounts.reduce((sum, cuenta) => sum + Number(cuenta.balance), 0)
  const cuentasVencidas = accounts.filter((c) => c.status === AccountReceivableStatus.OVERDUE).length
  const proximasVencer = accounts.filter((c) => {
    if (c.status === AccountReceivableStatus.PENDING || c.status === AccountReceivableStatus.PARTIAL) {
      if (!c.dueDate) return false
      const dueDate = new Date(c.dueDate)
      const today = new Date()
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays > 0 && diffDays <= 7
    }
    return false
  }).length

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "vencido":
        return <Badge variant="destructive">Vencido</Badge>
      case "proximo_vencer":
        return <Badge className="bg-yellow-100 text-yellow-800">Próximo a Vencer</Badge>
      case "vigente":
        return <Badge className="bg-green-100 text-green-800">Vigente</Badge>
      case "pagado":
        return <Badge className="bg-blue-100 text-blue-800">Pagado</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const handleNuevaCuenta = () => {
    setSelectedCuenta(null)
    // Limpiar formulario
    setFormData({
      clientId: '',
      projectId: '',
      invoiceNumber: '',
      iva: '16',
      ivaType: 'percentage',
      subtotal: '',
      amount: '',
      categoryId: '',
      issueDate: undefined,
      dueDate: undefined,
      description: '',
    })
    setIsDialogOpen(true)
  }

  const handleVerDetalle = (cuenta: AccountReceivable) => {
    setCuentaDetalle(cuenta)
    setIsDetalleDialogOpen(true)
  }

  const handleEditarCuenta = (cuenta: AccountReceivable) => {
    setSelectedCuenta(cuenta)
    
    // Detectar tipo de IVA basándose en el valor
    // Heurística: si IVA <= 100 → porcentaje, si IVA > 100 → monto fijo
    const ivaValue = parseFloat(cuenta.iva?.toString() || '16')
    const detectedIvaType: 'percentage' | 'amount' = ivaValue <= 100 ? 'percentage' : 'amount'
    
    // Pre-llenar formulario con datos existentes
    setFormData({
      clientId: cuenta.clientId,
      projectId: cuenta.projectId || '',
      invoiceNumber: cuenta.invoiceNumber,
      iva: cuenta.iva?.toString() || '16',
      ivaType: detectedIvaType,
      subtotal: cuenta.subtotal?.toString() || '',
      amount: cuenta.amount.toString(),
      categoryId: cuenta.categoryId || '',
      issueDate: parseDateWithoutTimezone(cuenta.issueDate),
      dueDate: cuenta.dueDate ? parseDateWithoutTimezone(cuenta.dueDate) : undefined,
      description: cuenta.description || '',
    })
    setIsDialogOpen(true)
  }

  const handleSubmitForm = async () => {
    // Validaciones básicas
    console.log("FormData:", formData)
    
    // Solo validar campos requeridos (categoryId es opcional)
    const missingFields = []
    if (!formData.clientId) missingFields.push("Cliente")
    if (!formData.invoiceNumber) missingFields.push("Número de Factura")
    if (!formData.subtotal) missingFields.push("Subtotal")
    if (!formData.issueDate) missingFields.push("Fecha de Emisión")
    // dueDate es opcional
    
    if (missingFields.length > 0) {
      toast.error(`Campos requeridos faltantes: ${missingFields.join(", ")}`)
      return
    }

    let result = null
    
    if (selectedCuenta) {
      // Actualizar cuenta existente con todos los campos editables
      result = await updateAccount(selectedCuenta.id, {
        clientId: formData.clientId,
        invoiceNumber: formData.invoiceNumber,
        iva: formData.iva !== "" ? parseFloat(formData.iva) : 0,
        ivaType: formData.ivaType,
        subtotal: parseFloat(formData.subtotal),
        amount: parseFloat(formData.amount),
        projectId: formData.projectId || undefined,
        categoryId: formData.categoryId || undefined,
        issueDate: formData.issueDate?.toISOString(),
        dueDate: formData.dueDate?.toISOString(),
        description: formData.description || undefined,
      })
    } else {
      // Crear nueva cuenta
      result = await createAccount({
        clientId: formData.clientId,
        projectId: formData.projectId || undefined,
        invoiceNumber: formData.invoiceNumber,
        iva: formData.iva !== "" ? parseFloat(formData.iva) : 0,
        ivaType: formData.ivaType,
        subtotal: parseFloat(formData.subtotal),
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId || undefined,
        issueDate: formData.issueDate?.toISOString() || new Date().toISOString(),
        dueDate: formData.dueDate?.toISOString(),
        description: formData.description || undefined,
        currency: 'MXN',
      })
    }
    
    // Solo cerrar el diálogo y recargar si la operación fue exitosa
    if (result) {
      setIsDialogOpen(false)
      setSelectedCuenta(null)
      // Recargar datos
      await handleApplyFilters()
      await fetchDashboard()
    }
  }

  const handleEliminarCuenta = async (cuentaId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta cuenta?')) {
      return
    }
    setDeletingId(cuentaId)
    try {
      await deleteAccount(cuentaId)
      toast.success("Cuenta eliminada correctamente")
      fetchAccounts()
      fetchDashboard()
    } catch (error) {
      console.error('Error al eliminar cuenta:', error)
      toast.error("Error al eliminar la cuenta")
    } finally {
      setDeletingId(null)
    }
  }

  const handleVerHistorial = async (account: AccountReceivable) => {
    setSelectedAccountForHistory(account)
    setLoadingHistory(true)
    setIsHistoryDialogOpen(true)
    try {
      const response = await apiClient.get(`/accounts-receivable/${account.id}/payments`)
      setAccountPayments(response.data || [])
    } catch (error) {
      console.error("Error al cargar historial:", error)
      toast.error("Error al cargar el historial de pagos")
      setAccountPayments([])
    } finally {
      setLoadingHistory(false)
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

  const handleUploadFile = async () => {
    if (!archivo) {
      toast.error('Por favor selecciona un archivo')
      return
    }

    setLoading(true)
    try {
      const response = await accountsReceivableUploadService.subirArchivo(archivo)
      setUploadResponse(response)
      toast.success(`Archivo cargado: ${response.registrosDetectados} registros detectados`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al subir el archivo')
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async () => {
    if (!uploadResponse) {
      toast.error('Primero debes subir un archivo')
      return
    }

    setLoading(true)
    try {
      const resultado = await accountsReceivableUploadService.validarDatos(uploadResponse.uploadId)
      setValidacionResultado(resultado)
      
      if (resultado.puedeImportar) {
        toast.success(`Validación completada: ${resultado.registrosValidos} registros válidos`)
      } else {
        toast.warning(`Validación completada con errores: ${resultado.registrosInvalidos} registros inválidos`)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al validar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!validacionResultado || !validacionResultado.puedeImportar) {
      toast.error('Los datos deben estar validados antes de importar')
      return
    }

    setLoading(true)
    try {
      const resultado = await accountsReceivableUploadService.importarDatos(uploadResponse.uploadId)
      setImportacionResultado(resultado)
      
      // Mostrar resultado según lo que pasó
      const totalRegistros = resultado.registrosImportados + resultado.registrosOmitidos
      
      if (resultado.registrosImportados > 0 && resultado.registrosOmitidos === 0) {
        // Éxito total
        toast.success(`✅ Importación exitosa: ${resultado.registrosImportados} de ${totalRegistros} cuentas importadas`)
      } else if (resultado.registrosImportados > 0 && resultado.registrosOmitidos > 0) {
        // Éxito parcial
        toast.warning(
          `⚠️ Importación parcial: ${resultado.registrosImportados} importadas, ${resultado.registrosOmitidos} con errores. Revisa los detalles.`,
          { duration: 6000 }
        )
        
        // Mostrar errores específicos
        if (resultado.errores && resultado.errores.length > 0) {
          resultado.errores.forEach((error, index) => {
            if (index < 3) { // Mostrar máximo 3 errores en toast
              toast.error(error, { duration: 8000 })
            }
          })
          if (resultado.errores.length > 3) {
            toast.error(`... y ${resultado.errores.length - 3} errores más. Revisa el resumen completo.`, { duration: 6000 })
          }
        }
      } else if (resultado.registrosImportados === 0 && resultado.registrosOmitidos > 0) {
        // Fallo total
        toast.error(`❌ Error: Ninguna cuenta pudo ser importada. ${resultado.registrosOmitidos} registros con errores.`, { duration: 6000 })
        
        // Mostrar errores específicos
        if (resultado.errores && resultado.errores.length > 0) {
          resultado.errores.forEach((error, index) => {
            if (index < 3) { // Mostrar máximo 3 errores en toast
              toast.error(error, { duration: 8000 })
            }
          })
          if (resultado.errores.length > 3) {
            toast.error(`... y ${resultado.errores.length - 3} errores más.`, { duration: 6000 })
          }
        }
      }
      
      // Recargar datos solo si se importó algo
      if (resultado.registrosImportados > 0) {
        await handleApplyFilters()
        await fetchDashboard()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al importar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true)
    try {
      const blob = await accountsReceivableUploadService.descargarPlantilla()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'plantilla_cuentas_cobrar.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Plantilla descargada exitosamente')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al descargar la plantilla')
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

  // Mostrar loading state
  if (isLoading && accounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cuentas por Cobrar</h1>
          <p className="text-muted-foreground">Gestiona las cuentas pendientes de cobro</p>
        </div>
        <div className="flex gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={handleDownloadTemplate}
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
                    Descarga el archivo Excel con el formato correcto para importar múltiples cuentas por cobrar a la vez
                  </p>
                </div>
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
                  <p className="font-semibold text-white dark:text-slate-900">Importación masiva de cuentas por cobrar</p>
                  <p className="text-xs text-slate-200 dark:text-slate-700">
                    Sube un archivo Excel con múltiples cuentas por cobrar a la vez
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button onClick={handleNuevaCuenta}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cuenta
          </Button>
        </div>
      </div>

      {/* KPIs - Calculados desde el backend (con filtros aplicados) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totals.totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">= Cobrado + Por Cobrar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{totals.totalCount} cuentas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cobrado</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totals.totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monto cobrado</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${accounts.filter(c => c.status === AccountReceivableStatus.OVERDUE).reduce((sum, c) => sum + Number(c.balance || 0), 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{accounts.filter(c => c.status === AccountReceivableStatus.OVERDUE).length} cuentas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas a Vencer</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {(() => {
                const now = new Date()
                const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                return accounts.filter(c => {
                  if (!c.dueDate) return false
                  const dueDate = new Date(c.dueDate)
                  return dueDate >= now && dueDate <= sevenDaysFromNow && 
                    (c.status === AccountReceivableStatus.PENDING || c.status === AccountReceivableStatus.PARTIAL)
                }).length
              })()}
            </div>
            <p className="text-xs text-muted-foreground">Próximos 7 días</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalCount}</div>
            <p className="text-xs text-muted-foreground">Facturas emitidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros Compacta */}
      <div className="bg-card border rounded-lg p-4 space-y-3">
        {/* Fila 1: Filtros Rápidos + Botón Avanzados */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Búsqueda */}
          <div className="flex-1 min-w-[250px]">
            <Input
              placeholder="🔍 Buscar cliente, factura o descripción..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="h-10"
            />
          </div>

          {/* Cliente */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Cliente</Label>
            <Select 
              value={filters.clientId} 
              onValueChange={(value) => setFilters({ ...filters, clientId: value })}
            >
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Estado</Label>
            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters({ ...filters, status: value as AccountReceivableStatus | "all" })}
            >
              <SelectTrigger className="w-[150px] h-10">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value={AccountReceivableStatus.PENDING}>Pendiente</SelectItem>
                <SelectItem value={AccountReceivableStatus.PARTIAL}>Parcial</SelectItem>
                <SelectItem value={AccountReceivableStatus.PAID}>Pagado</SelectItem>
                <SelectItem value={AccountReceivableStatus.OVERDUE}>Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2 ml-auto">
            <Sheet open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-10">
                  <Filter className="h-4 w-4 mr-2" />
                  Más Filtros
                  {(() => {
                    const count = [
                      filters.projectId !== "all",
                      filters.categoryId !== "all",
                      filters.invoiceNumber,
                      filters.dateFrom,
                      filters.dueDateFrom,
                      filters.minAmount,
                      filters.minBalance,
                    ].filter(Boolean).length
                    return count > 0 && <Badge variant="secondary" className="ml-2">{count}</Badge>
                  })()}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:max-w-[400px] overflow-y-auto">
                <SheetHeader className="px-6 pt-6">
                  <SheetTitle className="text-xl">Filtros Avanzados</SheetTitle>
                  <SheetDescription className="text-sm">
                    Configura filtros adicionales
                  </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-5 mt-6 px-6 pb-6">
                  {/* Proyecto */}
                  <div className="space-y-2.5">
                    <Label htmlFor="advProjectFilter" className="text-sm font-medium">
                      Proyecto
                      {filters.clientId !== "all" && (
                        <span className="text-xs text-muted-foreground ml-2">(del cliente seleccionado)</span>
                      )}
                    </Label>
                    <Select 
                      value={filters.projectId} 
                      onValueChange={(value) => setFilters({ ...filters, projectId: value })}
                    >
                      <SelectTrigger id="advProjectFilter" className="h-10">
                        <SelectValue placeholder="Todos los proyectos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los proyectos</SelectItem>
                        {filterProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.nombreProyecto || project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Categoría */}
                  <div className="space-y-2.5">
                    <Label htmlFor="advCategoryFilter" className="text-sm font-medium">Categoría</Label>
                    <Select 
                      value={filters.categoryId} 
                      onValueChange={(value) => setFilters({ ...filters, categoryId: value })}
                    >
                      <SelectTrigger id="advCategoryFilter" className="h-10">
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Folio de Factura */}
                  <div className="space-y-2.5">
                    <Label htmlFor="advInvoiceFilter" className="text-sm font-medium">Folio de Factura</Label>
                    <Input
                      id="advInvoiceFilter"
                      placeholder="Ej: FAC-001"
                      value={filters.invoiceNumber}
                      onChange={(e) => setFilters({ ...filters, invoiceNumber: e.target.value })}
                      className="h-10"
                    />
                  </div>

                  {/* Fechas de Emisión */}
                  <div className="space-y-2.5">
                    <Label className="text-sm font-medium">Fecha de Emisión</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-10 justify-start text-left text-sm">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {filters.dateFrom ? format(filters.dateFrom, "dd/MM/yy", { locale: es }) : "Desde"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar 
                            mode="single" 
                            selected={filters.dateFrom} 
                            onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-10 justify-start text-left text-sm">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {filters.dateTo ? format(filters.dateTo, "dd/MM/yy", { locale: es }) : "Hasta"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar 
                            mode="single" 
                            selected={filters.dateTo} 
                            onSelect={(date) => setFilters({ ...filters, dateTo: date })}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Fechas de Vencimiento */}
                  <div className="space-y-2.5">
                    <Label className="text-sm font-medium">Fecha de Vencimiento</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-10 justify-start text-left text-sm">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {filters.dueDateFrom ? format(filters.dueDateFrom, "dd/MM/yy", { locale: es }) : "Desde"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar 
                            mode="single" 
                            selected={filters.dueDateFrom} 
                            onSelect={(date) => setFilters({ ...filters, dueDateFrom: date })}
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-10 justify-start text-left text-sm">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {filters.dueDateTo ? format(filters.dueDateTo, "dd/MM/yy", { locale: es }) : "Hasta"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar 
                            mode="single" 
                            selected={filters.dueDateTo} 
                            onSelect={(date) => setFilters({ ...filters, dueDateTo: date })}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Rangos de Monto */}
                  <div className="space-y-2.5">
                    <Label className="text-sm font-medium">Monto Total</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        placeholder="Mínimo"
                        value={filters.minAmount}
                        onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                        className="h-10"
                      />
                      <Input
                        type="number"
                        placeholder="Máximo"
                        value={filters.maxAmount}
                        onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                        className="h-10"
                      />
                    </div>
                  </div>

                  {/* Rangos de Saldo */}
                  <div className="space-y-2.5">
                    <Label className="text-sm font-medium">Saldo Pendiente</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        placeholder="Mínimo"
                        value={filters.minBalance}
                        onChange={(e) => setFilters({ ...filters, minBalance: e.target.value })}
                        className="h-10"
                      />
                      <Input
                        type="number"
                        placeholder="Máximo"
                        value={filters.maxBalance}
                        onChange={(e) => setFilters({ ...filters, maxBalance: e.target.value })}
                        className="h-10"
                      />
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 pt-6 mt-2 border-t">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-11"
                      onClick={() => {
                        handleClearFilters()
                        setIsAdvancedFiltersOpen(false)
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Limpiar
                    </Button>
                    <Button 
                      className="flex-1 h-11"
                      onClick={() => {
                        handleApplyFilters()
                        setIsAdvancedFiltersOpen(false)
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Aplicar
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button 
              size="sm" 
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="h-10"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClearFilters}
              className="h-10"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Fila 2: Chips de Filtros Activos */}
        {(() => {
          const chips: { label: string; onRemove: () => void }[] = []
          
          if (filters.search) chips.push({ 
            label: `Búsqueda: ${filters.search}`,
            onRemove: () => setFilters({ ...filters, search: '' })
          })
          if (filters.clientId !== "all") {
            const client = clients.find(c => c.id === filters.clientId)
            chips.push({ 
              label: `Cliente: ${client?.name}`,
              onRemove: () => setFilters({ ...filters, clientId: 'all' })
            })
          }
          if (filters.projectId !== "all") {
            const project = filterProjects.find(p => p.id === filters.projectId)
            chips.push({ 
              label: `Proyecto: ${project?.nombreProyecto || project?.name}`,
              onRemove: () => setFilters({ ...filters, projectId: 'all' })
            })
          }
          if (filters.categoryId !== "all") {
            const category = categories.find(c => c.id === filters.categoryId)
            chips.push({ 
              label: `Categoría: ${category?.name}`,
              onRemove: () => setFilters({ ...filters, categoryId: 'all' })
            })
          }
          if (filters.status !== "all") {
            chips.push({ 
              label: `Estado: ${filters.status}`,
              onRemove: () => setFilters({ ...filters, status: 'all' })
            })
          }
          if (filters.invoiceNumber) {
            chips.push({ 
              label: `Factura: ${filters.invoiceNumber}`,
              onRemove: () => setFilters({ ...filters, invoiceNumber: '' })
            })
          }

          return chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip, index) => (
                <Badge 
                  key={index}
                  variant="secondary" 
                  className="px-2 py-1 cursor-pointer hover:bg-destructive/10"
                  onClick={chip.onRemove}
                >
                  {chip.label}
                  <XCircle className="ml-1.5 h-3 w-3" />
                </Badge>
              ))}
            </div>
          )
        })()}
      </div>

      {/* Tabla de Cuentas */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Cuentas por Cobrar</CardTitle>
          <CardDescription>
            Mostrando {accounts.length} cuentas
            {(filters.clientId !== "all" || filters.status !== "all" || filters.dateFrom || filters.dateTo) && " (filtrado)"}
            {isLoading && <Loader2 className="inline ml-2 h-4 w-4 animate-spin" />}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Factura</TableHead>
                <TableHead>Fecha Emisión</TableHead>
                <TableHead>Fecha Vencimiento</TableHead>
                <TableHead>Monto Total</TableHead>
                <TableHead>Saldo Pendiente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    {isLoading ? "Cargando..." : "No se encontraron cuentas por cobrar"}
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((cuenta) => (
                  <TableRow key={cuenta.id}>
                    <TableCell className="font-medium">{cuenta.client?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {cuenta.project?.nombreProyecto || 'Sin proyecto'}
                      </span>
                    </TableCell>
                    <TableCell>{cuenta.invoiceNumber}</TableCell>
                    <TableCell>{format(parseDateWithoutTimezone(cuenta.issueDate), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      {cuenta.dueDate ? format(parseDateWithoutTimezone(cuenta.dueDate), "dd/MM/yyyy") : <span className="text-muted-foreground">Sin vencimiento</span>}
                    </TableCell>
                    <TableCell>${Number(cuenta.amount).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">${Number(cuenta.balance).toLocaleString()}</TableCell>
                    <TableCell>{getEstadoBadge(mapEstado(cuenta.status))}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{cuenta.category?.name || 'Sin categoría'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleVerDetalle(cuenta)} title="Ver detalle">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleVerHistorial(cuenta)} title="Ver historial de pagos">
                          <History className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditarCuenta(cuenta)} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEliminarCuenta(cuenta.id)}
                          disabled={deletingId === cuenta.id}
                          className="text-destructive hover:text-destructive"
                          title="Eliminar"
                        >
                          {deletingId === cuenta.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para nueva/editar cuenta */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) {
          setSelectedCuenta(null)
          setFormData({
            clientId: '',
            projectId: '',
            invoiceNumber: '',
            iva: '16',
            ivaType: 'percentage',
            subtotal: '',
            amount: '',
            categoryId: '',
            issueDate: undefined,
            dueDate: undefined,
            description: '',
          })
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCuenta ? "Editar Cuenta por Cobrar" : "Nueva Cuenta por Cobrar"}</DialogTitle>
            <DialogDescription>
              {selectedCuenta ? "Modifica los datos de la cuenta" : "Registra una nueva cuenta por cobrar"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Cliente - Campo completo para evitar superposición */}
            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente *</Label>
              <Select 
                value={formData.clientId}
                onValueChange={(value) => setFormData({...formData, clientId: value})}
                disabled={loadingSelects}
              >
                <SelectTrigger id="clientId">
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {loadingSelects ? (
                    <SelectItem value="loading" disabled>
                      Cargando...
                    </SelectItem>
                  ) : clients.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      No hay clientes disponibles
                    </SelectItem>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.taxId}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {/* Proyecto */}
            <div className="space-y-2">
              <Label>Proyecto (Opcional)</Label>
              <Select
                value={formData.projectId || undefined}
                onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                disabled={!formData.clientId || loadingProjects}
              >
                <SelectTrigger>
                  {formData.projectId ? (
                    <SelectValue />
                  ) : (
                    <span className="text-muted-foreground">
                      {loadingProjects
                        ? "Cargando proyectos..."
                        : !formData.clientId 
                        ? "Primero selecciona un cliente" 
                        : "Seleccionar proyecto"}
                    </span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {loadingProjects ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cargando proyectos...
                      </div>
                    </SelectItem>
                  ) : !formData.clientId ? (
                    <SelectItem value="no-client" disabled>
                      Selecciona un cliente primero
                    </SelectItem>
                  ) : projects.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Este cliente no tiene proyectos
                    </SelectItem>
                  ) : (
                    <>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.nombreProyecto}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              {!formData.clientId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selecciona un cliente para ver sus proyectos
                </p>
              )}
            </div>
            
            {/* Número de Factura */}
            <div className="space-y-2">
              <Label htmlFor="factura">Número de Factura</Label>
              <Input 
                id="factura" 
                placeholder="FAC-2024-XXX"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
              />
            </div>
            {/* Campos de IVA y Monto */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-primary">💰 Monto e Impuestos</h3>
              
              {/* Selector de Tipo de IVA */}
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg border">
                <Label className="text-sm font-medium">Tipo de IVA:</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ivaType"
                      value="percentage"
                      checked={formData.ivaType === 'percentage'}
                      onChange={(e) => handlePresupuestoChange('ivaType', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Porcentaje (%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ivaType"
                      value="amount"
                      checked={formData.ivaType === 'amount'}
                      onChange={(e) => handlePresupuestoChange('ivaType', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Monto Fijo ($)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="subtotal">Subtotal (sin IVA) *</Label>
                  <Input 
                    id="subtotal"
                    type="text" 
                    placeholder="0"
                    value={formatNumber(formData.subtotal)}
                    onChange={(e) => handlePresupuestoChange('subtotal', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Monto sin IVA
                  </p>
                </div>
                <div>
                  <Label htmlFor="iva">
                    {formData.ivaType === 'percentage' ? 'IVA (%)' : 'IVA ($)'} *
                  </Label>
                  <Input 
                    id="iva"
                    type="text" 
                    placeholder={formData.ivaType === 'percentage' ? '16' : '0'}
                    value={formData.ivaType === 'percentage' ? formData.iva : formatNumber(formData.iva)}
                    onChange={(e) => handlePresupuestoChange('iva', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.ivaType === 'percentage' ? 'Porcentaje de IVA' : 'Monto fijo de IVA'}
                  </p>
                </div>
                <div>
                  <Label htmlFor="amount">Total (con IVA)</Label>
                  <Input 
                    id="amount"
                    type="text" 
                    value={formatNumber(formData.amount)}
                    readOnly
                    className="bg-muted font-semibold text-green-600"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Subtotal + IVA (calculado)
                  </p>
                </div>
              </div>
            </div>
            
            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select 
                value={formData.categoryId}
                onValueChange={(value) => setFormData({...formData, categoryId: value})}
                disabled={loadingSelects}
              >
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Selecciona una categoría (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {loadingSelects ? (
                    <SelectItem value="loading" disabled>
                      Cargando...
                    </SelectItem>
                  ) : categories.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      No hay categorías de tipo "Ingreso". Ve a /categorias para crear una.
                    </SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Emisión *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`w-full justify-start text-left font-normal ${!formData.issueDate ? 'text-muted-foreground' : ''}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.issueDate ? format(formData.issueDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single"
                      selected={formData.issueDate}
                      onSelect={(date) => setFormData({...formData, issueDate: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Fecha de Vencimiento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`w-full justify-start text-left font-normal ${!formData.dueDate ? 'text-muted-foreground' : ''}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate ? format(formData.dueDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) => setFormData({...formData, dueDate: date})}
                      initialFocus
                      disabled={(date) => formData.issueDate ? date < formData.issueDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input 
                id="description" 
                placeholder="Descripción de la cuenta"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitForm} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedCuenta ? "Guardar Cambios" : "Crear Cuenta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver detalle de cuenta */}
      <Dialog open={isDetalleDialogOpen} onOpenChange={setIsDetalleDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Cuenta por Cobrar</DialogTitle>
            <DialogDescription>
              Información completa de la cuenta
            </DialogDescription>
          </DialogHeader>
          {cuentaDetalle && (
            <div className="space-y-6">
              {/* Información del Cliente */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Información del Cliente
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Cliente</Label>
                    <p className="font-medium">{cuentaDetalle.client?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">RFC/Tax ID</Label>
                    <p className="font-medium">{cuentaDetalle.client?.taxId || 'N/A'}</p>
                  </div>
                  {cuentaDetalle.client?.email && (
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{cuentaDetalle.client.email}</p>
                    </div>
                  )}
                  {cuentaDetalle.client?.phone && (
                    <div>
                      <Label className="text-muted-foreground">Teléfono</Label>
                      <p className="font-medium">{cuentaDetalle.client.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de la Factura */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-lg">Información de la Factura</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Número de Factura</Label>
                    <p className="font-medium">{cuentaDetalle.invoiceNumber}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Estado</Label>
                    <div className="mt-1">
                      {getEstadoBadge(mapEstado(cuentaDetalle.status))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fecha de Emisión</Label>
                    <p className="font-medium">{format(new Date(cuentaDetalle.issueDate), "dd/MM/yyyy", { locale: es })}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fecha de Vencimiento</Label>
                    <p className="font-medium">
                      {cuentaDetalle.dueDate ? format(new Date(cuentaDetalle.dueDate), "dd/MM/yyyy", { locale: es }) : <span className="text-muted-foreground">Sin vencimiento</span>}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Categoría</Label>
                    <p className="font-medium">{cuentaDetalle.category?.name || 'Sin categoría'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Proyecto</Label>
                    <p className="font-medium">{cuentaDetalle.project?.name || 'Sin proyecto'}</p>
                  </div>
                </div>
              </div>

              {/* Información Financiera */}
              <div className="border rounded-lg p-4 space-y-3 bg-primary/5">
                <h3 className="font-semibold text-lg">Información Financiera</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Monto Total</Label>
                    <p className="text-xl font-bold text-primary">
                      ${Number(cuentaDetalle.amount).toLocaleString()} {cuentaDetalle.currency}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Monto Pagado</Label>
                    <p className="text-xl font-bold text-green-600">
                      ${Number(cuentaDetalle.paidAmount).toLocaleString()} {cuentaDetalle.currency}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Saldo Pendiente</Label>
                    <p className="text-2xl font-bold text-orange-600">
                      ${Number(cuentaDetalle.balance).toLocaleString()} {cuentaDetalle.currency}
                    </p>
                  </div>
                </div>
              </div>

              {/* Descripción y Notas */}
              {(cuentaDetalle.description || cuentaDetalle.notes) && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-lg">Descripción y Notas</h3>
                  {cuentaDetalle.description && (
                    <div>
                      <Label className="text-muted-foreground">Descripción</Label>
                      <p className="text-sm mt-1">{cuentaDetalle.description}</p>
                    </div>
                  )}
                  {cuentaDetalle.notes && (
                    <div>
                      <Label className="text-muted-foreground">Notas</Label>
                      <p className="text-sm mt-1">{cuentaDetalle.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Historial de Pagos */}
              {cuentaDetalle.payments && cuentaDetalle.payments.length > 0 && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-lg">Historial de Pagos</h3>
                  <div className="space-y-2">
                    {cuentaDetalle.payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-2 bg-muted rounded">
                        <div>
                          <p className="font-medium">${Number(payment.amount).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payment.paymentDate), "dd/MM/yyyy", { locale: es })} - {payment.paymentMethod}
                          </p>
                        </div>
                        {payment.reference && (
                          <Badge variant="outline">{payment.reference}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seguimientos */}
              {cuentaDetalle.followUps && cuentaDetalle.followUps.length > 0 && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-lg">Seguimientos</h3>
                  <div className="space-y-2">
                    {cuentaDetalle.followUps.map((followUp) => (
                      <div key={followUp.id} className="p-2 bg-muted rounded">
                        <div className="flex justify-between items-start mb-1">
                          <Badge variant="outline">{followUp.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(followUp.createdAt), "dd/MM/yyyy", { locale: es })}
                          </span>
                        </div>
                        <p className="text-sm">{followUp.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">Resultado: {followUp.result}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadatos */}
              <div className="border-t pt-3 text-xs text-muted-foreground grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Creado:</span> {format(new Date(cuentaDetalle.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                </div>
                <div>
                  <span className="font-medium">Última actualización:</span> {format(new Date(cuentaDetalle.updatedAt), "dd/MM/yyyy HH:mm", { locale: es })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetalleDialogOpen(false)}>
              Cerrar
            </Button>
            {cuentaDetalle && (
              <Button onClick={() => {
                setIsDetalleDialogOpen(false)
                handleEditarCuenta(cuentaDetalle)
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Cuenta
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Historial de Pagos */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Cobros/Pagos Recibidos
            </DialogTitle>
            <DialogDescription>
              Factura: {selectedAccountForHistory?.invoiceNumber} - Cliente: {selectedAccountForHistory?.client?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-y-auto py-4">
            {/* Resumen de la cuenta */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <Label className="text-xs text-muted-foreground">Monto Original</Label>
                <p className="font-bold text-xl">
                  ${Number(selectedAccountForHistory?.amount || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <Label className="text-xs text-muted-foreground">Total Cobrado</Label>
                <p className="font-bold text-xl text-green-600">
                  ${accountPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <Label className="text-xs text-muted-foreground">Saldo Pendiente</Label>
                <p className="font-bold text-xl text-orange-600">
                  ${Number(selectedAccountForHistory?.balance || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <Label className="text-xs text-muted-foreground">Total de Cobros</Label>
                <p className="font-bold text-xl text-blue-600">{accountPayments.length}</p>
              </div>
            </div>

            {/* Lista de pagos */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Registro de Cobros</h3>
                {loadingHistory && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
              </div>

              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : accountPayments.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Receipt className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      No hay cobros registrados para esta cuenta
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Los cobros aparecerán aquí una vez que sean registrados
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Referencia</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead>Observaciones</TableHead>
                        <TableHead>Registrado por</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accountPayments.map((payment, index) => {
                        const PaymentIcon = payment.paymentMethod === 'transfer' ? CreditCard :
                                           payment.paymentMethod === 'cash' ? DollarSign :
                                           payment.paymentMethod === 'check' ? FileText :
                                           payment.paymentMethod === 'card' ? CreditCard : Receipt

                        return (
                          <TableRow key={payment.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">
                              {accountPayments.length - index}
                            </TableCell>
                            <TableCell>
                              {format(new Date(payment.paymentDate), "dd MMM yyyy", { locale: es })}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <PaymentIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="capitalize">
                                  {payment.paymentMethod === 'transfer' ? 'Transferencia' :
                                   payment.paymentMethod === 'cash' ? 'Efectivo' :
                                   payment.paymentMethod === 'check' ? 'Cheque' :
                                   payment.paymentMethod === 'card' ? 'Tarjeta' : payment.paymentMethod}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{payment.reference || '-'}</TableCell>
                            <TableCell className="text-right font-medium text-green-600">
                              ${Number(payment.amount).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {payment.notes || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {payment.createdBy?.firstName} {payment.createdBy?.lastName}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Carga Masiva */}
      <BulkUploadDialog
        open={showBulkUploadDialog}
        onOpenChange={setShowBulkUploadDialog}
        title="Carga Masiva de Cuentas por Cobrar"
        description="Importa múltiples cuentas por cobrar desde un archivo Excel. Sigue el formato de la plantilla descargable."
        archivo={archivo}
        uploadResponse={uploadResponse}
        validacionResultado={validacionResultado}
        importacionResultado={importacionResultado}
        loading={loading}
        onFileChange={handleFileChange}
        onUpload={handleUploadFile}
        onValidate={handleValidate}
        onImport={handleImport}
        onReset={handleResetBulkUpload}
      />
    </div>
  )
}
