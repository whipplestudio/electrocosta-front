"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { TrendingUp, TrendingDown, Download } from "lucide-react"

export default function ComparativoPage() {
  const monthlyData = [
    { month: "Ene", actual: 850000, budget: 800000, previous: 750000 },
    { month: "Feb", actual: 920000, budget: 850000, previous: 800000 },
    { month: "Mar", actual: 780000, budget: 900000, previous: 850000 },
    { month: "Abr", actual: 1100000, budget: 950000, previous: 900000 },
    { month: "May", actual: 1250000, budget: 1000000, previous: 950000 },
    { month: "Jun", actual: 1180000, budget: 1100000, previous: 1000000 },
  ]

  const categoryData = [
    { name: "Ventas", value: 65, color: "#3b82f6" },
    { name: "Servicios", value: 25, color: "#10b981" },
    { name: "Otros", value: 10, color: "#f59e0b" },
  ]

  const kpiComparison = [
    {
      metric: "Ingresos Totales",
      actual: "$6,080,000",
      budget: "$5,600,000",
      previous: "$5,250,000",
      variance: "+8.6%",
      trend: "up",
    },
    {
      metric: "Gastos Operativos",
      actual: "$4,250,000",
      budget: "$4,200,000",
      previous: "$4,100,000",
      variance: "+1.2%",
      trend: "up",
    },
    {
      metric: "EBITDA",
      actual: "$1,830,000",
      budget: "$1,400,000",
      previous: "$1,150,000",
      variance: "+30.7%",
      trend: "up",
    },
    {
      metric: "Flujo de Caja",
      actual: "$1,520,000",
      budget: "$1,200,000",
      previous: "$980,000",
      variance: "+26.7%",
      trend: "up",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Análisis Comparativo</h1>
          <p className="text-muted-foreground">Comparación de resultados vs presupuesto y año anterior</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="2024">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiComparison.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{kpi.metric}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-bold">{kpi.actual}</div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Presupuesto:</span>
                  <span>{kpi.budget}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Año anterior:</span>
                  <span>{kpi.previous}</span>
                </div>
              </div>
              <Badge className={`${kpi.trend === "up" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {kpi.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {kpi.variance}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolución Mensual</CardTitle>
            <CardDescription>Comparación actual vs presupuesto vs año anterior</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
                <Bar dataKey="budget" fill="#10b981" name="Presupuesto" />
                <Bar dataKey="previous" fill="#f59e0b" name="Año Anterior" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Ingresos</CardTitle>
            <CardDescription>Composición por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tendencia Anual</CardTitle>
          <CardDescription>Comparación de métricas clave por trimestre</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={[
                { quarter: "Q1 2023", ingresos: 2200000, gastos: 1800000, ebitda: 400000 },
                { quarter: "Q2 2023", ingresos: 2400000, gastos: 1900000, ebitda: 500000 },
                { quarter: "Q3 2023", ingresos: 2600000, gastos: 2000000, ebitda: 600000 },
                { quarter: "Q4 2023", ingresos: 2800000, gastos: 2100000, ebitda: 700000 },
                { quarter: "Q1 2024", ingresos: 2550000, gastos: 2050000, ebitda: 500000 },
                { quarter: "Q2 2024", ingresos: 3530000, gastos: 2200000, ebitda: 1330000 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
              <Line type="monotone" dataKey="ingresos" stroke="#3b82f6" strokeWidth={2} name="Ingresos" />
              <Line type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2} name="Gastos" />
              <Line type="monotone" dataKey="ebitda" stroke="#10b981" strokeWidth={2} name="EBITDA" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
