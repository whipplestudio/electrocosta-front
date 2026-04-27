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
import { KpiCard, TotalKpiCard, DataTable, Column, Action, SelectFilter } from "@/components/ui"
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
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'paid'>('all')
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
    
    // Filtro por estado (tab)
    if (activeTab === 'pending') {
      filters.status = 'pending'
    } else if (activeTab === 'paid') {
      filters.status = 'paid'
    }
    // 'all' no filtra por estado
    
    return filters
  }, [searchQuery, activeTab])

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
  }, [searchQuery, activeTab])

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
          title={
            activeTab === 'all' ? 'Todas las Facturas' :
            activeTab === 'pending' ? 'Facturas Pendientes de Pago' :
            'Facturas Pagadas'
          }
          columns={[
            { key: 'invoiceNumber', header: 'Factura', align: 'left' },
            { key: 'client', header: 'Cliente', render: (row) => row.client?.name || 'N/A' },
            { key: 'amount', header: 'Monto Total', align: 'right', render: (row) => `$${Number(row.amount).toLocaleString()}` },
            { key: 'balance', header: 'Saldo Pendiente', align: 'right', render: (row) => `$${Number(row.balance).toLocaleString()}` },
            { key: 'dueDate', header: 'Vencimiento', render: (row) => 
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
          emptyMessage={
            activeTab === 'paid' 
              ? 'No se encontraron facturas pagadas'
              : activeTab === 'pending'
                ? 'No se encontraron cuentas pendientes de pago'
                : 'No se encontraron cuentas'
          }
          
          // Filtros integrados
          searchFilter={{ placeholder: 'Buscar por cliente o factura...', debounceMs: 400 }}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          
          selectFilters={[
            {
              key: 'status',
              label: 'Estado',
              options: [
                { value: '', label: 'Todas' },
                { value: 'pending', label: 'Pendiente' },
                { value: 'paid', label: 'Pagado' },
              ],
            },
          ]}
          filterValues={{ status: activeTab === 'all' ? '' : activeTab }}
          onFilterChange={(key, value) => {
            if (key === 'status') {
              setActiveTab(value === '' ? 'all' : value as any)
            }
          }}
          onClearFilters={() => {
            setSearchQuery('')
            setActiveTab('all')
          }}
          
          // Paginación backend
          pagination={pagination}
          onPageChange={(page) => loadData(page, pagination.limit)}
          onRowsPerPageChange={(limit) => loadData(1, limit)}
          rowsPerPageOptions={[10, 25, 50]}
        />

      {/* Dialog Registrar Pago */}
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
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monto">Monto Recibido *</Label>
                <Input 
                  id="monto" 
                  type="text"
                  placeholder="0" 
                  value={formatNumber(String(formData.amount || ''))}
                  onChange={(e) => handleAmountChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metodo">Método de Pago *</Label>
                <Select 
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                    <SelectItem value="check">Cheque</SelectItem>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="card">Tarjeta de Crédito</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="referencia">Referencia/Folio *</Label>
                <Input 
                  id="referencia" 
                  placeholder="Número de referencia o folio"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Pago *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`w-full justify-start text-left font-normal ${!formData.paymentDate ? 'text-muted-foreground' : ''}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.paymentDate ? format(formData.paymentDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single"
                      selected={formData.paymentDate}
                      onSelect={(date) => setFormData({...formData, paymentDate: date || new Date()})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea 
                id="observaciones" 
                placeholder="Comentarios adicionales..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRegisterDialog(false)
                setSelectedAccount(null)
                setFormData({
                  amount: '',
                  paymentMethod: 'transfer' as any,
                  paymentDate: new Date(),
                  reference: '',
                  notes: '',
                })
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleRegisterPayment} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Registrar Pago'
              )}
            </Button>
          </DialogFooter>
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
            {/* Resumen de la cuenta - Más compacto */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <Label className="text-xs text-muted-foreground">Monto Original</Label>
                <p className="font-bold text-xl">
                  ${Number(selectedAccount?.amount || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <Label className="text-xs text-muted-foreground">Total Pagado</Label>
                <p className="font-bold text-xl text-green-600">
                  ${payments.reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <Label className="text-xs text-muted-foreground">Saldo Pendiente</Label>
                <p className="font-bold text-xl text-orange-600">
                  ${Number(selectedAccount?.balance || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <Label className="text-xs text-muted-foreground">Total de Abonos</Label>
                <p className="font-bold text-xl text-blue-600">{payments.length}</p>
              </div>
            </div>

            {/* Lista de pagos - Tabla compacta */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Registro de Pagos y Abonos</h3>
                {loadingHistory && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
              </div>

              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : payments.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Receipt className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      No hay pagos registrados para esta cuenta
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Los pagos aparecerán aquí una vez que sean aplicados
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
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment, index) => {
                        const paymentMethodIcon = payment.paymentMethod === 'transfer' ? CreditCard :
                                                 payment.paymentMethod === 'cash' ? DollarSign :
                                                 payment.paymentMethod === 'check' ? FileText :
                                                 payment.paymentMethod === 'card' ? CreditCard : Receipt
                        
                        const PaymentIcon = paymentMethodIcon
                        const isFullPayment = Number(payment.amount) === Number(selectedAccount?.amount)

                        return (
                          <TableRow key={payment.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">
                              {payments.length - index}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                                {formatDateWithoutTimezone(payment.paymentDate)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="bg-green-100 p-1.5 rounded">
                                  <PaymentIcon className="h-3.5 w-3.5 text-green-600" />
                                </div>
                                <span className="text-sm">
                                  {paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-mono">
                                {payment.reference || '-'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-col items-end gap-1">
                                <span className="font-bold text-green-600">
                                  ${Number(payment.amount).toLocaleString()}
                                </span>
                                {isFullPayment && (
                                  <Badge variant="default" className="bg-green-600 text-xs h-5">
                                    Completo
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <p className="text-sm text-muted-foreground truncate" title={payment.notes || ''}>
                                {payment.notes || '-'}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">
                                {payment.createdBy ? 
                                  `${payment.createdBy.firstName} ${payment.createdBy.lastName}` : 
                                  'Sistema'}
                              </p>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditDialog(payment)}
                                title="Editar pago"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Acción rápida - Solo si hay saldo pendiente */}
            {payments.length > 0 && Number(selectedAccount?.balance || 0) > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Saldo pendiente: ${Number(selectedAccount?.balance || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">¿Deseas aplicar un nuevo pago a esta cuenta?</p>
                </div>
                <Button 
                  size="sm"
                  onClick={() => {
                    setShowHistoryDialog(false)
                    openRegisterDialog(selectedAccount!)
                  }}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Aplicar Pago
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowHistoryDialog(false)
              setPayments([])
              setSelectedAccount(null)
            }}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Pago */}
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
            <>
              {/* Preview de cambio */}
              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monto Actual:</span>
                  <span className="font-medium">${Number(selectedPayment.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nuevo Monto:</span>
                  <span className="font-medium text-blue-600">
                    ${editFormData.amount ? Number(unformatNumber(editFormData.amount)).toLocaleString() : '-'}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-muted-foreground">Nuevo Balance:</span>
                  <span className={`font-bold ${
                    Number(selectedAccount.amount) - (Number(selectedAccount.paidAmount) - Number(selectedPayment.amount) + Number(unformatNumber(editFormData.amount || '0'))) < 0
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}>
                    ${(() => {
                      const newAmount = Number(unformatNumber(editFormData.amount || '0'))
                      const oldAmount = Number(selectedPayment.amount)
                      const currentPaid = Number(selectedAccount.paidAmount)
                      const accountTotal = Number(selectedAccount.amount)
                      const newBalance = accountTotal - (currentPaid - oldAmount + newAmount)
                      return newBalance >= 0 ? newBalance.toLocaleString() : 'Inválido'
                    })()}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-monto">Nuevo Monto *</Label>
                    <Input 
                      id="edit-monto" 
                      type="text"
                      placeholder="0" 
                      value={formatNumber(String(editFormData.amount || ''))}
                      onChange={(e) => handleEditAmountChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-metodo">Método de Pago *</Label>
                    <Select 
                      value={editFormData.paymentMethod}
                      onValueChange={(value) => setEditFormData({ ...editFormData, paymentMethod: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                        <SelectItem value="check">Cheque</SelectItem>
                        <SelectItem value="cash">Efectivo</SelectItem>
                        <SelectItem value="card">Tarjeta de Crédito</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-referencia">Referencia/Folio</Label>
                    <Input 
                      id="edit-referencia" 
                      placeholder="Número de referencia"
                      value={editFormData.reference}
                      onChange={(e) => setEditFormData({ ...editFormData, reference: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de Pago *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          className={`w-full justify-start text-left font-normal ${!editFormData.paymentDate ? 'text-muted-foreground' : ''}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editFormData.paymentDate ? format(editFormData.paymentDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar 
                          mode="single"
                          selected={editFormData.paymentDate}
                          onSelect={(date) => setEditFormData({...editFormData, paymentDate: date || new Date()})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-observaciones">Observaciones</Label>
                  <Textarea 
                    id="edit-observaciones" 
                    placeholder="Comentarios adicionales..."
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditDialog(false)
                    setSelectedPayment(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpdatePayment} 
                  disabled={submitting || !editFormData.amount || Number(unformatNumber(editFormData.amount)) <= 0}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
