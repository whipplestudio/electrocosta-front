"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Download, RefreshCw } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const proyeccionSemanal = [
  { semana: "Sem 1", entradas: 450000, salidas: 380000, flujo: 70000, saldoAcumulado: 3920000 },
  { semana: "Sem 2", entradas: 520000, salidas: 420000, flujo: 100000, saldoAcumulado: 4020000 },
  { semana: "Sem 3", entradas: 380000, salidas: 450000, flujo: -70000, saldoAcumulado: 3950000 },
  { semana: "Sem 4", entradas: 600000, salidas: 380000, flujo: 220000, saldoAcumulado: 4170000 },
]

const proyeccionMensual = [
  { mes: "Feb", entradas: 1950000, salidas: 1630000, flujo: 320000, saldoAcumulado: 4170000 },
  { mes: "Mar", entradas: 2100000, salidas: 1750000, flujo: 350000, saldoAcumulado: 4520000 },
  { mes: "Abr", entradas: 1850000, salidas: 1680000, flujo: 170000, saldoAcumulado: 4690000 },
  { mes: "May", entradas: 2200000, salidas: 1800000, flujo: 400000, saldoAcumulado: 5090000 },
  { mes: "Jun", entradas: 2050000, salidas: 1720000, flujo: 330000, saldoAcumulado: 5420000 },
]

const entradasProgramadas = [
  {
    id: 1,
    fecha: "2024-02-05",
    concepto: "Cobro Cliente ABC Corp - Factura 001",
    monto: 125000,
    probabilidad: 95,
    categoria: "Clientes",
    estado: "Confirmado",
  },
  {
    id: 2,
    fecha: "2024-02-08",
    concepto: "Cobro Cliente XYZ SA - Factura 002",
    monto: 85000,
    probabilidad: 80,
    categoria: "Clientes",
    estado: "Probable",
  },
  {
    id: 3,
    fecha: "2024-02-12",
    concepto: "Cobro Proyecto Instalación Norte",
    monto: 350000,
    probabilidad: 90,
    categoria: "Proyectos",
    estado: "Confirmado",
  },
  {
    id: 4,
    fecha: "2024-02-15",
    concepto: "Cobro Cliente DEF Ltda - Factura 003",
    monto: 65000,
    probabilidad: 70,
    categoria: "Clientes",
    estado: "Incierto",
  },
]

const salidasProgramadas = [
  {
    id: 1,
    fecha: "2024-02-03",
    concepto: "Pago Proveedor Distribuidora Norte",
    monto: 180000,
    categoria: "Proveedores",
    estado: "Programado",
    prioridad: "Alta",
  },
  {
    id: 2,
    fecha: "2024-02-15",
    concepto: "Pago Nómina Febrero 2024",
    monto: 185000,
    categoria: "Nómina",
    estado: "Programado",
    prioridad: "Alta",
  },
  {
    id: 3,
    fecha: "2024-02-20",
    concepto: "Pago Servicios - Electricidad",
    monto: 25000,
    categoria: "Servicios",
    estado: "Programado",
    prioridad: "Media",
  },
  {
    id: 4,
    fecha: "2024-02-25",
    concepto: "Pago Renta Oficinas",
    monto: 45000,
    categoria: "Gastos Fijos",
    estado: "Programado",
    prioridad: "Alta",
  },
]

export default function ProyeccionFlujoPage() {
  const [periodoProyeccion, setPeriodoProyeccion] = useState("mensual")
  const [tipoVista, setTipoVista] = useState("grafico")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  const getProbabilityColor = (probabilidad: number) => {
    if (probabilidad >= 90) return "text-green-600"
    if (probabilidad >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getPriorityBadge = (prioridad: string) => {
    const variants = {
      Alta: "bg-red-100 text-red-800",
      Media: "bg-yellow-100 text-yellow-800",
      Baja: "bg-green-100 text-green-800",
    }
    return variants[prioridad as keyof typeof variants] || variants["Media"]
  }

  const getStatusBadge = (estado: string) => {
    const variants = {
      Confirmado: "bg-green-100 text-green-800",
      Probable: "bg-blue-100 text-blue-800",
      Incierto: "bg-yellow-100 text-yellow-800",
      Programado: "bg-blue-100 text-blue-800",
    }
    return variants[estado as keyof typeof variants] || variants["Probable"]
  }

  // Cálculos de resumen
  const totalEntradasProgramadas = entradasProgramadas.reduce((sum, entrada) => sum + entrada.monto, 0)
  const totalSalidasProgramadas = salidasProgramadas.reduce((sum, salida) => sum + salida.monto, 0)
  const flujoProyectado = totalEntradasProgramadas - totalSalidasProgramadas
  const saldoActual = 3850000
  const saldoProyectado = saldoActual + flujoProyectado

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Proyección de Flujo de Efectivo</h1>
          <p className="text-muted-foreground">Análisis y proyección de entradas y salidas de efectivo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Proyección
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar Datos
          </Button>
        </div>
      </div>

      {/* KPIs de Proyección */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Actual</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(saldoActual)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entradas Programadas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEntradasProgramadas)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Salidas Programadas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSalidasProgramadas)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Proyectado</p>
                <p
                  className={`text-2xl font-bold ${saldoProyectado >= saldoActual ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(saldoProyectado)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="proyeccion" className="space-y-4">
        <TabsList>
          <TabsTrigger value="proyeccion">Proyección</TabsTrigger>
          <TabsTrigger value="entradas">Entradas Programadas</TabsTrigger>
          <TabsTrigger value="salidas">Salidas Programadas</TabsTrigger>
        </TabsList>

        <TabsContent value="proyeccion" className="space-y-4">
          {/* Controles de Proyección */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={periodoProyeccion} onValueChange={setPeriodoProyeccion}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semanal">Proyección Semanal</SelectItem>
                    <SelectItem value="mensual">Proyección Mensual</SelectItem>
                    <SelectItem value="trimestral">Proyección Trimestral</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={tipoVista} onValueChange={setTipoVista}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tipo de Vista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grafico">Vista Gráfica</SelectItem>
                    <SelectItem value="tabla">Vista Tabla</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Proyección */}
          <Card>
            <CardHeader>
              <CardTitle>Proyección de Flujo de Efectivo</CardTitle>
              <CardDescription>
                {periodoProyeccion === "semanal" ? "Proyección semanal" : "Proyección mensual"} de entradas, salidas y
                saldo acumulado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tipoVista === "grafico" ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={periodoProyeccion === "semanal" ? proyeccionSemanal : proyeccionMensual}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={periodoProyeccion === "semanal" ? "semana" : "mes"} />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={2} name="Entradas" />
                      <Line type="monotone" dataKey="salidas" stroke="#ef4444" strokeWidth={2} name="Salidas" />
                      <Line
                        type="monotone"
                        dataKey="saldoAcumulado"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        name="Saldo Acumulado"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{periodoProyeccion === "semanal" ? "Semana" : "Mes"}</TableHead>
                      <TableHead>Entradas</TableHead>
                      <TableHead>Salidas</TableHead>
                      <TableHead>Flujo Neto</TableHead>
                      <TableHead>Saldo Acumulado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(periodoProyeccion === "semanal" ? proyeccionSemanal : proyeccionMensual).map((periodo, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {periodoProyeccion === "semanal" ? periodo.semana : periodo.mes}
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">{formatCurrency(periodo.entradas)}</TableCell>
                        <TableCell className="text-red-600 font-medium">{formatCurrency(periodo.salidas)}</TableCell>
                        <TableCell className={`font-medium ${periodo.flujo >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatCurrency(periodo.flujo)}
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(periodo.saldoAcumulado)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entradas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Entradas Programadas</CardTitle>
              <CardDescription>Cobros y entradas de efectivo programadas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Probabilidad</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entradasProgramadas.map((entrada) => (
                    <TableRow key={entrada.id}>
                      <TableCell>{entrada.fecha}</TableCell>
                      <TableCell>
                        <p className="font-medium">{entrada.concepto}</p>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">{formatCurrency(entrada.monto)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className={getProbabilityColor(entrada.probabilidad)}>{entrada.probabilidad}%</span>
                          </div>
                          <Progress value={entrada.probabilidad} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entrada.categoria}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(entrada.estado)}>{entrada.estado}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salidas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Salidas Programadas</CardTitle>
              <CardDescription>Pagos y salidas de efectivo programadas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salidasProgramadas.map((salida) => (
                    <TableRow key={salida.id}>
                      <TableCell>{salida.fecha}</TableCell>
                      <TableCell>
                        <p className="font-medium">{salida.concepto}</p>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-red-600">{formatCurrency(salida.monto)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{salida.categoria}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityBadge(salida.prioridad)}>{salida.prioridad}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(salida.estado)}>{salida.estado}</Badge>
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
