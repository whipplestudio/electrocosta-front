"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Target, Calendar } from "lucide-react"

export default function KPIsPage() {
  const kpis = [
    {
      title: "Liquidez Corriente",
      value: "2.45",
      target: "2.00",
      status: "good",
      trend: "up",
      change: "+12%",
      description: "Activo corriente / Pasivo corriente",
    },
    {
      title: "Rotación de Cartera",
      value: "45 días",
      target: "30 días",
      status: "warning",
      trend: "down",
      change: "-5 días",
      description: "Tiempo promedio de cobro",
    },
    {
      title: "Margen EBITDA",
      value: "18.5%",
      target: "20%",
      status: "warning",
      trend: "up",
      change: "+2.1%",
      description: "Rentabilidad operativa",
    },
    {
      title: "ROE",
      value: "15.2%",
      target: "12%",
      status: "good",
      trend: "up",
      change: "+3.2%",
      description: "Retorno sobre patrimonio",
    },
    {
      title: "Endeudamiento",
      value: "35%",
      target: "40%",
      status: "good",
      trend: "down",
      change: "-2%",
      description: "Pasivo total / Activo total",
    },
    {
      title: "Cobertura de Intereses",
      value: "8.5x",
      target: "5.0x",
      status: "good",
      trend: "up",
      change: "+1.2x",
      description: "EBIT / Gastos financieros",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600 bg-green-50"
      case "warning":
        return "text-yellow-600 bg-yellow-50"
      case "danger":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">KPIs Financieros</h1>
          <p className="text-muted-foreground">Indicadores clave de rendimiento financiero</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Actualizado: Hoy 09:30
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Badge className={getStatusColor(kpi.status)}>
                  {kpi.status === "good" ? "Óptimo" : kpi.status === "warning" ? "Atención" : "Crítico"}
                </Badge>
              </div>
              <CardDescription className="text-xs">{kpi.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    kpi.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {getTrendIcon(kpi.trend)}
                  {kpi.change}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Meta:</span>
                  <span className="font-medium">{kpi.target}</span>
                </div>
                <Progress value={kpi.status === "good" ? 85 : kpi.status === "warning" ? 65 : 35} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Objetivos del Mes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Reducir días de cartera</span>
                <Badge variant="outline">75%</Badge>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Aumentar margen EBITDA</span>
                <Badge variant="outline">60%</Badge>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Optimizar flujo de caja</span>
                <Badge variant="outline">90%</Badge>
              </div>
              <Progress value={90} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Financieras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Rotación de cartera elevada</p>
                <p className="text-muted-foreground">45 días vs meta de 30 días</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Cuentas vencidas &gt; 90 días</p>
                <p className="text-muted-foreground">$125,000 requiere atención</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Liquidez en niveles óptimos</p>
                <p className="text-muted-foreground">2.45x por encima de la meta</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
