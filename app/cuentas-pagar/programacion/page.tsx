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
import { Calendar, Plus, Search, CheckCircle, Loader2, X } from "lucide-react"
import { paymentSchedulingService, SchedulePaymentDto, PaymentSchedule } from "@/services/payment-scheduling.service"
import { accountsPayableService } from "@/services/accounts-payable.service"
import type { AccountPayable } from "@/types/accounts-payable"

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
  const [summary, setSummary] = useState({
    totalScheduled: 0,
    totalCompleted: 0,
    totalCancelled: 0,
    countScheduled: 0,
    countCompleted: 0,
    countCancelled: 0,
  })

  // Form state
  const [formData, setFormData] = useState<SchedulePaymentDto & { accountPayableId: string }>({
    accountPayableId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledAmount: 0,
    paymentMethod: 'transfer',
    bankAccount: '',
    checkNumber: '',
    reference: '',
    notes: '',
    requiresApproval: true,
  })

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

  // Programar pago
  const handleSchedulePayment = async () => {
    // Validaciones ANTES del try/catch
    if (!formData.accountPayableId) {
      console.log('No se seleccionó una cuenta por pagar')
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "Debes seleccionar una cuenta por pagar"
      })
      return
    }

    if (!formData.scheduledAmount || formData.scheduledAmount <= 0) {
      console.log('El monto debe ser mayor a cero')
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "El monto debe ser mayor a cero"
      })
      return
    }

    if (!formData.scheduledDate) {
      console.log('No se seleccionó una fecha para el pago')
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "Debes seleccionar una fecha para el pago"
      })
      return
    }

    // Validaciones según método de pago
    if (formData.paymentMethod === 'transfer' && !formData.bankAccount?.trim()) {
      console.log('La cuenta bancaria es requerida para transferencias')
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "La cuenta bancaria es requerida para transferencias"
      })
      return
    }

    if (formData.paymentMethod === 'check' && !formData.checkNumber?.trim()) {
      console.log('El número de cheque es requerido')
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "El número de cheque es requerido"
      })
      return
    }

    // Si pasa todas las validaciones, proceder con la petición
    try {
      setSubmitting(true)
      console.log('📤 Enviando petición al backend...')
      
      const { accountPayableId, ...scheduleData } = formData
      console.log('📦 Datos a enviar:', { accountPayableId, scheduleData })
      
      const result = await paymentSchedulingService.schedulePayment(accountPayableId, scheduleData)
      console.log('✅ Respuesta del backend:', result)

      toast({
        title: "✅ Éxito",
        description: "Pago programado exitosamente"
      })
      setShowScheduleDialog(false)
      resetForm()
      await loadData()
    } catch (error: any) {
      console.error('❌ Error al programar pago:', error)
      console.error('❌ Error response:', error.response)
      console.error('❌ Error data:', error.response?.data)
      
      const errorMessage = error.response?.data?.message || error.message || 'Error al programar el pago'
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
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledAmount: 0,
      paymentMethod: 'transfer',
      bankAccount: '',
      checkNumber: '',
      reference: '',
      notes: '',
      requiresApproval: true,
    })
  }

  // Seleccionar cuenta y prellenar datos
  const handleSelectAccount = (accountId: string) => {
    const account = availableAccounts.find(a => a.id === accountId)
    if (account) {
      setFormData({
        ...formData,
        accountPayableId: accountId,
        scheduledAmount: Number(account.amount),
        reference: account.invoiceNumber,
      })
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
    <div className="space-y-6">
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
            <div className="text-2xl font-bold">${totalProgramado.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredSchedules.length} pagos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${summary.totalScheduled.toLocaleString()}
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
              ${summary.totalCancelled.toLocaleString()}
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
              ${summary.totalCompleted.toLocaleString()}
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
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(schedule.scheduledDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium capitalize">{schedule.paymentMethod}</div>
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
            <DialogTitle>Programar Nuevo Pago</DialogTitle>
            <DialogDescription>Programa un pago para una cuenta por pagar aprobada</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cuenta por Pagar *</Label>
              <Select 
                value={formData.accountPayableId}
                onValueChange={handleSelectAccount}
              >
                <SelectTrigger>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Monto *</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={formData.scheduledAmount || ''}
                  onChange={(e) => setFormData({ ...formData, scheduledAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Fecha de Pago *</Label>
                <Input 
                  type="date" 
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
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
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  placeholder="1234567890"
                />
              </div>
            )}

            {formData.paymentMethod === 'check' && (
              <div>
                <Label>Número de Cheque *</Label>
                <Input 
                  value={formData.checkNumber}
                  onChange={(e) => setFormData({ ...formData, checkNumber: e.target.value })}
                  placeholder="CHK-001"
                />
              </div>
            )}

            <div>
              <Label>Referencia</Label>
              <Input 
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="REF-PAY-001"
              />
            </div>

            <div>
              <Label>Notas</Label>
              <Textarea 
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales..."
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
                  Programando...
                </>
              ) : (
                'Programar Pago'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
