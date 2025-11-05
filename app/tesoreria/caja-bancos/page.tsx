"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Wallet,
  Building2,
  DollarSign,
  CreditCard,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from "lucide-react"

const cuentasCaja = [
  {
    id: "CAJA-001",
    nombre: "Caja General",
    tipo: "Efectivo",
    saldo: 45000,
    limite: 50000,
    responsable: "María González",
    ultimoMovimiento: "2024-01-26",
    estado: "Activa",
  },
  {
    id: "CAJA-002",
    nombre: "Caja Chica Oficina",
    tipo: "Efectivo",
    saldo: 8500,
    limite: 10000,
    responsable: "Carlos Ruiz",
    ultimoMovimiento: "2024-01-25",
    estado: "Activa",
  },
]

const cuentasBanco = [
  {
    id: "BCO-001",
    banco: "BBVA Bancomer",
    numeroCuenta: "****1234",
    tipo: "Cuenta Corriente",
    saldo: 2850000,
    limite: 5000000,
    tasaInteres: 2.5,
    ultimoMovimiento: "2024-01-26",
    estado: "Activa",
  },
  {
    id: "BCO-002",
    banco: "Santander",
    numeroCuenta: "****5678",
    tipo: "Cuenta de Ahorros",
    saldo: 1200000,
    limite: 2000000,
    tasaInteres: 3.2,
    ultimoMovimiento: "2024-01-25",
    estado: "Activa",
  },
  {
    id: "BCO-003",
    banco: "Banorte",
    numeroCuenta: "****9012",
    tipo: "Línea de Crédito",
    saldo: -450000,
    limite: 1000000,
    tasaInteres: 12.5,
    ultimoMovimiento: "2024-01-24",
    estado: "Activa",
  },
]

const movimientosRecientes = [
  {
    id: 1,
    fecha: "2024-01-26",
    concepto: "Pago a proveedor - Distribuidora Norte",
    cuenta: "BBVA Bancomer ****1234",
    tipo: "Salida",
    monto: -125000,
    saldo: 2850000,
    referencia: "TRF-2024-0156",
  },
  {
    id: 2,
    fecha: "2024-01-26",
    concepto: "Cobro de factura - Cliente ABC",
    cuenta: "BBVA Bancomer ****1234",
    tipo: "Entrada",
    monto: 85000,
    saldo: 2975000,
    referencia: "DEP-2024-0089",
  },
  {
    id: 3,
    fecha: "2024-01-25",
    concepto: "Gastos de oficina",
    cuenta: "Caja Chica Oficina",
    tipo: "Salida",
    monto: -1500,
    saldo: 8500,
    referencia: "GASTO-2024-0045",
  },
]

export default function CajaBancosPage() {
  const [filtroTipo, setFiltroTipo] = useState("all")
  const [busqueda, setBusqueda] = useState("")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  const totalEfectivo = cuentasCaja.reduce((sum, cuenta) => sum + cuenta.saldo, 0)
  const totalBancos = cuentasBanco.reduce((sum, cuenta) => sum + cuenta.saldo, 0)
  const totalDisponible = totalEfectivo + totalBancos
  const totalLimites = [...cuentasCaja, ...cuentasBanco].reduce((sum, cuenta) => sum + cuenta.limite, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Caja y Bancos</h1>
          <p className="text-muted-foreground">Control de efectivo y cuentas bancarias</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Movimiento
          </Button>
          <Button>
            <Building2 className="h-4 w-4 mr-2" />
            Nueva Cuenta
          </Button>
        </div>
      </div>

      {/* KPIs de Tesorería */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Disponible</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalDisponible)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Efectivo</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalEfectivo)}</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bancos</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalBancos)}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Límites Totales</p>
                <p className="text-2xl font-bold text-gray-600">{formatCurrency(totalLimites)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cuentas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cuentas">Cuentas</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos Recientes</TabsTrigger>
        </TabsList>

        <TabsContent value="cuentas" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar cuenta..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="bancaria">Bancaria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cuentas de Caja */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Cuentas de Caja
                </CardTitle>
                <CardDescription>Efectivo disponible en cajas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cuentasCaja.map((cuenta) => (
                    <div key={cuenta.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{cuenta.nombre}</h4>
                          <p className="text-sm text-muted-foreground">{cuenta.id}</p>
                        </div>
                        <Badge variant="outline">{cuenta.estado}</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Saldo:</span>
                          <span className="font-medium">{formatCurrency(cuenta.saldo)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Límite:</span>
                          <span className="text-sm">{formatCurrency(cuenta.limite)}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Utilización</span>
                            <span>{Math.round((cuenta.saldo / cuenta.limite) * 100)}%</span>
                          </div>
                          <Progress value={(cuenta.saldo / cuenta.limite) * 100} className="h-2" />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Responsable:</span>
                          <span>{cuenta.responsable}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Último movimiento:</span>
                          <span>{cuenta.ultimoMovimiento}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cuentas Bancarias */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Cuentas Bancarias
                </CardTitle>
                <CardDescription>Cuentas en instituciones financieras</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cuentasBanco.map((cuenta) => (
                    <div key={cuenta.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{cuenta.banco}</h4>
                          <p className="text-sm text-muted-foreground">
                            {cuenta.numeroCuenta} • {cuenta.tipo}
                          </p>
                        </div>
                        <Badge variant="outline">{cuenta.estado}</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Saldo:</span>
                          <span className={`font-medium ${cuenta.saldo < 0 ? "text-red-600" : "text-green-600"}`}>
                            {formatCurrency(cuenta.saldo)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Límite:</span>
                          <span className="text-sm">{formatCurrency(cuenta.limite)}</span>
                        </div>
                        {cuenta.saldo < 0 ? (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Utilización de Crédito</span>
                              <span>{Math.round((Math.abs(cuenta.saldo) / cuenta.limite) * 100)}%</span>
                            </div>
                            <Progress value={(Math.abs(cuenta.saldo) / cuenta.limite) * 100} className="h-2" />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Disponible</span>
                              <span>{Math.round((cuenta.saldo / cuenta.limite) * 100)}%</span>
                            </div>
                            <Progress value={(cuenta.saldo / cuenta.limite) * 100} className="h-2" />
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tasa de interés:</span>
                          <span>{cuenta.tasaInteres}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Último movimiento:</span>
                          <span>{cuenta.ultimoMovimiento}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="movimientos">
          <Card>
            <CardHeader>
              <CardTitle>Movimientos Recientes</CardTitle>
              <CardDescription>Últimas transacciones en caja y bancos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Cuenta</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimientosRecientes.map((movimiento) => (
                    <TableRow key={movimiento.id}>
                      <TableCell>{movimiento.fecha}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{movimiento.concepto}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{movimiento.cuenta}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={movimiento.tipo === "Entrada" ? "default" : "secondary"}>
                          <div className="flex items-center gap-1">
                            {movimiento.tipo === "Entrada" ? (
                              <ArrowDownRight className="h-3 w-3" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3" />
                            )}
                            {movimiento.tipo}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${movimiento.monto < 0 ? "text-red-600" : "text-green-600"}`}>
                          {formatCurrency(movimiento.monto)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatCurrency(movimiento.saldo)}</span>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{movimiento.referencia}</code>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
