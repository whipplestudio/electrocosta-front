"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable, Column, Action, SelectFilter } from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar as CalendarIcon, Plus, Search, CheckCircle, Loader2, X, Edit, Clock, Ban, CheckCircle2, DollarSign } from "lucide-react"
import { KpiCard } from "@/components/ui/kpi-card"
import { ActionButton, CreateButton, CancelButton, EditButton } from "@/components/ui/action-button"
import { paymentSchedulingService, SchedulePaymentDto, PaymentSchedule } from "@/services/payment-scheduling.service"
import { accountsPayableService } from "@/services/accounts-payable.service"
import type { AccountPayable } from "@/types/accounts-payable"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { FloatingInput } from "@/components/ui/floating-input"
import { FloatingSelect, SelectOption } from "@/components/ui/floating-select"
import { FloatingDatePicker } from "@/components/ui/floating-date-picker"

// Helper para traducir método de pago
const getPaymentMethodLabel = (method: string | null | undefined) => {
  const labels: Record<string, string> = {
    transfer: 'Transferencia bancaria',
    check: 'Cheque',
    cash: 'Efectivo',
    card: 'Tarjeta',
  }
  return method ? labels[method] || method : 'N/A'
}

// Helper para formatear moneda en formato mexicano
const formatCurrency = (value: number | string | null | undefined): string => {
  const num = typeof value === 'number' ? value : parseFloat(value || '0')
  if (isNaN(num)) return '$0.00'
  return '$' + num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

export default function ProgramacionPagosPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([])

  // Ref para prevenir loop durante montaje inicial
  const isInitialMount = useRef(true)

  // Estados para paginación server-side (DataTable)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Estados para filtros (DataTable)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all' as string,
  })
  const [availableAccounts, setAvailableAccounts] = useState<AccountPayable[]>([])
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<PaymentSchedule | null>(null)
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const isEditing = editingSchedule !== null
  const [summary, setSummary] = useState({
    totalScheduled: 0,
    totalCompleted: 0,
    totalCancelled: 0,
    countScheduled: 0,
    countCompleted: 0,
    countCancelled: 0,
  })

  // Form state
  const [formData, setFormData] = useState({
    accountPayableId: '',
    scheduledDate: new Date(),
    scheduledAmount: '',
    paymentMethod: 'transfer' as 'transfer' | 'check' | 'cash',
    bankAccount: '',
    checkNumber: '',
    reference: '',
    notes: '',
    requiresApproval: true,
  })

  // Estado de errores de validación
  const [errors, setErrors] = useState<{
    accountPayableId?: string
    scheduledAmount?: string
    scheduledDate?: string
    bankAccount?: string
    checkNumber?: string
  }>({})

  // Cargar cuentas disponibles (solo una vez al montar el componente)
  const loadAvailableAccounts = useCallback(async () => {
    try {
      const accountsData = await accountsPayableService.getAll({
        page: 1,
        limit: 100,
        hasBalance: true,
        approvalStatus: 'approved'
      })
      setAvailableAccounts(accountsData.data)
    } catch (error) {
      console.error('Error al cargar cuentas disponibles:', error)
    }
  }, [])

  // Cargar schedules con paginación y filtros server-side
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = {
        page,
        limit,
      }

      if (filters.status && filters.status !== 'all') {
        params.status = filters.status
      }
      if (filters.search) {
        params.search = filters.search
      }

      const schedulesData = await paymentSchedulingService.getScheduledPayments(params)
      console.log("🚀 ~ ProgramacionPagosPage ~ schedulesData:", schedulesData)

      setSchedules(schedulesData.data)
      setTotal(schedulesData.total)
      setTotalPages(Math.ceil(schedulesData.total / limit) || 1)

      if (schedulesData.summary) {
        setSummary({
          totalScheduled: Number(schedulesData.summary.totalScheduled) || 0,
          totalCompleted: Number(schedulesData.summary.totalCompleted) || 0,
          totalCancelled: Number(schedulesData.summary.totalCancelled) || 0,
          countScheduled: schedulesData.summary.countScheduled || 0,
          countCompleted: schedulesData.summary.countCompleted || 0,
          countCancelled: schedulesData.summary.countCancelled || 0,
        })
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los pagos programados"
      })
    } finally {
      setLoading(false)
    }
  }, [page, limit, filters.status, filters.search])

  // Cargar cuentas disponibles solo al montar el componente
  useEffect(() => {
    loadAvailableAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cargar schedules cuando cambian filtros o paginación (dependencias primitivas)
  useEffect(() => {
    loadData()
    // Marcar que ya pasó el montaje inicial después del primer load
    const timer = setTimeout(() => {
      isInitialMount.current = false
    }, 500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filters.status, filters.search])

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
    setFormData((prev) => ({ ...prev, scheduledAmount: unformatted }))
    // Limpiar error de monto
    setErrors(prev => ({ ...prev, scheduledAmount: undefined }))
  }

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!formData.accountPayableId) {
      newErrors.accountPayableId = 'Debes seleccionar una cuenta por pagar'
    }

    const amountValue = parseFloat(formData.scheduledAmount)
    if (!formData.scheduledAmount || isNaN(amountValue) || amountValue <= 0) {
      newErrors.scheduledAmount = 'El monto debe ser mayor a cero'
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Debes seleccionar una fecha para el pago'
    }

    // Validaciones según método de pago
    if (formData.paymentMethod === 'transfer' && !formData.bankAccount?.trim()) {
      newErrors.bankAccount = 'La cuenta bancaria es requerida para transferencias'
    }

    if (formData.paymentMethod === 'check' && !formData.checkNumber?.trim()) {
      newErrors.checkNumber = 'El número de cheque es requerido'
    }

    setErrors(newErrors)

    // Si hay errores, mostrar toast
    if (Object.keys(newErrors).length > 0) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "Por favor completa todos los campos requeridos correctamente"
      })
      return false
    }

    return true
  }

  // Programar o actualizar pago
  const handleSchedulePayment = async () => {
    // Validar formulario
    if (!validateForm()) {
      return
    }

    // Si pasa todas las validaciones, proceder con la petición
    try {
      setSubmitting(true)
      console.log(isEditing ? '📤 Actualizando pago programado...' : '📤 Programando nuevo pago...')
      
      const { accountPayableId, ...scheduleData } = formData
      
      // Convertir tipos para el backend
      const payloadData = {
        ...scheduleData,
        scheduledDate: formData.scheduledDate.toISOString().split('T')[0],
        scheduledAmount: parseFloat(formData.scheduledAmount),
      }
      
      console.log('📦 Datos a enviar:', { accountPayableId, payloadData })
      
      let result
      if (isEditing && editingSchedule) {
        // Actualizar pago existente
        result = await paymentSchedulingService.updateSchedule(editingSchedule.id, payloadData)
      } else {
        // Crear nuevo pago programado
        result = await paymentSchedulingService.schedulePayment(accountPayableId, payloadData)
      }
      console.log('✅ Respuesta del backend:', result)

      toast({
        title: "✅ Éxito",
        description: isEditing ? "Pago actualizado exitosamente" : "Pago programado exitosamente"
      })
      setShowScheduleDialog(false)
      resetForm()
      await loadData()
    } catch (error: any) {
      console.error('❌ Error:', error)
      console.error('❌ Error response:', error.response)
      console.error('❌ Error data:', error.response?.data)
      
      const errorMessage = error.response?.data?.message || error.message || (isEditing ? 'Error al actualizar el pago' : 'Error al programar el pago')
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: errorMessage
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Cancelar programación
  const handleCancelSchedule = async (scheduleId: string) => {
    if (!confirm('¿Estás seguro de cancelar esta programación de pago?')) return

    if (cancellingId) return

    try {
      setCancellingId(scheduleId)
      await paymentSchedulingService.cancelSchedule(scheduleId)
      toast({
        title: "✅ Éxito",
        description: "Programación cancelada exitosamente"
      })
      await loadData()
    } catch (error: any) {
      console.error('Error al cancelar:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || 'Error al cancelar la programación'
      })
    } finally {
      setCancellingId(null)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      accountPayableId: '',
      scheduledDate: new Date(),
      scheduledAmount: '',
      paymentMethod: 'transfer',
      bankAccount: '',
      checkNumber: '',
      reference: '',
      notes: '',
      requiresApproval: true,
    })
    setErrors({})
    setEditingSchedule(null)
    setSelectedAccountInfo(null)
  }

  // Estado para información de montos de la cuenta seleccionada
  const [selectedAccountInfo, setSelectedAccountInfo] = useState<{
    totalAmount: number;
    scheduledAmount: number;
    remainingAmount: number;
  } | null>(null)

  // Seleccionar cuenta y prellenar datos
  const handleSelectAccount = async (accountId: string) => {
    const account = availableAccounts.find(acc => acc.id === accountId)
    if (account) {
      try {
        // Obtener pagos ya programados para esta cuenta
        const schedules = await paymentSchedulingService.getAccountSchedules(accountId)
        // Incluir todas las programaciones: pendientes, aprobadas y completadas
        const totalScheduled = schedules
          .filter(s => s.status === 'scheduled' || s.status === 'approved' || s.status === 'completed')
          .reduce((sum, s) => sum + Number(s.amount), 0)
        
        const accountTotal = Number(account.amount)
        const accountBalance = Number(account.balance)
        const remainingAmount = accountBalance
        
        // Guardar info para mostrar en UI
        setSelectedAccountInfo({
          totalAmount: accountTotal,
          scheduledAmount: totalScheduled,
          remainingAmount: remainingAmount
        })
        
        setFormData({
          ...formData,
          accountPayableId: accountId,
          scheduledAmount: remainingAmount > 0 ? remainingAmount.toString() : '0',
          reference: account.invoiceNumber,
        })
        // Limpiar error de cuenta
        setErrors(prev => ({ ...prev, accountPayableId: undefined }))
      } catch (error) {
        console.error('Error al obtener schedules:', error)
        // Fallback: usar monto total si hay error
        setFormData({
          ...formData,
          accountPayableId: accountId,
          scheduledAmount: account.amount.toString(),
          reference: account.invoiceNumber,
        })
        setErrors(prev => ({ ...prev, accountPayableId: undefined }))
      }
    }
  }

  // Abrir dialog para editar pago programado
  const handleEditSchedule = async (schedule: PaymentSchedule) => {
    try {
      setLoadingSchedule(true)
      console.log('📥 Obteniendo datos completos del pago programado...')
      
      // Obtener datos completos del schedule desde la API
      const fullSchedule = await paymentSchedulingService.getScheduleById(schedule.id)
      console.log('✅ Datos obtenidos:', fullSchedule)
      
      // Asegurar que la cuenta asociada esté en availableAccounts
      if (fullSchedule.accountPayable) {
        const accountExists = availableAccounts.some(acc => acc.id === fullSchedule.accountPayableId)
        if (!accountExists) {
          console.log('ℹ️ Agregando cuenta asociada a availableAccounts')
          setAvailableAccounts(prev => [...prev, fullSchedule.accountPayable as AccountPayable])
        }
      }
      
      setEditingSchedule(fullSchedule)
      
      // Parsear fecha sin timezone para evitar problemas de conversión
      const dateStr = fullSchedule.scheduledDate.split('T')[0]
      const [year, month, day] = dateStr.split('-').map(Number)
      const scheduledDate = new Date(year, month - 1, day)
      
      setFormData({
        accountPayableId: fullSchedule.accountPayableId,
        scheduledDate,
        scheduledAmount: fullSchedule.amount.toString(),
        paymentMethod: (fullSchedule.paymentMethod || 'transfer') as 'transfer' | 'check' | 'cash',
        bankAccount: fullSchedule.bankAccount || '',
        checkNumber: fullSchedule.checkNumber || '',
        reference: fullSchedule.reference || '',
        notes: fullSchedule.notes || '',
        requiresApproval: fullSchedule.requiresApproval ?? true,
      })
      setShowScheduleDialog(true)
    } catch (error: any) {
      console.error('❌ Error al obtener datos del pago programado:', error)
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: error.response?.data?.message || 'Error al cargar los datos del pago programado'
      })
    } finally {
      setLoadingSchedule(false)
    }
  }

  // Callbacks para DataTable - memoizados para evitar bucles infinitos
  const handleSearchChange = useCallback((value: string) => {
    if (isInitialMount.current) return // Ignorar durante montaje inicial
    setFilters((prev) => ({ ...prev, search: value }))
    setPage(1)
  }, [])

  const handleFilterChange = useCallback((key: string, value: string | string[]) => {
    if (isInitialMount.current) return // Ignorar durante montaje inicial
    setFilters((prev) => ({ ...prev, [key]: value as string }))
    setPage(1)
  }, [])

  const handleClearFilters = useCallback(() => {
    if (isInitialMount.current) return // Ignorar durante montaje inicial
    setFilters({ search: '', status: 'all' })
    setPage(1)
    toast({
      title: 'Filtros limpiados',
      description: 'Se han restablecido los filtros de búsqueda'
    })
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    if (isInitialMount.current) return // Ignorar durante montaje inicial
    setPage(newPage)
  }, [])

  const handleRowsPerPageChange = useCallback((newLimit: number) => {
    if (isInitialMount.current) return // Ignorar durante montaje inicial
    setLimit(newLimit)
    setPage(1)
  }, [])

  // Handler para cerrar el dialog y limpiar el formulario
  const handleCloseDialog = useCallback((open: boolean) => {
    if (!open) {
      // Se está cerrando el dialog (clic fuera o botón cerrar)
      resetForm()
    }
    setShowScheduleDialog(open)
  }, [])

  // Badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-50 text-blue-700">Programado</Badge>
      case "completed":
        return <Badge className="bg-green-50 text-green-700">Ejecutado</Badge>
      case "cancelled":
        return <Badge className="bg-red-50 text-red-700">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Configuración de columnas para el DataTable - memoizada para estabilidad
  const columns = useMemo<Column<PaymentSchedule>[]>(() => [
    {
      key: 'supplier',
      header: 'Proveedor',
      render: (row) => (
        <div>
          <div className="font-medium">
            {row.accountPayable?.supplier?.name || (row.accountPayable as any)?.supplierName || 'N/A'}
          </div>
          {row.reference && (
            <div className="text-sm text-muted-foreground">Ref: {row.reference}</div>
          )}
        </div>
      ),
    },
    {
      key: 'invoice',
      header: 'Factura',
      render: (row) => (
        <span className="font-medium">{row.accountPayable?.invoiceNumber || 'N/A'}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Monto',
      render: (row) => (
        <span className="font-medium">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      key: 'scheduledDate',
      header: 'Fecha Programada',
      render: (row) => (
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          {formatDateWithoutTimezone(row.scheduledDate)}
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Método',
      render: (row) => (
        <div>
          <div className="text-sm font-medium">{getPaymentMethodLabel(row.paymentMethod)}</div>
          {row.bankAccount && (
            <div className="text-xs text-muted-foreground">{row.bankAccount}</div>
          )}
          {row.checkNumber && (
            <div className="text-xs text-muted-foreground">CHK: {row.checkNumber}</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (row) => getStatusBadge(row.status),
    },
  ], [])

  // Configuración de acciones para el DataTable
  const actions = useMemo<Action<PaymentSchedule>[]>(() => [
    {
      label: 'Editar',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row) => handleEditSchedule(row),
      hidden: (row) => row.status !== 'scheduled',
      disabled: (row) => cancellingId === row.id || loadingSchedule,
    },
    {
      label: 'Cancelar',
      icon: <X className="h-4 w-4" />,
      onClick: (row) => handleCancelSchedule(row.id),
      hidden: (row) => row.status !== 'scheduled',
      disabled: (row) => cancellingId === row.id,
    },
  ], [cancellingId, loadingSchedule, handleEditSchedule, handleCancelSchedule])

  // Configuración de filtros de selección para el DataTable
  const selectFilters = useMemo<SelectFilter[]>(() => [
    {
      key: 'status',
      label: 'Estado',
      options: [
        { value: 'all', label: 'Todos los estados' },
        { value: 'scheduled', label: 'Programado' },
        { value: 'completed', label: 'Ejecutado' },
        { value: 'cancelled', label: 'Cancelado' },
      ],
    },
  ], [])

  // Valores memoizados para DataTable (evitar re-renders infinitos)
  const keyExtractor = useCallback((row: PaymentSchedule) => row.id, [])

  const searchFilterConfig = useMemo(() => ({
    placeholder: 'Buscar por proveedor, factura o referencia...',
    debounceMs: 400,
  }), [])

  const filterValues = useMemo(() => ({
    status: filters.status,
  }), [filters.status])

  const pagination = useMemo(() => ({
    page,
    limit,
    total,
    totalPages,
  }), [page, limit, total, totalPages])

  const rowsPerPageOptions = useMemo(() => [10, 25, 50], [])

  if (loading && schedules.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Programación de Pagos</h1>
          <p className="text-muted-foreground">Gestión y seguimiento de pagos programados</p>
        </div>
        <CreateButton onClick={() => setShowScheduleDialog(true)}>
          Programar Pago
        </CreateButton>
      </div>

      {/* KPIs - usar totales del summary ya que son globales, no de la página actual */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Total Programado"
          value={formatCurrency(summary.totalScheduled + summary.totalCompleted + summary.totalCancelled)}
          subtitle={`${summary.countScheduled + summary.countCompleted + summary.countCancelled} pagos`}
          icon={<DollarSign className="h-4 w-4" />}
          variant="default"
        />
        <KpiCard
          title="Pendientes"
          value={formatCurrency(summary.totalScheduled)}
          subtitle={`${summary.countScheduled} pagos`}
          icon={<Clock className="h-4 w-4" />}
          variant="info"
        />
        <KpiCard
          title="Cancelados"
          value={formatCurrency(summary.totalCancelled)}
          subtitle={`${summary.countCancelled} pagos`}
          icon={<Ban className="h-4 w-4" />}
          variant="danger"
        />
        <KpiCard
          title="Ejecutados"
          value={formatCurrency(summary.totalCompleted)}
          subtitle={`${summary.countCompleted} pagos`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          variant="success"
        />
      </div>

      {/* DataTable de Pagos Programados */}
      <DataTable
        title="Pagos Programados"
        columns={columns}
        data={schedules}
        keyExtractor={keyExtractor}
        actions={actions}
        loading={loading}
        emptyMessage="No se encontraron pagos programados"
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

      {/* Dialog Programar Pago */}
      <Dialog open={showScheduleDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Pago Programado' : 'Programar Nuevo Pago'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Actualiza los detalles del pago programado' : 'Programa un pago para una cuenta por pagar aprobada'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <FloatingSelect
                label="Cuenta por Pagar *"
                value={formData.accountPayableId}
                onChange={(value) => handleSelectAccount(value as string)}
                options={availableAccounts.map(account => ({
                  value: account.id,
                  label: `${account.invoiceNumber} - ${account.supplier?.name || (account as any).supplierName || 'N/A'} - ${formatCurrency(account.amount)}`
                }))}
                error={errors.accountPayableId}
                placeholder="Seleccionar cuenta"
                searchable
                searchPlaceholder="Buscar factura o proveedor..."
              />

              {/* Info de montos de la cuenta seleccionada - UI mejorada */}
              {selectedAccountInfo && (
                <div className="mt-3 p-4 bg-gradient-to-r from-[#f0fdf4] to-white border border-[#164e63]/20 rounded-xl shadow-sm">
                  <p className="text-xs font-medium text-[#164e63] uppercase tracking-wide mb-3">Resumen de la Cuenta</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                      <p className="text-xs text-muted-foreground mb-1">Total</p>
                      <p className="font-semibold text-[#374151]">
                        {formatCurrency(selectedAccountInfo.totalAmount)}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-amber-50/50 rounded-lg border border-amber-100">
                      <p className="text-xs text-amber-600 mb-1">Programado</p>
                      <p className="font-semibold text-amber-700">
                        {formatCurrency(selectedAccountInfo.scheduledAmount)}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-green-50/50 rounded-lg border border-green-100">
                      <p className="text-xs text-green-600 mb-1">Restante</p>
                      <p className="font-semibold text-green-700">
                        {formatCurrency(selectedAccountInfo.remainingAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FloatingInput
                label="Monto *"
                type="text"
                value={formatNumber(String(formData.scheduledAmount || ''))}
                onChange={(e) => handleAmountChange(e.target.value)}
                error={errors.scheduledAmount}
                startAdornment={<DollarSign className="h-4 w-4" />}
              />
              <FloatingDatePicker
                label="Fecha de Pago *"
                value={formData.scheduledDate}
                onChange={(date) => {
                  setFormData({...formData, scheduledDate: date as Date || new Date()})
                  setErrors(prev => ({ ...prev, scheduledDate: undefined }))
                }}
                mode="single"
                error={errors.scheduledDate}
              />
            </div>

            <FloatingSelect
              label="Método de Pago *"
              value={formData.paymentMethod}
              onChange={(value) => setFormData({ ...formData, paymentMethod: value as 'transfer' | 'check' | 'cash' })}
              options={[
                { value: 'transfer', label: 'Transferencia bancaria' },
                { value: 'check', label: 'Cheque' },
                { value: 'cash', label: 'Efectivo' },
                { value: 'card', label: 'Tarjeta' },
              ]}
            />

            {formData.paymentMethod === 'transfer' && (
              <FloatingInput
                label="Cuenta Bancaria *"
                value={formData.bankAccount}
                onChange={(e) => {
                  setFormData({ ...formData, bankAccount: e.target.value })
                  setErrors(prev => ({ ...prev, bankAccount: undefined }))
                }}
                placeholder="Ej: 1234567890 o CLABE"
                error={errors.bankAccount}
              />
            )}

            {formData.paymentMethod === 'check' && (
              <FloatingInput
                label="Número de Cheque *"
                value={formData.checkNumber}
                onChange={(e) => {
                  setFormData({ ...formData, checkNumber: e.target.value })
                  setErrors(prev => ({ ...prev, checkNumber: undefined }))
                }}
                placeholder="Ej: CHK-001 o 123456"
                error={errors.checkNumber}
              />
            )}

            <FloatingInput
              label="Referencia"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="Ej: REF-PAY-001 (opcional)"
            />

            <FloatingInput
              label="Notas"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ingrese notas o comentarios adicionales (opcional)"
            />
          </div>
          <DialogFooter>
            <CancelButton
              disabled={submitting}
              onClick={() => setShowScheduleDialog(false)}
            />
            <ActionButton
              variant={isEditing ? 'save' : 'create'}
              onClick={handleSchedulePayment}
              disabled={submitting}
              loading={submitting}
              loadingText={isEditing ? 'Actualizando...' : 'Programando...'}
            >
              {isEditing ? 'Actualizar Pago' : 'Programar Pago'}
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
