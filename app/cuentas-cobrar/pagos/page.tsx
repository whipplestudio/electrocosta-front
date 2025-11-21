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
import { CheckCircle, Clock, DollarSign, FileText, Plus, Search, Calendar, Loader2, X, History, Receipt, CreditCard } from "lucide-react"
import { accountsReceivableService, paymentsService } from "@/services/accounts-receivable.service"
import type { AccountReceivable, Payment, RegisterPaymentDto } from "@/types/accounts-receivable"
import { RouteProtection } from "@/components/route-protection"

const paymentMethodLabels: Record<string, string> = {
  transfer: 'Transferencia',
  check: 'Cheque',
  cash: 'Efectivo',
  card: 'Tarjeta',
  other: 'Otro',
}

export default function AplicacionPagos() {
  return (
    <RouteProtection requiredPermissions={["cuentas_cobrar.pagos.ver"]}>
      <AplicacionPagosContent />
    </RouteProtection>
  )
}

function AplicacionPagosContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [accounts, setAccounts] = useState<AccountReceivable[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<AccountReceivable | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

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
      const accountsData = await accountsReceivableService.list({ 
        page: 1, 
        limit: 100,
      })
      setAccounts(accountsData.data.filter(a => Number(a.balance) > 0))
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar las cuentas por cobrar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Registrar pago
  const handleRegisterPayment = async () => {
    if (!selectedAccount) return

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
      // Convertir fecha a formato ISO 8601 completo
      const paymentData = {
        ...formData,
        paymentDate: new Date(formData.paymentDate).toISOString(),
      }
      await paymentsService.register(selectedAccount.id, paymentData)
      
      toast.success('Pago registrado exitosamente')
      setShowRegisterDialog(false)
      setSelectedAccount(null)
      setFormData({
        amount: 0,
        paymentMethod: 'transfer' as any,
        paymentDate: new Date().toISOString().split('T')[0],
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
      amount: Number(account.balance),
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

  // Filtrar cuentas
  const filteredAccounts = accounts.filter(
    (account) =>
      account.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calcular KPIs
  const totalPending = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0)
  const overdueAccounts = accounts.filter(acc => new Date(acc.dueDate) < new Date())
  const totalOverdue = overdueAccounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Aplicación de Pagos</h2>
          <p className="text-muted-foreground">Registro y aplicación de pagos recibidos</p>
        </div>
      </div>

      {/* KPIs de Pagos */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{accounts.length} facturas pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalOverdue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{overdueAccounts.length} cuentas vencidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas Activas</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foreground">Con saldo pendiente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${accounts.length > 0 ? (totalPending / accounts.length).toFixed(0).toLocaleString() : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Por factura</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facturas Pendientes de Pago</CardTitle>
              <CardDescription>Facturas que requieren aplicación de pagos</CardDescription>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por cliente o factura..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Factura</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Monto Total</TableHead>
                      <TableHead>Saldo Pendiente</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No se encontraron cuentas pendientes de pago
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAccounts.map((account) => {
                        const isOverdue = new Date(account.dueDate) < new Date()
                        const isPartial = Number(account.balance) < Number(account.amount)
                        
                        return (
                          <TableRow key={account.id}>
                            <TableCell className="font-medium">{account.invoiceNumber}</TableCell>
                            <TableCell>{account.client?.name || 'N/A'}</TableCell>
                            <TableCell>${Number(account.amount).toLocaleString()}</TableCell>
                            <TableCell className="font-bold">
                              ${Number(account.balance).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(account.dueDate).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  isOverdue
                                    ? "destructive"
                                    : isPartial
                                      ? "secondary"
                                      : "default"
                                }
                              >
                                {isOverdue ? 'Vencida' : isPartial ? 'Parcial' : 'Vigente'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => loadPaymentHistory(account)}
                                  title="Ver historial de pagos"
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => openRegisterDialog(account)}
                                  className="gap-1"
                                >
                                  <DollarSign className="h-3 w-3" />
                                  Aplicar Pago
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                  type="number"
                  step="0.01"
                  placeholder="0.00" 
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
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
                <Label htmlFor="fecha">Fecha de Pago *</Label>
                <Input 
                  id="fecha" 
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                />
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
                  amount: 0,
                  paymentMethod: 'transfer' as any,
                  paymentDate: new Date().toISOString().split('T')[0],
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
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                {new Date(payment.paymentDate).toLocaleDateString('es-MX', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
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
    </div>
  )
}
