"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActionButton } from "@/components/ui/action-button"
import { KpiCard } from "@/components/ui/kpi-card"
import { DataTable, Column, Action, SelectFilter } from "@/components/ui/data-table"
import { FloatingInput } from "@/components/ui/floating-input"
import { FloatingSelect, SelectOption } from "@/components/ui/floating-select"
import { FloatingDatePicker } from "@/components/ui/floating-date-picker"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, Clock, DollarSign, Search, Calendar as CalendarIcon, Loader2, History, CreditCard, Building2, FileText, CalendarDays, Wallet, Receipt, Banknote, Pencil } from "lucide-react"
import { accountsPayableService } from "@/services/accounts-payable.service"
import { paymentSchedulingService, type PaymentSchedule } from "@/services/payment-scheduling.service"
import type { AccountPayable, RegisterPaymentDto, UpdatePaymentDto, Payment } from "@/types/accounts-payable"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

const paymentMethodLabels: Record<string, string> = {
  transfer: 'Transferencia',
  check: 'Cheque',
  cash: 'Efectivo',
  card: 'Tarjeta',
  other: 'Otro',
}

// Helper para formatear fechas sin conversión de zona horaria
const formatDateWithoutTimezone = (dateString: string): string => {
  const date = new Date(dateString)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()
  
  const localDate = new Date(year, month, day)
  return format(localDate, "dd MMM yyyy", { locale: es })
}

export default function AplicacionPagosCuentasPagar() {
  // Estados para DataTable y paginación backend
  const [schedules, setSchedules] = useState<Array<PaymentSchedule & { paidAmount?: number; remainingAmount?: number; isFullyPaid?: boolean }>>([])
  const [accounts, setAccounts] = useState<AccountPayable[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  // Paginación server-side
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Filtros
  const [filters, setFilters] = useState({
    search: "",
    paymentStatus: "all" as "pending" | "paid" | "all",
  })
  const [summary, setSummary] = useState({ totalPending: 0, countPending: 0, totalPaid: 0, countPaid: 0 })

  // Dialogs
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<AccountPayable | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<PaymentSchedule | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [paymentsToday, setPaymentsToday] = useState(0)

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'transfer' as any,
    paymentDate: new Date(),
    reference: '',
    notes: '',
  })

  // Cargar datos con paginación backend
  const loadData = useCallback(async () => {
    try {
      setLoading(true)

      let allData: PaymentSchedule[] = []
      let combinedSummary = { totalPending: 0, countPending: 0, totalPaid: 0, countPaid: 0 }

      if (filters.paymentStatus === 'all') {
        // Cargar ambos estados
        const [pendingResponse, paidResponse] = await Promise.all([
          paymentSchedulingService.getScheduledPaymentsByPaymentStatus('pending', {
            status: 'completed',
            page,
            limit,
            ...(filters.search ? { search: filters.search } : {}),
          }),
          paymentSchedulingService.getScheduledPaymentsByPaymentStatus('paid', {
            status: 'completed',
            page,
            limit,
            ...(filters.search ? { search: filters.search } : {}),
          }),
        ])
        allData = [...pendingResponse.data, ...paidResponse.data]
        combinedSummary = {
          totalPending: pendingResponse.summary?.totalPending || 0,
          countPending: pendingResponse.summary?.countPending || 0,
          totalPaid: paidResponse.summary?.totalPaid || 0,
          countPaid: paidResponse.summary?.countPaid || 0,
        }
      } else {
        // Cargar solo un estado
        const response = await paymentSchedulingService.getScheduledPaymentsByPaymentStatus(
          filters.paymentStatus,
          {
            status: 'completed',
            page,
            limit,
            ...(filters.search ? { search: filters.search } : {}),
          }
        )
        allData = response.data
        if (filters.paymentStatus === 'pending') {
          combinedSummary.totalPending = response.summary?.totalPending || 0
          combinedSummary.countPending = response.summary?.countPending || 0
        } else {
          combinedSummary.totalPaid = response.summary?.totalPaid || 0
          combinedSummary.countPaid = response.summary?.countPaid || 0
        }
      }

      // Extraer accountPayableIds únicos para cargar las cuentas relacionadas
      const accountIds = [...new Set(allData.map((s) => s.accountPayableId))]

      let relatedAccounts: AccountPayable[] = []
      if (accountIds.length > 0) {
        const accountsData = await accountsPayableService.getAll({
          page: 1,
          limit: 100,
          approvalStatus: 'approved',
        })
        relatedAccounts = accountsData.data.filter((a) => accountIds.includes(a.id))
      }

      // Calcular balances para cada programación
      const paymentsData: Record<string, Payment[]> = {}
      for (const account of relatedAccounts) {
        try {
          const payments = await accountsPayableService.getPayments(account.id)
          paymentsData[account.id] = payments
        } catch {
          paymentsData[account.id] = []
        }
      }

      const schedulesWithBalances = calculateScheduleBalances(allData, paymentsData)

      setSchedules(schedulesWithBalances)
      setAccounts(relatedAccounts)
      // Para 'all', usamos un total aproximado (la paginación real requeriría un endpoint diferente)
      const totalCount = combinedSummary.countPending + combinedSummary.countPaid
      setTotal(totalCount)
      setTotalPages(Math.max(1, Math.ceil(totalCount / limit)))

      // Actualizar summary
      setSummary(combinedSummary)

      // Cargar pagos de hoy (opcional)
      try {
        const todayPaymentsData = await accountsPayableService.getPaymentsToday()
        setPaymentsToday(todayPaymentsData.count)
      } catch {
        setPaymentsToday(0)
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar las programaciones de pago')
    } finally {
      setLoading(false)
    }
  }, [page, limit, filters.paymentStatus, filters.search])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Callbacks para DataTable
  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }))
    setPage(1)
  }, [])

  const handleFilterChange = useCallback((key: string, value: string | string[]) => {
    if (key === 'paymentStatus') {
      // Si el valor está vacío (usuario limpió el filtro), usar 'all' por defecto
      const statusValue = (value as string) || 'all'
      setFilters((prev) => ({ ...prev, paymentStatus: statusValue as 'pending' | 'paid' | 'all' }))
    }
    setPage(1)
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({ search: '', paymentStatus: 'all' })
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handleRowsPerPageChange = useCallback((newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }, [])

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

  const handleAmountChange = (value: string) => {
    const unformatted = unformatNumber(value)
    setFormData((prev) => ({ ...prev, amount: unformatted }))
  }

  // Registrar o actualizar pago
  const handleRegisterPayment = async () => {
    console.log(isEditMode ? 'handleEditPayment iniciado' : 'handleRegisterPayment iniciado')
    
    if (!selectedAccount) {
      console.log('No hay cuenta seleccionada')
      return
    }

    console.log('Validando formData:', formData)

    const amountValue = parseFloat(formData.amount)
    if (!formData.amount || isNaN(amountValue) || amountValue <= 0) {
      toast.error('El monto debe ser mayor a cero')
      return
    }

    // En modo edición, no validamos contra el balance porque el pago ya existe
    if (!isEditMode && amountValue > Number(selectedAccount.balance)) {
      toast.error('El monto no puede ser mayor al saldo pendiente')
      return
    }

    if (!formData.reference?.trim()) {
      toast.error('La referencia es obligatoria')
      return
    }

    try {
      setSubmitting(true)
      
      if (isEditMode && selectedPayment) {
        // Actualizar pago existente
        console.log('Actualizando pago...')
        const paymentData: UpdatePaymentDto = {
          amount: parseFloat(formData.amount),
          paymentMethod: formData.paymentMethod,
          paymentDate: format(formData.paymentDate, 'yyyy-MM-dd'),
          reference: formData.reference,
          notes: formData.notes || undefined,
          paymentScheduleId: selectedSchedule?.id,
        }

        await accountsPayableService.updatePayment(selectedAccount.id, selectedPayment.id, paymentData)
        
        toast.success('Pago actualizado exitosamente')
      } else {
        // Registrar nuevo pago
        console.log('Registrando pago...')
        const paymentData: RegisterPaymentDto = {
          amount: parseFloat(formData.amount),
          paymentMethod: formData.paymentMethod,
          paymentDate: format(formData.paymentDate, 'yyyy-MM-dd'),
          reference: formData.reference,
          notes: formData.notes || undefined,
          paymentScheduleId: selectedSchedule?.id, // Asociar con la programación seleccionada
        }

        await accountsPayableService.registerPayment(selectedAccount.id, paymentData)
        
        toast.success('Pago registrado exitosamente')
      }
      
      setShowRegisterDialog(false)
      
      // Si veníamos del historial de pagos, cerrarlo también
      if (isEditMode && showHistoryDialog) {
        setShowHistoryDialog(false)
      }
      
      resetForm()
      loadData()
    } catch (error: any) {
      console.error(isEditMode ? 'Error al actualizar pago:' : 'Error al registrar pago:', error)
      toast.error(error?.response?.data?.message || error.message || (isEditMode ? 'Error al actualizar el pago' : 'Error al registrar el pago'))
    } finally {
      setSubmitting(false)
    }
  }

  // Abrir diálogo de edición de pago
  const handleEditPayment = (payment: Payment) => {
    setIsEditMode(true)
    setSelectedPayment(payment)
    
    // Encontrar la programación asociada si existe
    const schedule = schedules.find(s => s.id === payment.paymentScheduleId)
    if (schedule) {
      setSelectedSchedule(schedule)
    }
    
    // Pre-llenar el formulario con los datos del pago
    setFormData({
      amount: String(payment.amount),
      paymentMethod: payment.paymentMethod,
      paymentDate: new Date(payment.paymentDate),
      reference: payment.reference || '',
      notes: payment.notes || '',
    })
    
    setShowRegisterDialog(true)
  }

  // Ver historial de pagos de toda la cuenta
  const handleViewHistory = async (account: AccountPayable) => {
    setSelectedAccount(account)
    setSelectedSchedule(null) // No hay programación específica seleccionada
    setLoadingHistory(true)
    setShowHistoryDialog(true)

    try {
      const paymentsData = await accountsPayableService.getPayments(account.id)
      setPayments(paymentsData)
    } catch (error) {
      console.error('Error al cargar historial:', error)
      toast.error('Error al cargar el historial de pagos')
      setPayments([])
    } finally {
      setLoadingHistory(false)
    }
  }

  // Ver historial de pagos de una programación específica
  const handleViewScheduleHistory = async (schedule: PaymentSchedule & { paidAmount?: number; remainingAmount?: number; isFullyPaid?: boolean }) => {
    if (!schedule.accountPayable) return

    setSelectedAccount(schedule.accountPayable as AccountPayable)
    setSelectedSchedule(schedule)
    setLoadingHistory(true)
    setShowHistoryDialog(true)

    try {
      // Obtener pagos específicos de esta programación
      const paymentsData = await paymentSchedulingService.getSchedulePayments(schedule.id)
      setPayments(paymentsData)
    } catch (error) {
      console.error('Error al cargar historial de programación:', error)
      toast.error('Error al cargar el historial de pagos de la programación')
      setPayments([])
    } finally {
      setLoadingHistory(false)
    }
  }

  // Helper: Calcular cuánto se debe pagar de otras programaciones de la misma cuenta
  const getPaidAmountForOtherSchedules = (
    allSchedules: PaymentSchedule[], 
    currentSchedule: PaymentSchedule,
    paymentsByAccount: Record<string, Payment[]>
  ): number => {
    const accountId = currentSchedule.accountPayableId
    const accountSchedules = allSchedules
      .filter((s: PaymentSchedule) => s.accountPayableId === accountId)
      .sort((a: PaymentSchedule, b: PaymentSchedule) => 
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      )
    
    const currentIndex = accountSchedules.findIndex((s: PaymentSchedule) => s.id === currentSchedule.id)
    if (currentIndex === -1) return 0
    
    // Sumar montos de programaciones anteriores
    let otherSchedulesAmount = 0
    for (let i = 0; i < currentIndex; i++) {
      otherSchedulesAmount += Number(accountSchedules[i].amount)
    }
    
    return otherSchedulesAmount
  }

  // Helper: Calcular el balance de cada programación considerando pagos en orden cronológico
  const calculateScheduleBalances = (
    schedules: PaymentSchedule[],
    paymentsByAccount: Record<string, Payment[]>
  ): Array<PaymentSchedule & { paidAmount: number; remainingAmount: number; isFullyPaid: boolean }> => {
    // Agrupar programaciones por cuenta
    const schedulesByAccount: Record<string, PaymentSchedule[]> = {}
    schedules.forEach((s: PaymentSchedule) => {
      if (!schedulesByAccount[s.accountPayableId]) {
        schedulesByAccount[s.accountPayableId] = []
      }
      schedulesByAccount[s.accountPayableId].push(s)
    })
    
    const result: Array<PaymentSchedule & { paidAmount: number; remainingAmount: number; isFullyPaid: boolean }> = []
    
    // Procesar cada cuenta
    Object.keys(schedulesByAccount).forEach((accountId) => {
      const accountSchedules = schedulesByAccount[accountId].sort(
        (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      )
      const accountPayments = paymentsByAccount[accountId] || []
      const totalPaid = accountPayments.reduce((sum: number, p: Payment) => sum + Number(p.amount), 0)
      
      let paidAccumulator = 0
      
      accountSchedules.forEach((schedule: PaymentSchedule) => {
        const scheduledAmount = Number(schedule.amount)
        const paidForThisSchedule = Math.max(0, Math.min(scheduledAmount, totalPaid - paidAccumulator))
        paidAccumulator += paidForThisSchedule
        const remaining = scheduledAmount - paidForThisSchedule
        
        result.push({
          ...schedule,
          paidAmount: paidForThisSchedule,
          remainingAmount: remaining,
          isFullyPaid: remaining === 0
        })
      })
    })
    
    return result
  }

  const resetForm = () => {
    setFormData({
      amount: '',
      paymentMethod: 'transfer',
      paymentDate: new Date(),
      reference: '',
      notes: '',
    })
    setSelectedAccount(null)
    setSelectedSchedule(null)
  }

  const openRegisterDialog = (schedule: PaymentSchedule & { remainingAmount?: number }) => {
    setIsEditMode(false)
    setSelectedPayment(null)
    setSelectedSchedule(schedule)
    // Buscar la cuenta relacionada
    const account = accounts.find(a => a.id === schedule.accountPayableId)
    setSelectedAccount(account || null)
    // Pre-llenar con el monto faltante, no el total
    const amountToPay = schedule.remainingAmount || Number(schedule.amount)
    setFormData({
      amount: String(amountToPay),
      paymentMethod: schedule.paymentMethod || 'transfer',
      paymentDate: new Date(),
      reference: schedule.reference || '',
      notes: schedule.notes || '',
    })
    setShowRegisterDialog(true)
  }

  // Configuración de columnas para DataTable
  const columns = useMemo<Column<PaymentSchedule & { paidAmount?: number; remainingAmount?: number }>[]>(() => [
    {
      key: 'supplier',
      header: 'Proveedor',
      render: (row: PaymentSchedule & { paidAmount?: number; remainingAmount?: number }) => {
        const account = accounts.find((a) => a.id === row.accountPayableId)
        return (
          <span className="font-medium">
            {account?.supplier?.name || (account as any)?.supplierName || 'N/A'}
          </span>
        )
      },
    },
    {
      key: 'amount',
      header: 'Monto Programado',
      align: 'right',
      render: (row: PaymentSchedule & { paidAmount?: number; remainingAmount?: number }) => `$${Number(row.amount).toLocaleString()}`,
    },
    {
      key: 'col-paid',
      header: 'Pagado',
      align: 'center',
      render: (row: PaymentSchedule & { paidAmount?: number; remainingAmount?: number }) => {
        const isPaidTab = filters.paymentStatus === 'paid' || (row.paidAmount || 0) >= Number(row.amount)
        const progressPercent = Number(row.amount) > 0 ? ((row.paidAmount || 0) / Number(row.amount)) * 100 : 0
        return (
          <div className="flex flex-col items-center gap-1">
            <span className={isPaidTab ? 'text-green-600 font-bold' : 'text-green-600'}>
              ${(row.paidAmount || 0).toLocaleString()}
            </span>
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isPaidTab ? 'bg-green-600' : 'bg-green-500'}`}
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{Math.round(progressPercent)}%</span>
          </div>
        )
      },
    },
    {
      key: 'remainingAmount',
      header: 'Faltante',
      align: 'right',
      render: (row: PaymentSchedule & { paidAmount?: number; remainingAmount?: number }) => {
        const isPaidTab = filters.paymentStatus === 'paid'
        return (
          <div className={`font-bold ${isPaidTab ? 'text-green-600' : 'text-red-600'}`}>
            ${(row.remainingAmount || 0).toLocaleString()}
            {isPaidTab && <span className="text-xs block font-normal">(Completado)</span>}
          </div>
        )
      },
    },
    {
      key: 'scheduledDate',
      header: 'Fecha Programada',
      render: (row: PaymentSchedule & { paidAmount?: number; remainingAmount?: number }) => formatDateWithoutTimezone(row.scheduledDate),
    },
    {
      key: 'paymentMethod',
      header: 'Método',
      render: (row: PaymentSchedule & { paidAmount?: number; remainingAmount?: number }) => (
        <Badge variant="outline">
          {paymentMethodLabels[row.paymentMethod || 'transfer'] || row.paymentMethod}
        </Badge>
      ),
    },
  ], [accounts, filters.paymentStatus])

  // Configuración de acciones para DataTable
  const actions = useMemo<Action<PaymentSchedule & { paidAmount?: number; remainingAmount?: number }>[]>(() => [
    {
      label: 'Ver historial',
      icon: <History className="h-4 w-4" />,
      onClick: (row: PaymentSchedule & { paidAmount?: number; remainingAmount?: number }) => {
        // Ver historial de pagos específicos de esta programación
        handleViewScheduleHistory(row)
      },
    },
    {
      label: 'Registrar pago',
      icon: <CreditCard className="h-4 w-4" />,
      onClick: (row: PaymentSchedule & { paidAmount?: number; remainingAmount?: number }) => openRegisterDialog(row),
      hidden: (row) => filters.paymentStatus === 'paid' || (row.remainingAmount || 0) === 0,
    },
  ], [accounts, filters.paymentStatus, handleViewScheduleHistory])

  // Columnas para el DataTable de historial de pagos (con acción de editar)
  const historyColumns = useMemo<Column<Payment>[]>(() => [
    {
      key: 'paymentDate',
      header: 'Fecha',
      render: (row: Payment) => formatDateWithoutTimezone(row.paymentDate),
    },
    {
      key: 'amount',
      header: 'Monto',
      align: 'right',
      render: (row: Payment) => (
        <span className="font-bold text-green-600">
          ${Number(row.amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Método',
      render: (row: Payment) => paymentMethodLabels[row.paymentMethod] || row.paymentMethod,
    },
    {
      key: 'reference',
      header: 'Referencia',
      render: (row: Payment) => (
        <span className="font-mono text-sm">{row.reference}</span>
      ),
    },
    {
      key: 'createdBy',
      header: 'Registrado por',
      render: (row: Payment) => `${row.createdBy.firstName} ${row.createdBy.lastName}`,
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (row: Payment) => (
        <button
          onClick={() => handleEditPayment(row)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Editar pago"
        >
          <Pencil className="h-4 w-4 text-blue-600" />
        </button>
      ),
    },
  ], [])

  // Configuración de filtros de selección
  const selectFilters = useMemo<SelectFilter[]>(() => [
    {
      key: 'paymentStatus',
      label: 'Estado de Pago',
      options: [
        { value: 'all', label: `Todos` },
        { value: 'pending', label: `Por Pagar` },
        { value: 'paid', label: `Ya Pagadas` },
      ],
    },
  ], [summary.countPending, summary.countPaid])

  // Configuración de paginación
  const pagination = useMemo(() => ({
    page,
    limit,
    total,
    totalPages,
  }), [page, limit, total, totalPages])

  const searchFilterConfig = useMemo(() => ({
    placeholder: 'Buscar por proveedor...',
    debounceMs: 400,
  }), [])

  const filterValues = useMemo(() => ({
    paymentStatus: filters.paymentStatus,
  }), [filters.paymentStatus])

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      partial: { label: 'Parcial', className: 'bg-blue-100 text-blue-800' },
      paid: { label: 'Pagado', className: 'bg-green-100 text-green-800' },
      overdue: { label: 'Vencido', className: 'bg-red-100 text-red-800' },
      scheduled: { label: 'Programado', className: 'bg-purple-100 text-purple-800' },
    }
    const { label, className } = config[status] || { label: status, className: '' }
    return <Badge className={className}>{label}</Badge>
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aplicación de Pagos</h1>
          <p className="text-muted-foreground">Registra los pagos realizados a proveedores</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          title="Por Pagar"
          value={`$${summary.totalPending.toLocaleString()}`}
          subtitle={`${summary.countPending} programaci${summary.countPending !== 1 ? 'ones' : 'ón'}`}
          icon={<DollarSign className="h-4 w-4" />}
          variant="danger"
          loading={loading}
        />

        <KpiCard
          title="Ya Pagado"
          value={`$${summary.totalPaid.toLocaleString()}`}
          subtitle={`${summary.countPaid} programaci${summary.countPaid !== 1 ? 'ones' : 'ón'}`}
          icon={<CheckCircle className="h-4 w-4" />}
          variant="success"
          loading={loading}
        />

        <KpiCard
          title="Vencidas"
          value={schedules.filter((s: PaymentSchedule) => new Date(s.scheduledDate) < new Date()).length}
          subtitle="Con fecha vencida"
          icon={<Clock className="h-4 w-4" />}
          variant="warning"
          loading={loading}
        />

        <KpiCard
          title="Pagos Hoy"
          value={paymentsToday}
          subtitle="Registrados hoy"
          icon={<CreditCard className="h-4 w-4" />}
          variant="info"
          loading={loading}
        />
      </div>

      {/* DataTable con paginación y filtros */}
      <DataTable
        title="Pagos Programados"
        columns={columns}
        data={schedules}
        keyExtractor={(row) => row.id}
        actions={actions}
        loading={loading}
        emptyMessage={filters.search ? 'No se encontraron programaciones' : filters.paymentStatus === 'pending' ? 'No hay pagos programados pendientes' : 'No hay pagos programados completados'}
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
        rowsPerPageOptions={[10, 25, 50]}
      />

      {/* Dialog: Registrar Pago */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Editar Pago' : 'Registrar Pago'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Modifica los datos del pago registrado' : 'Registra un pago realizado al proveedor'}
            </DialogDescription>
          </DialogHeader>

          {selectedSchedule && (
            <div className="space-y-5 py-4">
              {/* Info de la programación - Diseño mejorado con cards */}
              <div className="rounded-xl border bg-gradient-to-br from-gray-50 to-white p-4 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <Building2 className="h-4 w-4 text-cyan-700" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Proveedor</span>
                    <p className="font-semibold text-gray-900">{selectedAccount?.supplier?.name || (selectedAccount as any)?.supplierName || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-xs text-gray-500 block">Factura</span>
                      <span className="font-medium text-sm">{selectedAccount?.invoiceNumber || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-xs text-gray-500 block">Fecha Programada</span>
                      <span className="font-medium text-sm">{formatDateWithoutTimezone(selectedSchedule.scheduledDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">Programado</span>
                    <span className="font-bold text-blue-700">${Number(selectedSchedule.amount).toLocaleString()}</span>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">Pagado</span>
                    <span className="font-bold text-green-700">${(selectedSchedule as any).paidAmount?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">Faltante</span>
                    <span className="font-bold text-red-700">${(selectedSchedule as any).remainingAmount?.toLocaleString() || Number(selectedSchedule.amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Formulario con componentes reutilizables */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FloatingInput
                    label="Monto del Pago *"
                    value={formatNumber(String(formData.amount || ''))}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0"
                    startAdornment={<DollarSign className="h-4 w-4 text-gray-400" />}
                  />

                  <FloatingSelect
                    label="Método de Pago *"
                    value={formData.paymentMethod}
                    onChange={(value) => setFormData({ ...formData, paymentMethod: value as any })}
                    options={[
                      { value: 'transfer', label: 'Transferencia' },
                      { value: 'check', label: 'Cheque' },
                      { value: 'cash', label: 'Efectivo' },
                      { value: 'card', label: 'Tarjeta' },
                      { value: 'other', label: 'Otro' },
                    ]}
                    placeholder="Selecciona un método"
                  />
                </div>

                <FloatingDatePicker
                  label="Fecha de Pago *"
                  value={formData.paymentDate}
                  onChange={(date) => {
                    const selectedDate = date instanceof Date ? date : new Date()
                    setFormData({ ...formData, paymentDate: selectedDate })
                  }}
                  mode="single"
                  placeholder="Selecciona una fecha"
                />

                <FloatingInput
                  label="Referencia / Número de Transacción *"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="Ej: TRANSF-001, CHEQUE-123"
                  startAdornment={<Receipt className="h-4 w-4 text-gray-400" />}
                />

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-1 block">Notas (Opcional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Observaciones adicionales..."
                    rows={3}
                    className="rounded-xl border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                  />
                </div>
              </div>

            </div>
          )}

          <DialogFooter>
            <ActionButton variant="cancel" onClick={() => setShowRegisterDialog(false)} disabled={submitting}>
              Cancelar
            </ActionButton>
            <ActionButton variant="primary" onClick={handleRegisterPayment} loading={submitting}>
              Registrar Pago
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Historial de Pagos */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-cyan-600" />
              {selectedSchedule ? 'Historial de Pagos - Programación' : 'Historial de Pagos'}
            </DialogTitle>
            <DialogDescription>
              {selectedSchedule 
                ? `Pagos registrados para la programación del ${formatDateWithoutTimezone(selectedSchedule.scheduledDate)}` 
                : 'Pagos registrados para esta cuenta por pagar'}
            </DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-5">
              {/* Info de la cuenta - Diseño mejorado */}
              <div className="rounded-xl border bg-gradient-to-br from-gray-50 to-white p-4 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <Building2 className="h-4 w-4 text-cyan-700" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Proveedor</span>
                    <p className="font-semibold text-gray-900">{selectedAccount.supplier?.name || (selectedAccount as any).supplierName || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-xs text-gray-500 block">Factura</span>
                      <span className="font-medium text-sm">{selectedAccount.invoiceNumber || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-xs text-gray-500 block">Monto Total</span>
                      <span className="font-medium text-sm">${Number(selectedAccount.amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">Pagado</span>
                    <span className="font-bold text-green-700">${Number(selectedAccount.paidAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">Saldo</span>
                    <span className="font-bold text-red-700">${Number(selectedAccount.balance || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Info de la programación si está seleccionada */}
              {selectedSchedule && (
                <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarDays className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Información de la Programación</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center p-2 bg-white rounded-lg">
                      <span className="text-xs text-gray-500 block">Monto Programado</span>
                      <span className="font-bold text-blue-700">${Number(selectedSchedule.amount).toLocaleString()}</span>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg">
                      <span className="text-xs text-gray-500 block">Pagado</span>
                      <span className="font-bold text-green-700">${((selectedSchedule as any).paidAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg">
                      <span className="text-xs text-gray-500 block">Restante</span>
                      <span className="font-bold text-red-700">${((selectedSchedule as any).remainingAmount || Number(selectedSchedule.amount)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* DataTable de pagos */}
              <DataTable
                title="Pagos Registrados"
                columns={historyColumns}
                data={payments}
                keyExtractor={(row) => row.id}
                loading={loadingHistory}
                emptyMessage={selectedSchedule ? "No hay pagos registrados para esta programación" : "No hay pagos registrados para esta cuenta"}
                showFilters={false}
                showHeader={false}
                stickyHeader={false}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
