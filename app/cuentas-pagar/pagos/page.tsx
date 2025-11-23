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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, Clock, DollarSign, Search, Calendar, Loader2, History, Receipt, CreditCard } from "lucide-react"
import { accountsPayableService } from "@/services/accounts-payable.service"
import type { AccountPayable, RegisterPaymentDto, Payment } from "@/types/accounts-payable"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Checkbox } from "@/components/ui/checkbox"

const paymentMethodLabels: Record<string, string> = {
  transfer: 'Transferencia',
  check: 'Cheque',
  cash: 'Efectivo',
  card: 'Tarjeta',
  other: 'Otro',
}

export default function AplicacionPagosCuentasPagar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [accounts, setAccounts] = useState<AccountPayable[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<AccountPayable | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [paymentsToday, setPaymentsToday] = useState(0)
  const [generarGasto, setGenerarGasto] = useState(false)
  const [categoriaGasto, setCategoriaGasto] = useState('operativo')

  // Form state
  const [formData, setFormData] = useState({
    amount: 0,
    paymentMethod: 'transfer' as any,
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
  })

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Cargar cuentas (prioritario)
      const accountsData = await accountsPayableService.getAll({ 
        page: 1, 
        limit: 100,
        approvalStatus: 'approved', // Solo cuentas aprobadas
      })
      
      // Filtrar solo cuentas con saldo pendiente
      const pendingAccounts = accountsData.data.filter(a => Number(a.balance) > 0)
      setAccounts(pendingAccounts)
      
      // Cargar pagos de hoy (opcional, no bloquea la carga)
      try {
        const todayPaymentsData = await accountsPayableService.getPaymentsToday()
        setPaymentsToday(todayPaymentsData.count)
      } catch (error) {
        console.warn('No se pudieron cargar los pagos de hoy:', error)
        setPaymentsToday(0)
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar las cuentas por pagar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Registrar pago
  const handleRegisterPayment = async () => {
    console.log('handleRegisterPayment iniciado')
    
    if (!selectedAccount) {
      console.log('No hay cuenta seleccionada')
      return
    }

    console.log('Validando formData:', formData)

    if (!formData.amount || formData.amount <= 0) {
      toast.error('El monto debe ser mayor a cero')
      return
    }

    if (formData.amount > Number(selectedAccount.balance)) {
      toast.error('El monto no puede ser mayor al saldo pendiente')
      return
    }

    if (!formData.reference?.trim()) {
      toast.error('La referencia es obligatoria')
      return
    }

    try {
      setSubmitting(true)
      console.log('Iniciando proceso de registro...')
      
      // Registrar el pago (el backend creará el gasto si generarGasto es true)
      console.log('Registrando pago...')
      const paymentData: any = {
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        reference: formData.reference,
        notes: formData.notes || undefined,
      }

      // Si se debe generar gasto, agregar los datos adicionales
      if (generarGasto) {
        paymentData.generarGasto = true
        paymentData.categoriaGasto = categoriaGasto
        console.log('Se generará gasto con categoría:', categoriaGasto)
      }

      console.log('Payment data:', paymentData)
      await accountsPayableService.registerPayment(selectedAccount.id, paymentData)
      
      console.log('Pago registrado exitosamente')
      toast.success('Pago registrado exitosamente')
      setShowRegisterDialog(false)
      resetForm()
      loadData()
    } catch (error: any) {
      console.error('Error al registrar pago:', error)
      toast.error(error?.response?.data?.message || error.message || 'Error al registrar el pago')
    } finally {
      setSubmitting(false)
    }
  }

  // Ver historial de pagos
  const handleViewHistory = async (account: AccountPayable) => {
    setSelectedAccount(account)
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

  const resetForm = () => {
    setFormData({
      amount: 0,
      paymentMethod: 'transfer',
      paymentDate: new Date().toISOString().split('T')[0],
      reference: '',
      notes: '',
    })
    setSelectedAccount(null)
    setGenerarGasto(false)
    setCategoriaGasto('operativo')
  }

  const openRegisterDialog = (account: AccountPayable) => {
    setSelectedAccount(account)
    setFormData({
      amount: Number(account.balance),
      paymentMethod: 'transfer',
      paymentDate: new Date().toISOString().split('T')[0],
      reference: account.invoiceNumber,
      notes: account.description || '',
    })
    setShowRegisterDialog(true)
  }

  const filteredAccounts = accounts.filter(account => {
    const supplierName = account.supplier?.name || (account as any).supplierName || '';
    return (
      supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aplicación de Pagos</h1>
          <p className="text-muted-foreground">Registra los pagos realizados a proveedores</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${accounts.reduce((sum, a) => sum + Number(a.balance), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {accounts.length} cuenta{accounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accounts.filter(a => a.status === 'overdue').length}
            </div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Hoy</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentsToday}</div>
            <p className="text-xs text-muted-foreground">Registrados hoy</p>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda y filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Cuentas por Pagar Pendientes</CardTitle>
          <CardDescription>Selecciona una cuenta para registrar un pago</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por proveedor o número de factura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Factura</TableHead>
                  <TableHead>Monto Total</TableHead>
                  <TableHead>Saldo Pendiente</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No se encontraron cuentas' : 'No hay cuentas pendientes de pago'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.supplier?.name || (account as any).supplierName || 'N/A'}</TableCell>
                      <TableCell>{account.invoiceNumber}</TableCell>
                      <TableCell>${Number(account.amount).toLocaleString()}</TableCell>
                      <TableCell className="font-bold text-red-600">
                        ${Number(account.balance).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {format(new Date(account.dueDate), 'dd MMM yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>{getStatusBadge(account.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewHistory(account)}
                          >
                            <History className="h-4 w-4 mr-1" />
                            Historial
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openRegisterDialog(account)}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Registrar Pago
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Registrar Pago */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              Registra un pago realizado al proveedor
            </DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-4 py-4">
              {/* Info de la cuenta */}
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Proveedor:</span>
                  <span className="font-medium">{selectedAccount.supplier?.name || (selectedAccount as any).supplierName || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Factura:</span>
                  <span className="font-medium">{selectedAccount.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saldo Pendiente:</span>
                  <span className="font-bold text-red-600">
                    ${Number(selectedAccount.balance).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Formulario */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Monto del Pago *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Método de Pago *</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                      <SelectItem value="check">Cheque</SelectItem>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="card">Tarjeta</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="paymentDate">Fecha de Pago *</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="reference">Referencia / Número de Transacción *</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="Ej: TRANSF-001, CHEQUE-123"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notas (Opcional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Observaciones adicionales..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Checkbox para generar gasto */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="generar-gasto"
                    checked={generarGasto}
                    onCheckedChange={(checked) => setGenerarGasto(checked as boolean)}
                  />
                  <Label
                    htmlFor="generar-gasto"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    📄 Generar comprobante de gasto automáticamente
                  </Label>
                </div>

                {/* Campos adicionales para el gasto */}
                {generarGasto && (
                  <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                    <p className="text-sm text-blue-700">
                      ℹ️ Se creará un gasto con los datos del pago. Solo especifica la categoría:
                    </p>
                    
                    <div className="space-y-2">
                      <Label>Categoría del Gasto</Label>
                      <Select value={categoriaGasto} onValueChange={setCategoriaGasto}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operativo">Operativo</SelectItem>
                          <SelectItem value="administrativo">Administrativo</SelectItem>
                          <SelectItem value="ventas">Ventas</SelectItem>
                          <SelectItem value="financiero">Financiero</SelectItem>
                          <SelectItem value="otros">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="text-xs text-blue-600 space-y-1">
                      <p>• Fecha: Se usará la fecha del pago ({formData.paymentDate})</p>
                      <p>• Concepto: Se usará la referencia del pago</p>
                      <p>• Monto: Se usará el monto del pago (${formData.amount})</p>
                      <p>• Método de pago: Se usará el método del pago ({paymentMethodLabels[formData.paymentMethod]})</p>
                      <p>• Proveedor: {selectedAccount?.supplier?.name || (selectedAccount as any).supplierName || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegisterDialog(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleRegisterPayment} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Historial de Pagos */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historial de Pagos</DialogTitle>
            <DialogDescription>
              Pagos registrados para esta cuenta por pagar
            </DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-4">
              {/* Info de la cuenta */}
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Proveedor:</span>
                  <span className="font-medium">{selectedAccount.supplier?.name || (selectedAccount as any).supplierName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Factura:</span>
                  <span className="font-medium">{selectedAccount.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monto Total:</span>
                  <span className="font-medium">${Number(selectedAccount.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pagado:</span>
                  <span className="font-medium text-green-600">
                    ${Number(selectedAccount.paidAmount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Saldo:</span>
                  <span className="font-bold text-red-600">
                    ${Number(selectedAccount.balance).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Lista de pagos */}
              {loadingHistory ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay pagos registrados
                </div>
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
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(new Date(payment.paymentDate), 'dd MMM yyyy', { locale: es })}
                        </TableCell>
                        <TableCell className="font-bold text-green-600">
                          ${Number(payment.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>{paymentMethodLabels[payment.paymentMethod]}</TableCell>
                        <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                        <TableCell>
                          {payment.createdBy.firstName} {payment.createdBy.lastName}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
