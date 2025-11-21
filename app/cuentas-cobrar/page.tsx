"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  Plus,
  Edit,
  Eye,
  Download,
  Filter,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  Loader2,
  ChevronDown,
  Trash2,
  Users,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { useAccountsReceivable } from "@/hooks/use-accounts-receivable"
import { AccountReceivable, AccountReceivableStatus } from "@/types/accounts-receivable"
import { clientsService, type Client } from "@/services/clients.service"
import { categoriesService, type Category } from "@/services/categories.service"
import { RouteProtection } from "@/components/route-protection"

// Helper para mapear estados del backend al frontend
const mapEstado = (status: AccountReceivableStatus): string => {
  switch (status) {
    case AccountReceivableStatus.PENDING:
      return "vigente"
    case AccountReceivableStatus.PARTIAL:
      return "vigente"
    case AccountReceivableStatus.PAID:
      return "pagado"
    case AccountReceivableStatus.OVERDUE:
      return "vencido"
    case AccountReceivableStatus.CANCELLED:
      return "pagado"
    default:
      return "vigente"
  }
}

export default function CuentasCobrarPage() {
  return (
    <RouteProtection requiredPermissions={["cuentas_cobrar.registro.ver"]}>
      <CuentasCobrarPageContent />
    </RouteProtection>
  )
}

function CuentasCobrarPageContent() {
  const {
    accounts,
    dashboard,
    isLoading,
    error,
    fetchAccounts,
    fetchDashboard,
    createAccount,
    updateAccount,
    deleteAccount,
    pagination,
  } = useAccountsReceivable()
  
  // Estados para diálogos
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetalleDialogOpen, setIsDetalleDialogOpen] = useState(false)
  const [selectedCuenta, setSelectedCuenta] = useState<AccountReceivable | null>(null)
  const [cuentaDetalle, setCuentaDetalle] = useState<AccountReceivable | null>(null)
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    clientId: "all",
    status: "all" as AccountReceivableStatus | "all",
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
  })
  const [isFilterExpanded, setIsFilterExpanded] = useState(true)
  
  // Estados para clientes y categorías
  const [clients, setClients] = useState<Client[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingSelects, setLoadingSelects] = useState(false)
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    clientId: '',
    invoiceNumber: '',
    amount: '',
    categoryId: '',
    issueDate: undefined as Date | undefined,
    dueDate: undefined as Date | undefined,
    description: '',
  })
  

  // Cargar clientes y categorías
  const loadClientsAndCategories = async () => {
    setLoadingSelects(true)
    try {
      const [clientsData, categoriesData] = await Promise.all([
        clientsService.list(),
        categoriesService.list(),
      ])
      setClients(clientsData)
      setCategories(categoriesData.filter(cat => cat.type === 'income')) // Solo categorías de ingresos
    } catch (error) {
      console.error('Error al cargar clientes y categorías:', error)
      toast.error('Error al cargar opciones del formulario')
    } finally {
      setLoadingSelects(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    handleApplyFilters()
    fetchDashboard()
    loadClientsAndCategories()
  }, [])

  // Aplicar filtros y recargar datos del backend
  const handleApplyFilters = async () => {
    const filterDto: any = {}
    
    if (filters.clientId && filters.clientId !== "all") filterDto.clientId = filters.clientId
    if (filters.status && filters.status !== "all") filterDto.status = filters.status
    if (filters.dateFrom) filterDto.dateFrom = filters.dateFrom.toISOString()
    if (filters.dateTo) filterDto.dateTo = filters.dateTo.toISOString()
    
    await fetchAccounts(filterDto)
  }

  // Limpiar filtros
  const handleClearFilters = async () => {
    setFilters({
      clientId: "all",
      status: "all",
      dateFrom: undefined,
      dateTo: undefined,
    })
    await fetchAccounts()
  }

  // Cálculos basados en los datos del backend
  const totalPorCobrar = accounts.reduce((sum, cuenta) => sum + Number(cuenta.balance), 0)
  const cuentasVencidas = accounts.filter((c) => c.status === AccountReceivableStatus.OVERDUE).length
  const proximasVencer = accounts.filter((c) => {
    if (c.status === AccountReceivableStatus.PENDING || c.status === AccountReceivableStatus.PARTIAL) {
      const dueDate = new Date(c.dueDate)
      const today = new Date()
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays > 0 && diffDays <= 7
    }
    return false
  }).length

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "vencido":
        return <Badge variant="destructive">Vencido</Badge>
      case "proximo_vencer":
        return <Badge className="bg-yellow-100 text-yellow-800">Próximo a Vencer</Badge>
      case "vigente":
        return <Badge className="bg-green-100 text-green-800">Vigente</Badge>
      case "pagado":
        return <Badge className="bg-blue-100 text-blue-800">Pagado</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const handleNuevaCuenta = () => {
    setSelectedCuenta(null)
    // Limpiar formulario
    setFormData({
      clientId: '',
      invoiceNumber: '',
      amount: '',
      categoryId: '',
      issueDate: undefined,
      dueDate: undefined,
      description: '',
    })
    setIsDialogOpen(true)
  }

  const handleVerDetalle = (cuenta: AccountReceivable) => {
    setCuentaDetalle(cuenta)
    setIsDetalleDialogOpen(true)
  }

  const handleEditarCuenta = (cuenta: AccountReceivable) => {
    setSelectedCuenta(cuenta)
    // Pre-llenar formulario con datos existentes
    setFormData({
      clientId: cuenta.clientId,
      invoiceNumber: cuenta.invoiceNumber,
      amount: cuenta.amount.toString(),
      categoryId: cuenta.categoryId || '',
      issueDate: new Date(cuenta.issueDate),
      dueDate: new Date(cuenta.dueDate),
      description: cuenta.description || '',
    })
    setIsDialogOpen(true)
  }

  const handleSubmitForm = async () => {
    // Validaciones básicas
    if (!formData.clientId || !formData.invoiceNumber || !formData.amount || !formData.issueDate || !formData.dueDate) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    try {
      if (selectedCuenta) {
        // Actualizar cuenta existente con todos los campos editables
        await updateAccount(selectedCuenta.id, {
          invoiceNumber: formData.invoiceNumber,
          amount: parseFloat(formData.amount),
          categoryId: formData.categoryId || undefined,
          issueDate: formData.issueDate?.toISOString(),
          dueDate: formData.dueDate?.toISOString(),
          description: formData.description || undefined,
        })
        toast.success('Cuenta actualizada exitosamente')
      } else {
        // Crear nueva cuenta
        await createAccount({
          clientId: formData.clientId,
          invoiceNumber: formData.invoiceNumber,
          amount: parseFloat(formData.amount),
          categoryId: formData.categoryId || undefined,
          issueDate: formData.issueDate?.toISOString() || new Date().toISOString(),
          dueDate: formData.dueDate?.toISOString() || new Date().toISOString(),
          description: formData.description || undefined,
          currency: 'MXN',
        })
        toast.success('Cuenta creada exitosamente')
      }
      
      setIsDialogOpen(false)
      setSelectedCuenta(null)
      // Recargar datos
      await handleApplyFilters()
      await fetchDashboard()
    } catch (error) {
      console.error('Error al guardar cuenta:', error)
      toast.error('Error al guardar la cuenta')
    }
  }

  const handleEliminarCuenta = async (cuentaId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta cuenta?')) {
      return
    }

    try {
      await deleteAccount(cuentaId)
      toast.success('Cuenta eliminada exitosamente')
      // Recargar datos
      await handleApplyFilters()
      await fetchDashboard()
    } catch (error) {
      console.error('Error al eliminar cuenta:', error)
      toast.error('Error al eliminar la cuenta')
    }
  }

  const exportarExcel = () => {
    // TODO: Implementar exportación real
    console.log("Exportando cuentas por cobrar a Excel...")
    toast.info('Funcionalidad de exportación en desarrollo')
  }

  // Mostrar loading state
  if (isLoading && accounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cuentas por Cobrar</h1>
          <p className="text-muted-foreground">Gestiona las cuentas pendientes de cobro</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportarExcel}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
          <Button onClick={handleNuevaCuenta}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cuenta
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboard?.totalPending?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">{accounts.length} cuentas activas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.overdueCount || 0}</div>
            <p className="text-xs text-muted-foreground">Requieren atención inmediata</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas a Vencer</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proximasVencer}</div>
            <p className="text-xs text-muted-foreground">En los próximos 7 días</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foreground">Emitidas este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros Mejorados */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setIsFilterExpanded(!isFilterExpanded)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filtros de Búsqueda</CardTitle>
              {(filters.clientId !== "all" || filters.status !== "all" || filters.dateFrom || filters.dateTo) && (
                <Badge variant="secondary" className="ml-2">
                  {[filters.clientId !== "all" ? filters.clientId : null, filters.status !== "all" ? filters.status : null, filters.dateFrom, filters.dateTo].filter(Boolean).length} activos
                </Badge>
              )}
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform ${isFilterExpanded ? 'rotate-180' : ''}`} />
          </div>
        </CardHeader>
        {isFilterExpanded && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por Cliente */}
              <div className="space-y-2">
                <Label htmlFor="clientFilter">Cliente</Label>
                <Select 
                  value={filters.clientId} 
                  onValueChange={(value) => setFilters({ ...filters, clientId: value })}
                >
                  <SelectTrigger id="clientFilter">
                    <SelectValue placeholder="Todos los clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los clientes</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filtro por Estado */}
              <div className="space-y-2">
                <Label htmlFor="statusFilter">Estado</Label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters({ ...filters, status: value as AccountReceivableStatus | "all" })}
                >
                  <SelectTrigger id="statusFilter">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value={AccountReceivableStatus.PENDING}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        Pendiente
                      </div>
                    </SelectItem>
                    <SelectItem value={AccountReceivableStatus.PARTIAL}>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        Parcial
                      </div>
                    </SelectItem>
                    <SelectItem value={AccountReceivableStatus.PAID}>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Pagado
                      </div>
                    </SelectItem>
                    <SelectItem value={AccountReceivableStatus.OVERDUE}>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Vencido
                      </div>
                    </SelectItem>
                    <SelectItem value={AccountReceivableStatus.CANCELLED}>
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4 text-gray-500" />
                        Cancelado
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filtro por Fecha Desde */}
              <div className="space-y-2">
                <Label>Fecha Desde</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`w-full justify-start text-left font-normal ${!filters.dateFrom ? 'text-muted-foreground' : ''}`}
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {filters.dateFrom ? format(filters.dateFrom, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      selected={filters.dateFrom} 
                      onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Filtro por Fecha Hasta */}
              <div className="space-y-2">
                <Label>Fecha Hasta</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`w-full justify-start text-left font-normal ${!filters.dateTo ? 'text-muted-foreground' : ''}`}
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {filters.dateTo ? format(filters.dateTo, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      selected={filters.dateTo} 
                      onSelect={(date) => setFilters({ ...filters, dateTo: date })}
                      initialFocus
                      disabled={(date) => filters.dateFrom ? date < filters.dateFrom : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Botones de Acción */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                disabled={filters.clientId === "all" && filters.status === "all" && !filters.dateFrom && !filters.dateTo}
              >
                Limpiar Filtros
              </Button>
              <Button onClick={handleApplyFilters} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Filter className="mr-2 h-4 w-4" />
                Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Tabla de Cuentas */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Cuentas por Cobrar</CardTitle>
          <CardDescription>
            Mostrando {accounts.length} cuentas
            {(filters.clientId !== "all" || filters.status !== "all" || filters.dateFrom || filters.dateTo) && " (filtrado)"}
            {isLoading && <Loader2 className="inline ml-2 h-4 w-4 animate-spin" />}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
              {error}
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Factura</TableHead>
                <TableHead>Fecha Emisión</TableHead>
                <TableHead>Fecha Vencimiento</TableHead>
                <TableHead>Monto Total</TableHead>
                <TableHead>Saldo Pendiente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {isLoading ? "Cargando..." : "No se encontraron cuentas por cobrar"}
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((cuenta) => (
                  <TableRow key={cuenta.id}>
                    <TableCell className="font-medium">{cuenta.client?.name || 'N/A'}</TableCell>
                    <TableCell>{cuenta.invoiceNumber}</TableCell>
                    <TableCell>{format(new Date(cuenta.issueDate), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{format(new Date(cuenta.dueDate), "dd/MM/yyyy")}</TableCell>
                    <TableCell>${Number(cuenta.amount).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">${Number(cuenta.balance).toLocaleString()}</TableCell>
                    <TableCell>{getEstadoBadge(mapEstado(cuenta.status))}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{cuenta.category?.name || 'Sin categoría'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleVerDetalle(cuenta)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditarCuenta(cuenta)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEliminarCuenta(cuenta.id)}
                          className="text-destructive hover:text-destructive"
                        >
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

      {/* Dialog para nueva/editar cuenta */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) {
          setSelectedCuenta(null)
          setFormData({
            clientId: '',
            invoiceNumber: '',
            amount: '',
            categoryId: '',
            issueDate: undefined,
            dueDate: undefined,
            description: '',
          })
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCuenta ? "Editar Cuenta por Cobrar" : "Nueva Cuenta por Cobrar"}</DialogTitle>
            <DialogDescription>
              {selectedCuenta ? "Modifica los datos de la cuenta" : "Registra una nueva cuenta por cobrar"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Cliente *</Label>
                <Select 
                  value={formData.clientId}
                  onValueChange={(value) => setFormData({...formData, clientId: value})}
                  disabled={loadingSelects || selectedCuenta !== null}
                >
                  <SelectTrigger id="clientId">
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingSelects ? (
                      <SelectItem value="loading" disabled>
                        Cargando...
                      </SelectItem>
                    ) : clients.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No hay clientes disponibles
                      </SelectItem>
                    ) : (
                      clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} - {client.taxId}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedCuenta && (
                  <p className="text-xs text-muted-foreground">
                    No se puede cambiar el cliente al editar
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="factura">Número de Factura *</Label>
                <Input 
                  id="factura" 
                  placeholder="FAC-2024-XXX"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monto">Monto Total *</Label>
                <Input 
                  id="monto" 
                  type="number" 
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select 
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({...formData, categoryId: value})}
                  disabled={loadingSelects}
                >
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Selecciona una categoría (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingSelects ? (
                      <SelectItem value="loading" disabled>
                        Cargando...
                      </SelectItem>
                    ) : categories.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No hay categorías disponibles
                      </SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Emisión *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`w-full justify-start text-left font-normal ${!formData.issueDate ? 'text-muted-foreground' : ''}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.issueDate ? format(formData.issueDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single"
                      selected={formData.issueDate}
                      onSelect={(date) => setFormData({...formData, issueDate: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Fecha de Vencimiento *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`w-full justify-start text-left font-normal ${!formData.dueDate ? 'text-muted-foreground' : ''}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate ? format(formData.dueDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) => setFormData({...formData, dueDate: date})}
                      initialFocus
                      disabled={(date) => formData.issueDate ? date < formData.issueDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input 
                id="description" 
                placeholder="Descripción de la cuenta"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitForm} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedCuenta ? "Guardar Cambios" : "Crear Cuenta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver detalle de cuenta */}
      <Dialog open={isDetalleDialogOpen} onOpenChange={setIsDetalleDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Cuenta por Cobrar</DialogTitle>
            <DialogDescription>
              Información completa de la cuenta
            </DialogDescription>
          </DialogHeader>
          {cuentaDetalle && (
            <div className="space-y-6">
              {/* Información del Cliente */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Información del Cliente
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Cliente</Label>
                    <p className="font-medium">{cuentaDetalle.client?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">RFC/Tax ID</Label>
                    <p className="font-medium">{cuentaDetalle.client?.taxId || 'N/A'}</p>
                  </div>
                  {cuentaDetalle.client?.email && (
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{cuentaDetalle.client.email}</p>
                    </div>
                  )}
                  {cuentaDetalle.client?.phone && (
                    <div>
                      <Label className="text-muted-foreground">Teléfono</Label>
                      <p className="font-medium">{cuentaDetalle.client.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de la Factura */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-lg">Información de la Factura</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Número de Factura</Label>
                    <p className="font-medium">{cuentaDetalle.invoiceNumber}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Estado</Label>
                    <div className="mt-1">
                      {getEstadoBadge(mapEstado(cuentaDetalle.status))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fecha de Emisión</Label>
                    <p className="font-medium">{format(new Date(cuentaDetalle.issueDate), "dd/MM/yyyy", { locale: es })}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fecha de Vencimiento</Label>
                    <p className="font-medium">{format(new Date(cuentaDetalle.dueDate), "dd/MM/yyyy", { locale: es })}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Categoría</Label>
                    <p className="font-medium">{cuentaDetalle.category?.name || 'Sin categoría'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Proyecto</Label>
                    <p className="font-medium">{cuentaDetalle.project?.name || 'Sin proyecto'}</p>
                  </div>
                </div>
              </div>

              {/* Información Financiera */}
              <div className="border rounded-lg p-4 space-y-3 bg-primary/5">
                <h3 className="font-semibold text-lg">Información Financiera</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Monto Total</Label>
                    <p className="text-xl font-bold text-primary">
                      ${Number(cuentaDetalle.amount).toLocaleString()} {cuentaDetalle.currency}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Monto Pagado</Label>
                    <p className="text-xl font-bold text-green-600">
                      ${Number(cuentaDetalle.paidAmount).toLocaleString()} {cuentaDetalle.currency}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Saldo Pendiente</Label>
                    <p className="text-2xl font-bold text-orange-600">
                      ${Number(cuentaDetalle.balance).toLocaleString()} {cuentaDetalle.currency}
                    </p>
                  </div>
                </div>
              </div>

              {/* Descripción y Notas */}
              {(cuentaDetalle.description || cuentaDetalle.notes) && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-lg">Descripción y Notas</h3>
                  {cuentaDetalle.description && (
                    <div>
                      <Label className="text-muted-foreground">Descripción</Label>
                      <p className="text-sm mt-1">{cuentaDetalle.description}</p>
                    </div>
                  )}
                  {cuentaDetalle.notes && (
                    <div>
                      <Label className="text-muted-foreground">Notas</Label>
                      <p className="text-sm mt-1">{cuentaDetalle.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Historial de Pagos */}
              {cuentaDetalle.payments && cuentaDetalle.payments.length > 0 && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-lg">Historial de Pagos</h3>
                  <div className="space-y-2">
                    {cuentaDetalle.payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-2 bg-muted rounded">
                        <div>
                          <p className="font-medium">${Number(payment.amount).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payment.paymentDate), "dd/MM/yyyy", { locale: es })} - {payment.paymentMethod}
                          </p>
                        </div>
                        {payment.reference && (
                          <Badge variant="outline">{payment.reference}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seguimientos */}
              {cuentaDetalle.followUps && cuentaDetalle.followUps.length > 0 && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-lg">Seguimientos</h3>
                  <div className="space-y-2">
                    {cuentaDetalle.followUps.map((followUp) => (
                      <div key={followUp.id} className="p-2 bg-muted rounded">
                        <div className="flex justify-between items-start mb-1">
                          <Badge variant="outline">{followUp.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(followUp.createdAt), "dd/MM/yyyy", { locale: es })}
                          </span>
                        </div>
                        <p className="text-sm">{followUp.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">Resultado: {followUp.result}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadatos */}
              <div className="border-t pt-3 text-xs text-muted-foreground grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Creado:</span> {format(new Date(cuentaDetalle.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                </div>
                <div>
                  <span className="font-medium">Última actualización:</span> {format(new Date(cuentaDetalle.updatedAt), "dd/MM/yyyy HH:mm", { locale: es })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetalleDialogOpen(false)}>
              Cerrar
            </Button>
            {cuentaDetalle && (
              <Button onClick={() => {
                setIsDetalleDialogOpen(false)
                handleEditarCuenta(cuentaDetalle)
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Cuenta
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
