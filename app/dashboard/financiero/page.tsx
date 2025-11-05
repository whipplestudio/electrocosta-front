"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Calendar, Target } from "lucide-react"

const monthlyData = [
  { month: "Ene", ingresos: 850000, gastos: 620000, utilidad: 230000 },
  { month: "Feb", ingresos: 920000, gastos: 680000, utilidad: 240000 },
  { month: "Mar", ingresos: 780000, gastos: 590000, utilidad: 190000 },
  { month: "Abr", ingresos: 1100000, gastos: 750000, utilidad: 350000 },
  { month: "May", ingresos: 950000, gastos: 720000, utilidad: 230000 },
  { month: "Jun", ingresos: 1200000, gastos: 800000, utilidad: 400000 },
]

const cashFlowData = [
  { day: "Lun", entrada: 45000, salida: 32000 },
  { day: "Mar", entrada: 52000, salida: 28000 },
  { day: "Mié", entrada: 38000, salida: 45000 },
  { day: "Jue", entrada: 61000, salida: 35000 },
  { day: "Vie", entrada: 48000, salida: 42000 },
]

const expenseCategories = [
  { name: "Nómina", value: 45, color: "#0088FE" },
  { name: "Materiales", value: 30, color: "#00C49F" },
  { name: "Servicios", value: 15, color: "#FFBB28" },
  { name: "Otros", value: 10, color: "#FF8042" },
]

export default function DashboardFinanciero() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Financiero</h2>
          <p className="text-muted-foreground">Análisis detallado de la situación financiera</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            Junio 2024
          </Badge>
        </div>
      </div>

      {/* KPIs Financieros */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,200,000</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> vs mes anterior
            </p>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos del Mes</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$800,000</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+8.2%</span> vs mes anterior
            </p>
            <Progress value={60} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$400,000</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+18.7%</span> vs mes anterior
            </p>
            <Progress value={80} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen de Utilidad</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">33.3%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> vs mes anterior
            </p>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="cashflow">Flujo de Efectivo</TabsTrigger>
          <TabsTrigger value="expenses">Análisis de Gastos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tendencia Financiera (6 meses)</CardTitle>
                <CardDescription>Ingresos, gastos y utilidad mensual</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="ingresos" fill="#0088FE" name="Ingresos" />
                    <Bar dataKey="gastos" fill="#FF8042" name="Gastos" />
                    <Bar dataKey="utilidad" fill="#00C49F" name="Utilidad" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indicadores Clave</CardTitle>
                <CardDescription>Métricas financieras importantes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ROI Mensual</span>
                  <Badge variant="secondary">15.2%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Liquidez Corriente</span>
                  <Badge variant="secondary">2.8</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rotación de Inventario</span>
                  <Badge variant="secondary">4.2x</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Días de Cobranza</span>
                  <Badge variant="destructive">45 días</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Días de Pago</span>
                  <Badge variant="secondary">30 días</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flujo de Efectivo Semanal</CardTitle>
              <CardDescription>Entradas y salidas de efectivo por día</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Line type="monotone" dataKey="entrada" stroke="#00C49F" strokeWidth={2} name="Entradas" />
                  <Line type="monotone" dataKey="salida" stroke="#FF8042" strokeWidth={2} name="Salidas" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Gastos</CardTitle>
                <CardDescription>Porcentaje por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas Financieras</CardTitle>
                <CardDescription>Situaciones que requieren atención</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Días de cobranza elevados</p>
                    <p className="text-xs text-muted-foreground">45 días promedio, objetivo: 30 días</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Gastos operativos aumentaron</p>
                    <p className="text-xs text-muted-foreground">8.2% vs mes anterior</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Margen de utilidad mejoró</p>
                    <p className="text-xs text-muted-foreground">33.3%, +2.1% vs mes anterior</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
