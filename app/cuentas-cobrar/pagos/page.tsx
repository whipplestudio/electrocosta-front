"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { KpiCard, TotalKpiCard, DataTable, Column, Action, SelectFilter, ActionButton } from "@/components/ui"
import { DynamicFormDialog } from "@/components/forms/dynamic-form"
import { CheckCircle, Clock, DollarSign, FileText, Plus, Search, Calendar as CalendarIcon, Loader2, X, History, Receipt, CreditCard, Pencil, Filter, AlertCircle, TrendingUp, TrendingDown, Eye } from "lucide-react"
import { useAccountsReceivable } from "@/hooks/use-accounts-receivable"
import { accountsReceivableService, paymentsService } from "@/services/accounts-receivable.service"
import type { AccountReceivable, Payment, RegisterPaymentDto } from "@/types/accounts-receivable"
import { RouteProtection } from "@/components/route-protection"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const paymentMethodLabels: Record<string, string> = {
  transfer: 'Transferencia',
  check: 'Cheque',
  cash: 'Efectivo',
  card: 'Tarjeta',
  other: 'Otro',
}

const paymentMethodIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  transfer: CreditCard,
  check: FileText,
  cash: DollarSign,
  card: CreditCard,
  other: Receipt,
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

export default function AplicacionPagos() {
  return (
    <RouteProtection requiredPermissions={["cuentas_cobrar.pagos.ver"]}>
      <AplicacionPagosContent />
    </RouteProtection>
  )
}

function AplicacionPagosContent() {
  // Hook de accounts receivable con paginación
  const {
    accounts,
    isLoading: loading,
    pagination,
    fetchAccounts,
  } = useAccountsReceivable()

  // Estados locales
  const [payments, setPayments] = useState<Payment[]>([])
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<AccountReceivable | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState('')
  
  // Estados para edición de pago
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [editFormData, setEditFormData] = useState({
    amount: '',
    paymentMethod: 'transfer' as any,
    paymentDate: new Date(),
    reference: '',
    notes: '',
  })

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'transfer' as any,
    paymentDate: new Date(),
    reference: '',
    notes: '',
  })

  // Construir filtros para el backend según el tab activo
  const buildFilters = useCallback(() => {
    const filters: any = {}
    
    // Filtro de búsqueda (cliente o factura)
    if (searchQuery) {
      filters.search = searchQuery
    }
    
    // Siempre traer cuentas con deuda (pending, partial, overdue)
    filters.status = ['pending', 'partial', 'overdue']
    
    return filters
  }, [searchQuery])

  // Cargar datos con paginación
  const loadData = useCallback(async (page = 1, limit = 10) => {
    const filters = buildFilters()
    await fetchAccounts(filters, page, limit)
  }, [fetchAccounts, buildFilters])

  // Cargar datos iniciales
  useEffect(() => {
    loadData(1, 10)
  }, [loadData])

  // Recargar cuando cambien los filtros (solo buscar, no clientFilter)
  useEffect(() => {
    // Debounce para evitar llamadas múltiples mientras el usuario escribe
    const timer = setTimeout(() => {
      loadData(1, 10)
    }, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

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
    // Guardar como string para permitir decimales parciales mientras se escribe
    setFormData((prev) => ({ ...prev, amount: unformatted }))
  }

  // Registrar pago
  const handleRegisterPayment = async () => {
    if (!selectedAccount) return

    const amountValue = parseFloat(formData.amount)
    if (!formData.amount || amountValue <= 0) {
      toast.error('El monto debe ser mayor a cero')
      return
    }

    if (amountValue > Number(selectedAccount.balance)) {
      toast.error('El monto no puede ser mayor al saldo pendiente')
      return
    }

    if (!formData.reference?.trim()) {
      toast.error('La referencia es obligatoria')
      return
    }

    try {
      setSubmitting(true)
      // Convertir fecha a formato ISO 8601 completo y amount a número
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount),
        paymentDate: new Date(formData.paymentDate).toISOString(),
      }
      await paymentsService.register(selectedAccount.id, paymentData)
      
      toast.success('Pago registrado exitosamente')
      setShowRegisterDialog(false)
      setSelectedAccount(null)
      setFormData({
        amount: '',
        paymentMethod: 'transfer' as any,
        paymentDate: new Date(),
        reference: '',
        notes: '',
      })
      await loadData()
    } catch (error) {
      console.error('Error al registrar pago:', error)
      toast.error('Error al registrar el pago')
    } finally {
      setSubmitting(false)
    }
  }

  // Abrir dialog de registro con cuenta seleccionada
  const openRegisterDialog = (account: AccountReceivable) => {
    setSelectedAccount(account)
    setFormData({
      ...formData,
      amount: account.balance.toString(),
    })
    setShowRegisterDialog(true)
  }

  // Cargar historial de pagos
  const loadPaymentHistory = async (account: AccountReceivable) => {
    try {
      setLoadingHistory(true)
      setSelectedAccount(account)
      const history = await paymentsService.getHistory(account.id)
      setPayments(history)
      setShowHistoryDialog(true)
    } catch (error) {
      console.error('Error al cargar historial:', error)
      toast.error('Error al cargar el historial de pagos')
    } finally {
      setLoadingHistory(false)
    }
  }

  // Calcular KPIs
  const totalPending = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0)
  const overdueAccounts = accounts.filter(acc => acc.dueDate && new Date(acc.dueDate) < new Date())
  const totalOverdue = overdueAccounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0)

  // Abrir dialog de editar pago
  const openEditDialog = (payment: Payment) => {
    setSelectedPayment(payment)
    setEditFormData({
      amount: payment.amount.toString(),
      paymentMethod: payment.paymentMethod,
      paymentDate: new Date(payment.paymentDate),
      reference: payment.reference || '',
      notes: payment.notes || '',
    })
    setShowEditDialog(true)
  }

  // Manejar cambio de monto en edición
  const handleEditAmountChange = (value: string) => {
    const unformatted = unformatNumber(value)
    setEditFormData((prev) => ({ ...prev, amount: unformatted }))
  }

  // Guardar edición de pago
  const handleUpdatePayment = async () => {
    if (!selectedPayment || !selectedAccount) return

    const amountValue = parseFloat(editFormData.amount)
    if (!editFormData.amount || amountValue <= 0) {
      toast.error('El monto debe ser mayor a cero')
      return
    }

    const oldAmount = Number(selectedPayment.amount)
    const accountTotal = Number(selectedAccount.amount)
    const currentPaid = Number(selectedAccount.paidAmount)
    const difference = amountValue - oldAmount
    const newBalance = accountTotal - (currentPaid + difference)

    if (newBalance < 0) {
      toast.error(`El nuevo monto excede el total de la factura. Máximo permitido: $${(accountTotal - (currentPaid - oldAmount)).toLocaleString()}`)
      return
    }

    try {
      setSubmitting(true)
      const paymentData = {
        ...editFormData,
        amount: amountValue,
        paymentDate: new Date(editFormData.paymentDate).toISOString(),
      }
      
      const result = await paymentsService.updatePayment(selectedPayment.id, paymentData)
      
      toast.success(`Pago actualizado. Nuevo balance: $${Number(result.account.balance).toLocaleString()}`)
      setShowEditDialog(false)
      setSelectedPayment(null)
      
      // Recargar datos
      await loadData()
      
      // Si el dialog de historial está abierto, recargar el historial
      if (showHistoryDialog && selectedAccount) {
        const history = await paymentsService.getHistory(selectedAccount.id)
        setPayments(history)
      }
    } catch (error) {
      console.error('Error al actualizar pago:', error)
      toast.error('Error al actualizar el pago')
    } finally {
      setSubmitting(false)
    }
  }

  // Configuración de columnas y acciones para DataTable del historial de pagos
  const paymentHistoryColumns: Column<Payment>[] = [
    {
      key: 'index',
      header: '#',
      width: '50px',
      render: (row: Payment) => payments.length - payments.indexOf(row),
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
      align: 'right' as const,
      render: (row: Payment) => {
        const isFullPayment = Number(row.amount) === Number(selectedAccount?.amount)
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
  ]

  const paymentHistoryActions: Action<Payment>[] = [
    {
      icon: <Pencil className="h-4 w-4" />,
      label: 'Editar pago',
      onClick: (payment: Payment) => openEditDialog(payment),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Aplicación de Pagos</h2>
          <p className="text-muted-foreground">Registro y aplicación de pagos recibidos</p>
        </div>
      </div>

      {/* KPIs de Pagos usando componentes reutilizables */}
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          title="Pagos Pendientes"
          value={`$${totalPending.toLocaleString()}`}
          subtitle={`${accounts.length} facturas pendientes`}
          icon={<Clock className="h-4 w-4" />}
          variant="warning"
        />

        <KpiCard
          title="Vencidos"
          value={`$${totalOverdue.toLocaleString()}`}
          subtitle={`${overdueAccounts.length} cuentas vencidas`}
          icon={<AlertCircle className="h-4 w-4" />}
          variant="danger"
        />

        <KpiCard
          title="Cuentas Activas"
          value={accounts.length.toString()}
          subtitle="Con saldo pendiente"
          icon={<DollarSign className="h-4 w-4" />}
          variant="primary"
        />

        <KpiCard
          title="Promedio por Factura"
          value={`$${accounts.length > 0 ? Math.round(totalPending / accounts.length).toLocaleString() : '0'}`}
          subtitle="Monto promedio"
          icon={<TrendingUp className="h-4 w-4" />}
          variant="info"
        />
      </div>

        {/* Tabla de Facturas con DataTable reutilizable */}
        <DataTable
          title="Cuentas por Cobrar con Deuda"
          columns={[
            { key: 'invoiceNumber', header: 'Factura', align: 'left' },
            { key: 'client', header: 'Cliente', render: (row) => row.client?.name || 'N/A' },
            { key: 'amount', header: 'Monto Total', align: 'right', render: (row) => `$${Number(row.amount).toLocaleString()}` },
            { key: 'balance', header: 'Saldo Pendiente', align: 'right', render: (row) => `$${Number(row.balance).toLocaleString()}` },
            { 
              key: 'dueDate', 
              header: 'Vencimiento', 
              render: (row) => 
                row.dueDate ? formatDateWithoutTimezone(row.dueDate) : 'Sin vencimiento'
            },
            { 
              key: 'status', 
              header: 'Estado', 
              align: 'center',
              render: (row) => {
                const isPaid = Number(row.balance) === 0
                
                if (isPaid) {
                  return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pagado</Badge>
                } else {
                  return <Badge variant="secondary">Pendiente</Badge>
                }
              }
            },
          ]}
          data={accounts}
          keyExtractor={(row) => row.id}
          actions={[
            {
              label: 'Ver historial',
              icon: <History className="h-4 w-4" />,
              onClick: (row) => loadPaymentHistory(row),
            },
            {
              label: 'Aplicar pago',
              icon: <DollarSign className="h-4 w-4" />,
              onClick: (row) => openRegisterDialog(row),
              hidden: (row) => Number(row.balance) === 0,
            },
          ]}
          loading={loading}
          emptyMessage="No se encontraron cuentas con deuda"
          
          // Filtros integrados
          searchFilter={{ placeholder: 'Buscar por cliente o factura...', debounceMs: 400 }}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          
          onClearFilters={() => {
            setSearchQuery('')
          }}
          
          // Paginación backend
          pagination={pagination}
          onPageChange={(page) => loadData(page, pagination.limit)}
          onRowsPerPageChange={(limit) => loadData(1, limit)}
          rowsPerPageOptions={[10, 25, 50]}
        />

      {/* Dialog Registrar Pago con DynamicForm */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Pago</DialogTitle>
            <DialogDescription>
              {selectedAccount && (
                <div className="mt-2 space-y-1">
                  <p><strong>Factura:</strong> {selectedAccount.invoiceNumber}</p>
                  <p><strong>Cliente:</strong> {selectedAccount.client?.name}</p>
                  <p><strong>Saldo Pendiente:</strong> ${Number(selectedAccount.balance).toLocaleString()}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DynamicFormDialog
            dialogTitle=""
            dialogDescription=""
            config={{
              columns: 2,
              fields: [
                {
                  name: 'amount',
                  label: 'Monto Recibido',
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
                  required: true,
                  placeholder: 'Número de referencia o folio',
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
                amount: selectedAccount?.balance ? String(selectedAccount.balance) : '',
                paymentMethod: 'transfer',
                reference: '',
                paymentDate: new Date().toISOString().split('T')[0],
                notes: '',
              },
            }}
            onSubmit={async (data) => {
              if (!selectedAccount) return

              const amountValue = parseFloat(data.amount)
              if (!data.amount || amountValue <= 0) {
                toast.error('El monto debe ser mayor a cero')
                return
              }

              if (amountValue > Number(selectedAccount.balance)) {
                toast.error('El monto no puede ser mayor al saldo pendiente')
                return
              }

              if (!data.reference?.trim()) {
                toast.error('La referencia es obligatoria')
                return
              }

              try {
                setSubmitting(true)
                const paymentData = {
                  amount: amountValue,
                  paymentMethod: data.paymentMethod,
                  paymentDate: new Date(data.paymentDate).toISOString(),
                  reference: data.reference,
                  notes: data.notes || '',
                }
                await paymentsService.register(selectedAccount.id, paymentData)
                
                toast.success('Pago registrado exitosamente')
                setShowRegisterDialog(false)
                setSelectedAccount(null)
                await loadData()
              } catch (error) {
                console.error('Error al registrar pago:', error)
                toast.error('Error al registrar el pago')
              } finally {
                setSubmitting(false)
              }
            }}
            onCancel={() => {
              setShowRegisterDialog(false)
              setSelectedAccount(null)
            }}
            submitLabel="Registrar Pago"
            cancelLabel="Cancelar"
            loading={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Historial de Pagos */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Pagos/Abonos
            </DialogTitle>
            <DialogDescription>
              Factura: {selectedAccount?.invoiceNumber} - Cliente: {selectedAccount?.client?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {/* Resumen de la cuenta con KpiCard reutilizables */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard
                title="Monto Original"
                value={`$${Number(selectedAccount?.amount || 0).toLocaleString()}`}
                icon={<FileText className="h-4 w-4" />}
              />
              <KpiCard
                title="Total Pagado"
                value={`$${payments.reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString()}`}
                icon={<DollarSign className="h-4 w-4" />}
                variant="success"
              />
              <KpiCard
                title="Saldo Pendiente"
                value={`$${Number(selectedAccount?.balance || 0).toLocaleString()}`}
                icon={<Clock className="h-4 w-4" />}
                variant="warning"
              />
              <KpiCard
                title="Total de Abonos"
                value={payments.length}
                icon={<Receipt className="h-4 w-4" />}
                variant="info"
              />
            </div>

            {/* Lista de pagos - DataTable reutilizable */}
            <div>
              <DataTable
                title="Registro de Pagos y Abonos"
                data={payments}
                columns={paymentHistoryColumns}
                keyExtractor={(row: Payment) => row.id}
                actions={paymentHistoryActions}
                loading={loadingHistory}
                emptyMessage="No hay pagos registrados para esta cuenta"
              />
            </div>

            {/* Acción rápida - Solo si hay saldo pendiente */}
            {payments.length > 0 && Number(selectedAccount?.balance || 0) > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Saldo pendiente: ${Number(selectedAccount?.balance || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">¿Deseas aplicar un nuevo pago a esta cuenta?</p>
                </div>
                <ActionButton
                  variant="create"
                  size="sm"
                  startIcon={<DollarSign className="h-4 w-4" />}
                  onClick={() => {
                    setShowHistoryDialog(false)
                    openRegisterDialog(selectedAccount!)
                  }}
                >
                  Aplicar Pago
                </ActionButton>
              </div>
            )}
          </div>

          <DialogFooter>
            <ActionButton
              variant="cancel"
              size="md"
              onClick={() => {
                setShowHistoryDialog(false)
                setPayments([])
                setSelectedAccount(null)
              }}
            >
              Cerrar
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Pago con DynamicForm */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Editar Pago
            </DialogTitle>
            <DialogDescription>
              {selectedAccount && selectedPayment && (
                <div className="mt-2 space-y-1">
                  <p><strong>Factura:</strong> {selectedAccount.invoiceNumber}</p>
                  <p><strong>Cliente:</strong> {selectedAccount.client?.name}</p>
                  <p><strong>Monto Actual:</strong> ${Number(selectedPayment.amount).toLocaleString()}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAccount && selectedPayment && (
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
                  amount: selectedPayment?.amount ? String(selectedPayment.amount) : '',
                  paymentMethod: selectedPayment?.paymentMethod || 'transfer',
                  reference: selectedPayment?.reference || '',
                  paymentDate: selectedPayment?.paymentDate 
                    ? new Date(selectedPayment.paymentDate).toISOString().split('T')[0] 
                    : new Date().toISOString().split('T')[0],
                  notes: selectedPayment?.notes || '',
                },
              }}
              onSubmit={async (data) => {
                if (!selectedAccount || !selectedPayment) return

                const amountValue = parseFloat(data.amount)
                if (!data.amount || amountValue <= 0) {
                  toast.error('El monto debe ser mayor a cero')
                  return
                }

                const oldAmount = Number(selectedPayment.amount)
                const balanceDifference = oldAmount - amountValue
                const newBalance = Number(selectedAccount.balance) + balanceDifference

                if (newBalance < 0) {
                  toast.error(`El nuevo balance sería negativo (${newBalance.toLocaleString()})`)
                  return
                }

                try {
                  setSubmitting(true)
                  const updateData = {
                    amount: amountValue,
                    paymentMethod: data.paymentMethod,
                    paymentDate: new Date(data.paymentDate).toISOString(),
                    reference: data.reference || '',
                    notes: data.notes || '',
                  }
                  
                  const result = await paymentsService.updatePayment(
                    selectedPayment.id,
                    updateData
                  )
                  
                  if (result) {
                    toast.success(`Pago actualizado. Nuevo balance: $${Number(result.account.balance).toLocaleString()}`)
                    setShowEditDialog(false)
                    setSelectedPayment(null)
                    await loadData()
                    
                    // Si el dialog de historial está abierto, recargar el historial
                    if (showHistoryDialog && selectedAccount) {
                      const history = await paymentsService.getHistory(selectedAccount.id)
                      setPayments(history)
                    }
                  }
                } catch (error) {
                  console.error('Error al actualizar pago:', error)
                  toast.error('Error al actualizar el pago')
                } finally {
                  setSubmitting(false)
                }
              }}
              onCancel={() => {
                setShowEditDialog(false)
                setSelectedPayment(null)
              }}
              submitLabel="Guardar Cambios"
              cancelLabel="Cancelar"
              loading={submitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
