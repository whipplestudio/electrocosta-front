"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DataTable, Column, Action } from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, Clock, Loader2, AlertCircle, DollarSign } from "lucide-react"
import { KpiCard } from "@/components/ui/kpi-card"
import { ActionButton, CancelButton } from "@/components/ui/action-button"
import { paymentApprovalService, type PendingApproval } from "@/services/payment-approval.service"

export default function AprobacionPage() {
  const [loading, setLoading] = useState(true)
  const [approvals, setApprovals] = useState<PendingApproval[]>([])
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
  })

  // Cargar datos con paginación y filtros server-side
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = {
        page,
        limit,
      }

      if (filters.search) {
        params.search = filters.search
      }

      const data = await paymentApprovalService.getPendingApprovals(params)
      setApprovals(data.data || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || Math.ceil(data.total / limit) || 1)
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
      setLoading(false)
    }
  }, [page, limit, filters.search])

  // Cargar datos cuando cambian filtros o paginación
  useEffect(() => {
    loadData()
    const timer = setTimeout(() => {
      isInitialMount.current = false
    }, 500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filters.search])

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

  // Callbacks para DataTable - memoizados para evitar bucles infinitos
  const handleSearchChange = useCallback((value: string) => {
    if (isInitialMount.current) return
    setFilters((prev) => ({ ...prev, search: value }))
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    if (isInitialMount.current) return
    setPage(newPage)
  }, [])

  const handleRowsPerPageChange = useCallback((newLimit: number) => {
    if (isInitialMount.current) return
    setLimit(newLimit)
    setPage(1)
  }, [])

  const handleClearFilters = useCallback(() => {
    if (isInitialMount.current) return
    setFilters({ search: '' })
    setPage(1)
    toast.success('Filtros limpiados')
  }, [])

  // Formato de fecha sin conversión de zona horaria
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth()
    const day = date.getUTCDate()
    
    // Crear fecha local con componentes UTC exactos
    const localDate = new Date(year, month, day)
    return localDate.toLocaleDateString('es-MX', {
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

  // Configuración de columnas para el DataTable - memoizada para estabilidad
  const columns = useMemo<Column<PendingApproval>[]>(() => [
    {
      key: 'supplier',
      header: 'Proveedor / Factura',
      render: (row) => (
        <div>
          <div className="font-medium">
            {row.accountPayable.supplier?.name || (row.accountPayable as any).supplierName || 'N/A'}
          </div>
          <div className="text-sm text-muted-foreground">
            Factura: {row.accountPayable.invoiceNumber}
          </div>
          {row.accountPayable.description && (
            <div className="text-xs text-muted-foreground max-w-xs truncate mt-1">
              {row.accountPayable.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Monto',
      render: (row) => (
        <div>
          <div className="font-medium">
            ${Number(row.amount).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            de ${Number(row.accountPayable.amount).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: 'scheduledDate',
      header: 'Fecha Programada',
      render: (row) => formatDate(row.scheduledDate),
    },
    {
      key: 'paymentMethod',
      header: 'Método de Pago',
      render: (row) => (
        <div>
          <Badge variant="outline" className="mb-1">
            {row.paymentMethod ? (paymentMethodLabels[row.paymentMethod] || row.paymentMethod) : 'N/A'}
          </Badge>
          {row.bankAccount && (
            <div className="text-xs text-muted-foreground mt-1">
              Cuenta: {row.bankAccount}
            </div>
          )}
          {row.checkNumber && (
            <div className="text-xs text-muted-foreground mt-1">
              Cheque: {row.checkNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'reference',
      header: 'Referencia / Detalles',
      render: (row) => (
        <div>
          {row.reference && (
            <div className="text-sm font-medium mb-1">
              {row.reference}
            </div>
          )}
          {row.notes && (
            <div className="text-xs text-muted-foreground max-w-xs truncate">
              {row.notes}
            </div>
          )}
          {!row.reference && !row.notes && (
            <span className="text-xs text-muted-foreground">Sin detalles</span>
          )}
        </div>
      ),
    },
    {
      key: 'createdBy',
      header: 'Solicitado Por',
      render: (row) => (
        <div>
          <div className="text-sm">
            {row.createdBy.firstName} {row.createdBy.lastName}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDate(row.createdAt)}
          </div>
        </div>
      ),
    },
  ], [])

  // Configuración de acciones para el DataTable
  const actions = useMemo<Action<PendingApproval>[]>(() => [
    {
      label: 'Aprobar',
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (row) => handleApprove(row),
    },
    {
      label: 'Rechazar',
      icon: <XCircle className="h-4 w-4" />,
      onClick: (row) => handleReject(row),
    },
  ], [handleApprove, handleReject])

  // Valores memoizados para DataTable (evitar re-renders infinitos)
  const keyExtractor = useCallback((row: PendingApproval) => row.id, [])

  const searchFilterConfig = useMemo(() => ({
    placeholder: 'Buscar proveedor o factura...',
    debounceMs: 400,
  }), [])

  const pagination = useMemo(() => ({
    page,
    limit,
    total,
    totalPages,
  }), [page, limit, total, totalPages])

  const rowsPerPageOptions = useMemo(() => [10, 25, 50], [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Aprobación de Pagos</h1>
        <p className="text-gray-600">Gestiona las solicitudes de pago que requieren aprobación</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Pendientes"
          value={`$${(summary.totalPending || 0).toLocaleString()}`}
          subtitle={`${summary.countPending || 0} solicitudes`}
          icon={<Clock className="h-4 w-4" />}
          variant="warning"
        />

        <KpiCard
          title="Aprobados Hoy"
          value={`$${(summary.totalApproved || 0).toLocaleString()}`}
          subtitle={`${summary.countApproved || 0} pagos`}
          icon={<CheckCircle className="h-4 w-4" />}
          variant="success"
        />

        <KpiCard
          title="Requieren Atención"
          value={total.toString()}
          subtitle="solicitudes visibles"
          icon={<AlertCircle className="h-4 w-4" />}
          variant="danger"
        />

        <KpiCard
          title="Total"
          value={`$${((summary.totalPending || 0) + (summary.totalApproved || 0)).toLocaleString()}`}
          subtitle={`${(summary.countPending || 0) + (summary.countApproved || 0)} en total`}
          icon={<DollarSign className="h-4 w-4" />}
          variant="default"
        />
      </div>

      {/* DataTable de Solicitudes Pendientes */}
      <DataTable
        title="Solicitudes Pendientes"
        columns={columns}
        data={approvals}
        keyExtractor={keyExtractor}
        actions={actions}
        loading={loading}
        emptyMessage="No hay solicitudes pendientes de aprobación"
        // Filtros de búsqueda
        searchFilter={searchFilterConfig}
        searchValue={filters.search}
        onSearchChange={handleSearchChange}
        // Limpiar filtros
        onClearFilters={handleClearFilters}
        // Paginación server-side
        pagination={pagination}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsPerPageOptions}
      />

      {/* Dialog Aprobar */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-lg">
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
          <DialogFooter className="gap-2">
            <ActionButton
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false)
                setSelectedApproval(null)
                setApproveNotes("")
              }}
              disabled={submitting}
            >
              Cancelar
            </ActionButton>
            <ActionButton
              variant="confirm"
              onClick={confirmApprove}
              disabled={submitting}
              loading={submitting}
              loadingText="Aprobando..."
              startIcon={<CheckCircle className="h-4 w-4" />}
            >
              Aprobar Pago
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rechazar */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-lg">
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
          <DialogFooter className="gap-2">
            <ActionButton
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false)
                setSelectedApproval(null)
                setRejectReason("")
                setRejectNotes("")
              }}
              disabled={submitting}
            >
              Cancelar
            </ActionButton>
            <ActionButton
              variant="danger"
              onClick={confirmReject}
              disabled={submitting}
              loading={submitting}
              loadingText="Rechazando..."
              startIcon={<XCircle className="h-4 w-4" />}
            >
              Rechazar Pago
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
