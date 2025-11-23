"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, Clock, Search, Loader2, AlertCircle } from "lucide-react"
import { paymentApprovalService, type PendingApproval } from "@/services/payment-approval.service"

export default function AprobacionPage() {
  const [loading, setLoading] = useState(true)
  const [approvals, setApprovals] = useState<PendingApproval[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [approveNotes, setApproveNotes] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [rejectNotes, setRejectNotes] = useState("")
  const [summary, setSummary] = useState({
    totalPending: 0,
    countPending: 0,
    totalApproved: 0,
    countApproved: 0,
  })

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await paymentApprovalService.getPendingApprovals({ page: 1, limit: 100 })
      setApprovals(data.data || [])
      setSummary({
        totalPending: Number(data.summary?.totalPending) || 0,
        countPending: Number(data.summary?.countPending) || 0,
        totalApproved: Number(data.summary?.totalApproved) || 0,
        countApproved: Number(data.summary?.countApproved) || 0,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Error al cargar las solicitudes de aprobación"
      toast.error(errorMessage)
    } finally {
      console.log('Finalizando carga de datos')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Aprobar pago
  const handleApprove = (approval: PendingApproval) => {
    setSelectedApproval(approval)
    setApproveNotes("")
    setShowApproveDialog(true)
  }

  const confirmApprove = async () => {
    if (!selectedApproval) return

    try {
      setSubmitting(true)
      await paymentApprovalService.approvePayment(selectedApproval.id, {
        notes: approveNotes || undefined
      })
      toast.success("Pago aprobado exitosamente")
      setShowApproveDialog(false)
      setSelectedApproval(null)
      setApproveNotes("")
      await loadData()
    } catch (error: any) {
      console.error('Error capturado en confirmApprove:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      const errorMessage = error.response?.data?.message || error.message || "Error al aprobar el pago"
      console.log('Mostrando toast con mensaje:', errorMessage)
      
      // Mostrar el toast de error
      toast.error(errorMessage)
      
      // Cerrar el diálogo
      setShowApproveDialog(false)
      setSelectedApproval(null)
      setApproveNotes("")
    } finally {
      console.log('Finalizando proceso de aprobación')
      setSubmitting(false)
    }
  }

  // Rechazar pago
  const handleReject = (approval: PendingApproval) => {
    setSelectedApproval(approval)
    setRejectReason("")
    setRejectNotes("")
    setShowRejectDialog(true)
  }

  const confirmReject = async () => {
    if (!selectedApproval) return

    if (!rejectReason.trim()) {
      toast.error("Debes indicar el motivo del rechazo")
      return
    }

    try {
      setSubmitting(true)
      console.log('Intentando rechazar pago con ID:', selectedApproval.id)
      await paymentApprovalService.rejectPayment(selectedApproval.id, {
        reason: rejectReason,
        notes: rejectNotes || undefined
      })
      console.log('Pago rechazado exitosamente')
      toast.success("Pago rechazado exitosamente")
      setShowRejectDialog(false)
      setSelectedApproval(null)
      setRejectReason("")
      setRejectNotes("")
      await loadData()
    } catch (error: any) {
      console.error('Error capturado en confirmReject:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      const errorMessage = error.response?.data?.message || error.message || "Error al rechazar el pago"
      console.log('Mostrando toast con mensaje:', errorMessage)
      
      // Mostrar el toast de error
      toast.error(errorMessage)
      
      // Cerrar el diálogo
      setShowRejectDialog(false)
      setSelectedApproval(null)
      setRejectReason("")
      setRejectNotes("")
    } finally {
      console.log('Finalizando proceso de rechazo')
      setSubmitting(false)
    }
  }

  // Filtrar aprobaciones
  const filteredApprovals = approvals.filter(approval => {
    const supplierName = approval.accountPayable.supplier?.name || (approval.accountPayable as any).supplierName || '';
    const description = approval.accountPayable.description || '';
    const matchSearch = 
      supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.accountPayable.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchSearch
  })

  // Formato de fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Método de pago labels
  const paymentMethodLabels: Record<string, string> = {
    transfer: 'Transferencia',
    check: 'Cheque',
    cash: 'Efectivo',
    card: 'Tarjeta',
    other: 'Otro'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Aprobación de Pagos</h1>
        <p className="text-gray-600">Gestiona las solicitudes de pago que requieren aprobación</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${(summary.totalPending || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.countPending || 0} solicitudes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Aprobados Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(summary.totalApproved || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.countApproved || 0} pagos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              Requieren Atención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {filteredApprovals.length}
            </div>
            <p className="text-xs text-muted-foreground">
              solicitudes visibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${((summary.totalPending || 0) + (summary.totalApproved || 0)).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {(summary.countPending || 0) + (summary.countApproved || 0)} en total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Solicitudes Pendientes</CardTitle>
              <CardDescription>Lista de pagos que requieren tu aprobación</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar..."
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
                  <TableHead>Proveedor / Factura</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha Programada</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Solicitado Por</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApprovals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No hay solicitudes pendientes de aprobación
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApprovals.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {approval.accountPayable.supplier?.name || (approval.accountPayable as any).supplierName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {approval.accountPayable.invoiceNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {approval.accountPayable.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ${Number(approval.amount).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          de ${Number(approval.accountPayable.amount).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(approval.scheduledDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {approval.paymentMethod ? (paymentMethodLabels[approval.paymentMethod] || approval.paymentMethod) : 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {approval.createdBy.firstName} {approval.createdBy.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(approval.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => handleApprove(approval)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleReject(approval)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
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

      {/* Dialog Aprobar */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Pago</DialogTitle>
            <DialogDescription>
              Confirma la aprobación de este pago programado
            </DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Proveedor:</span>
                  <span className="text-sm font-medium">{selectedApproval.accountPayable.supplier?.name || (selectedApproval.accountPayable as any).supplierName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Factura:</span>
                  <span className="text-sm font-medium">{selectedApproval.accountPayable.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monto:</span>
                  <span className="text-sm font-medium text-green-600">
                    ${Number(selectedApproval.amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fecha Programada:</span>
                  <span className="text-sm font-medium">{formatDate(selectedApproval.scheduledDate)}</span>
                </div>
              </div>
              <div>
                <Label>Notas (opcional)</Label>
                <Textarea
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  placeholder="Agregar notas sobre la aprobación..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => {
                setShowApproveDialog(false)
                setSelectedApproval(null)
                setApproveNotes("")
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={confirmApprove}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aprobando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aprobar Pago
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rechazar */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Pago</DialogTitle>
            <DialogDescription>
              Indica el motivo del rechazo de este pago
            </DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Proveedor:</span>
                  <span className="text-sm font-medium">{selectedApproval.accountPayable.supplier?.name || (selectedApproval.accountPayable as any).supplierName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Factura:</span>
                  <span className="text-sm font-medium">{selectedApproval.accountPayable.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monto:</span>
                  <span className="text-sm font-medium text-red-600">
                    ${Number(selectedApproval.amount).toLocaleString()}
                  </span>
                </div>
              </div>
              <div>
                <Label>Motivo del Rechazo *</Label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Indica por qué se rechaza este pago..."
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label>Notas Adicionales (opcional)</Label>
                <Textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => {
                setShowRejectDialog(false)
                setSelectedApproval(null)
                setRejectReason("")
                setRejectNotes("")
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={confirmReject}
              disabled={submitting}
              variant="destructive"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rechazando...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Rechazar Pago
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
