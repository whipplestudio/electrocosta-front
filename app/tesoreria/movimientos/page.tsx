"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Download,
  Plus,
  Eye,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

const movimientos = [
  {
    id: "MOV-2024-0156",
    fecha: "2024-01-26",
    concepto: "Pago a proveedor - Distribuidora Norte",
    cuenta: "BBVA Bancomer ****1234",
    tipo: "Salida",
    categoria: "Proveedores",
    monto: -125000,
    saldoAnterior: 2975000,
    saldoActual: 2850000,
    referencia: "TRF-2024-0156",
    estado: "Confirmado",
    usuario: "María González",
  },
  {
    id: "MOV-2024-0155",
    fecha: "2024-01-26",
    concepto: "Cobro de factura - Cliente ABC Corp",
    cuenta: "BBVA Bancomer ****1234",
    tipo: "Entrada",
    categoria: "Clientes",
    monto: 85000,
    saldoAnterior: 2890000,
    saldoActual: 2975000,
    referencia: "DEP-2024-0089",
    estado: "Confirmado",
    usuario: "Carlos Ruiz",
  },
  {
    id: "MOV-2024-0154",
    fecha: "2024-01-25",
    concepto: "Gastos de oficina - Papelería",
    cuenta: "Caja Chica Oficina",
    tipo: "Salida",
    categoria: "Gastos Operativos",
    monto: -1500,
    saldoAnterior: 10000,
    saldoActual: 8500,
    referencia: "GASTO-2024-0045",
    estado: "Confirmado",
    usuario: "Ana López",
  },
  {
    id: "MOV-2024-0153",
    fecha: "2024-01-25",
    concepto: "Transferencia entre cuentas",
    cuenta: "Santander ****5678",
    tipo: "Entrada",
    categoria: "Transferencias",
    monto: 50000,
    saldoAnterior: 1150000,
    saldoActual: 1200000,
    referencia: "TRANS-2024-0034",
    estado: "Confirmado",
    usuario: "María González",
  },
  {
    id: "MOV-2024-0152",
    fecha: "2024-01-24",
    concepto: "Pago de nómina - Enero 2024",
    cuenta: "BBVA Bancomer ****1234",
    tipo: "Salida",
    categoria: "Nómina",
    monto: -180000,
    saldoAnterior: 3070000,
    saldoActual: 2890000,
    referencia: "NOM-2024-001",
    estado: "Confirmado",
    usuario: "Sistema",
  },
  {
    id: "MOV-2024-0151",
    fecha: "2024-01-24",
    concepto: "Comisión bancaria",
    cuenta: "BBVA Bancomer ****1234",
    tipo: "Salida",
    categoria: "Comisiones",
    monto: -500,
    saldoAnterior: 3070500,
    saldoActual: 3070000,
    referencia: "COM-2024-0089",
    estado: "Pendiente",
    usuario: "Sistema",
  },
]

export default function MovimientosPage() {
  const [filtroTipo, setFiltroTipo] = useState("all")
  const [filtroCategoria, setFiltroCategoria] = useState("all")
  const [filtroCuenta, setFiltroCuenta] = useState("all")
  const [filtroEstado, setFiltroEstado] = useState("all")
  const [busqueda, setBusqueda] = useState("")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  const getTypeBadge = (tipo: string) => {
    return tipo === "Entrada" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getTypeIcon = (tipo: string) => {
    return tipo === "Entrada" ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />
  }

  const getStatusBadge = (estado: string) => {
    const variants = {
      Confirmado: "bg-green-100 text-green-800",
      Pendiente: "bg-yellow-100 text-yellow-800",
      Cancelado: "bg-red-100 text-red-800",
    }
    return variants[estado as keyof typeof variants] || variants["Pendiente"]
  }

  // Estadísticas
  const totalMovimientos = movimientos.length
  const totalEntradas = movimientos.filter((m) => m.tipo === "Entrada").reduce((sum, m) => sum + m.monto, 0)
  const totalSalidas = movimientos.filter((m) => m.tipo === "Salida").reduce((sum, m) => sum + Math.abs(m.monto), 0)
  const flujoNeto = totalEntradas - totalSalidas
  const movimientosPendientes = movimientos.filter((m) => m.estado === "Pendiente").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Movimientos de Tesorería</h1>
          <p className="text-muted-foreground">Registro detallado de todos los movimientos de efectivo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Movimiento
          </Button>
        </div>
      </div>

      {/* KPIs de Movimientos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Entradas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEntradas)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Salidas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSalidas)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Flujo Neto</p>
                <p className={`text-2xl font-bold ${flujoNeto >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(flujoNeto)}
                </p>
              </div>
              <div className={`h-8 w-8 ${flujoNeto >= 0 ? "text-green-600" : "text-red-600"}`}>
                {flujoNeto >= 0 ? <TrendingUp className="h-8 w-8" /> : <TrendingDown className="h-8 w-8" />}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{movimientosPendientes}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar movimiento, concepto o referencia..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <DatePickerWithRange />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                  <SelectItem value="proveedores">Proveedores</SelectItem>
                  <SelectItem value="nomina">Nómina</SelectItem>
                  <SelectItem value="gastos">Gastos Operativos</SelectItem>
                  <SelectItem value="transferencias">Transferencias</SelectItem>
                  <SelectItem value="comisiones">Comisiones</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroCuenta} onValueChange={setFiltroCuenta}>
                <SelectTrigger>
                  <SelectValue placeholder="Cuenta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las cuentas</SelectItem>
                  <SelectItem value="bbva">BBVA Bancomer</SelectItem>
                  <SelectItem value="santander">Santander</SelectItem>
                  <SelectItem value="caja">Caja Chica</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Movimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Movimientos</CardTitle>
          <CardDescription>Historial completo de movimientos de tesorería</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Movimiento</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Cuenta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Saldo Actual</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientos.map((movimiento) => (
                <TableRow key={movimiento.id}>
                  <TableCell>{movimiento.fecha}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{movimiento.id}</p>
                      <p className="text-xs text-muted-foreground">{movimiento.referencia}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{movimiento.concepto}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{movimiento.cuenta}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeBadge(movimiento.tipo)}>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(movimiento.tipo)}
                        {movimiento.tipo}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{movimiento.categoria}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${movimiento.monto < 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(movimiento.monto)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{formatCurrency(movimiento.saldoActual)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(movimiento.estado)}>{movimiento.estado}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{movimiento.usuario}</p>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
