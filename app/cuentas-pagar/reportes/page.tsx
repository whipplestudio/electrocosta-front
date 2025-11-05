"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Download, AlertTriangle, Clock, TrendingDown } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const vencimientosData = [
  {
    id: "CP-001",
    proveedor: "Suministros Eléctricos SA",
    factura: "FP-2024-001",
    monto: 45000,
    fechaVencimiento: "2024-01-20",
    diasVencimiento: 5,
    estado: "vencido",
    categoria: "Materiales",
  },
  {
    id: "CP-002",
    proveedor: "Transportes Rápidos",
    factura: "FP-2024-002",
    monto: 12500,
    fechaVencimiento: "2024-01-25",
    diasVencimiento: 0,
    estado: "hoy",
    categoria: "Servicios",
  },
  {
    id: "CP-003",
    proveedor: "Oficinas Modernas",
    factura: "FP-2024-003",
    monto: 8750,
    fechaVencimiento: "2024-01-27",
    diasVencimiento: -2,
    estado: "proximo",
    categoria: "Oficina",
  },
]

const chartDataVencimientos = [
  { name: "Vencido", value: 45000, color: "#ef4444" },
  { name: "Hoy", value: 12500, color: "#f97316" },
  { name: "Próximo", value: 8750, color: "#eab308" },
  { name: "Futuro", value: 125000, color: "#22c55e" },
]

const chartDataMensual = [
  { mes: "Oct", vencidos: 85000, pagados: 120000 },
  { mes: "Nov", vencidos: 67000, pagados: 145000 },
  { mes: "Dic", vencidos: 92000, pagados: 135000 },
  { mes: "Ene", vencidos: 66250, pagados: 0 },
]

const estadoBadgeVariant = {
  vencido: "destructive",
  hoy: "secondary",
  proximo: "default",
} as const

export default function ReportesCuentasPagar() {
  const [periodoFilter, setPeriodoFilter] = useState("mes_actual")
  const [categoriaFilter, setCategoriaFilter] = useState("todas")

  const totalVencido = vencimientosData
    .filter((item) => item.estado === "vencido")
    .reduce((sum, item) => sum + item.monto, 0)
  const totalHoy = vencimientosData.filter((item) => item.estado === "hoy").reduce((sum, item) => sum + item.monto, 0)
  const totalProximo = vencimientosData
    .filter((item) => item.estado === "proximo")
    .reduce((sum, item) => sum + item.monto, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes de Vencimientos</h1>
          <p className="text-muted-foreground">Análisis y seguimiento de cuentas por pagar</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencido</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${totalVencido.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pago inmediato requerido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vence Hoy</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">${totalHoy.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Programar pago hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos 7 días</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">${totalProximo.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Planificar pagos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mes</CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              ${(totalVencido + totalHoy + totalProximo).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Enero 2024</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vencimientos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vencimientos">Vencimientos</TabsTrigger>
          <TabsTrigger value="analisis">Análisis Temporal</TabsTrigger>
          <TabsTrigger value="categorias">Por Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="vencimientos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reporte de Vencimientos</CardTitle>
              <CardDescription>Cuentas por pagar organizadas por fecha de vencimiento</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              <div className="flex gap-4 mb-6">
                <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mes_actual">Mes actual</SelectItem>
                    <SelectItem value="trimestre">Trimestre</SelectItem>
                    <SelectItem value="semestre">Semestre</SelectItem>
                    <SelectItem value="año">Año completo</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las categorías</SelectItem>
                    <SelectItem value="Materiales">Materiales</SelectItem>
                    <SelectItem value="Servicios">Servicios</SelectItem>
                    <SelectItem value="Oficina">Oficina</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tabla de vencimientos */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Factura</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Días</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vencimientosData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.proveedor}</TableCell>
                        <TableCell>{item.factura}</TableCell>
                        <TableCell>${item.monto.toLocaleString()}</TableCell>
                        <TableCell>{item.fechaVencimiento}</TableCell>
                        <TableCell>
                          <Badge variant={estadoBadgeVariant[item.estado as keyof typeof estadoBadgeVariant]}>
                            {item.estado === "vencido" ? "Vencido" : item.estado === "hoy" ? "Vence Hoy" : "Próximo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.categoria}</TableCell>
                        <TableCell>
                          {item.diasVencimiento > 0
                            ? `+${item.diasVencimiento}`
                            : item.diasVencimiento < 0
                              ? item.diasVencimiento
                              : "0"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analisis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Vencimiento</CardTitle>
                <CardDescription>Montos por estado de vencimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartDataVencimientos}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartDataVencimientos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Monto"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendencia Mensual</CardTitle>
                <CardDescription>Vencidos vs Pagados por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartDataMensual}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
                    <Bar dataKey="vencidos" fill="#ef4444" name="Vencidos" />
                    <Bar dataKey="pagados" fill="#22c55e" name="Pagados" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categorias">
          <Card>
            <CardHeader>
              <CardTitle>Análisis por Categorías</CardTitle>
              <CardDescription>Distribución de pagos por tipo de gasto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Materiales</h3>
                    <p className="text-2xl font-bold">$45,000</p>
                    <p className="text-sm text-muted-foreground">68% del total</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Servicios</h3>
                    <p className="text-2xl font-bold">$12,500</p>
                    <p className="text-sm text-muted-foreground">19% del total</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Oficina</h3>
                    <p className="text-2xl font-bold">$8,750</p>
                    <p className="text-sm text-muted-foreground">13% del total</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
