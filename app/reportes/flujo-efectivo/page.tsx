"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Calendar, TrendingUp, TrendingDown } from "lucide-react"

const datosFlujo = [
  { mes: "Enero", ingresos: 450000, egresos: 320000, flujo: 130000 },
  { mes: "Febrero", ingresos: 520000, egresos: 380000, flujo: 140000 },
  { mes: "Marzo", ingresos: 480000, egresos: 350000, flujo: 130000 },
]

export default function FlujoEfectivo() {
  const [periodo, setPeriodo] = useState("2024")

  const totalIngresos = datosFlujo.reduce((sum, item) => sum + item.ingresos, 0)
  const totalEgresos = datosFlujo.reduce((sum, item) => sum + item.egresos, 0)
  const flujoNeto = totalIngresos - totalEgresos

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Reporte de Flujo de Efectivo</h1>
        </div>
        <div className="flex gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalIngresos.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Período seleccionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalEgresos.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Período seleccionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flujo Neto</CardTitle>
            <Badge variant={flujoNeto > 0 ? "default" : "destructive"}>{flujoNeto > 0 ? "Positivo" : "Negativo"}</Badge>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${flujoNeto > 0 ? "text-green-600" : "text-red-600"}`}>
              ${flujoNeto.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Diferencia neta</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {datosFlujo.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{item.mes}</h4>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos</p>
                  <p className="font-semibold text-green-600">${item.ingresos.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Egresos</p>
                  <p className="font-semibold text-red-600">${item.egresos.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Flujo</p>
                  <p className={`font-semibold ${item.flujo > 0 ? "text-green-600" : "text-red-600"}`}>
                    ${item.flujo.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
