"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Edit, Trash2, CalendarIcon, TrendingDown, AlertCircle, Clock, CheckCircle, XCircle, Loader2, Upload, FileDown } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { accountsPayableService } from "@/services/accounts-payable.service"
import { paymentSchedulingService } from "@/services/payment-scheduling.service"
import { accountsPayableUploadService } from "@/services/accounts-payable-upload.service"
import type { UploadResponse, ValidacionResultado, ImportacionResultado } from "@/services/accounts-payable-upload.service"
import { BulkUploadDialog } from "@/components/bulk-upload-dialog"
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

  const fetchAccounts = useCallback(async (filterParams?: any) => {
    try {
      setLoading(true)
      const params: any = { page: 1, limit: 100 }
      
      if (filterParams?.status && filterParams.status !== "all") {
        params.status = filterParams.status
      }
      if (filterParams?.approvalStatus && filterParams.approvalStatus !== "all") {
        params.approvalStatus = filterParams.approvalStatus
      }
      if (filterParams?.search) {
        params.search = filterParams.search
      }
      
      const response = await accountsPayableService.getAll(params)
      setAccounts(response.data)
    } catch (error) {
      console.error("Error al cargar cuentas por pagar:", error)
      toast.error("Error al cargar las cuentas por pagar")
    } finally {
      setLoading(false)
    }
  }, [])

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

        updated.amount = (subtotal + ivaAmount).toString()
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

  const handleEditarCuenta = (cuenta: AccountPayable) => {
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
  }

  const handleSubmitForm = async () => {
    // Validar campos obligatorios
    if (!formData.supplierName || !formData.subtotal || !formData.issueDate) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    // Validar que fecha de vencimiento sea >= fecha de emisión (si se proporciona)
    if (formData.dueDate && formData.issueDate && formData.dueDate < formData.issueDate) {
      toast.error("La fecha de vencimiento debe ser igual o mayor a la fecha de emisión")
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
          subtotal: parseFloat(formData.subtotal),
          amount: parseFloat(formData.amount),
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
          subtotal: parseFloat(formData.subtotal),
          amount: parseFloat(formData.amount),
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
      fetchAccounts(filters)
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

  const handleEliminarCuenta = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta cuenta?")) return
    try {
      await accountsPayableService.delete(id)
      toast.success("Cuenta eliminada")
      fetchAccounts(filters)
      fetchDashboard()
    } catch (error) {
      toast.error("Error al eliminar")
    }
  }

  const handleAprobar = async (id: string) => {
    if (approvingId || rejectingId) return
    try {
      setApprovingId(id)
      await accountsPayableService.approve(id)
      toast.success("Cuenta aprobada")
      fetchAccounts(filters)
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
      fetchAccounts(filters)
      fetchDashboard()
    } catch (error) {
      toast.error("Error al rechazar")
    } finally {
      setRejectingId(null)
    }
  }

  const handleVerHistorial = async (account: AccountPayable) => {
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
  }

  const handleApplyFilters = async () => {
    setApplyingFilters(true)
    try {
      await fetchAccounts(filters)
      toast.success('Filtros aplicados correctamente')
    } catch (error) {
      toast.error('Error al aplicar filtros')
    } finally {
      setApplyingFilters(false)
    }
  }

  const handleClearFilters = async () => {
    setFilters({ status: "all", approvalStatus: "all", search: "" })
    setApplyingFilters(true)
    try {
      await fetchAccounts()
      toast.success('Filtros limpiados')
    } catch (error) {
      toast.error('Error al limpiar filtros')
    } finally {
      setApplyingFilters(false)
    }
  }

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
      fetchAccounts(filters)
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
                      <FileDown className="h-4 w-4" />
                      Plantilla Excel
                    </>
                  )}
                </Button>
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
                <Button variant="outline" onClick={() => setBulkUploadOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" /> Carga Masiva
                </Button>
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
          <Button onClick={handleNuevaCuenta}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Cuenta
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(dashboardData.totalPendiente || 0).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencido</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${(dashboardData.totalVencido || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{dashboardData.cuentasVencidas || 0} cuentas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas a Vencer</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.proximasVencer || 0}</div>
            <p className="text-xs text-muted-foreground">Próximos 7 días</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes Aprobación</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.pendientesAprobacion || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Filtros</CardTitle>
            {activeFiltersCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} activo{activeFiltersCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Buscar</Label>
              <Input
                placeholder="Proveedor o factura..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div>
              <Label>Estado</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="paid">Pagado</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                  <SelectItem value="scheduled">Programado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Aprobación</Label>
              <Select 
                value={filters.approvalStatus} 
                onValueChange={(value) => setFilters({ ...filters, approvalStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="approved">Aprobado</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button 
                className="flex-1" 
                onClick={handleApplyFilters}
                disabled={applyingFilters || loading}
              >
                {applyingFilters && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Aplicar Filtros
              </Button>
              <Button 
                variant="outline"
                onClick={handleClearFilters}
                disabled={applyingFilters || loading || activeFiltersCount === 0}
              >
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Factura</TableHead>
                <TableHead>Clasificación</TableHead>
                <TableHead>Monto Total</TableHead>
                <TableHead>Pagado</TableHead>
                <TableHead>Faltante</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Aprobación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center">Cargando...</TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center">No hay cuentas por pagar</TableCell>
                </TableRow>
              ) : (
                accounts.map((cuenta) => (
                  <TableRow key={cuenta.id}>
                    <TableCell>{cuenta.supplier?.name || cuenta.supplierName || 'N/A'}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {cuenta.project?.nombreProyecto || 'Sin proyecto'}
                      </span>
                    </TableCell>
                    <TableCell>{cuenta.invoiceNumber}</TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {cuenta.macroClasificacion === 'MATERIALES' && '💎 Materiales'}
                        {cuenta.macroClasificacion === 'MANO_DE_OBRA' && '👷 Mano de Obra'}
                        {cuenta.macroClasificacion === 'OTROS' && '📦 Otros'}
                        {!cuenta.macroClasificacion && <span className="text-muted-foreground">Sin clasificar</span>}
                      </span>
                    </TableCell>
                    <TableCell>${parseFloat(cuenta.amount).toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">
                      ${parseFloat(cuenta.paidAmount || '0').toLocaleString()}
                    </TableCell>
                    <TableCell className="text-red-600 font-medium">
                      ${parseFloat(cuenta.balance || '0').toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {cuenta.dueDate ? formatDateWithoutTimezone(cuenta.dueDate) : <span className="text-muted-foreground">Sin vencimiento</span>}
                    </TableCell>
                    <TableCell>{getEstadoBadge(cuenta.status)}</TableCell>
                    <TableCell>{getAprobacionBadge(cuenta.approvalStatus)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {cuenta.approvalStatus === "pending" && (
                          <>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleAprobar(cuenta.id)}
                              disabled={approvingId === cuenta.id || rejectingId === cuenta.id}
                            >
                              {approvingId === cuenta.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleRechazar(cuenta.id)}
                              disabled={approvingId === cuenta.id || rejectingId === cuenta.id}
                            >
                              {rejectingId === cuenta.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleVerHistorial(cuenta)} title="Ver historial de pagos">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEditarCuenta(cuenta)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEliminarCuenta(cuenta.id)}>
                          <Trash2 className="h-4 w-4" />
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

      {/* Dialog Crear/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAccount ? "Editar Cuenta" : "Nueva Cuenta por Pagar"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Proveedor *</Label>
              <Input
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                placeholder="Nombre del proveedor"
              />
            </div>
            <div className="grid gap-2">
              <Label>Proyecto (Opcional)</Label>
              <Select value={formData.projectId} onValueChange={(v) => setFormData({ ...formData, projectId: v })} disabled={loadingSelects}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingSelects ? "Cargando..." : projects.length === 0 ? "No hay proyectos" : "Selecciona proyecto (opcional)"} />
                </SelectTrigger>
                <SelectContent>
                  {projects.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No hay proyectos disponibles</div>
                  ) : (
                    <>
                      <SelectItem value="none">Sin proyecto</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Número de Factura</Label>
              <Input
                placeholder="FAC-2024-XXX"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
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
            <div className="grid gap-2">
              <Label>Categoría</Label>
              <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })} disabled={loadingSelects}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingSelects ? "Cargando..." : categories.length === 0 ? "No hay categorías de egreso" : "Selecciona categoría (opcional)"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No hay categorías de tipo "Egreso". Ve a /categorias para crear una.</div>
                  ) : (
                    categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Clasificación Financiera *</Label>
              <Select 
                value={formData.macroClasificacion} 
                onValueChange={(v) => setFormData({ ...formData, macroClasificacion: v as "" | "MATERIALES" | "MANO_DE_OBRA" | "OTROS" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona clasificación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MATERIALES">💎 Materiales</SelectItem>
                  <SelectItem value="MANO_DE_OBRA">👷 Mano de Obra</SelectItem>
                  <SelectItem value="OTROS">📦 Otros Gastos</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Esta clasificación determina cómo se agrupa el gasto en el Dashboard financiero
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Fecha de Emisión *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.issueDate ? format(formData.issueDate, "PPP", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.issueDate} onSelect={(d) => setFormData({ ...formData, issueDate: d })} locale={es} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Fecha de Vencimiento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, "PPP", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.dueDate} onSelect={(d) => setFormData({ ...formData, dueDate: d })} locale={es} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Descripción</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={savingAccount}>Cancelar</Button>
            <Button onClick={handleSubmitForm} disabled={savingAccount}>
              {savingAccount ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {selectedAccount ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                selectedAccount ? "Actualizar" : "Crear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Historial de Pagos */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historial de Pagos - {selectedAccount?.supplierName || selectedAccount?.supplier?.name}</DialogTitle>
          </DialogHeader>
          
          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : accountHistory ? (
            <div className="space-y-6 py-4">
              {/* Resumen */}
              <div className="grid grid-cols-3 gap-4 bg-muted p-4 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Monto Total</p>
                  <p className="text-lg font-bold">${parseFloat(selectedAccount?.amount || '0').toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pagado</p>
                  <p className="text-lg font-bold text-green-600">${parseFloat(selectedAccount?.paidAmount || '0').toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Faltante</p>
                  <p className="text-lg font-bold text-red-600">${parseFloat(selectedAccount?.balance || '0').toLocaleString()}</p>
                </div>
              </div>

              {/* Programaciones */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Programaciones de Pago ({accountHistory.schedules.length})
                </h3>
                {accountHistory.schedules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin programaciones</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha Programada</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Referencia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accountHistory.schedules.map((schedule: any) => (
                        <TableRow key={schedule.id}>
                          <TableCell>{formatDateWithoutTimezone(schedule.scheduledDate)}</TableCell>
                          <TableCell>${parseFloat(schedule.amount).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={schedule.status === 'completed' ? 'bg-green-100 text-green-800' : schedule.status === 'scheduled' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}>
                              {schedule.status === 'completed' ? 'Completado' : schedule.status === 'scheduled' ? 'Programado' : schedule.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{schedule.paymentMethod || '-'}</TableCell>
                          <TableCell>{schedule.reference || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* Pagos Realizados */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Pagos Realizados ({accountHistory.payments.length})
                </h3>
                {accountHistory.payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin pagos registrados</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Referencia</TableHead>
                        <TableHead>Registrado por</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accountHistory.payments.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDateWithoutTimezone(payment.paymentDate)}</TableCell>
                          <TableCell className="font-medium text-green-600">${parseFloat(payment.amount).toLocaleString()}</TableCell>
                          <TableCell>{payment.paymentMethod || '-'}</TableCell>
                          <TableCell>{payment.reference || '-'}</TableCell>
                          <TableCell>{payment.createdBy?.firstName} {payment.createdBy?.lastName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          ) : null}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>Cerrar</Button>
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
