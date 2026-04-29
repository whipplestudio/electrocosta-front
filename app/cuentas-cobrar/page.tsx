"use client"

import { useState, useEffect, useCallback } from "react"
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
  FileDown,
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
  HelpCircle,
  Pencil,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Helper para parsear fecha sin timezone (evita que se muestre un día atrasado)
const parseDateWithoutTimezone = (dateStr: string | Date): Date => {
  if (dateStr instanceof Date) return dateStr
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Helper para formatear fechas sin conversión de zona horaria
const formatDateWithoutTimezone = (dateString: string): string => {
  const date = new Date(dateString)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()

  const localDate = new Date(year, month, day)
  return localDate.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
import { toast } from "sonner"
import { useAccountsReceivable } from "@/hooks/use-accounts-receivable"
import { ActionButton, KpiCard, TotalKpiCard, FloatingInput, FloatingSelect, FloatingDatePicker, DateSelection } from "@/components/ui"
import { DynamicForm, FormSection } from "@/components/ui/dynamic-form"
import { DynamicFormDialog } from "@/components/forms/dynamic-form"
import { FinancialAmountSection } from "@/components/financial"
import { BulkUploadGuideDialogCobrar } from "@/components/bulk-upload-guide-dialog-cobrar"
import type { IvaType } from "@/components/financial"
import { DataTable, Column, Action, SelectFilter } from "@/components/ui/data-table"
import { AccountReceivable, AccountReceivableStatus, Payment, PaymentMethod } from "@/types/accounts-receivable"
import { clientsService, type Client } from "@/services/clients.service"
import { categoriesService, type Category } from "@/services/categories.service"
import { projectsService, type Project } from "@/services/projects.service"
import { accountsReceivableUploadService } from "@/services/accounts-receivable-upload.service"
import { accountsReceivableService, paymentsService } from "@/services/accounts-receivable.service"
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
  
  // Estados para paginación (DataTable)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // Estados para filtros básicos (DataTable)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterClientId, setFilterClientId] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("")

  // Estados para filtros avanzados (aplicados)
  const [filters, setFilters] = useState({
    projectId: "all",
    categoryId: "all",
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

  // Estado temporal para filtros avanzados (edición en el Sheet)
  const [tempFilters, setTempFilters] = useState(filters)
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
  const [guideOpen, setGuideOpen] = useState(false)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [uploadResponse, setUploadResponse] = useState<any>(null)
  const [validacionResultado, setValidacionResultado] = useState<any>(null)
  const [importacionResultado, setImportacionResultado] = useState<any>(null)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Estados para historial de pagos
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [selectedAccountForHistory, setSelectedAccountForHistory] = useState<AccountReceivable | null>(null)
  const [accountPayments, setAccountPayments] = useState<Payment[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  // Estados para editar pago
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false)
  const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState<Payment | null>(null)
  const [editPaymentFormData, setEditPaymentFormData] = useState<{
    amount: string
    paymentMethod: PaymentMethod
    paymentDate: string
    reference: string
    notes: string
  }>({
    amount: '',
    paymentMethod: PaymentMethod.TRANSFER,
    paymentDate: '',
    reference: '',
    notes: '',
  })
  
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
    if (filterClientId && filterClientId !== "all") {
      loadProjectsForFilter(filterClientId)
    } else {
      loadAllProjectsForFilter()
    }
  }, [filterClientId])

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

  // Construir DTO de filtros para la API
  const buildFilterDto = useCallback((advancedFilters?: typeof filters): any => {
    const filterDto: any = {}
    const advFilters = advancedFilters || filters

    if (searchQuery) filterDto.search = searchQuery
    if (filterClientId && filterClientId !== "all") filterDto.clientId = filterClientId
    if (advFilters.projectId && advFilters.projectId !== "all") filterDto.projectId = advFilters.projectId
    if (advFilters.categoryId && advFilters.categoryId !== "all") filterDto.categoryId = advFilters.categoryId
    if (filterStatus && filterStatus !== "all") filterDto.status = filterStatus
    if (advFilters.invoiceNumber) filterDto.invoiceNumber = advFilters.invoiceNumber
    if (advFilters.dateFrom) filterDto.dateFrom = advFilters.dateFrom.toISOString()
    if (advFilters.dateTo) filterDto.dateTo = advFilters.dateTo.toISOString()
    if (advFilters.dueDateFrom) filterDto.dueDateFrom = advFilters.dueDateFrom.toISOString()
    if (advFilters.dueDateTo) filterDto.dueDateTo = advFilters.dueDateTo.toISOString()
    if (advFilters.minAmount) filterDto.minAmount = parseFloat(advFilters.minAmount)
    if (advFilters.maxAmount) filterDto.maxAmount = parseFloat(advFilters.maxAmount)
    if (advFilters.minBalance) filterDto.minBalance = parseFloat(advFilters.minBalance)
    if (advFilters.maxBalance) filterDto.maxBalance = parseFloat(advFilters.maxBalance)

    return filterDto
  }, [searchQuery, filterClientId, filterStatus, filters])

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchDashboard()
    loadClientsAndCategories()
  }, [])

  // Recargar datos cuando cambian filtros básicos o paginación
  useEffect(() => {
    const filterDto = buildFilterDto()
    fetchAccounts(filterDto, page, limit)
    fetchTotals(filterDto)
  }, [page, limit, searchQuery, filterClientId, filterStatus, buildFilterDto])

  // Aplicar filtros y recargar datos del backend (para filtros avanzados)
  const handleApplyFilters = async () => {
    const filterDto = buildFilterDto()

    await fetchAccounts(filterDto, page, limit)
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
    setSearchQuery("")
    setFilterClientId("")
    setFilterStatus("")
    setFilters({
      projectId: "all",
      categoryId: "all",
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
    setPage(1)
    setFilterProjects([])
    await fetchAccounts({}, 1, limit)
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
      await fetchTotals()
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
      fetchTotals()
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

  // Abrir dialog de editar pago
  const handleOpenEditPayment = (payment: Payment) => {
    setSelectedPaymentForEdit(payment)
    // Map string payment method to PaymentMethod enum
    const methodMap: Record<string, PaymentMethod> = {
      'transfer': PaymentMethod.TRANSFER,
      'cash': PaymentMethod.CASH,
      'check': PaymentMethod.CHECK,
      'card': PaymentMethod.CARD,
      'other': PaymentMethod.OTHER,
    }
    setEditPaymentFormData({
      amount: payment.amount.toString(),
      paymentMethod: methodMap[payment.paymentMethod] || PaymentMethod.TRANSFER,
      paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
      reference: payment.reference || '',
      notes: payment.notes || '',
    })
    setIsEditPaymentDialogOpen(true)
  }

  // Guardar edición de pago
  const handleUpdatePayment = async () => {
    if (!selectedPaymentForEdit || !selectedAccountForHistory) return

    const amountValue = parseFloat(editPaymentFormData.amount)
    if (!editPaymentFormData.amount || amountValue <= 0) {
      toast.error('El monto debe ser mayor a cero')
      return
    }

    const oldAmount = Number(selectedPaymentForEdit.amount)
    const accountTotal = Number(selectedAccountForHistory.amount)
    const currentPaid = Number(selectedAccountForHistory.paidAmount)
    const difference = amountValue - oldAmount
    const newBalance = accountTotal - (currentPaid + difference)

    if (newBalance < 0) {
      toast.error(`El nuevo monto excede el total de la factura. Máximo permitido: $${(accountTotal - (currentPaid - oldAmount)).toLocaleString()}`)
      return
    }

    try {
      setLoading(true)
      const paymentData = {
        amount: amountValue,
        paymentMethod: editPaymentFormData.paymentMethod,
        paymentDate: new Date(editPaymentFormData.paymentDate).toISOString(),
        reference: editPaymentFormData.reference,
        notes: editPaymentFormData.notes,
      }
      
      const result = await paymentsService.updatePayment(selectedPaymentForEdit.id, paymentData)
      
      toast.success(`Pago actualizado. Nuevo balance: $${Number(result.account.balance).toLocaleString()}`)
      setIsEditPaymentDialogOpen(false)
      setSelectedPaymentForEdit(null)
      
      // Recargar historial
      const response = await apiClient.get(`/accounts-receivable/${selectedAccountForHistory.id}/payments`)
      setAccountPayments(response.data || [])
      
      // Actualizar la cuenta seleccionada con los nuevos datos
      setSelectedAccountForHistory(result.account)
      
      // Refrescar lista de cuentas
      fetchAccounts()
      fetchDashboard()
    } catch (error) {
      console.error('Error al actualizar pago:', error)
      toast.error('Error al actualizar el pago')
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

  // Configuración de columnas para el DataTable
  const columns: Column<AccountReceivable>[] = [
    {
      key: 'client',
      header: 'Cliente',
      render: (row) => (
        <span className="font-medium">{row.client?.name || 'N/A'}</span>
      ),
    },
    {
      key: 'project',
      header: 'Proyecto',
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.project?.nombreProyecto || 'Sin proyecto'}
        </span>
      ),
    },
    {
      key: 'invoiceNumber',
      header: 'Factura',
    },
    {
      key: 'issueDate',
      header: 'Fecha Emisión',
      render: (row) => format(parseDateWithoutTimezone(row.issueDate), "dd/MM/yyyy"),
    },
    {
      key: 'dueDate',
      header: 'Fecha Vencimiento',
      render: (row) => row.dueDate
        ? format(parseDateWithoutTimezone(row.dueDate), "dd/MM/yyyy")
        : <span className="text-muted-foreground">Sin vencimiento</span>,
    },
    {
      key: 'amount',
      header: 'Monto Total',
      align: 'right',
      render: (row) => `$${Number(row.amount).toLocaleString()}`,
    },
    {
      key: 'balance',
      header: 'Saldo Pendiente',
      align: 'right',
      render: (row) => <span className="font-medium">${Number(row.balance).toLocaleString()}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (row) => getEstadoBadge(mapEstado(row.status)),
    },
    {
      key: 'category',
      header: 'Categoría',
      render: (row) => (
        <Badge variant="outline">{row.category?.name || 'Sin categoría'}</Badge>
      ),
    },
  ]

  // Configuración de acciones para el DataTable
  const actions: Action<AccountReceivable>[] = [
    {
      label: 'Ver detalle',
      icon: <Eye size={16} />,
      onClick: (row) => handleVerDetalle(row),
    },
    {
      label: 'Ver historial',
      icon: <History size={16} />,
      onClick: (row) => handleVerHistorial(row),
    },
    {
      label: 'Editar',
      icon: <Edit size={16} />,
      onClick: (row) => handleEditarCuenta(row),
    },
    {
      label: 'Eliminar',
      icon: <Trash2 size={16} />,
      onClick: (row) => handleEliminarCuenta(row.id),
      disabled: (row) => deletingId === row.id,
    },
  ]

  // Configuración de filtros de selección para el DataTable
  const selectFilters: SelectFilter[] = [
    {
      key: 'clientId',
      label: 'Cliente',
      options: [
        { value: '', label: 'Todos' },
        ...clients.map((client) => ({ value: client.id, label: client.name })),
      ],
    },
    {
      key: 'status',
      label: 'Estado',
      options: [
        { value: '', label: 'Todos' },
        { value: AccountReceivableStatus.PENDING, label: 'Pendiente' },
        { value: AccountReceivableStatus.PARTIAL, label: 'Parcial' },
        { value: AccountReceivableStatus.PAID, label: 'Pagado' },
        { value: AccountReceivableStatus.OVERDUE, label: 'Vencido' },
      ],
    },
  ]

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
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <ActionButton 
                  variant="ghost"
                  onClick={() => setGuideOpen(true)}
                  size="sm"
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
                  onClick={handleDownloadTemplate} 
                  disabled={downloadingTemplate}
                  size="sm"
                  startIcon={downloadingTemplate ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                >
                  {downloadingTemplate ? 'Descargando...' : 'Plantilla Excel'}
                </ActionButton>
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
                <ActionButton 
                  variant="outline"
                  onClick={() => setShowBulkUploadDialog(true)}
                  size="sm"
                  startIcon={<Upload className="h-4 w-4" />}
                >
                  Carga Masiva
                </ActionButton>
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
          <ActionButton variant="create" onClick={handleNuevaCuenta} size="sm">
            Nueva Cuenta
          </ActionButton>
        </div>
      </div>

      {/* KPIs - Calculados desde el backend (con filtros aplicados) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total Facturado"
          value={`$${totals.totalAmount.toLocaleString()}`}
          subtitle="= Cobrado + Por Cobrar"
          icon={<DollarSign className="h-4 w-4" />}
          variant="primary"
        />

        <KpiCard
          title="Total por Cobrar"
          value={`$${totals.totalBalance.toLocaleString()}`}
          subtitle={`${totals.totalCount} cuentas pendientes`}
          icon={<TrendingUp className="h-4 w-4" />}
          variant="warning"
        />

        <KpiCard
          title="Total Cobrado"
          value={`$${totals.totalPaid.toLocaleString()}`}
          subtitle="Monto cobrado"
          icon={<CheckCircle className="h-4 w-4" />}
          variant="success"
        />

        <KpiCard
          title="Vencidas"
          value={`$${accounts.filter(c => c.status === AccountReceivableStatus.OVERDUE).reduce((sum, c) => sum + Number(c.balance || 0), 0).toLocaleString()}`}
          subtitle={`${accounts.filter(c => c.status === AccountReceivableStatus.OVERDUE).length} cuentas vencidas`}
          icon={<AlertCircle className="h-4 w-4" />}
          variant="danger"
        />

        <KpiCard
          title="Próximas a Vencer"
          value={(() => {
            const now = new Date()
            const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            return accounts.filter(c => {
              if (!c.dueDate) return false
              const dueDate = new Date(c.dueDate)
              return dueDate >= now && dueDate <= sevenDaysFromNow && 
                (c.status === AccountReceivableStatus.PENDING || c.status === AccountReceivableStatus.PARTIAL)
            }).length.toString()
          })()}
          subtitle="Próximos 7 días"
          icon={<Clock className="h-4 w-4" />}
          variant="info"
        />

        <TotalKpiCard
          value={totals.totalCount}
          subtitle="Facturas emitidas"
          icon={<FileSpreadsheet className="h-4 w-4" />}
        />
      </div>

      {/* DataTable de Cuentas por Cobrar */}
      <DataTable
        title="Listado de Cuentas por Cobrar"
        columns={columns}
        data={accounts}
        keyExtractor={(row) => row.id}
        actions={actions}
        loading={isLoading}
        emptyMessage="No se encontraron cuentas por cobrar"
        // Filtros de búsqueda
        searchFilter={{
          placeholder: 'Buscar cliente, factura o descripción...',
          debounceMs: 400,
        }}
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setPage(1)
        }}
        // Filtros de selección
        selectFilters={selectFilters}
        filterValues={{
          clientId: filterClientId,
          status: filterStatus,
        }}
        onFilterChange={(key, value) => {
          if (key === 'clientId') setFilterClientId(value as string)
          if (key === 'status') setFilterStatus(value as string)
          setPage(1)
        }}
        onClearFilters={handleClearFilters}
        // Botones del toolbar
        toolbarButtons={
          <ActionButton
            variant="filter"
            size="sm"
            startIcon={<Filter className="h-4 w-4" />}
            onClick={() => setIsAdvancedFiltersOpen(true)}
          >
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
          </ActionButton>
        }
        // Paginación
        pagination={{
          page: pagination?.page ?? page,
          limit: pagination?.limit ?? limit,
          total: pagination?.total ?? 0,
          totalPages: pagination?.totalPages ?? 1,
        }}
        onPageChange={(newPage) => {
          setPage(newPage)
          fetchAccounts(buildFilterDto(), newPage, limit)
        }}
        onRowsPerPageChange={(newLimit) => {
          setLimit(newLimit)
          setPage(1)
          fetchAccounts(buildFilterDto(), 1, newLimit)
        }}
        rowsPerPageOptions={[10, 25, 50]}
      />

      {/* Sheet de Filtros Avanzados */}
      <Sheet
        open={isAdvancedFiltersOpen}
        onOpenChange={(open) => {
          if (open) {
            // Al abrir, sincronizar tempFilters con los filtros actuales
            setTempFilters(filters)
          }
          setIsAdvancedFiltersOpen(open)
        }}
      >
        <SheetContent className="w-[400px] sm:max-w-[400px] overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle className="text-xl">Filtros Avanzados</SheetTitle>
            <SheetDescription className="text-sm">
              Configura filtros adicionales
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 mt-6 px-6 pb-6">
            {/* Proyecto */}
            <FloatingSelect
              label="Proyecto"
              value={tempFilters.projectId}
              onChange={(value) => setTempFilters({ ...tempFilters, projectId: value as string })}
              options={[
                { value: 'all', label: 'Todos los proyectos' },
                ...filterProjects.map((project) => ({
                  value: project.id,
                  label: project.nombreProyecto || project.name,
                })),
              ]}
              placeholder={filterClientId && filterClientId !== "all" ? "Del cliente seleccionado" : "Todos los proyectos"}
            />

            {/* Categoría */}
            <FloatingSelect
              label="Categoría"
              value={tempFilters.categoryId}
              onChange={(value) => setTempFilters({ ...tempFilters, categoryId: value as string })}
              options={[
                { value: 'all', label: 'Todas las categorías' },
                ...categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                })),
              ]}
              placeholder="Todas las categorías"
            />

            {/* Folio de Factura */}
            <FloatingInput
              label="Folio de Factura"
              placeholder="Ej: FAC-001"
              value={tempFilters.invoiceNumber}
              onChange={(e) => setTempFilters({ ...tempFilters, invoiceNumber: e.target.value })}
            />

            {/* Fechas de Emisión */}
            <FloatingDatePicker
              label="Fecha de Emisión"
              value={{
                from: tempFilters.dateFrom,
                to: tempFilters.dateTo,
              }}
              onChange={(range) => {
                if (range && 'from' in range) {
                  setTempFilters({
                    ...tempFilters,
                    dateFrom: range.from,
                    dateTo: range.to,
                  })
                }
              }}
              mode="range"
              placeholder="Seleccionar rango"
            />

            {/* Fechas de Vencimiento */}
            <FloatingDatePicker
              label="Fecha de Vencimiento"
              value={{
                from: tempFilters.dueDateFrom,
                to: tempFilters.dueDateTo,
              }}
              onChange={(range) => {
                if (range && 'from' in range) {
                  setTempFilters({
                    ...tempFilters,
                    dueDateFrom: range.from,
                    dueDateTo: range.to,
                  })
                }
              }}
              mode="range"
              placeholder="Seleccionar rango"
            />

            {/* Rangos de Monto */}
            <div className="grid grid-cols-2 gap-3">
              <FloatingInput
                label="Monto Mín"
                type="number"
                placeholder="0.00"
                value={tempFilters.minAmount}
                onChange={(e) => setTempFilters({ ...tempFilters, minAmount: e.target.value })}
              />
              <FloatingInput
                label="Monto Máx"
                type="number"
                placeholder="0.00"
                value={tempFilters.maxAmount}
                onChange={(e) => setTempFilters({ ...tempFilters, maxAmount: e.target.value })}
              />
            </div>

            {/* Rangos de Saldo */}
            <div className="grid grid-cols-2 gap-3">
              <FloatingInput
                label="Saldo Mín"
                type="number"
                placeholder="0.00"
                value={tempFilters.minBalance}
                onChange={(e) => setTempFilters({ ...tempFilters, minBalance: e.target.value })}
              />
              <FloatingInput
                label="Saldo Máx"
                type="number"
                placeholder="0.00"
                value={tempFilters.maxBalance}
                onChange={(e) => setTempFilters({ ...tempFilters, maxBalance: e.target.value })}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-6 mt-2 border-t">
              <ActionButton
                variant="outline"
                size="md"
                fullWidth
                startIcon={<XCircle className="h-4 w-4" />}
                onClick={() => {
                  // Resetear tempFilters a valores por defecto
                  setTempFilters({
                    projectId: "all",
                    categoryId: "all",
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
                  // Aplicar limpieza a los filtros reales
                  handleClearFilters()
                  setIsAdvancedFiltersOpen(false)
                }}
              >
                Limpiar
              </ActionButton>
              <ActionButton
                variant="primary"
                size="md"
                fullWidth
                startIcon={<CheckCircle2 className="h-4 w-4" />}
                onClick={() => {
                  // Copiar tempFilters a filters y luego aplicar
                  setFilters(tempFilters)
                  // Llamar a la API con los nuevos filtros
                  const filterDto = buildFilterDto(tempFilters)
                  fetchAccounts(filterDto, page, limit)
                  fetchTotals(filterDto)
                  setIsAdvancedFiltersOpen(false)
                }}
              >
                Aplicar
              </ActionButton>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Formulario de Cuenta por Cobrar usando DynamicForm */}
      <DynamicForm
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
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
        }}
        title={selectedCuenta ? "Editar Cuenta por Cobrar" : "Nueva Cuenta por Cobrar"}
        description={selectedCuenta ? "Modifica los datos de la cuenta" : "Registra una nueva cuenta por cobrar"}
        mode={selectedCuenta ? 'edit' : 'create'}
        maxWidth="2xl"
        data={formData}
        onChange={setFormData}
        onSubmit={handleSubmitForm}
        loading={isLoading}
        sections={[
          {
            columns: 1,
            fields: [
              {
                name: 'clientId',
                type: 'select',
                label: 'Cliente',
                required: true,
                placeholder: loadingSelects ? "Cargando..." : "Selecciona un cliente",
                options: loadingSelects 
                  ? [{ label: 'Cargando...', value: 'loading', disabled: true }]
                  : clients.length === 0 
                    ? [{ label: 'No hay clientes disponibles', value: 'empty', disabled: true }]
                    : clients.map((client) => ({
                        label: `${client.name} - ${client.taxId}`,
                        value: client.id,
                      })),
                disabled: loadingSelects,
                colSpan: 'full',
              },
            ],
          },
          {
            columns: 1,
            fields: [
              {
                name: 'projectId',
                type: 'custom',
                label: 'Proyecto (Opcional)',
                render: ({ value, onChange }) => (
                  <FloatingSelect
                    label="Proyecto (Opcional)"
                    value={value || ''}
                    onChange={(newValue) => onChange(newValue as string)}
                    options={loadingProjects 
                      ? [{ label: 'Cargando proyectos...', value: 'loading', disabled: true }]
                      : !formData.clientId 
                        ? [{ label: 'Primero selecciona un cliente', value: 'no-client', disabled: true }]
                        : projects.length === 0 
                          ? [{ label: 'Este cliente no tiene proyectos', value: 'empty', disabled: true }]
                          : projects.map((project) => ({
                              label: project.nombreProyecto,
                              value: project.id,
                            }))
                    }
                    placeholder={loadingProjects 
                      ? "Cargando proyectos..." 
                      : !formData.clientId 
                        ? "Primero selecciona un cliente" 
                        : "Seleccionar proyecto"}
                    disabled={!formData.clientId || loadingProjects}
                    helperText={!formData.clientId ? "Selecciona un cliente para ver sus proyectos" : undefined}
                  />
                ),
                colSpan: 'full',
              },
            ],
          },
          {
            columns: 1,
            fields: [
              {
                name: 'invoiceNumber',
                type: 'text',
                label: 'Número de Factura',
                placeholder: 'FAC-2024-XXX',
                colSpan: 'full',
              },
            ],
          },
          {
            fields: [
              {
                name: 'ivaSection',
                type: 'custom',
                label: '',
                colSpan: 'full',
                render: () => (
                  <FinancialAmountSection
                    title="💰 Venta"
                    iva={formData.ivaType === 'percentage' ? formData.iva : formatNumber(formData.iva)}
                    ivaType={formData.ivaType}
                    subtotal={formatNumber(formData.subtotal)}
                    total={formatNumber(formData.amount)}
                    onIvaChange={(value: string) => handlePresupuestoChange('iva', value)}
                    onIvaTypeChange={(type: IvaType) => handlePresupuestoChange('ivaType', type)}
                    onSubtotalChange={(value: string) => handlePresupuestoChange('subtotal', value)}
                    subtotalLabel="Subtotal (sin IVA) *"
                    totalLabel="Total Venta (con IVA)"
                    subtotalPlaceholder="Ej: 100,000"
                    subtotalHelperText="Monto sin IVA"
                  />
                ),
              },
            ],
          },
          {
            columns: 1,
            fields: [
              {
                name: 'categoryId',
                type: 'select',
                label: 'Categoría',
                placeholder: loadingSelects ? "Cargando..." : "Selecciona una categoría (opcional)",
                options: loadingSelects
                  ? [{ label: 'Cargando...', value: 'loading', disabled: true }]
                  : categories.length === 0
                    ? [{ label: 'No hay categorías de tipo "Ingreso". Ve a /categorias para crear una.', value: 'empty', disabled: true }]
                    : categories.map((category) => ({
                        label: category.name,
                        value: category.id,
                      })),
                disabled: loadingSelects,
                colSpan: 'full',
              },
            ],
          },
          {
            columns: 2,
            fields: [
              {
                name: 'issueDate',
                type: 'custom',
                label: 'Fecha de Emisión',
                required: true,
                render: ({ value, onChange }) => (
                  <FloatingDatePicker
                    label="Fecha de Emisión *"
                    value={value}
                    onChange={(date) => onChange(date)}
                    placeholder="Seleccionar fecha"
                  />
                ),
                colSpan: 1,
              },
              {
                name: 'dueDate',
                type: 'custom',
                label: 'Fecha de Vencimiento',
                render: ({ value, onChange }) => (
                  <FloatingDatePicker
                    label="Fecha de Vencimiento"
                    value={value}
                    onChange={(date) => onChange(date)}
                    placeholder="Seleccionar fecha"
                  />
                ),
                colSpan: 1,
              },
            ],
          },
          {
            columns: 1,
            fields: [
              {
                name: 'description',
                type: 'textarea',
                label: 'Descripción',
                placeholder: 'Descripción de la cuenta',
                rows: 3,
                colSpan: 'full',
              },
            ],
          },
        ]}
        submitLabel="Crear Cuenta"
        submitLabelEditing="Guardar Cambios"
        loadingLabel="Creando..."
        loadingLabelEditing="Guardando..."
      />

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

              {/* Información Financiera - Usando KpiCards */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Información Financiera
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <KpiCard
                    title="Monto Total"
                    value={`$${Number(cuentaDetalle.amount).toLocaleString()} ${cuentaDetalle.currency}`}
                    variant="primary"
                    icon={<Receipt className="h-4 w-4" />}
                  />
                  <KpiCard
                    title="Monto Pagado"
                    value={`$${Number(cuentaDetalle.paidAmount).toLocaleString()} ${cuentaDetalle.currency}`}
                    variant="success"
                    icon={<CheckCircle className="h-4 w-4" />}
                  />
                </div>
                <div className="col-span-2">
                  <KpiCard
                    title="Saldo Pendiente"
                    value={`$${Number(cuentaDetalle.balance).toLocaleString()} ${cuentaDetalle.currency}`}
                    variant={Number(cuentaDetalle.balance) > 0 ? 'warning' : 'success'}
                    icon={<AlertCircle className="h-4 w-4" />}
                  />
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
          <DialogFooter className="gap-2">
            <ActionButton variant="outline" onClick={() => setIsDetalleDialogOpen(false)}>
              Cerrar
            </ActionButton>
            {cuentaDetalle && (
              <ActionButton
                variant="edit"
                onClick={() => {
                  setIsDetalleDialogOpen(false)
                  handleEditarCuenta(cuentaDetalle)
                }}
              >
                Editar Cuenta
              </ActionButton>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Historial de Pagos */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
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
            {/* Resumen de la cuenta con KpiCard reutilizables */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard
                title="Monto Original"
                value={`$${Number(selectedAccountForHistory?.amount || 0).toLocaleString()}`}
                icon={<FileText className="h-4 w-4" />}
              />
              <KpiCard
                title="Total Cobrado"
                value={`$${accountPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString()}`}
                icon={<DollarSign className="h-4 w-4" />}
                variant="success"
              />
              <KpiCard
                title="Saldo Pendiente"
                value={`$${Number(selectedAccountForHistory?.balance || 0).toLocaleString()}`}
                icon={<Clock className="h-4 w-4" />}
                variant="warning"
              />
              <KpiCard
                title="Total de Cobros"
                value={accountPayments.length}
                icon={<Receipt className="h-4 w-4" />}
                variant="info"
              />
            </div>

            {/* Lista de pagos - DataTable reutilizable */}
            <DataTable
              title="Registro de Cobros"
              data={accountPayments}
              columns={[
                {
                  key: 'index',
                  header: '#',
                  width: '50px',
                  render: (row: Payment) => accountPayments.length - accountPayments.indexOf(row),
                },
                {
                  key: 'paymentDate',
                  header: 'Fecha',
                  render: (row: Payment) => (
                    <div className="flex items-center gap-1 text-sm">
                      <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                      {formatDateWithoutTimezone(row.paymentDate)}
                    </div>
                  ),
                },
                {
                  key: 'paymentMethod',
                  header: 'Método',
                  render: (row: Payment) => {
                    const paymentMethodIcons: Record<string, React.ComponentType<{ className?: string }>> = {
                      transfer: CreditCard,
                      check: FileText,
                      cash: DollarSign,
                      card: CreditCard,
                      other: Receipt,
                    }
                    const paymentMethodLabels: Record<string, string> = {
                      transfer: 'Transferencia',
                      check: 'Cheque',
                      cash: 'Efectivo',
                      card: 'Tarjeta',
                      other: 'Otro',
                    }
                    const PaymentIcon = paymentMethodIcons[row.paymentMethod] || Receipt
                    return (
                      <div className="flex items-center gap-2">
                        <div className="bg-green-100 p-1.5 rounded">
                          <PaymentIcon className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <span className="text-sm">{paymentMethodLabels[row.paymentMethod] || row.paymentMethod}</span>
                      </div>
                    )
                  },
                },
                {
                  key: 'reference',
                  header: 'Referencia',
                  render: (row: Payment) => (
                    <span className="text-sm font-mono">{row.reference || '-'}</span>
                  ),
                },
                {
                  key: 'amount',
                  header: 'Monto',
                  align: 'right',
                  render: (row: Payment) => {
                    const isFullPayment = Number(row.amount) === Number(selectedAccountForHistory?.amount)
                    return (
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-green-600">${Number(row.amount).toLocaleString()}</span>
                        {isFullPayment && (
                          <Badge variant="default" className="bg-green-600 text-xs h-5">Completo</Badge>
                        )}
                      </div>
                    )
                  },
                },
                {
                  key: 'notes',
                  header: 'Observaciones',
                  render: (row: Payment) => (
                    <p className="text-sm text-muted-foreground truncate max-w-xs" title={row.notes || ''}>
                      {row.notes || '-'}
                    </p>
                  ),
                },
                {
                  key: 'createdBy',
                  header: 'Registrado por',
                  render: (row: Payment) => (
                    <p className="text-sm">
                      {row.createdBy ? `${row.createdBy.firstName} ${row.createdBy.lastName}` : 'Sistema'}
                    </p>
                  ),
                },
              ]}
              keyExtractor={(row: Payment) => row.id}
              actions={[
                {
                  icon: <Pencil className="h-4 w-4" />,
                  label: 'Editar pago',
                  onClick: (payment: Payment) => handleOpenEditPayment(payment),
                },
              ]}
              loading={loadingHistory}
              emptyMessage="No hay cobros registrados para esta cuenta"
            />
          </div>

          <DialogFooter>
            <ActionButton variant="cancel" onClick={() => setIsHistoryDialogOpen(false)}>
              Cerrar
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Editar Pago */}
      <Dialog open={isEditPaymentDialogOpen} onOpenChange={setIsEditPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Editar Pago
            </DialogTitle>
            <DialogDescription>
              {selectedAccountForHistory && selectedPaymentForEdit && (
                <div className="mt-2 space-y-1">
                  <p><strong>Factura:</strong> {selectedAccountForHistory.invoiceNumber}</p>
                  <p><strong>Cliente:</strong> {selectedAccountForHistory.client?.name}</p>
                  <p><strong>Monto Actual:</strong> ${Number(selectedPaymentForEdit.amount).toLocaleString()}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAccountForHistory && selectedPaymentForEdit && (
            <DynamicFormDialog
              dialogTitle=""
              dialogDescription=""
              config={{
                columns: 2,
                fields: [
                  {
                    name: 'amount',
                    label: 'Nuevo Monto',
                    type: 'currency',
                    required: true,
                    placeholder: '0.00',
                    min: 0.01,
                  },
                  {
                    name: 'paymentMethod',
                    label: 'Método de Pago',
                    type: 'select',
                    required: true,
                    options: [
                      { value: 'transfer', label: 'Transferencia Bancaria' },
                      { value: 'check', label: 'Cheque' },
                      { value: 'cash', label: 'Efectivo' },
                      { value: 'card', label: 'Tarjeta de Crédito' },
                      { value: 'other', label: 'Otro' },
                    ],
                  },
                  {
                    name: 'reference',
                    label: 'Referencia/Folio',
                    type: 'text',
                    placeholder: 'Número de referencia',
                  },
                  {
                    name: 'paymentDate',
                    label: 'Fecha de Pago',
                    type: 'date',
                    required: true,
                  },
                  {
                    name: 'notes',
                    label: 'Observaciones',
                    type: 'textarea',
                    placeholder: 'Comentarios adicionales...',
                    className: 'col-span-2',
                  },
                ],
                defaultValues: {
                  amount: selectedPaymentForEdit?.amount ? String(selectedPaymentForEdit.amount) : '',
                  paymentMethod: selectedPaymentForEdit?.paymentMethod || 'transfer',
                  reference: selectedPaymentForEdit?.reference || '',
                  paymentDate: selectedPaymentForEdit?.paymentDate 
                    ? new Date(selectedPaymentForEdit.paymentDate).toISOString().split('T')[0] 
                    : new Date().toISOString().split('T')[0],
                  notes: selectedPaymentForEdit?.notes || '',
                },
              }}
              onSubmit={async (data: Record<string, any>) => {
                if (!selectedAccountForHistory || !selectedPaymentForEdit) return

                const amountValue = parseFloat(data.amount)
                if (!data.amount || amountValue <= 0) {
                  toast.error('El monto debe ser mayor a cero')
                  return
                }

                const oldAmount = Number(selectedPaymentForEdit.amount)
                const balanceDifference = oldAmount - amountValue
                const newBalance = Number(selectedAccountForHistory.balance) + balanceDifference

                if (newBalance < 0) {
                  toast.error(`El nuevo balance sería negativo (${newBalance.toLocaleString()})`)
                  return
                }

                try {
                  setLoading(true)
                  const updateData = {
                    amount: amountValue,
                    paymentMethod: data.paymentMethod as PaymentMethod,
                    paymentDate: new Date(data.paymentDate).toISOString(),
                    reference: data.reference || '',
                    notes: data.notes || '',
                  }
                  
                  const result = await paymentsService.updatePayment(
                    selectedPaymentForEdit.id,
                    updateData
                  )
                  
                  toast.success(`Pago actualizado. Nuevo balance: $${Number(result.account.balance).toLocaleString()}`)
                  setIsEditPaymentDialogOpen(false)
                  setSelectedPaymentForEdit(null)
                  
                  // Recargar historial
                  const response = await apiClient.get(`/accounts-receivable/${selectedAccountForHistory.id}/payments`)
                  setAccountPayments(response.data || [])
                  
                  // Actualizar la cuenta seleccionada con los nuevos datos
                  setSelectedAccountForHistory(result.account)
                  
                  // Refrescar lista de cuentas
                  fetchAccounts()
                  fetchDashboard()
                } catch (error) {
                  console.error('Error al actualizar pago:', error)
                  toast.error('Error al actualizar el pago')
                } finally {
                  setLoading(false)
                }
              }}
              onCancel={() => {
                setIsEditPaymentDialogOpen(false)
                setSelectedPaymentForEdit(null)
              }}
              submitLabel="Guardar Cambios"
              cancelLabel="Cancelar"
              loading={loading}
            />
          )}
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

      {/* Dialog de Guía de Carga Masiva */}
      <BulkUploadGuideDialogCobrar
        open={guideOpen}
        onOpenChange={setGuideOpen}
      />
    </div>
  )
}
