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
import { CheckCircle, Clock, DollarSign, Search, Calendar as CalendarIcon, Loader2, History, Receipt, CreditCard } from "lucide-react"
import { accountsPayableService } from "@/services/accounts-payable.service"
import { paymentSchedulingService, type PaymentSchedule } from "@/services/payment-scheduling.service"
import type { AccountPayable, RegisterPaymentDto, Payment } from "@/types/accounts-payable"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

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
  const [approvedSchedules, setApprovedSchedules] = useState<Array<PaymentSchedule & { paidAmount?: number; remainingAmount?: number; isFullyPaid?: boolean }>>([])
  const [paidSchedules, setPaidSchedules] = useState<Array<PaymentSchedule & { paidAmount?: number; remainingAmount?: number; isFullyPaid?: boolean }>>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'paid'>('pending')
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<AccountPayable | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<PaymentSchedule | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [paymentsToday, setPaymentsToday] = useState(0)
  const [summary, setSummary] = useState({ totalPending: 0, countPending: 0, totalPaid: 0, countPaid: 0 })

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'transfer' as any,
    paymentDate: new Date(),
    reference: '',
    notes: '',
  })

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      
      // 1. Cargar programaciones PENDIENTES de pago (con saldo por pagar)
      const pendingData = await paymentSchedulingService.getScheduledPaymentsByPaymentStatus('pending', {
        status: 'completed', // Solo las aprobadas
        page: 1,
        limit: 100,
      })
      
      // 2. Cargar programaciones YA PAGADAS
      const paidData = await paymentSchedulingService.getScheduledPaymentsByPaymentStatus('paid', {
        status: 'completed',
        page: 1,
        limit: 100,
      })
      
      // 3. Extraer todos los accountPayableId únicos
      const allSchedules = [...pendingData.data, ...paidData.data]
      const approvedAccountIds = [...new Set(
        allSchedules.map((s: PaymentSchedule) => s.accountPayableId)
      )]
      
      // 4. Cargar las cuentas relacionadas
      let accountsWithApprovedSchedules: AccountPayable[] = []
      if (approvedAccountIds.length > 0) {
        const accountsData = await accountsPayableService.getAll({
          page: 1,
          limit: 100,
          approvalStatus: 'approved',
        })
        accountsWithApprovedSchedules = accountsData.data.filter(
          (a: AccountPayable) => approvedAccountIds.includes(a.id)
        )
      }
      
      setApprovedSchedules(pendingData.data)
      setPaidSchedules(paidData.data)
      setAccounts(accountsWithApprovedSchedules)
      setSummary({
        totalPending: pendingData.summary?.totalPending || 0,
        countPending: pendingData.summary?.countPending || 0,
        totalPaid: paidData.summary?.totalPaid || 0,
        countPaid: paidData.summary?.countPaid || 0,
      })
      
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

  // Registrar pago
  const handleRegisterPayment = async () => {
    console.log('handleRegisterPayment iniciado')
    
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
      console.log('Iniciando proceso de registro...')
      
      // Registrar el pago
      console.log('Registrando pago...')
      const paymentData: RegisterPaymentDto = {
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentDate: format(formData.paymentDate, 'yyyy-MM-dd'),
        reference: formData.reference,
        notes: formData.notes || undefined,
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

  const currentSchedules = activeTab === 'pending' ? approvedSchedules : paidSchedules
  
  const filteredSchedules = currentSchedules.filter(schedule => {
    const account = accounts.find(a => a.id === schedule.accountPayableId)
    const supplierName = account?.supplier?.name || (account as any)?.supplierName || '';
    const invoiceNumber = account?.invoiceNumber || '';
    const reference = schedule.reference || '';
    return (
      supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reference.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aplicación de Pagos</h1>
          <p className="text-muted-foreground">Registra los pagos realizados a proveedores</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Pagar</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary.totalPending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.countPending} programaci{summary.countPending !== 1 ? 'ones' : 'ón'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ya Pagado</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary.totalPaid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.countPaid} programaci{summary.countPaid !== 1 ? 'ones' : 'ón'}
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
              {approvedSchedules.filter(s => new Date(s.scheduledDate) < new Date()).length}
            </div>
            <p className="text-xs text-muted-foreground">Con fecha vencida</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Hoy</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentsToday}</div>
            <p className="text-xs text-muted-foreground">Registrados hoy</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs y Tabla */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pagos Programados</CardTitle>
              <CardDescription>Programaciones de pago aprobadas</CardDescription>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mt-4 border-b">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'pending' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Por Pagar ({summary.countPending})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'paid' 
                  ? 'border-green-600 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Ya Pagadas ({summary.countPaid})
              </span>
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por proveedor, factura o referencia..."
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
                  <TableHead>Monto Programado</TableHead>
                  <TableHead>Pagado</TableHead>
                  <TableHead className="text-right">Faltante</TableHead>
                  <TableHead>Fecha Programada</TableHead>
                  <TableHead>Método</TableHead>
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
                ) : filteredSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No se encontraron programaciones' : activeTab === 'pending' ? 'No hay pagos programados pendientes' : 'No hay pagos programados completados'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchedules.map((schedule: any) => {
                    const account = accounts.find(a => a.id === schedule.accountPayableId);
                    const progressPercent = Number(schedule.amount) > 0 
                      ? (schedule.paidAmount / Number(schedule.amount)) * 100 
                      : 0;
                    const isPaidTab = activeTab === 'paid';
                    return (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">
                          {account?.supplier?.name || (account as any)?.supplierName || 'N/A'}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${Number(schedule.amount).toLocaleString()}
                        </TableCell>
                        <TableCell className={`${isPaidTab ? 'text-green-600 font-bold' : 'text-green-600'}`}>
                          ${schedule.paidAmount.toLocaleString()}
                          <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
                            <div 
                              className={`h-1 rounded-full ${isPaidTab ? 'bg-green-600' : 'bg-green-500'}`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-bold ${isPaidTab ? 'text-green-600' : 'text-red-600'}`}>
                          ${schedule.remainingAmount.toLocaleString()}
                          {isPaidTab && <span className="text-xs block font-normal">(Completado)</span>}
                        </TableCell>
                        <TableCell>
                          {format(new Date(schedule.scheduledDate), 'dd MMM yyyy', { locale: es })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {paymentMethodLabels[schedule.paymentMethod || 'transfer'] || schedule.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => account && handleViewHistory(account)}
                            >
                              <History className="h-4 w-4 mr-1" />
                              Historial
                            </Button>
                            {!isPaidTab && (
                              <Button
                                size="sm"
                                onClick={() => openRegisterDialog(schedule)}
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                Registrar Pago
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
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

          {selectedSchedule && (
            <div className="space-y-4 py-4">
              {/* Info de la programación y cuenta */}
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Proveedor:</span>
                  <span className="font-medium">{selectedAccount?.supplier?.name || (selectedAccount as any)?.supplierName || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Factura:</span>
                  <span className="font-medium">{selectedAccount?.invoiceNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monto Programado:</span>
                  <span className="font-medium">
                    ${Number(selectedSchedule.amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ya Pagado:</span>
                  <span className="text-green-600">
                    ${(selectedSchedule as any).paidAmount?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-300 pt-2 mt-2">
                  <span className="text-muted-foreground font-semibold">Faltante por Pagar:</span>
                  <span className="font-bold text-red-600 text-base">
                    ${(selectedSchedule as any).remainingAmount?.toLocaleString() || Number(selectedSchedule.amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fecha Programada:</span>
                  <span className="font-medium">
                    {format(new Date(selectedSchedule.scheduledDate), 'dd MMM yyyy', { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Método:</span>
                  <span className="font-medium">
                    {paymentMethodLabels[selectedSchedule.paymentMethod || 'transfer']}
                  </span>
                </div>
              </div>

              {/* Formulario */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Monto del Pago *</Label>
                  <Input
                    id="amount"
                    type="text"
                    value={formatNumber(String(formData.amount || ''))}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0"
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
