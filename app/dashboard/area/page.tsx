"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Briefcase } from "lucide-react"

const salesData = [
  { mes: "Ene", ventas: 450000, meta: 400000, clientes: 12 },
  { mes: "Feb", ventas: 520000, meta: 450000, clientes: 15 },
  { mes: "Mar", ventas: 380000, meta: 420000, clientes: 10 },
  { mes: "Abr", ventas: 680000, meta: 500000, clientes: 18 },
  { mes: "May", ventas: 590000, meta: 550000, clientes: 16 },
  { mes: "Jun", ventas: 720000, meta: 600000, clientes: 20 },
]

const projectsData = [
  { mes: "Ene", proyectos: 8, completados: 6, ingresos: 320000 },
  { mes: "Feb", proyectos: 10, completados: 8, ingresos: 420000 },
  { mes: "Mar", proyectos: 7, completados: 5, ingresos: 280000 },
  { mes: "Abr", proyectos: 12, completados: 10, ingresos: 580000 },
  { mes: "May", proyecesos: 9, completados: 7, ingresos: 380000 },
  { mes: "Jun", proyectos: 14, completados: 12, ingresos: 650000 },
]

const expensesData = [
  { categoria: "Nómina", monto: 180000, presupuesto: 200000 },
  { categoria: "Materiales", monto: 120000, presupuesto: 150000 },
  { categoria: "Servicios", monto: 45000, presupuesto: 50000 },
  { categoria: "Transporte", monto: 25000, presupuesto: 30000 },
]

export default function DashboardArea() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard por Área</h2>
          <p className="text-muted-foreground">Análisis de rendimiento por departamento</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Junio 2024</Badge>
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="projects">Proyectos</TabsTrigger>
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          {/* KPIs de Ventas */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$720,000</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+20%</span> vs meta
                </p>
                <Progress value={120} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Nuevos</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">20</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+25%</span> vs mes anterior
                </p>
                <Progress value={85} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                <Target className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$36,000</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600">-5%</span> vs mes anterior
                </p>
                <Progress value={70} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversión</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+3%</span> vs mes anterior
                </p>
                <Progress value={68} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Ventas vs Meta</CardTitle>
                <CardDescription>Comparativo mensual de ventas y objetivos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="ventas" fill="#0088FE" name="Ventas" />
                    <Bar dataKey="meta" fill="#00C49F" name="Meta" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clientes por Mes</CardTitle>
                <CardDescription>Evolución de clientes nuevos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="clientes" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          {/* KPIs de Proyectos */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
                <Briefcase className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">14</div>
                <p className="text-xs text-muted-foreground">2 iniciados esta semana</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completados</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">86%</span> tasa de éxito
                </p>
                <Progress value={86} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Proyectos</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$650,000</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+71%</span> vs mes anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                <TrendingDown className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45 días</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">-5 días</span> vs mes anterior
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rendimiento de Proyectos</CardTitle>
              <CardDescription>Proyectos iniciados vs completados por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="proyectos" fill="#0088FE" name="Iniciados" />
                  <Bar dataKey="completados" fill="#00C49F" name="Completados" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          {/* KPIs de Gastos */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$370,000</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">-14%</span> vs presupuesto
                </p>
                <Progress value={86} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Presupuesto Usado</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">86%</div>
                <p className="text-xs text-muted-foreground">$60,000 disponibles</p>
                <Progress value={86} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mayor Gasto</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Nómina</div>
                <p className="text-xs text-muted-foreground">$180,000 (49%)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+5%</span> vs mes anterior
                </p>
                <Progress value={92} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gastos vs Presupuesto por Categoría</CardTitle>
              <CardDescription>Comparativo de gastos reales contra presupuesto asignado</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expensesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="monto" fill="#FF8042" name="Gasto Real" />
                  <Bar dataKey="presupuesto" fill="#0088FE" name="Presupuesto" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
