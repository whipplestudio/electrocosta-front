"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Edit, Trash2, AlertCircle, Clock, CheckCircle, XCircle, Loader2, Upload, FileDown, History, Receipt, CreditCard, DollarSign, Filter } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { accountsPayableService } from "@/services/accounts-payable.service"
import { paymentSchedulingService } from "@/services/payment-scheduling.service"
import { accountsPayableUploadService } from "@/services/accounts-payable-upload.service"
import type { UploadResponse, ValidacionResultado, ImportacionResultado } from "@/services/accounts-payable-upload.service"
import { BulkUploadDialog } from "@/components/bulk-upload-dialog"
import { KpiCard, ExpenseKpiCard, WarningKpiCard, SuccessKpiCard, TotalKpiCard } from "@/components/ui/kpi-card"
import { ActionButton, CreateButton, CancelButton } from "@/components/ui/action-button"
import { DataTable, Column, Action, SelectFilter } from "@/components/ui/data-table"
import { DynamicForm, FormSection } from "@/components/ui/dynamic-form"
import { FloatingSelect } from "@/components/ui/floating-select"
import { FloatingDatePicker } from "@/components/ui/floating-date-picker"
import { FinancialAmountSection } from "@/components/financial"
import type { IvaType } from "@/components/financial"
import { suppliersService, type Supplier } from "@/services/suppliers.service"
import { categoriesService, type Category } from "@/services/categories.service"
import { projectsService, type Project } from "@/services/projects.service"
import type { AccountPayable, AccountPayableStatus, CreateAccountPayableDto, UpdateAccountPayableDto } from "@/types/accounts-payable"

// Helper para formatear fechas sin conversión de zona horaria
const formatDateWithoutTimezone = (dateString: string): string => {
  const date = new Date(dateString)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()
  
  const localDate = new Date(year, month, day)
  return format(localDate, "dd MMM yyyy", { locale: es })
}

export default function CuentasPagarPage() {
  const [accounts, setAccounts] = useState<AccountPayable[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [projects, setProjects] = useState<Pick<Project, 'id' | 'name' | 'code'>[]>([])
  console.log("🚀 ~ CuentasPagarPage ~ projects:", projects)
  const [loading, setLoading] = useState(true)
  const [loadingSelects, setLoadingSelects] = useState(false)
  const [applyingFilters, setApplyingFilters] = useState(false)
  const [savingAccount, setSavingAccount] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: "all" as string,
    approvalStatus: "all" as string,
    search: ""
  })

  // Estados para paginación server-side (DataTable)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<AccountPayable | null>(null)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [accountHistory, setAccountHistory] = useState<{ payments: any[]; schedules: any[] } | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [formData, setFormData] = useState({
    supplierId: "",
    supplierName: "",
    projectId: "",
    invoiceNumber: "",
    iva: "16",
    ivaType: 'percentage' as 'percentage' | 'amount',
    subtotal: "",
    amount: "",
    categoryId: "",
    macroClasificacion: "" as "" | "MATERIALES" | "MANO_DE_OBRA" | "OTROS",
    issueDate: undefined as Date | undefined,
    dueDate: undefined as Date | undefined,
    description: "",
  })
  console.log("🚀 ~ CuentasPagarPage ~ formData:", formData)

  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalPendiente: 0,
    totalVencido: 0,
    cuentasVencidas: 0,
    proximasVencer: 0,
    pendientesAprobacion: 0,
  })

  // Estados para carga masiva
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false)
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null)
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null)
  const [validacionResultado, setValidacionResultado] = useState<ValidacionResultado | null>(null)
  const [importacionResultado, setImportacionResultado] = useState<ImportacionResultado | null>(null)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = {
        page,
        limit,
      }

      if (filters.status && filters.status !== "all") {
        params.status = filters.status
      }
      if (filters.approvalStatus && filters.approvalStatus !== "all") {
        params.approvalStatus = filters.approvalStatus
      }
      if (filters.search) {
        params.search = filters.search
      }

      const response = await accountsPayableService.getAll(params)
      setAccounts(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error("Error al cargar cuentas por pagar:", error)
      toast.error("Error al cargar las cuentas por pagar")
    } finally {
      setLoading(false)
    }
  }, [page, limit, filters])

  // Calcular métricas del dashboard basadas en las cuentas (filtradas o totales)
  const calculateDashboardMetrics = useCallback((accountsData: AccountPayable[]) => {
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const totalPendiente = accountsData.reduce((sum, acc) => sum + Number(acc.balance || 0), 0)
    
    const overdueAccounts = accountsData.filter(acc => {
      if (!acc.dueDate) return false
      return new Date(acc.dueDate) < now && acc.status !== 'paid' && acc.status !== 'cancelled'
    })
    const totalVencido = overdueAccounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0)
    
    const proximasVencer = accountsData.filter(acc => {
      if (!acc.dueDate) return false
      const dueDate = new Date(acc.dueDate)
      return dueDate >= now && dueDate <= sevenDaysFromNow && acc.status !== 'paid' && acc.status !== 'cancelled'
    }).length
    
    const pendientesAprobacion = accountsData.filter(acc => acc.approvalStatus === 'pending').length
    
    return {
      totalPendiente,
      totalVencido,
      cuentasVencidas: overdueAccounts.length,
      proximasVencer,
      pendientesAprobacion,
    }
  }, [])

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await accountsPayableService.getDashboard()
      setDashboardData({
        totalPendiente: data.keyMetrics?.totalPayable || 0,
        totalVencido: data.keyMetrics?.totalOverdue || 0,
        cuentasVencidas: data.overdueAccounts?.length || 0,
        proximasVencer: data.keyMetrics?.upcomingThisWeek || 0,
        pendientesAprobacion: data.keyMetrics?.pendingApproval || 0,
      })
    } catch (error) {
      console.error("Error al cargar dashboard:", error)
      toast.error("Error al cargar estadísticas del dashboard")
    }
  }, [])

  const loadSuppliersAndCategories = async () => {
    try {
      setLoadingSelects(true)
      
      const [suppliersResp, categoriesResp, projectsData] = await Promise.all([
        suppliersService.getAll({ page: 1, limit: 100 }),
        categoriesService.getAll({ page: 1, limit: 100 }),
        projectsService.listAll(),
      ]);
      
      setSuppliers(suppliersResp.data)
      
      // Filtrar solo categorías de tipo "expense" (egresos)
      const expenseCategories = categoriesResp.data.filter((cat) => cat.type === 'expense')
      console.log('📊 Total de categorías:', categoriesResp.data.length)
      console.log('💸 Categorías de egreso:', expenseCategories.length)
      
      if (expenseCategories.length === 0 && categoriesResp.data.length > 0) {
        console.warn('⚠️ Hay categorías creadas pero ninguna es de tipo "Egreso"')
        toast.warning('No hay categorías de tipo "Egreso". Crea categorías de egreso en el módulo de Categorías.')
      }
      
      setCategories(expenseCategories)
      setProjects(projectsData)
    } catch (error) {
      console.error("Error al cargar opciones:", error)
      toast.error("Error al cargar opciones del formulario")
    } finally {
      setLoadingSelects(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
    fetchDashboard()
    loadSuppliersAndCategories()
  }, [fetchAccounts, fetchDashboard])

  // Recalcular métricas del dashboard cuando cambian las cuentas (por filtros)
  useEffect(() => {
    if (accounts.length > 0) {
      const filteredMetrics = calculateDashboardMetrics(accounts)
      setDashboardData(filteredMetrics)
    }
  }, [accounts, calculateDashboardMetrics])

  // Auto-completar macroClasificacion cuando se selecciona una categoría (solo al crear, no al editar)
  useEffect(() => {
    // Solo auto-completar si NO estamos editando una cuenta existente
    if (!selectedAccount && formData.categoryId && categories.length > 0) {
      const selectedCategory = categories.find(c => c.id === formData.categoryId)
      if (selectedCategory && (selectedCategory as any).macroClasificacion) {
        setFormData(prev => ({
          ...prev,
          macroClasificacion: (selectedCategory as any).macroClasificacion
        }))
      }
    }
  }, [formData.categoryId, categories, selectedAccount])

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

  // Formatear moneda con máximo 2 decimales (para mostrar montos calculados)
  const formatCurrency = (value: string): string => {
    const num = parseFloat(value.replace(/,/g, ''))
    if (isNaN(num)) return ''
    // Forzar exactamente 2 decimales y luego formatear con separadores
    const fixed = num.toFixed(2)
    const [integer, decimal] = fixed.split('.')
    return `${Number(integer).toLocaleString('en-US')}.${decimal}`
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
      
      // Si se modificó subtotal, iva o ivaType, calcular amount con IVA
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

        updated.amount = (subtotal + ivaAmount).toFixed(2)
      }
      
      return updated
    })
  }

  const handleNuevaCuenta = () => {
    setSelectedAccount(null)
    setFormData({
      supplierId: "",
      supplierName: "",
      projectId: "",
      invoiceNumber: "",
      iva: "16",
      ivaType: 'percentage',
      subtotal: "",
      amount: "",
      categoryId: "",
      macroClasificacion: "",
      issueDate: new Date(),
      dueDate: undefined,
      description: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditarCuenta = useCallback((cuenta: AccountPayable) => {
    console.log("🚀 ~ handleEditarCuenta ~ cuenta:", cuenta)
    setSelectedAccount(cuenta)

    // Detectar tipo de IVA basándose en el valor
    // Heurística: si IVA <= 100 → porcentaje, si IVA > 100 → monto fijo
    const ivaValue = parseFloat(cuenta.iva?.toString() || '16')
    const detectedIvaType: 'percentage' | 'amount' = ivaValue <= 100 ? 'percentage' : 'amount'

    setFormData({
      supplierId: cuenta.supplierId || "",
      supplierName: cuenta.supplier?.name || cuenta.supplierName || "",
      projectId: cuenta.projectId || "",
      invoiceNumber: cuenta.invoiceNumber,
      iva: cuenta.iva?.toString() || "16",
      ivaType: detectedIvaType,
      subtotal: cuenta.subtotal?.toString() || "",
      amount: cuenta.amount.toString(),
      categoryId: cuenta.categoryId || "",
      macroClasificacion: cuenta.macroClasificacion || "",
      issueDate: new Date(cuenta.issueDate.split('T')[0] + 'T12:00:00'),
      dueDate: cuenta.dueDate ? new Date(cuenta.dueDate.split('T')[0] + 'T12:00:00') : undefined,
      description: cuenta.description || "",
    })
    setIsDialogOpen(true)
  }, [])

  const handleSubmitForm = async () => {
    // Validar campos obligatorios
    if (!formData.supplierName || !formData.subtotal || !formData.issueDate) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    if (savingAccount) return

    try {
      setSavingAccount(true)
      if (selectedAccount) {
        await accountsPayableService.update(selectedAccount.id, {
          supplierName: formData.supplierName,
          invoiceNumber: formData.invoiceNumber,
          iva: formData.iva !== "" ? parseFloat(formData.iva) : 0,
          ivaType: formData.ivaType,
          subtotal: parseFloat(formData.subtotal),
          amount: parseFloat(parseFloat(formData.amount).toFixed(2)),
          projectId: formData.projectId || undefined,
          categoryId: formData.categoryId || undefined,
          macroClasificacion: formData.macroClasificacion || undefined,
          issueDate: formData.issueDate?.toISOString(),
          dueDate: formData.dueDate?.toISOString(),
          description: formData.description || undefined,
        })
        toast.success("Cuenta actualizada exitosamente")
      } else {
        await accountsPayableService.create({
          supplierName: formData.supplierName,
          projectId: formData.projectId || undefined,
          invoiceNumber: formData.invoiceNumber,
          iva: formData.iva !== "" ? parseFloat(formData.iva) : 0,
          ivaType: formData.ivaType,
          subtotal: parseFloat(formData.subtotal),
          amount: parseFloat(parseFloat(formData.amount).toFixed(2)),
          categoryId: formData.categoryId || undefined,
          macroClasificacion: formData.macroClasificacion || undefined,
          issueDate: formData.issueDate?.toISOString() || new Date().toISOString(),
          dueDate: formData.dueDate?.toISOString(),
          description: formData.description || undefined,
          currency: "MXN",
        })
        toast.success("Cuenta creada exitosamente")
      }
      setIsDialogOpen(false)
      fetchAccounts()
      fetchDashboard()
    } catch (error: any) {
      console.error("Error al guardar cuenta:", error)
      // Mostrar mensaje específico del backend si está disponible
      const errorMessage = error?.response?.data?.message || error?.message || "Error al guardar la cuenta"
      toast.error(errorMessage)
    } finally {
      setSavingAccount(false)
    }
  }

  const handleEliminarCuenta = useCallback(async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta cuenta?")) return
    try {
      await accountsPayableService.delete(id)
      toast.success("Cuenta eliminada")
      fetchAccounts()
      fetchDashboard()
    } catch (error) {
      toast.error("Error al eliminar")
    }
  }, [fetchAccounts, fetchDashboard])

  const handleAprobar = async (id: string) => {
    if (approvingId || rejectingId) return
    try {
      setApprovingId(id)
      await accountsPayableService.approve(id)
      toast.success("Cuenta aprobada")
      fetchAccounts()
      fetchDashboard()
    } catch (error) {
      toast.error("Error al aprobar")
    } finally {
      setApprovingId(null)
    }
  }

  const handleRechazar = async (id: string) => {
    if (approvingId || rejectingId) return
    const reason = prompt("Razón del rechazo:")
    if (!reason) return
    try {
      setRejectingId(id)
      await accountsPayableService.reject(id, { reason })
      toast.success("Cuenta rechazada")
      fetchAccounts()
      fetchDashboard()
    } catch (error) {
      toast.error("Error al rechazar")
    } finally {
      setRejectingId(null)
    }
  }

  const handleVerHistorial = useCallback(async (account: AccountPayable) => {
    setSelectedAccount(account)
    setLoadingHistory(true)
    setIsHistoryDialogOpen(true)
    try {
      const [payments, schedules] = await Promise.all([
        accountsPayableService.getPayments(account.id),
        paymentSchedulingService.getAccountSchedules(account.id),
      ])
      setAccountHistory({ payments, schedules })
    } catch (error) {
      console.error("Error al cargar historial:", error)
      toast.error("Error al cargar el historial de pagos")
      setAccountHistory({ payments: [], schedules: [] })
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  const handleClearFilters = useCallback(async () => {
    setFilters({ status: "all", approvalStatus: "all", search: "" })
    setPage(1)
    // El useEffect se encargará de hacer el fetch automáticamente
    toast.success('Filtros limpiados')
  }, [])

  // Callbacks para DataTable - memoizados para evitar bucles infinitos
  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }))
    setPage(1)
  }, [])

  const handleFilterChange = useCallback((key: string, value: string | string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value as string }))
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handleRowsPerPageChange = useCallback((newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }, [])

  // Valores memoizados para DataTable (evitar re-renders infinitos)
  const keyExtractor = useCallback((row: AccountPayable) => row.id, [])

  const searchFilterConfig = useMemo(() => ({
    placeholder: 'Buscar proveedor, factura o descripción...',
    debounceMs: 400,
  }), [])

  const filterValues = useMemo(() => ({
    status: filters.status,
    approvalStatus: filters.approvalStatus,
  }), [filters.status, filters.approvalStatus])

  const pagination = useMemo(() => ({
    page,
    limit,
    total,
    totalPages,
  }), [page, limit, total, totalPages])

  const rowsPerPageOptions = useMemo(() => [10, 25, 50], [])

  // Funciones de carga masiva
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBulkUploadFile(e.target.files[0])
      setUploadResponse(null)
      setValidacionResultado(null)
      setImportacionResultado(null)
    }
  }

  const handleUpload = async () => {
    if (!bulkUploadFile) return
    try {
      setLoading(true)
      const response = await accountsPayableUploadService.subirArchivo(bulkUploadFile)
      setUploadResponse(response)
      toast.success(`${response.registrosDetectados} registros detectados`)
    } catch (error: any) {
      toast.error(error.message || 'Error al subir archivo')
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async () => {
    if (!uploadResponse) return
    try {
      setLoading(true)
      const resultado = await accountsPayableUploadService.validarDatos(uploadResponse.uploadId)
      setValidacionResultado(resultado)
      toast.success(`${resultado.registrosValidos} registros válidos, ${resultado.registrosInvalidos} con errores`)
    } catch (error: any) {
      toast.error(error.message || 'Error al validar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!uploadResponse) return
    try {
      setLoading(true)
      const resultado = await accountsPayableUploadService.importarDatos(uploadResponse.uploadId)
      setImportacionResultado(resultado)
      toast.success(`${resultado.registrosImportados} cuentas por pagar importadas`)
      fetchAccounts()
      fetchDashboard()
    } catch (error: any) {
      toast.error(error.message || 'Error al importar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true)
    try {
      const blob = await accountsPayableUploadService.descargarPlantilla()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'plantilla_cuentas_pagar.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Plantilla descargada')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al descargar plantilla')
    } finally {
      setDownloadingTemplate(false)
    }
  }

  const handleResetBulkUpload = () => {
    setBulkUploadFile(null)
    setUploadResponse(null)
    setValidacionResultado(null)
    setImportacionResultado(null)
  }

  const activeFiltersCount = [
    filters.status !== "all",
    filters.approvalStatus !== "all",
    filters.search !== ""
  ].filter(Boolean).length

  // Configuración de columnas para el DataTable - memoizada para estabilidad
  const columns = useMemo<Column<AccountPayable>[]>(() => [
    {
      key: 'supplier',
      header: 'Proveedor',
      render: (row) => (
        <span className="font-medium">{row.supplier?.name || row.supplierName || 'N/A'}</span>
      ),
    },
    {
      key: 'project',
      header: 'Proyecto',
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.project?.name || 'Sin proyecto'}
        </span>
      ),
    },
    {
      key: 'invoiceNumber',
      header: 'Factura',
    },
    {
      key: 'macroClasificacion',
      header: 'Clasificación',
      render: (row) => (
        <span className="text-xs">
          {row.macroClasificacion === 'MATERIALES' && '💎 Materiales'}
          {row.macroClasificacion === 'MANO_DE_OBRA' && '👷 Mano de Obra'}
          {row.macroClasificacion === 'OTROS' && '📦 Otros'}
          {!row.macroClasificacion && <span className="text-muted-foreground">Sin clasificar</span>}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Monto Total',
      align: 'right',
      render: (row) => `$${parseFloat(row.amount).toLocaleString()}`,
    },
    {
      key: 'paidAmount',
      header: 'Pagado',
      align: 'right',
      render: (row) => (
        <span className="text-green-600">${parseFloat(row.paidAmount || '0').toLocaleString()}</span>
      ),
    },
    {
      key: 'balance',
      header: 'Faltante',
      align: 'right',
      render: (row) => (
        <span className="font-medium text-red-600">${parseFloat(row.balance || '0').toLocaleString()}</span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Vencimiento',
      render: (row) =>
        row.dueDate
          ? formatDateWithoutTimezone(row.dueDate)
          : <span className="text-muted-foreground">Sin vencimiento</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (row) => getEstadoBadge(row.status),
    },
    {
      key: 'approvalStatus',
      header: 'Aprobación',
      align: 'center',
      render: (row) => getAprobacionBadge(row.approvalStatus),
    },
    {
      key: 'inlineActions',
      header: 'Acciones',
      align: 'center',
      render: (row) => (
        <div className="flex gap-1 justify-center">
          {row.approvalStatus === "pending" && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAprobar(row.id)}
                disabled={approvingId === row.id || rejectingId === row.id}
              >
                {approvingId === row.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRechazar(row.id)}
                disabled={approvingId === row.id || rejectingId === row.id}
              >
                {rejectingId === row.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </Button>
            </>
          )}
        </div>
      ),
    },
  ], [approvingId, rejectingId])

  // Configuración de acciones para el DataTable - memoizada
  const actions = useMemo<Action<AccountPayable>[]>(() => [
    {
      label: 'Ver historial',
      icon: <Clock className="h-4 w-4" />,
      onClick: (row) => handleVerHistorial(row),
    },
    {
      label: 'Editar',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row) => handleEditarCuenta(row),
    },
    {
      label: 'Eliminar',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row) => handleEliminarCuenta(row.id),
    },
  ], [handleVerHistorial, handleEditarCuenta, handleEliminarCuenta])

  // Configuración de filtros de selección para el DataTable - memoizada (estática)
  const selectFilters = useMemo<SelectFilter[]>(() => [
    {
      key: 'status',
      label: 'Estado',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'pending', label: 'Pendiente' },
        { value: 'partial', label: 'Parcial' },
        { value: 'paid', label: 'Pagado' },
        { value: 'overdue', label: 'Vencido' },
        { value: 'scheduled', label: 'Programado' },
        { value: 'cancelled', label: 'Cancelado' },
      ],
    },
    {
      key: 'approvalStatus',
      label: 'Aprobación',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'pending', label: 'Pendiente' },
        { value: 'approved', label: 'Aprobado' },
        { value: 'rejected', label: 'Rechazado' },
      ],
    },
  ], [])

  const getEstadoBadge = (status: AccountPayableStatus) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      partial: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
      scheduled: "bg-purple-100 text-purple-800",
    }
    const labels = {
      pending: "Pendiente",
      partial: "Parcial",
      paid: "Pagado",
      overdue: "Vencido",
      cancelled: "Cancelado",
      scheduled: "Programado",
    }
    return <Badge className={styles[status]}>{labels[status]}</Badge>
  }

  const getAprobacionBadge = (status: string) => {
    if (status === "approved") return <Badge className="bg-green-100 text-green-800">Aprobado</Badge>
    if (status === "rejected") return <Badge className="bg-red-100 text-red-800">Rechazado</Badge>
    return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cuentas por Pagar</h1>
          <p className="text-muted-foreground">Gestiona las facturas y pagos a proveedores</p>
        </div>
        <div className="flex gap-2">
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
                    Descarga el archivo Excel con el formato correcto para importar múltiples cuentas por pagar a la vez
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
                  onClick={() => setBulkUploadOpen(true)}
                  size="sm"
                  startIcon={<Upload className="h-4 w-4" />}
                >
                  Carga Masiva
                </ActionButton>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs bg-slate-700 dark:bg-slate-200 border-slate-600 dark:border-slate-300">
                <div className="space-y-1">
                  <p className="font-semibold text-white dark:text-slate-900">Importación masiva de cuentas por pagar</p>
                  <p className="text-xs text-slate-200 dark:text-slate-700">
                    Sube un archivo Excel con múltiples cuentas por pagar a la vez
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

      {/* Dashboard KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <TotalKpiCard
          title="Total Pendiente"
          value={`$${(dashboardData.totalPendiente || 0).toLocaleString()}`}
          subtitle="Monto total por pagar"
          icon={<DollarSign className="h-4 w-4" />}
          loading={loading}
        />
        <ExpenseKpiCard
          title="Total Vencido"
          value={`$${(dashboardData.totalVencido || 0).toLocaleString()}`}
          subtitle={`${dashboardData.cuentasVencidas || 0} cuentas vencidas`}
          icon={<AlertCircle className="h-4 w-4" />}
          loading={loading}
        />
        <WarningKpiCard
          title="Próximas a Vencer"
          value={dashboardData.proximasVencer || 0}
          subtitle="Próximos 7 días"
          icon={<Clock className="h-4 w-4" />}
          loading={loading}
        />
        <SuccessKpiCard
          title="Pendientes Aprobación"
          value={dashboardData.pendientesAprobacion || 0}
          subtitle="Por aprobar o rechazar"
          icon={<CheckCircle className="h-4 w-4" />}
          loading={loading}
        />
      </div>

      {/* DataTable de Cuentas por Pagar */}
      <DataTable
        title="Listado de Cuentas por Pagar"
        columns={columns}
        data={accounts}
        keyExtractor={keyExtractor}
        actions={actions}
        loading={loading}
        emptyMessage="No se encontraron cuentas por pagar"
        // Filtros de búsqueda
        searchFilter={searchFilterConfig}
        searchValue={filters.search}
        onSearchChange={handleSearchChange}
        // Filtros de selección
        selectFilters={selectFilters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        // Paginación server-side
        pagination={pagination}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsPerPageOptions}
      />

      {/* Formulario de Cuenta por Pagar usando DynamicForm */}
      <DynamicForm
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setSelectedAccount(null)
            setFormData({
              supplierId: "",
              supplierName: "",
              projectId: "",
              invoiceNumber: "",
              iva: "16",
              ivaType: 'percentage',
              subtotal: "",
              amount: "",
              categoryId: "",
              macroClasificacion: "",
              issueDate: undefined,
              dueDate: undefined,
              description: "",
            })
          }
        }}
        title={selectedAccount ? "Editar Cuenta por Pagar" : "Nueva Cuenta por Pagar"}
        description={selectedAccount ? "Modifica los datos de la cuenta" : "Registra una nueva cuenta por pagar"}
        mode={selectedAccount ? 'edit' : 'create'}
        maxWidth="2xl"
        data={formData}
        onChange={setFormData}
        onSubmit={handleSubmitForm}
        loading={savingAccount}
        sections={[
          {
            columns: 1,
            fields: [
              {
                name: 'supplierName',
                type: 'text',
                label: 'Proveedor',
                required: true,
                placeholder: 'Nombre del proveedor',
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
                    options={loadingSelects
                      ? [{ label: 'Cargando...', value: 'loading', disabled: true }]
                      : projects.length === 0
                        ? [{ label: 'No hay proyectos disponibles', value: 'empty', disabled: true }]
                        : [
                            { label: 'Sin proyecto', value: 'none' },
                            ...projects.map((p) => ({
                              label: `${p.code} - ${p.name}`,
                              value: p.id,
                            }))
                          ]
                    }
                    placeholder={loadingSelects ? "Cargando..." : "Seleccionar proyecto"}
                    disabled={loadingSelects}
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
                    title="💰 Compra"
                    iva={formData.ivaType === 'percentage' ? formData.iva : formatNumber(formData.iva)}
                    ivaType={formData.ivaType as IvaType}
                    subtotal={formatNumber(formData.subtotal)}
                    total={formatNumber(formData.amount)}
                    onIvaChange={(value: string) => handlePresupuestoChange('iva', value)}
                    onIvaTypeChange={(type: IvaType) => handlePresupuestoChange('ivaType', type)}
                    onSubtotalChange={(value: string) => handlePresupuestoChange('subtotal', value)}
                    subtotalLabel="Subtotal (sin IVA) *"
                    totalLabel="Total Compra (con IVA)"
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
                    ? [{ label: 'No hay categorías de tipo "Egreso". Ve a /categorias para crear una.', value: 'empty', disabled: true }]
                    : categories.map((c) => ({
                        label: c.name,
                        value: c.id,
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
                name: 'macroClasificacion',
                type: 'select',
                label: 'Clasificación Financiera',
                required: true,
                placeholder: 'Selecciona clasificación',
                options: [
                  { label: '💎 Materiales', value: 'MATERIALES' },
                  { label: '👷 Mano de Obra', value: 'MANO_DE_OBRA' },
                  { label: '📦 Otros Gastos', value: 'OTROS' },
                ],
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

      {/* Diálogo de Historial de Pagos - Material Design 3 */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="!max-w-7xl !w-[95vw] max-h-[85vh] overflow-y-auto overflow-x-hidden p-0 gap-0">
          {/* Header con tonal surface */}
          <DialogHeader className="px-6 pt-6 pb-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <History className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  Historial de Pagos
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {selectedAccount?.supplierName || selectedAccount?.supplier?.name}
                </p>
              </div>
            </div>
          </DialogHeader>

          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Cargando historial...</p>
            </div>
          ) : accountHistory ? (
            <div className="p-6 space-y-6">
              {/* Resumen - Cards con elevación MD3 */}
              <div className="grid grid-cols-3 gap-4">
                {/* Monto Total - Surface Container Highest */}
                <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Receipt className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Monto Total
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    ${parseFloat(selectedAccount?.amount || '0').toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Pagado - Primary Container */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Pagado
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 tracking-tight">
                    ${parseFloat(selectedAccount?.paidAmount || '0').toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Faltante - Error Container */}
                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-4 border border-rose-200 dark:border-rose-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-800/50 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      Faltante
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-rose-700 dark:text-rose-300 tracking-tight">
                    ${parseFloat(selectedAccount?.balance || '0').toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Progress Bar - Visual indicator */}
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Progreso de pago</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {selectedAccount?.amount && parseFloat(selectedAccount.amount) > 0
                      ? Math.round((parseFloat(selectedAccount.paidAmount || '0') / parseFloat(selectedAccount.amount)) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${selectedAccount?.amount && parseFloat(selectedAccount.amount) > 0
                        ? Math.min((parseFloat(selectedAccount.paidAmount || '0') / parseFloat(selectedAccount.amount)) * 100, 100)
                        : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Programaciones - Outlined Card */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      Programaciones de Pago
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                      {accountHistory.schedules.length}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  {accountHistory.schedules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                        <Clock className="h-5 w-5 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Sin programaciones de pago</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Fecha Programada</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Monto</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Estado</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Método</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Referencia</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accountHistory.schedules.map((schedule: any) => (
                            <TableRow key={schedule.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                              <TableCell className="font-medium">
                                {formatDateWithoutTimezone(schedule.scheduledDate)}
                              </TableCell>
                              <TableCell className="font-semibold">
                                ${parseFloat(schedule.amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                  schedule.status === 'completed'
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                    : schedule.status === 'scheduled'
                                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                    schedule.status === 'completed' ? 'bg-emerald-500' : schedule.status === 'scheduled' ? 'bg-violet-500' : 'bg-slate-500'
                                  }`} />
                                  {schedule.status === 'completed' ? 'Completado' : schedule.status === 'scheduled' ? 'Programado' : schedule.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-slate-600 dark:text-slate-400">{schedule.paymentMethod || '-'}</TableCell>
                              <TableCell className="text-slate-600 dark:text-slate-400 font-mono text-xs">{schedule.reference || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>

              {/* Pagos Realizados - Outlined Card */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      Pagos Realizados
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                      {accountHistory.payments.length}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  {accountHistory.payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                        <CreditCard className="h-5 w-5 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Sin pagos registrados</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Fecha</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Monto</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Método</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Referencia</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Registrado por</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accountHistory.payments.map((payment: any) => (
                            <TableRow key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                              <TableCell className="font-medium">
                                {formatDateWithoutTimezone(payment.paymentDate)}
                              </TableCell>
                              <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                                ${parseFloat(payment.amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-slate-600 dark:text-slate-400">{payment.paymentMethod || '-'}</TableCell>
                              <TableCell className="text-slate-600 dark:text-slate-400 font-mono text-xs">{payment.reference || '-'}</TableCell>
                              <TableCell className="text-slate-700 dark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium">
                                    {payment.createdBy?.firstName?.[0]}{payment.createdBy?.lastName?.[0]}
                                  </div>
                                  <span className="text-sm">{payment.createdBy?.firstName} {payment.createdBy?.lastName}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
            <ActionButton
              variant="close"
              onClick={() => setIsHistoryDialogOpen(false)}
              size="md"
            >
              Cerrar
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Carga Masiva */}
      <BulkUploadDialog
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        title="Carga Masiva de Cuentas por Pagar"
        description="Sube un archivo Excel con múltiples cuentas por pagar para importarlas en el sistema"
        archivo={bulkUploadFile}
        onFileChange={handleFileChange}
        uploadResponse={uploadResponse}
        validacionResultado={validacionResultado}
        importacionResultado={importacionResultado}
        onUpload={handleUpload}
        onValidate={handleValidate}
        onImport={handleImport}
        onReset={handleResetBulkUpload}
        loading={loading}
      />
    </div>
  )
}
