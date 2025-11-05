"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, FileText, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Ejecutivo</h1>
          <p className="text-muted-foreground">Resumen general del estado financiero de Electro Costa</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Actualizado: Hoy 10:15
        </Badge>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,847,500</div>
            <p className="text-xs text-muted-foreground">+12% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total por Pagar</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,234,800</div>
            <p className="text-xs text-muted-foreground">-5% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flujo Neto</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$1,612,700</div>
            <p className="text-xs text-muted-foreground">Positivo este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">8</div>
            <p className="text-xs text-muted-foreground">Cuentas vencidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Resumen General
            </CardTitle>
            <CardDescription>Vista consolidada de métricas principales</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/resumen">
              <Button className="w-full">
                Ver Resumen
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              KPIs Financieros
            </CardTitle>
            <CardDescription>Indicadores clave de rendimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/kpis">
              <Button className="w-full">
                Ver KPIs
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Análisis Comparativo
            </CardTitle>
            <CardDescription>Comparación vs presupuesto y períodos anteriores</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/comparativo">
              <Button className="w-full">
                Ver Comparativo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas transacciones y movimientos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Pago recibido - Constructora ABC</p>
                <p className="text-sm text-muted-foreground">Hace 2 horas</p>
              </div>
              <Badge className="bg-green-100 text-green-800">$150,000</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">Factura emitida - Empresa XYZ</p>
                <p className="text-sm text-muted-foreground">Hace 4 horas</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">$85,000</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium">Cuenta vencida - Comercial DEF</p>
                <p className="text-sm text-muted-foreground">Hace 1 día</p>
              </div>
              <Badge variant="destructive">$75,000</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>Resumen de módulos y usuarios activos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Usuarios conectados</span>
              <Badge className="bg-green-100 text-green-800">12 activos</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cuentas por cobrar</span>
              <Badge variant="outline">45 registros</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cuentas por pagar</span>
              <Badge variant="outline">28 registros</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Reportes generados hoy</span>
              <Badge variant="outline">8 reportes</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Última sincronización</span>
              <Badge variant="secondary">10:15 AM</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
