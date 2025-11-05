"use client"

import { useState } from "react"
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
  TrendingDown,
  AlertCircle,
  Clock,
  CreditCard,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface CuentaPorPagar {
  id: string
  proveedor: string
  factura: string
  fechaEmision: string
  fechaVencimiento: string
  monto: number
  montoPendiente: number
  estado: "vigente" | "vencido" | "proximo_vencer" | "pagado"
  diasVencido: number
  categoria: string
  metodoPago?: string
}

const mockCuentasPagar: CuentaPorPagar[] = [
  {
    id: "1",
    proveedor: "Distribuidora Eléctrica Norte",
    factura: "PROV-2024-001",
    fechaEmision: "2024-01-05",
    fechaVencimiento: "2024-02-05",
    monto: 85000,
    montoPendiente: 85000,
    estado: "vigente",
    diasVencido: 0,
    categoria: "Materiales",
    metodoPago: "Transferencia",
  },
  {
    id: "2",
    proveedor: "Servicios Técnicos ABC",
    factura: "PROV-2024-002",
    fechaEmision: "2024-01-01",
    fechaVencimiento: "2024-01-31",
    monto: 45000,
    montoPendiente: 45000,
    estado: "vencido",
    diasVencido: 15,
    categoria: "Servicios",
    metodoPago: "Cheque",
  },
  {
    id: "3",
    proveedor: "Transportes XYZ",
    factura: "PROV-2024-003",
    fechaEmision: "2024-01-15",
    fechaVencimiento: "2024-02-18",
    monto: 25000,
    montoPendiente: 25000,
    estado: "proximo_vencer",
    diasVencido: 0,
    categoria: "Logística",
    metodoPago: "Transferencia",
  },
  {
    id: "4",
    proveedor: "Suministros DEF",
    factura: "PROV-2024-004",
    fechaEmision: "2024-01-10",
    fechaVencimiento: "2024-01-25",
    monto: 65000,
    montoPendiente: 0,
    estado: "pagado",
    diasVencido: 0,
    categoria: "Materiales",
    metodoPago: "Transferencia",
  },
]

export default function CuentasPagarPage() {
  const [cuentas, setCuentas] = useState<CuentaPorPagar[]>(mockCuentasPagar)
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCuenta, setSelectedCuenta] = useState<CuentaPorPagar | null>(null)
  const [fechaDesde, setFechaDesde] = useState<Date>()
  const [fechaHasta, setFechaHasta] = useState<Date>()

  const cuentasFiltradas = cuentas.filter((cuenta) => {
    const matchEstado = filtroEstado === "todos" || cuenta.estado === filtroEstado
    const matchCategoria = filtroCategoria === "todos" || cuenta.categoria === filtroCategoria
    const matchBusqueda =
      cuenta.proveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
      cuenta.factura.toLowerCase().includes(busqueda.toLowerCase())
    return matchEstado && matchCategoria && matchBusqueda
  })

  const totalPorPagar = cuentasFiltradas.reduce((sum, cuenta) => sum + cuenta.montoPendiente, 0)
  const cuentasVencidas = cuentasFiltradas.filter((c) => c.estado === "vencido").length
  const proximasVencer = cuentasFiltradas.filter((c) => c.estado === "proximo_vencer").length

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
    setIsDialogOpen(true)
  }

  const handleEditarCuenta = (cuenta: CuentaPorPagar) => {
    setSelectedCuenta(cuenta)
    setIsDialogOpen(true)
  }

  const exportarExcel = () => {
    console.log("Exportando cuentas por pagar a Excel...")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cuentas por Pagar</h1>
          <p className="text-muted-foreground">Gestiona las obligaciones pendientes de pago</p>
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
            <CardTitle className="text-sm font-medium">Total por Pagar</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalPorPagar.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Obligaciones pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{cuentasVencidas}</div>
            <p className="text-xs text-muted-foreground">Pagos atrasados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas a Vencer</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{proximasVencer}</div>
            <p className="text-xs text-muted-foreground">Vencen en 7 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cuentasFiltradas.length}</div>
            <p className="text-xs text-muted-foreground">Facturas registradas</p>
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
                placeholder="Proveedor o factura..."
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
                  <SelectItem value="Materiales">Materiales</SelectItem>
                  <SelectItem value="Servicios">Servicios</SelectItem>
                  <SelectItem value="Logística">Logística</SelectItem>
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
          <CardTitle>Listado de Cuentas por Pagar</CardTitle>
          <CardDescription>
            Mostrando {cuentasFiltradas.length} de {cuentas.length} cuentas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Factura</TableHead>
                <TableHead>Fecha Emisión</TableHead>
                <TableHead>Fecha Vencimiento</TableHead>
                <TableHead>Monto Total</TableHead>
                <TableHead>Monto Pendiente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Método Pago</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cuentasFiltradas.map((cuenta) => (
                <TableRow key={cuenta.id}>
                  <TableCell className="font-medium">{cuenta.proveedor}</TableCell>
                  <TableCell>{cuenta.factura}</TableCell>
                  <TableCell>{format(new Date(cuenta.fechaEmision), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{format(new Date(cuenta.fechaVencimiento), "dd/MM/yyyy")}</TableCell>
                  <TableCell>${cuenta.monto.toLocaleString()}</TableCell>
                  <TableCell className="font-medium text-red-600">${cuenta.montoPendiente.toLocaleString()}</TableCell>
                  <TableCell>{getEstadoBadge(cuenta.estado)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{cuenta.categoria}</Badge>
                  </TableCell>
                  <TableCell>{cuenta.metodoPago}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para nueva/editar cuenta */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCuenta ? "Editar Cuenta por Pagar" : "Nueva Cuenta por Pagar"}</DialogTitle>
            <DialogDescription>
              {selectedCuenta ? "Modifica los datos de la cuenta" : "Registra una nueva obligación de pago"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proveedor">Proveedor</Label>
                <Input id="proveedor" placeholder="Nombre del proveedor" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="factura">Número de Factura</Label>
                <Input id="factura" placeholder="PROV-2024-XXX" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monto">Monto Total</Label>
                <Input id="monto" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="materiales">Materiales</SelectItem>
                    <SelectItem value="servicios">Servicios</SelectItem>
                    <SelectItem value="logistica">Logística</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Emisión</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Seleccionar fecha
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Fecha de Vencimiento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Seleccionar fecha
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metodoPago">Método de Pago</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsDialogOpen(false)}>
              {selectedCuenta ? "Guardar Cambios" : "Crear Cuenta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
