"use client"
import { CreditCard, TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

const cuentasBancarias = [
  {
    id: "CTA001",
    banco: "BBVA Bancomer",
    numero: "****1234",
    tipo: "Cuenta Corriente",
    saldo: 2450000,
    moneda: "MXN",
    estado: "Activa",
  },
  {
    id: "CTA002",
    banco: "Santander",
    numero: "****5678",
    tipo: "Cuenta de Inversión",
    saldo: 1850000,
    moneda: "MXN",
    estado: "Activa",
  },
  {
    id: "CTA003",
    banco: "Banamex",
    numero: "****9012",
    tipo: "Cuenta USD",
    saldo: 125000,
    moneda: "USD",
    estado: "Activa",
  },
]

const movimientosRecientes = [
  {
    id: "MOV001",
    fecha: "2024-01-20",
    concepto: "Pago a Proveedor - Distribuidora Eléctrica",
    tipo: "Egreso",
    monto: -85000,
    cuenta: "BBVA ****1234",
    referencia: "TRF001234",
  },
  {
    id: "MOV002",
    fecha: "2024-01-19",
    concepto: "Cobro Cliente - Constructora ABC",
    tipo: "Ingreso",
    monto: 125000,
    cuenta: "BBVA ****1234",
    referencia: "DEP005678",
  },
  {
    id: "MOV003",
    fecha: "2024-01-18",
    concepto: "Pago Nómina Quincenal",
    tipo: "Egreso",
    monto: -245000,
    cuenta: "Santander ****5678",
    referencia: "NOM240118",
  },
]

const proyeccionFlujo = [
  { semana: "Sem 1", ingresos: 450000, egresos: 320000, neto: 130000 },
  { semana: "Sem 2", ingresos: 380000, egresos: 290000, neto: 90000 },
  { semana: "Sem 3", ingresos: 520000, egresos: 410000, neto: 110000 },
  { semana: "Sem 4", ingresos: 340000, egresos: 380000, neto: -40000 },
]

export default function TesoreriaPage() {
  const totalSaldo = cuentasBancarias.reduce((sum, cuenta) => {
    if (cuenta.moneda === "USD") {
      return sum + cuenta.saldo * 17.5 // Tipo de cambio aproximado
    }
    return sum + cuenta.saldo
  }, 0)

  const ingresosMes = movimientosRecientes
    .filter((mov) => mov.tipo === "Ingreso")
    .reduce((sum, mov) => sum + mov.monto, 0)

  const egresosMes = Math.abs(
    movimientosRecientes.filter((mov) => mov.tipo === "Egreso").reduce((sum, mov) => sum + mov.monto, 0),
  )

  const flujoNeto = ingresosMes - egresosMes

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tesorería</h1>
          <p className="text-muted-foreground">Gestión de caja, bancos y flujo de efectivo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Conciliar Bancos</Button>
          <Button>Nuevo Movimiento</Button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSaldo.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">En {cuentasBancarias.length} cuentas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${ingresosMes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% vs mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egresos del Mes</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${egresosMes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">-5% vs mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flujo Neto</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${flujoNeto >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${flujoNeto.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cuentas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cuentas">Cuentas Bancarias</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
          <TabsTrigger value="proyeccion">Proyección</TabsTrigger>
        </TabsList>

        <TabsContent value="cuentas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {cuentasBancarias.map((cuenta) => (
              <Card key={cuenta.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{cuenta.banco}</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${cuenta.saldo.toLocaleString()} {cuenta.moneda}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {cuenta.tipo} • {cuenta.numero}
                  </p>
                  <div className="mt-2">
                    <Badge variant={cuenta.estado === "Activa" ? "default" : "secondary"}>{cuenta.estado}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="movimientos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Movimientos Recientes</CardTitle>
              <CardDescription>Últimas transacciones registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Cuenta</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimientosRecientes.map((movimiento) => (
                    <TableRow key={movimiento.id}>
                      <TableCell>{movimiento.fecha}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {movimiento.tipo === "Ingreso" ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          )}
                          {movimiento.concepto}
                        </div>
                      </TableCell>
                      <TableCell>{movimiento.cuenta}</TableCell>
                      <TableCell>{movimiento.referencia}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          movimiento.monto >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        ${Math.abs(movimiento.monto).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proyeccion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proyección de Flujo de Efectivo</CardTitle>
              <CardDescription>Estimación para las próximas 4 semanas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proyeccionFlujo.map((semana, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{semana.semana}</span>
                      <span className={`font-bold ${semana.neto >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ${semana.neto.toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Ingresos: </span>
                        <span className="text-green-600">${semana.ingresos.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Egresos: </span>
                        <span className="text-red-600">${semana.egresos.toLocaleString()}</span>
                      </div>
                    </div>
                    <Progress value={semana.neto >= 0 ? 100 : 0} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
