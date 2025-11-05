"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const antiguedadData = [
  { periodo: "0-30 días", cobrar: 45000, pagar: 32000, color: "#22c55e" },
  { periodo: "31-60 días", cobrar: 28000, pagar: 18000, color: "#eab308" },
  { periodo: "61-90 días", cobrar: 15000, pagar: 12000, color: "#f97316" },
  { periodo: "91-120 días", cobrar: 8000, pagar: 5000, color: "#ef4444" },
  { periodo: "Más de 120 días", cobrar: 12000, pagar: 8000, color: "#991b1b" },
]

const clientesVencidos = [
  {
    cliente: "Constructora ABC S.A.",
    factura: "F-2023-145",
    monto: 15000,
    diasVencido: 45,
    categoria: "31-60 días",
  },
  {
    cliente: "Empresa XYZ Ltda.",
    factura: "F-2023-132",
    monto: 8500,
    diasVencido: 75,
    categoria: "61-90 días",
  },
  {
    cliente: "Comercial DEF S.A.",
    factura: "F-2023-098",
    monto: 22000,
    diasVencido: 15,
    categoria: "0-30 días",
  },
  {
    cliente: "Industrias GHI",
    factura: "F-2023-156",
    monto: 12000,
    diasVencido: 95,
    categoria: "91-120 días",
  },
  {
    cliente: "Servicios JKL",
    factura: "F-2023-089",
    monto: 6800,
    diasVencido: 135,
    categoria: "Más de 120 días",
  },
]

export default function AntiguedadPage() {
  const totalCobrar = antiguedadData.reduce((sum, item) => sum + item.cobrar, 0)
  const totalPagar = antiguedadData.reduce((sum, item) => sum + item.pagar, 0)
  const vencidoCobrar = antiguedadData.slice(1).reduce((sum, item) => sum + item.cobrar, 0)
  const vencidoPagar = antiguedadData.slice(1).reduce((sum, item) => sum + item.pagar, 0)

  const getCategoriaColor = (categoria: string) => {
    const colors = {
      "0-30 días": "bg-green-100 text-green-800",
      "31-60 días": "bg-yellow-100 text-yellow-800",
      "61-90 días": "bg-orange-100 text-orange-800",
      "91-120 días": "bg-red-100 text-red-800",
      "Más de 120 días": "bg-red-200 text-red-900",
    }
    return colors[categoria as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Antigüedad de Saldos</h1>
          <p className="text-muted-foreground">Análisis de cuentas por cobrar y pagar por períodos de vencimiento</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="enero">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enero">Enero 2024</SelectItem>
              <SelectItem value="febrero">Febrero 2024</SelectItem>
              <SelectItem value="marzo">Marzo 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCobrar.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Todas las categorías</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total por Pagar</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPagar.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Todas las categorías</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencido por Cobrar</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${vencidoCobrar.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((vencidoCobrar / totalCobrar) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencido por Pagar</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${vencidoPagar.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{((vencidoPagar / totalPagar) * 100).toFixed(1)}% del total</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Períodos</CardTitle>
            <CardDescription>Comparativo de cuentas por cobrar vs pagar</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={antiguedadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
                <Bar dataKey="cobrar" fill="#3b82f6" name="Por Cobrar" />
                <Bar dataKey="pagar" fill="#ef4444" name="Por Pagar" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Composición por Cobrar</CardTitle>
            <CardDescription>Distribución porcentual por períodos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={antiguedadData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="cobrar"
                  label={({ periodo, percent }) => `${periodo}: ${(percent * 100).toFixed(0)}%`}
                >
                  {antiguedadData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Monto"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla detallada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Cuentas Vencidas</CardTitle>
          <CardDescription>Clientes con facturas pendientes de cobro</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Factura</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Días Vencido</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesVencidos.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.cliente}</TableCell>
                  <TableCell>{item.factura}</TableCell>
                  <TableCell>${item.monto.toLocaleString()}</TableCell>
                  <TableCell>{item.diasVencido} días</TableCell>
                  <TableCell>
                    <Badge className={getCategoriaColor(item.categoria)}>{item.categoria}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Gestionar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
