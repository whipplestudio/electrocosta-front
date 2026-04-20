"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
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
import { Calendar as CalendarIcon, Plus, Search, CheckCircle, Loader2, X, Edit } from "lucide-react"
import { paymentSchedulingService, SchedulePaymentDto, PaymentSchedule } from "@/services/payment-scheduling.service"
import { accountsPayableService } from "@/services/accounts-payable.service"
import type { AccountPayable } from "@/types/accounts-payable"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([])
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

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [schedulesData, accountsData] = await Promise.all([
        paymentSchedulingService.getScheduledPayments({ page: 1, limit: 100 }),
        accountsPayableService.getAll({ page: 1, limit: 100, status: 'pending' }),
      ])

      setSchedules(schedulesData.data)
      if (schedulesData.summary) {
        setSummary({
          totalScheduled: schedulesData.summary.totalScheduled || 0,
          totalCompleted: schedulesData.summary.totalCompleted || 0,
          totalCancelled: schedulesData.summary.totalCancelled || 0,
          countScheduled: schedulesData.summary.countScheduled || 0,
          countCompleted: schedulesData.summary.countCompleted || 0,
          countCancelled: schedulesData.summary.countCancelled || 0,
        })
      }

      // Filtrar cuentas aprobadas
      const pendingAccounts = accountsData.data.filter(
        acc => acc.approvalStatus === 'approved'
      )
      setAvailableAccounts(pendingAccounts)
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
        const totalScheduled = schedules
          .filter(s => s.status === 'scheduled' || s.status === 'approved')
          .reduce((sum, s) => sum + Number(s.amount), 0)
        
        const accountTotal = Number(account.amount)
        const remainingAmount = accountTotal - totalScheduled
        
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

  // Filtrar pagos
  const filteredSchedules = schedules.filter((schedule) => {
    const supplierName = schedule.accountPayable?.supplier?.name || (schedule.accountPayable as any)?.supplierName || '';
    const matchesSearch =
      supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.accountPayable?.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || schedule.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  // Calcular totales filtrados
  const totalProgramado = filteredSchedules.reduce((sum, s) => sum + Number(s.amount), 0)

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

  if (loading) {
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
        <Button onClick={() => setShowScheduleDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Programar Pago
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Programado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalProgramado)}</div>
            <p className="text-xs text-muted-foreground">{filteredSchedules.length} pagos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.totalScheduled)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.countScheduled} pagos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalCancelled)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.countCancelled} pagos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ejecutados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalCompleted)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.countCompleted} pagos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Pagos Programados</CardTitle>
          <CardDescription>Lista de pagos programados y su estado actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por proveedor, factura o referencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="scheduled">Programado</SelectItem>
                <SelectItem value="completed">Ejecutado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Factura</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha Programada</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron pagos programados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{schedule.accountPayable?.supplier?.name || (schedule.accountPayable as any)?.supplierName || 'N/A'}</div>
                          {schedule.reference && (
                            <div className="text-sm text-muted-foreground">Ref: {schedule.reference}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {schedule.accountPayable?.invoiceNumber || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">${Number(schedule.amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          {formatDateWithoutTimezone(schedule.scheduledDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">{getPaymentMethodLabel(schedule.paymentMethod)}</div>
                          {schedule.bankAccount && (
                            <div className="text-xs text-muted-foreground">{schedule.bankAccount}</div>
                          )}
                          {schedule.checkNumber && (
                            <div className="text-xs text-muted-foreground">CHK: {schedule.checkNumber}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {schedule.status === "scheduled" && (
                            <>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleEditSchedule(schedule)}
                                disabled={cancellingId === schedule.id || loadingSchedule}
                              >
                                {loadingSchedule ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Cargando...
                                  </>
                                ) : (
                                  <>
                                    <Edit className="h-4 w-4 mr-1" />
                                    Editar
                                  </>
                                )}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleCancelSchedule(schedule.id)}
                                disabled={cancellingId === schedule.id}
                              >
                                {cancellingId === schedule.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Cancelando...
                                  </>
                                ) : (
                                  <>
                                    <X className="h-4 w-4 mr-1" />
                                    Cancelar
                                  </>
                                )}
                              </Button>
                            </>
                          )}
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

      {/* Dialog Programar Pago */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Pago Programado' : 'Programar Nuevo Pago'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Actualiza los detalles del pago programado' : 'Programa un pago para una cuenta por pagar aprobada'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cuenta por Pagar *</Label>
              <Select 
                value={formData.accountPayableId}
                onValueChange={handleSelectAccount}
              >
                <SelectTrigger className={errors.accountPayableId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {availableAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.invoiceNumber} - {account.supplier?.name || (account as any).supplierName || 'N/A'} - ${Number(account.amount).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.accountPayableId && (
                <p className="text-sm text-red-500 mt-1">{errors.accountPayableId}</p>
              )}
              
              {/* Info de montos de la cuenta seleccionada */}
              {selectedAccountInfo && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-semibold text-blue-900">
                        ${selectedAccountInfo.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center border-l border-blue-200">
                      <p className="text-muted-foreground">Programado</p>
                      <p className="font-semibold text-amber-600">
                        ${selectedAccountInfo.scheduledAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center border-l border-blue-200">
                      <p className="text-muted-foreground">Restante</p>
                      <p className="font-semibold text-green-600">
                        ${selectedAccountInfo.remainingAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Monto *</Label>
                <Input 
                  type="text"
                  value={formatNumber(String(formData.scheduledAmount || ''))}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={errors.scheduledAmount ? "border-red-500" : ""}
                />
                {errors.scheduledAmount && (
                  <p className="text-sm text-red-500 mt-1">{errors.scheduledAmount}</p>
                )}
              </div>
              <div>
                <Label>Fecha de Pago *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`w-full justify-start text-left font-normal ${!formData.scheduledDate ? 'text-muted-foreground' : ''} ${errors.scheduledDate ? 'border-red-500' : ''}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduledDate ? format(formData.scheduledDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single"
                      selected={formData.scheduledDate}
                      onSelect={(date) => {
                        setFormData({...formData, scheduledDate: date || new Date()})
                        setErrors(prev => ({ ...prev, scheduledDate: undefined }))
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.scheduledDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.scheduledDate}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Método de Pago *</Label>
              <Select 
                value={formData.paymentMethod}
                onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transferencia bancaria</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.paymentMethod === 'transfer' && (
              <div>
                <Label>Cuenta Bancaria *</Label>
                <Input 
                  value={formData.bankAccount}
                  onChange={(e) => {
                    setFormData({ ...formData, bankAccount: e.target.value })
                    setErrors(prev => ({ ...prev, bankAccount: undefined }))
                  }}
                  placeholder="Ej: 1234567890 o CLABE"
                  className={errors.bankAccount ? "border-red-500" : ""}
                />
                {errors.bankAccount && (
                  <p className="text-sm text-red-500 mt-1">{errors.bankAccount}</p>
                )}
              </div>
            )}

            {formData.paymentMethod === 'check' && (
              <div>
                <Label>Número de Cheque *</Label>
                <Input 
                  value={formData.checkNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, checkNumber: e.target.value })
                    setErrors(prev => ({ ...prev, checkNumber: undefined }))
                  }}
                  placeholder="Ej: CHK-001 o 123456"
                  className={errors.checkNumber ? "border-red-500" : ""}
                />
                {errors.checkNumber && (
                  <p className="text-sm text-red-500 mt-1">{errors.checkNumber}</p>
                )}
              </div>
            )}

            <div>
              <Label>Referencia</Label>
              <Input 
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Ej: REF-PAY-001 (opcional)"
              />
            </div>

            <div>
              <Label>Notas</Label>
              <Textarea 
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ingrese notas o comentarios adicionales (opcional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button"
              variant="outline" 
              disabled={submitting}
              onClick={() => {
                setShowScheduleDialog(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              onClick={handleSchedulePayment} 
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Actualizando...' : 'Programando...'}
                </>
              ) : (
                isEditing ? 'Actualizar Pago' : 'Programar Pago'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
