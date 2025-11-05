"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, FileText, Download } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

// Datos de ejemplo basados en los requerimientos
const cuentasPorCobrarData = [
  { id: 1, cliente: "Constructora ABC", monto: 125000, vencimiento: "2025-01-15", estado: "Vencido", dias: 5 },
  { id: 2, cliente: "Desarrollos XYZ", monto: 85000, vencimiento: "2025-01-25", estado: "Próximo", dias: -5 },
  { id: 3, cliente: "Inmobiliaria DEF", monto: 200000, vencimiento: "2025-02-10", estado: "Vigente", dias: -21 },
  { id: 4, cliente: "Proyectos GHI", monto: 95000, vencimiento: "2025-01-30", estado: "Vigente", dias: -10 },
]

const cuentasPorPagarData = [
  {
    id: 1,
    proveedor: "Materiales Eléctricos SA",
    monto: 45000,
    vencimiento: "2025-01-18",
    estado: "Próximo",
    categoria: "Materiales",
  },
  {
    id: 2,
    proveedor: "Nómina Enero",
    monto: 180000,
    vencimiento: "2025-01-31",
    estado: "Vigente",
    categoria: "Nómina",
  },
  {
    id: 3,
    proveedor: "Servicios Técnicos",
    monto: 25000,
    vencimiento: "2025-01-22",
    estado: "Próximo",
    categoria: "Servicios",
  },
  {
    id: 4,
    proveedor: "Equipos Industriales",
    monto: 75000,
    vencimiento: "2025-02-05",
    estado: "Vigente",
    categoria: "Equipos",
  },
]

const chartData = [
  { mes: "Oct", cobrado: 450000, pagado: 320000 },
  { mes: "Nov", cobrado: 520000, pagado: 380000 },
  { mes: "Dic", cobrado: 480000, pagado: 420000 },
  { mes: "Ene", cobrado: 505000, pagado: 325000 },
]

const pieData = [
  { name: "Materiales", value: 45, color: "#164e63" },
  { name: "Nómina", value: 55, color: "#84cc16" },
  { name: "Servicios", value: 15, color: "#1d4ed8" },
  { name: "Equipos", value: 23, color: "#f97316" },
]

export default function FinancialDashboard() {
  const [filtroFecha, setFiltroFecha] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")

  const totalCobrar = cuentasPorCobrarData.reduce((sum, item) => sum + item.monto, 0)
  const totalPagar = cuentasPorPagarData.reduce((sum, item) => sum + item.monto, 0)
  const flujoEfectivo = totalCobrar - totalPagar
  const vencidos = cuentasPorCobrarData.filter((item) => item.estado === "Vencido").length

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Vencido":
        return <Badge variant="destructive">{estado}</Badge>
      case "Próximo":
        return <Badge className="bg-orange-500 hover:bg-orange-600">{estado}</Badge>
      case "Vigente":
        return <Badge className="bg-green-500 hover:bg-green-600">{estado}</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Financiero</h1>
            <p className="text-muted-foreground">Gestión de Cuentas por Pagar y Cobrar - Electro Costa</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
            <Button size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Nuevo Registro
            </Button>
          </div>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${totalCobrar.toLocaleString("es-MX")}</div>
              <p className="text-xs text-muted-foreground">+12% vs mes anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total por Pagar</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">${totalPagar.toLocaleString("es-MX")}</div>
              <p className="text-xs text-muted-foreground">-5% vs mes anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flujo de Efectivo</CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">${flujoEfectivo.toLocaleString("es-MX")}</div>
              <p className="text-xs text-muted-foreground">Balance proyectado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cuentas Vencidas</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{vencidos}</div>
              <p className="text-xs text-muted-foreground">Requieren atención inmediata</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Flujo de Efectivo Mensual</CardTitle>
              <CardDescription>Comparativo de ingresos vs egresos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString("es-MX")}`} />
                  <Bar dataKey="cobrado" fill="var(--color-primary)" name="Cobrado" />
                  <Bar dataKey="pagado" fill="var(--color-destructive)" name="Pagado" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribución de Gastos</CardTitle>
              <CardDescription>Por categoría de proveedor</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tables Section */}
        <Tabs defaultValue="cobrar" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cobrar">Cuentas por Cobrar</TabsTrigger>
            <TabsTrigger value="pagar">Cuentas por Pagar</TabsTrigger>
          </TabsList>

          <TabsContent value="cobrar" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle>Cuentas por Cobrar</CardTitle>
                    <CardDescription>Gestión de facturas pendientes de cobro</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar cliente..."
                      className="w-64"
                      value={filtroFecha}
                      onChange={(e) => setFiltroFecha(e.target.value)}
                    />
                    <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="vigente">Vigente</SelectItem>
                        <SelectItem value="proximo">Próximo</SelectItem>
                        <SelectItem value="vencido">Vencido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Cliente</th>
                        <th className="text-left p-2">Monto</th>
                        <th className="text-left p-2">Vencimiento</th>
                        <th className="text-left p-2">Estado</th>
                        <th className="text-left p-2">Días</th>
                        <th className="text-left p-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuentasPorCobrarData.map((cuenta) => (
                        <tr key={cuenta.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{cuenta.cliente}</td>
                          <td className="p-2">${cuenta.monto.toLocaleString("es-MX")}</td>
                          <td className="p-2">{cuenta.vencimiento}</td>
                          <td className="p-2">{getEstadoBadge(cuenta.estado)}</td>
                          <td className="p-2">
                            <span className={cuenta.dias > 0 ? "text-destructive" : "text-muted-foreground"}>
                              {cuenta.dias > 0 ? `+${cuenta.dias}` : cuenta.dias}
                            </span>
                          </td>
                          <td className="p-2">
                            <Button variant="outline" size="sm">
                              Ver Detalle
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pagar" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle>Cuentas por Pagar</CardTitle>
                    <CardDescription>Gestión de pagos a proveedores y nómina</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Buscar proveedor..." className="w-64" />
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas</SelectItem>
                        <SelectItem value="materiales">Materiales</SelectItem>
                        <SelectItem value="nomina">Nómina</SelectItem>
                        <SelectItem value="servicios">Servicios</SelectItem>
                        <SelectItem value="equipos">Equipos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Proveedor</th>
                        <th className="text-left p-2">Monto</th>
                        <th className="text-left p-2">Vencimiento</th>
                        <th className="text-left p-2">Estado</th>
                        <th className="text-left p-2">Categoría</th>
                        <th className="text-left p-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuentasPorPagarData.map((cuenta) => (
                        <tr key={cuenta.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{cuenta.proveedor}</td>
                          <td className="p-2">${cuenta.monto.toLocaleString("es-MX")}</td>
                          <td className="p-2">{cuenta.vencimiento}</td>
                          <td className="p-2">{getEstadoBadge(cuenta.estado)}</td>
                          <td className="p-2">
                            <Badge variant="outline">{cuenta.categoria}</Badge>
                          </td>
                          <td className="p-2">
                            <Button variant="outline" size="sm">
                              Programar Pago
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
