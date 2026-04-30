"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { ActionButton } from "@/components/ui/action-button"
import { KpiCard } from "@/components/ui/kpi-card"
import { DataTable, Column, Action } from "@/components/ui/data-table"
import { FloatingInput } from "@/components/ui/floating-input"
import { FloatingSelect } from "@/components/ui/floating-select"
import { FloatingDatePicker } from "@/components/ui/floating-date-picker"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, Clock, DollarSign, History, CreditCard, Building2, FileText, Wallet, Receipt, Pencil, AlertCircle, Calendar } from "lucide-react"
import { accountsPayableService } from "@/services/accounts-payable.service"
import type { AccountPayable, RegisterPaymentDto, UpdatePaymentDto, Payment, AccountPayableStatus, PaymentMethod } from "@/types/accounts-payable"

const paymentMethodLabels: Record<string, string> = {
  transfer: 'Transferencia',
  check: 'Cheque',
  cash: 'Efectivo',
  card: 'Tarjeta',
  other: 'Otro',
}

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()
  const localDate = new Date(year, month, day)
  return localDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatNumber = (value: string): string => {
  const numericValue = value.replace(/[^0-9.]/g, '')
  const parts = numericValue.split('.')
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('')
  }
  return numericValue
}

const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) || 0 : value
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export default function PagosPage() {
  const [accounts, setAccounts] = useState<AccountPayable[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [search, setSearch] = useState("")

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<AccountPayable | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  const [formData, setFormData] = useState<RegisterPaymentDto>({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'transfer',
    reference: '',
    notes: '',
  })

  const [editFormData, setEditFormData] = useState<Partial<UpdatePaymentDto>>({
    amount: 0,
    paymentDate: '',
    paymentMethod: 'transfer',
    reference: '',
    notes: '',
  })

  const [dashboardData, setDashboardData] = useState({
    totalPendiente: 0,
    totalPagado: 0,
    cuentasPendientes: 0,
  })

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = { page, limit, sortBy: 'createdAt', order: 'desc' }
      // Siempre filtrar por cuentas con deuda (pending, partial, overdue)
      params.status = ['pending', 'partial', 'overdue']
      if (search) {
        params.search = search
      }
      
      const response = await accountsPayableService.getAll(params)
      setAccounts(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages)

      // Calcular métricas
      const totalPendiente = response.data.reduce((sum: number, acc: AccountPayable) => 
        sum + Number(acc.balance || 0), 0)
      const totalPagado = response.data.reduce((sum: number, acc: AccountPayable) => 
        sum + Number(acc.paidAmount || 0), 0)
      const cuentasPendientes = response.data.filter((acc: AccountPayable) => 
        acc.status !== 'paid' && acc.status !== 'cancelled').length

      setDashboardData({ totalPendiente, totalPagado, cuentasPendientes })
    } catch (error) {
      console.error("Error al cargar cuentas:", error)
      toast.error("Error al cargar las cuentas por pagar")
    } finally {
      setLoading(false)
    }
  }, [page, limit, search])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const handleRegisterPayment = async () => {
    if (!selectedAccount) return
    if (!formData.amount || formData.amount <= 0) {
      toast.error("Ingresa un monto válido")
      return
    }
    if (!formData.paymentDate) {
      toast.error("Selecciona una fecha de pago")
      return
    }
    if (!formData.reference?.trim()) {
      toast.error("Ingresa una referencia")
      return
    }

    const maxPayment = Number(selectedAccount.balance || 0)
    if (formData.amount > maxPayment) {
      toast.error(`El monto no puede exceder el saldo pendiente: $${maxPayment.toLocaleString()}`)
      return
    }

    try {
      setSubmitting(true)
      await accountsPayableService.registerPayment(selectedAccount.id, formData)
      toast.success("Pago registrado exitosamente")
      setShowRegisterDialog(false)
      resetForm()
      fetchAccounts()
    } catch (error: any) {
      console.error("Error al registrar pago:", error)
      toast.error(error.message || "Error al registrar el pago")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdatePayment = async () => {
    if (!selectedPayment) return
    if (!editFormData.amount || editFormData.amount <= 0) {
      toast.error("Ingresa un monto válido")
      return
    }

    try {
      setSubmitting(true)
      await accountsPayableService.updatePayment(selectedAccount!.id, selectedPayment.id, editFormData)
      toast.success("Pago actualizado exitosamente")
      setShowEditDialog(false)
      if (selectedAccount) {
        loadPayments(selectedAccount.id)
        const updatedAccount = await accountsPayableService.getById(selectedAccount.id)
        setSelectedAccount(updatedAccount)
      }
      fetchAccounts()
    } catch (error: any) {
      console.error("Error al actualizar pago:", error)
      toast.error(error.message || "Error al actualizar el pago")
    } finally {
      setSubmitting(false)
    }
  }

  const loadPayments = async (accountId: string) => {
    try {
      setLoadingPayments(true)
      const data = await accountsPayableService.getPayments(accountId)
      setPayments(data)
    } catch (error) {
      console.error("Error al cargar pagos:", error)
      toast.error("Error al cargar los pagos")
    } finally {
      setLoadingPayments(false)
    }
  }

  const handleVerHistorial = useCallback(async (account: AccountPayable) => {
    setSelectedAccount(account)
    setShowHistoryDialog(true)
    await loadPayments(account.id)
  }, [])

  const handleRegistrarPago = useCallback((account: AccountPayable) => {
    setSelectedAccount(account)
    setFormData({
      amount: Number(account.balance || 0),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'transfer',
      reference: '',
      notes: '',
    })
    setShowRegisterDialog(true)
  }, [])

  const handleEditarPago = useCallback((payment: Payment) => {
    setSelectedPayment(payment)
    setEditFormData({
      amount: Number(payment.amount),
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      reference: payment.reference || '',
      notes: payment.notes || '',
    })
    setShowEditDialog(true)
  }, [])

  const resetForm = () => {
    setFormData({
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'transfer',
      reference: '',
      notes: '',
    })
    setSelectedAccount(null)
  }

  const handleAmountChange = (value: string) => {
    const cleanValue = formatNumber(value)
    const numValue = parseFloat(cleanValue) || 0
    setFormData(prev => ({ ...prev, amount: numValue }))
  }

  const getEstadoBadge = (status: AccountPayableStatus) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    }
    const labels: Record<string, string> = {
      pending: "Pendiente",
      paid: "Pagado",
      overdue: "Vencido",
      cancelled: "Cancelado",
    }
    return <Badge className={styles[status]}>{labels[status]}</Badge>
  }

  const columns = useMemo<Column<AccountPayable>[]>(() => [
    {
      key: 'supplier',
      header: 'Proveedor',
      render: (row) => (
        <span className="font-medium">{row.supplier?.name || row.supplierName || 'N/A'}</span>
      ),
    },
    {
      key: 'invoiceNumber',
      header: 'Factura',
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
      header: 'Saldo Pendiente',
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
          ? formatDate(row.dueDate)
          : <span className="text-muted-foreground">Sin vencimiento</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (row) => getEstadoBadge(row.status),
    },
  ], [])

  const actions = useMemo<Action<AccountPayable>[]>(() => [
    {
      label: 'Registrar Pago',
      icon: <DollarSign className="h-4 w-4" />,
      onClick: (row) => handleRegistrarPago(row),
    },
    {
      label: 'Ver Historial',
      icon: <History className="h-4 w-4" />,
      onClick: (row) => handleVerHistorial(row),
    },
  ], [handleRegistrarPago, handleVerHistorial])

  const paymentColumns = useMemo<Column<Payment>[]>(() => [
    {
      key: 'paymentDate',
      header: 'Fecha',
      render: (row: Payment) => formatDate(row.paymentDate),
    },
    {
      key: 'amount',
      header: 'Monto',
      align: 'right',
      render: (row: Payment) => `$${parseFloat(row.amount).toLocaleString()}`,
    },
    {
      key: 'paymentMethod',
      header: 'Método',
      render: (row: Payment) => paymentMethodLabels[row.paymentMethod] || row.paymentMethod,
    },
    {
      key: 'reference',
      header: 'Referencia',
      render: (row: Payment) => row.reference || 'N/A',
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (row: Payment) => (
        <ActionButton variant="ghost" size="sm" onClick={() => handleEditarPago(row)}>
          <Pencil className="h-4 w-4" />
        </ActionButton>
      ),
    },
  ], [handleEditarPago])


  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handleClearFilters = useCallback(() => {
    setSearch("")
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handleRowsPerPageChange = useCallback((newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagos</h1>
          <p className="text-muted-foreground">Gestiona los pagos a proveedores</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Total Pendiente"
          value={`$${dashboardData.totalPendiente.toLocaleString()}`}
          icon={<Wallet className="h-4 w-4" />}
          loading={loading}
        />
        <KpiCard
          title="Total Pagado"
          value={`$${dashboardData.totalPagado.toLocaleString()}`}
          icon={<CheckCircle className="h-4 w-4 text-green-600" />}
          loading={loading}
        />
        <KpiCard
          title="Cuentas Pendientes"
          value={dashboardData.cuentasPendientes}
          icon={<AlertCircle className="h-4 w-4 text-yellow-600" />}
          loading={loading}
        />
      </div>

      {/* DataTable */}
      <DataTable
        title="Cuentas por Pagar Pendientes"
        columns={columns}
        data={accounts}
        keyExtractor={(row) => row.id}
        actions={actions}
        loading={loading}
        emptyMessage="No hay cuentas pendientes de pago"
        searchFilter={{
          placeholder: 'Buscar proveedor o factura...',
          debounceMs: 400,
        }}
        searchValue={search}
        onSearchChange={handleSearchChange}
        onClearFilters={handleClearFilters}
        pagination={{
          page,
          limit,
          total,
          totalPages,
        }}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[10, 25, 50]}
      />

      {/* Dialog: Registrar Pago */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-cyan-600" />
              Registrar Pago
            </DialogTitle>
            <DialogDescription>
              {selectedAccount && `Registra un pago para la factura ${selectedAccount.invoiceNumber}`}
            </DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Proveedor:</span>
                  <span className="font-medium">{selectedAccount.supplier?.name || selectedAccount.supplierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Monto Total:</span>
                  <span className="font-medium">${Number(selectedAccount.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Pagado:</span>
                  <span className="font-medium text-green-600">${Number(selectedAccount.paidAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium text-gray-700">Saldo Pendiente:</span>
                  <span className="font-bold text-red-600">${Number(selectedAccount.balance || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInput
                  label="Monto del Pago *"
                  value={formatCurrency(formData.amount || 0)}
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
                value={formData.paymentDate ? new Date(formData.paymentDate) : undefined}
                onChange={(date) => {
                  const selectedDate = date instanceof Date ? date : new Date()
                  setFormData({ ...formData, paymentDate: selectedDate.toISOString().split('T')[0] })
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
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  className="rounded-xl border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                />
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

      {/* Dialog: Editar Pago */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-cyan-600" />
              Editar Pago
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                label="Monto *"
                value={formatCurrency(String(editFormData.amount || ''))}
                onChange={(e) => {
                  const cleanValue = formatNumber(e.target.value)
                  setEditFormData(prev => ({ ...prev, amount: parseFloat(cleanValue) || 0 }))
                }}
                placeholder="0"
                startAdornment={<DollarSign className="h-4 w-4 text-gray-400" />}
              />

              <FloatingSelect
                label="Método de Pago *"
                value={editFormData.paymentMethod ?? ''}
                onChange={(value) => setEditFormData({ ...editFormData, paymentMethod: value as PaymentMethod })}
                options={[
                  { value: 'transfer', label: 'Transferencia' },
                  { value: 'check', label: 'Cheque' },
                  { value: 'cash', label: 'Efectivo' },
                  { value: 'card', label: 'Tarjeta' },
                  { value: 'other', label: 'Otro' },
                ]}
              />
            </div>

            <FloatingDatePicker
              label="Fecha de Pago *"
              value={editFormData.paymentDate ? new Date(editFormData.paymentDate) : undefined}
              onChange={(date) => {
                const selectedDate = date instanceof Date ? date : new Date()
                setEditFormData({ ...editFormData, paymentDate: selectedDate.toISOString().split('T')[0] })
              }}
              mode="single"
            />

            <FloatingInput
              label="Referencia *"
              value={editFormData.reference || ''}
              onChange={(e) => setEditFormData({ ...editFormData, reference: e.target.value })}
              startAdornment={<Receipt className="h-4 w-4 text-gray-400" />}
            />

            <div>
              <Label htmlFor="edit-notes" className="text-sm font-medium text-gray-700 mb-1 block">Notas</Label>
              <Textarea
                id="edit-notes"
                value={editFormData.notes || ''}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                rows={3}
                className="rounded-xl border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
          </div>

          <DialogFooter>
            <ActionButton variant="cancel" onClick={() => setShowEditDialog(false)} disabled={submitting}>
              Cancelar
            </ActionButton>
            <ActionButton variant="primary" onClick={handleUpdatePayment} loading={submitting}>
              Guardar Cambios
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Historial de Pagos - Mobile First */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
          <DialogHeader className="pb-3 sm:pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <History className="h-5 w-5" />
              Historial de Pagos
            </DialogTitle>
            <DialogDescription>
              {selectedAccount && `Factura: ${selectedAccount.invoiceNumber} - Proveedor: ${selectedAccount.supplier?.name || selectedAccount.supplierName}`}
            </DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-4 flex-1 overflow-y-auto py-4">
              {/* Resumen de la cuenta con KpiCard reutilizables */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard
                  title="Monto Original"
                  value={`$${Number(selectedAccount.amount || 0).toLocaleString()}`}
                  icon={<Receipt className="h-4 w-4" />}
                />
                <KpiCard
                  title="Total Pagado"
                  value={`$${payments.reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString()}`}
                  icon={<DollarSign className="h-4 w-4" />}
                  variant="success"
                />
                <KpiCard
                  title="Saldo Pendiente"
                  value={`$${Number(selectedAccount.balance || 0).toLocaleString()}`}
                  icon={<Clock className="h-4 w-4" />}
                  variant="warning"
                />
                <KpiCard
                  title="Total de Pagos"
                  value={payments.length}
                  icon={<FileText className="h-4 w-4" />}
                  variant="info"
                />
              </div>

              {/* Lista de pagos - DataTable reutilizable */}
              <DataTable
                title="Registro de Pagos"
                data={payments}
                columns={[
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
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDate(row.paymentDate)}
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
                      const PaymentIcon = paymentMethodIcons[row.paymentMethod] || Receipt
                      return (
                        <div className="flex items-center gap-2">
                          <div className="bg-emerald-100 p-1.5 rounded">
                            <PaymentIcon className="h-3.5 w-3.5 text-emerald-600" />
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
                      const isFullPayment = Number(row.amount) === Number(selectedAccount?.amount)
                      return (
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-bold text-emerald-600">${Number(row.amount).toLocaleString()}</span>
                          {isFullPayment && (
                            <Badge variant="default" className="bg-emerald-600 text-xs h-5">Completo</Badge>
                          )}
                        </div>
                      )
                    },
                  },
                ]}
                keyExtractor={(row: Payment) => row.id}
                actions={[
                  {
                    icon: <Pencil className="h-4 w-4" />,
                    label: 'Editar pago',
                    onClick: (payment: Payment) => handleEditarPago(payment),
                  },
                ]}
                loading={loadingPayments}
                emptyMessage="No hay pagos registrados para esta cuenta"
              />
            </div>
          )}

          <DialogFooter>
            <ActionButton variant="cancel" onClick={() => setShowHistoryDialog(false)}>
              Cerrar
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
