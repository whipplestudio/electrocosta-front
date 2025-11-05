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
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { useAccountsReceivable } from "@/hooks/use-accounts-receivable"
import { AccountReceivable, AccountReceivableStatus } from "@/types/accounts-receivable"

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
  const {
    accounts,
    dashboard,
    isLoading,
    error,
    fetchAccounts,
    fetchDashboard,
    pagination,
  } = useAccountsReceivable()
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCuenta, setSelectedCuenta] = useState<AccountReceivable | null>(null)
  const [fechaDesde, setFechaDesde] = useState<Date>()
  const [fechaHasta, setFechaHasta] = useState<Date>()
  
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

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchAccounts()
    fetchDashboard()
  }, [fetchAccounts, fetchDashboard])

  // Filtrar cuentas
  const cuentasFiltradas = accounts.filter((cuenta) => {
    const estadoMapeado = mapEstado(cuenta.status)
    const matchEstado = filtroEstado === "todos" || estadoMapeado === filtroEstado
    const matchCategoria = filtroCategoria === "todos" || cuenta.category?.name === filtroCategoria
    const matchBusqueda =
      cuenta.client?.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      cuenta.invoiceNumber.toLowerCase().includes(busqueda.toLowerCase())
    return matchEstado && matchCategoria && matchBusqueda
  })

  // Calcular totales desde el dashboard o desde las cuentas filtradas
  const totalPorCobrar = dashboard?.totalPending || cuentasFiltradas.reduce((sum, cuenta) => sum + Number(cuenta.balance), 0)
  const cuentasVencidas = dashboard?.overdueCount || cuentasFiltradas.filter((c) => mapEstado(c.status) === "vencido").length
  const proximasVencer = cuentasFiltradas.filter((c) => {
    const dueDate = new Date(c.dueDate)
    const today = new Date()
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays > 0 && diffDays <= 7
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

    // TODO: Por ahora solo cerramos el dialog
    // En el futuro aquí llamaremos a createAccount() con formData
    console.log('Datos del formulario:', formData)
    toast.info('Funcionalidad de crear cuenta en desarrollo')
    setIsDialogOpen(false)
  }

  const exportarExcel = () => {
    // TODO: Implementar exportación real
    console.log("Exportando cuentas por cobrar a Excel...")
    toast.info('Funcionalidad de exportación en desarrollo')
  }
  
  // Estados para date picker de prueba
  const [openTest, setOpenTest] = useState(false)
  const [dateTest, setDateTest] = useState<Date | undefined>(undefined)

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
      {/* Date Picker de Prueba */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-sm">🧪 Prueba de Date Picker</CardTitle>
          <CardDescription className="text-xs">
            Este es un calendario de prueba para verificar que funciona correctamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <Label htmlFor="dateTest" className="px-1 font-semibold">
              Selecciona una fecha de prueba
            </Label>
            <Popover open={openTest} onOpenChange={setOpenTest}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="dateTest"
                  className="w-64 justify-between font-normal"
                >
                  {dateTest ? format(dateTest, "PPP", { locale: es }) : "Seleccionar fecha"}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTest}
                  onSelect={(date) => {
                    setDateTest(date)
                    setOpenTest(false)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {dateTest && (
              <p className="text-sm text-green-600 font-medium">
                ✅ Fecha seleccionada: {format(dateTest, "PPP", { locale: es })}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPorCobrar.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monto pendiente total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{cuentasVencidas}</div>
            <p className="text-xs text-muted-foreground">Requieren atención inmediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas a Vencer</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{proximasVencer}</div>
            <p className="text-xs text-muted-foreground">Vencen en los próximos 7 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cuentasFiltradas.length}</div>
            <p className="text-xs text-muted-foreground">Facturas en el período</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <Input
                placeholder="Cliente o factura..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                  <SelectItem value="proximo_vencer">Próximo a Vencer</SelectItem>
                  <SelectItem value="vigente">Vigente</SelectItem>
                  <SelectItem value="pagado">Pagado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="Ventas">Ventas</SelectItem>
                  <SelectItem value="Proyectos">Proyectos</SelectItem>
                  <SelectItem value="Anticipos">Anticipos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha Desde</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaDesde ? format(fechaDesde, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={fechaDesde} onSelect={setFechaDesde} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Fecha Hasta</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaHasta ? format(fechaHasta, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={fechaHasta} onSelect={setFechaHasta} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Cuentas */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Cuentas por Cobrar</CardTitle>
          <CardDescription>
            Mostrando {cuentasFiltradas.length} de {accounts.length} cuentas
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
              {cuentasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No se encontraron cuentas por cobrar
                  </TableCell>
                </TableRow>
              ) : (
                cuentasFiltradas.map((cuenta) => (
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
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditarCuenta(cuenta)}>
                          <Edit className="h-4 w-4" />
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <Label htmlFor="clientId">ID del Cliente *</Label>
                <Input 
                  id="clientId" 
                  placeholder="UUID del cliente"
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">Temporalmente ingresa el UUID</p>
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
                <Label htmlFor="categoria">ID Categoría</Label>
                <Input 
                  id="categoria" 
                  placeholder="UUID de categoría (opcional)"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                />
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
    </div>
  )
}
