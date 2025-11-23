"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, Edit, Trash2, CalendarIcon, TrendingDown, AlertCircle, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { accountsPayableService } from "@/services/accounts-payable.service"
import { suppliersService, type Supplier } from "@/services/suppliers.service"
import { categoriesService, type Category } from "@/services/categories.service"
import type { AccountPayable, AccountPayableStatus, CreateAccountPayableDto, UpdateAccountPayableDto } from "@/types/accounts-payable"

export default function CuentasPagarPage() {
  const [accounts, setAccounts] = useState<AccountPayable[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSelects, setLoadingSelects] = useState(false)
  const [applyingFilters, setApplyingFilters] = useState(false)
  const [savingAccount, setSavingAccount] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: "all" as string,
    approvalStatus: "all" as string,
    search: ""
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<AccountPayable | null>(null)
  const [formData, setFormData] = useState({
    supplierId: "",
    supplierName: "",
    invoiceNumber: "",
    amount: "",
    categoryId: "",
    issueDate: undefined as Date | undefined,
    dueDate: undefined as Date | undefined,
    description: "",
  })

  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalPendiente: 0,
    totalVencido: 0,
    cuentasVencidas: 0,
    proximasVencer: 0,
    pendientesAprobacion: 0,
  })

  const fetchAccounts = useCallback(async (filterParams?: any) => {
    try {
      setLoading(true)
      const params: any = { page: 1, limit: 100 }
      
      if (filterParams?.status && filterParams.status !== "all") {
        params.status = filterParams.status
      }
      if (filterParams?.approvalStatus && filterParams.approvalStatus !== "all") {
        params.approvalStatus = filterParams.approvalStatus
      }
      if (filterParams?.search) {
        params.search = filterParams.search
      }
      
      const response = await accountsPayableService.getAll(params)
      setAccounts(response.data)
    } catch (error) {
      console.error("Error al cargar cuentas por pagar:", error)
      toast.error("Error al cargar las cuentas por pagar")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await accountsPayableService.getDashboard()
      setDashboardData({
        totalPendiente: data.keyMetrics?.totalPayable || 0,
        totalVencido: data.keyMetrics?.totalOverdue || 0,
        cuentasVencidas: data.overdueAccounts?.length || 0,
        proximasVencer: data.keyMetrics?.upcomingThisWeek || 0,
        pendientesAprobacion: 0, // Se calculará desde las cuentas después
      })
    } catch (error) {
      console.error("Error al cargar dashboard:", error)
      toast.error("Error al cargar estadísticas del dashboard")
    }
  }, [])

  const loadSuppliersAndCategories = async () => {
    try {
      setLoadingSelects(true)
      
      const [suppliersResp, categoriesResp] = await Promise.all([
        suppliersService.getAll({ page: 1, limit: 100 }),
        categoriesService.getAll({ page: 1, limit: 100 }),
      ]);
      
      setSuppliers(suppliersResp.data)
      
      // Filtrar solo categorías de tipo "expense" (egresos)
      const expenseCategories = categoriesResp.data.filter((cat) => cat.type === 'expense')
      console.log('📊 Total de categorías:', categoriesResp.data.length)
      console.log('💸 Categorías de egreso:', expenseCategories.length)
      
      if (expenseCategories.length === 0 && categoriesResp.data.length > 0) {
        console.warn('⚠️ Hay categorías creadas pero ninguna es de tipo "Egreso"')
        toast.warning('No hay categorías de tipo "Egreso". Crea categorías de egreso en el módulo de Categorías.')
      }
      
      setCategories(expenseCategories)
    } catch (error) {
      console.error("Error al cargar opciones:", error)
      toast.error("Error al cargar opciones del formulario")
    } finally {
      setLoadingSelects(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
    fetchDashboard()
    loadSuppliersAndCategories()
  }, [fetchAccounts, fetchDashboard])

  // Calcular pendientes de aprobación cuando las cuentas cambien
  useEffect(() => {
    const pendientes = accounts.filter(a => a.approvalStatus === 'pending').length
    setDashboardData(prev => ({ ...prev, pendientesAprobacion: pendientes }))
  }, [accounts])

  const handleNuevaCuenta = () => {
    setSelectedAccount(null)
    setFormData({
      supplierId: "",
      supplierName: "",
      invoiceNumber: "",
      amount: "",
      categoryId: "",
      issueDate: new Date(),
      dueDate: undefined,
      description: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditarCuenta = (cuenta: AccountPayable) => {
    setSelectedAccount(cuenta)
    setFormData({
      supplierId: cuenta.supplierId || "",
      supplierName: cuenta.supplier?.name || cuenta.supplierName || "",
      invoiceNumber: cuenta.invoiceNumber,
      amount: cuenta.amount.toString(),
      categoryId: cuenta.categoryId || "",
      issueDate: new Date(cuenta.issueDate),
      dueDate: new Date(cuenta.dueDate),
      description: cuenta.description || "",
    })
    setIsDialogOpen(true)
  }

  const handleSubmitForm = async () => {
    if (!formData.supplierName || !formData.invoiceNumber || !formData.amount || !formData.issueDate || !formData.dueDate) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    if (savingAccount) return

    try {
      setSavingAccount(true)
      if (selectedAccount) {
        await accountsPayableService.update(selectedAccount.id, {
          invoiceNumber: formData.invoiceNumber,
          amount: parseFloat(formData.amount),
          categoryId: formData.categoryId || undefined,
          issueDate: formData.issueDate?.toISOString(),
          dueDate: formData.dueDate?.toISOString(),
          description: formData.description || undefined,
        })
        toast.success("Cuenta actualizada exitosamente")
      } else {
        await accountsPayableService.create({
          supplierName: formData.supplierName,
          invoiceNumber: formData.invoiceNumber,
          amount: parseFloat(formData.amount),
          categoryId: formData.categoryId || undefined,
          issueDate: formData.issueDate?.toISOString() || new Date().toISOString(),
          dueDate: formData.dueDate?.toISOString() || new Date().toISOString(),
          description: formData.description || undefined,
          currency: "MXN",
        })
        toast.success("Cuenta creada exitosamente")
      }
      setIsDialogOpen(false)
      fetchAccounts(filters)
      fetchDashboard()
    } catch (error) {
      console.error("Error al guardar cuenta:", error)
      toast.error("Error al guardar la cuenta")
    } finally {
      setSavingAccount(false)
    }
  }

  const handleEliminarCuenta = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta cuenta?")) return
    try {
      await accountsPayableService.delete(id)
      toast.success("Cuenta eliminada")
      fetchAccounts(filters)
      fetchDashboard()
    } catch (error) {
      toast.error("Error al eliminar")
    }
  }

  const handleAprobar = async (id: string) => {
    if (approvingId || rejectingId) return
    try {
      setApprovingId(id)
      await accountsPayableService.approve(id)
      toast.success("Cuenta aprobada")
      fetchAccounts(filters)
      fetchDashboard()
    } catch (error) {
      toast.error("Error al aprobar")
    } finally {
      setApprovingId(null)
    }
  }

  const handleRechazar = async (id: string) => {
    if (approvingId || rejectingId) return
    const reason = prompt("Razón del rechazo:")
    if (!reason) return
    try {
      setRejectingId(id)
      await accountsPayableService.reject(id, { reason })
      toast.success("Cuenta rechazada")
      fetchAccounts(filters)
      fetchDashboard()
    } catch (error) {
      toast.error("Error al rechazar")
    } finally {
      setRejectingId(null)
    }
  }

  const handleApplyFilters = async () => {
    setApplyingFilters(true)
    try {
      await fetchAccounts(filters)
      toast.success('Filtros aplicados correctamente')
    } catch (error) {
      toast.error('Error al aplicar filtros')
    } finally {
      setApplyingFilters(false)
    }
  }

  const handleClearFilters = async () => {
    setFilters({ status: "all", approvalStatus: "all", search: "" })
    setApplyingFilters(true)
    try {
      await fetchAccounts()
      toast.success('Filtros limpiados')
    } catch (error) {
      toast.error('Error al limpiar filtros')
    } finally {
      setApplyingFilters(false)
    }
  }

  const activeFiltersCount = [
    filters.status !== "all",
    filters.approvalStatus !== "all",
    filters.search !== ""
  ].filter(Boolean).length

  const getEstadoBadge = (status: AccountPayableStatus) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      partial: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
      scheduled: "bg-purple-100 text-purple-800",
    }
    const labels = {
      pending: "Pendiente",
      partial: "Parcial",
      paid: "Pagado",
      overdue: "Vencido",
      cancelled: "Cancelado",
      scheduled: "Programado",
    }
    return <Badge className={styles[status]}>{labels[status]}</Badge>
  }

  const getAprobacionBadge = (status: string) => {
    if (status === "approved") return <Badge className="bg-green-100 text-green-800">Aprobado</Badge>
    if (status === "rejected") return <Badge className="bg-red-100 text-red-800">Rechazado</Badge>
    return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cuentas por Pagar</h1>
          <p className="text-muted-foreground">Gestiona las facturas y pagos a proveedores</p>
        </div>
        <Button onClick={handleNuevaCuenta}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Cuenta
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(dashboardData.totalPendiente || 0).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencido</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${(dashboardData.totalVencido || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{dashboardData.cuentasVencidas || 0} cuentas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas a Vencer</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.proximasVencer || 0}</div>
            <p className="text-xs text-muted-foreground">Próximos 7 días</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes Aprobación</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.pendientesAprobacion || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Filtros</CardTitle>
            {activeFiltersCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} activo{activeFiltersCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Buscar</Label>
              <Input
                placeholder="Proveedor o factura..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div>
              <Label>Estado</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="paid">Pagado</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                  <SelectItem value="scheduled">Programado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Aprobación</Label>
              <Select 
                value={filters.approvalStatus} 
                onValueChange={(value) => setFilters({ ...filters, approvalStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="approved">Aprobado</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button 
                className="flex-1" 
                onClick={handleApplyFilters}
                disabled={applyingFilters || loading}
              >
                {applyingFilters && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Aplicar Filtros
              </Button>
              <Button 
                variant="outline"
                onClick={handleClearFilters}
                disabled={applyingFilters || loading || activeFiltersCount === 0}
              >
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Factura</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Aprobación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Cargando...</TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No hay cuentas por pagar</TableCell>
                </TableRow>
              ) : (
                accounts.map((cuenta) => (
                  <TableRow key={cuenta.id}>
                    <TableCell>{cuenta.supplier?.name || cuenta.supplierName || 'N/A'}</TableCell>
                    <TableCell>{cuenta.invoiceNumber}</TableCell>
                    <TableCell>${parseFloat(cuenta.amount).toLocaleString()}</TableCell>
                    <TableCell>{format(new Date(cuenta.dueDate), "dd MMM yyyy", { locale: es })}</TableCell>
                    <TableCell>{getEstadoBadge(cuenta.status)}</TableCell>
                    <TableCell>{getAprobacionBadge(cuenta.approvalStatus)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {cuenta.approvalStatus === "pending" && (
                          <>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleAprobar(cuenta.id)}
                              disabled={approvingId === cuenta.id || rejectingId === cuenta.id}
                            >
                              {approvingId === cuenta.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleRechazar(cuenta.id)}
                              disabled={approvingId === cuenta.id || rejectingId === cuenta.id}
                            >
                              {rejectingId === cuenta.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleEditarCuenta(cuenta)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEliminarCuenta(cuenta.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Crear/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAccount ? "Editar Cuenta" : "Nueva Cuenta por Pagar"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Proveedor *</Label>
              <Input
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                placeholder="Nombre del proveedor"
                disabled={!!selectedAccount}
              />
            </div>
            <div className="grid gap-2">
              <Label>Número de Factura *</Label>
              <Input
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Monto *</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Categoría</Label>
              <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })} disabled={loadingSelects}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingSelects ? "Cargando..." : categories.length === 0 ? "No hay categorías de egreso" : "Selecciona categoría (opcional)"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No hay categorías de tipo "Egreso". Ve a /categorias para crear una.</div>
                  ) : (
                    categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Fecha de Emisión *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.issueDate ? format(formData.issueDate, "PPP", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.issueDate} onSelect={(d) => setFormData({ ...formData, issueDate: d })} locale={es} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Fecha de Vencimiento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, "PPP", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.dueDate} onSelect={(d) => setFormData({ ...formData, dueDate: d })} locale={es} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Descripción</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={savingAccount}>Cancelar</Button>
            <Button onClick={handleSubmitForm} disabled={savingAccount}>
              {savingAccount ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {selectedAccount ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                selectedAccount ? "Actualizar" : "Crear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
