"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, TrendingUp, DollarSign, Percent } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

const estadoResultados = {
  ingresos: {
    ventasNetas: 850000,
    otrosIngresos: 25000,
    total: 875000,
  },
  costos: {
    costoVentas: 425000,
    total: 425000,
  },
  utilidadBruta: 450000,
  gastosOperativos: {
    gastosVentas: 120000,
    gastosAdministrativos: 95000,
    gastosGenerales: 35000,
    total: 250000,
  },
  utilidadOperativa: 200000,
  otrosGastos: {
    gastosFinancieros: 15000,
    otrosGastos: 8000,
    total: 23000,
  },
  utilidadAntesImpuestos: 177000,
  impuestos: 35400,
  utilidadNeta: 141600,
}

const comparativoMensual = [
  { mes: "Ene", ingresos: 75000, gastos: 45000, utilidad: 30000 },
  { mes: "Feb", ingresos: 82000, gastos: 48000, utilidad: 34000 },
  { mes: "Mar", ingresos: 78000, gastos: 46000, utilidad: 32000 },
  { mes: "Abr", ingresos: 85000, gastos: 52000, utilidad: 33000 },
  { mes: "May", ingresos: 92000, gastos: 55000, utilidad: 37000 },
  { mes: "Jun", ingresos: 88000, gastos: 53000, utilidad: 35000 },
]

const ratiosFinancieros = [
  {
    concepto: "Margen Bruto",
    valor: ((estadoResultados.utilidadBruta / estadoResultados.ingresos.total) * 100).toFixed(1),
    tipo: "porcentaje",
  },
  {
    concepto: "Margen Operativo",
    valor: ((estadoResultados.utilidadOperativa / estadoResultados.ingresos.total) * 100).toFixed(1),
    tipo: "porcentaje",
  },
  {
    concepto: "Margen Neto",
    valor: ((estadoResultados.utilidadNeta / estadoResultados.ingresos.total) * 100).toFixed(1),
    tipo: "porcentaje",
  },
  { concepto: "ROI", valor: "18.5", tipo: "porcentaje" },
]

export default function EstadoResultadosPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getVariationBadge = (current: number, previous: number) => {
    const variation = ((current - previous) / previous) * 100
    const isPositive = variation > 0
    return (
      <Badge
        variant={isPositive ? "default" : "destructive"}
        className={isPositive ? "bg-green-100 text-green-800" : ""}
      >
        {isPositive ? "+" : ""}
        {variation.toFixed(1)}%
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Estado de Resultados</h1>
          <p className="text-muted-foreground">Análisis de ingresos, gastos y rentabilidad</p>
        </div>
        <div className="flex gap-2">
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
          <Select defaultValue="anual">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anual">Anual</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="mensual">Mensual</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(estadoResultados.ingresos.total)}</div>
            <div className="flex items-center gap-2 mt-1">
              {getVariationBadge(875000, 820000)}
              <p className="text-xs text-muted-foreground">vs período anterior</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilidad Bruta</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(estadoResultados.utilidadBruta)}</div>
            <div className="flex items-center gap-2 mt-1">
              {getVariationBadge(450000, 425000)}
              <p className="text-xs text-muted-foreground">vs período anterior</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilidad Operativa</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(estadoResultados.utilidadOperativa)}</div>
            <div className="flex items-center gap-2 mt-1">
              {getVariationBadge(200000, 185000)}
              <p className="text-xs text-muted-foreground">vs período anterior</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(estadoResultados.utilidadNeta)}</div>
            <div className="flex items-center gap-2 mt-1">
              {getVariationBadge(141600, 128000)}
              <p className="text-xs text-muted-foreground">vs período anterior</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Mensual</CardTitle>
            <CardDescription>Evolución de ingresos, gastos y utilidad</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={comparativoMensual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
                <Line type="monotone" dataKey="ingresos" stroke="#3b82f6" name="Ingresos" strokeWidth={2} />
                <Line type="monotone" dataKey="gastos" stroke="#ef4444" name="Gastos" strokeWidth={2} />
                <Line type="monotone" dataKey="utilidad" stroke="#22c55e" name="Utilidad" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Composición de Gastos</CardTitle>
            <CardDescription>Distribución de gastos operativos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { categoria: "Ventas", monto: estadoResultados.gastosOperativos.gastosVentas },
                  { categoria: "Administrativos", monto: estadoResultados.gastosOperativos.gastosAdministrativos },
                  { categoria: "Generales", monto: estadoResultados.gastosOperativos.gastosGenerales },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Monto"]} />
                <Bar dataKey="monto" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Estado de Resultados detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Resultados Detallado</CardTitle>
              <CardDescription>Período: Enero - Diciembre 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>INGRESOS</TableCell>
                    <TableCell className="text-right">{formatCurrency(estadoResultados.ingresos.total)}</TableCell>
                    <TableCell className="text-right">100.0%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Ventas Netas</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(estadoResultados.ingresos.ventasNetas)}
                    </TableCell>
                    <TableCell className="text-right">
                      {((estadoResultados.ingresos.ventasNetas / estadoResultados.ingresos.total) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Otros Ingresos</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(estadoResultados.ingresos.otrosIngresos)}
                    </TableCell>
                    <TableCell className="text-right">
                      {((estadoResultados.ingresos.otrosIngresos / estadoResultados.ingresos.total) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>

                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>COSTO DE VENTAS</TableCell>
                    <TableCell className="text-right">({formatCurrency(estadoResultados.costos.total)})</TableCell>
                    <TableCell className="text-right">
                      {((estadoResultados.costos.total / estadoResultados.ingresos.total) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>

                  <TableRow className="font-semibold text-green-600">
                    <TableCell>UTILIDAD BRUTA</TableCell>
                    <TableCell className="text-right">{formatCurrency(estadoResultados.utilidadBruta)}</TableCell>
                    <TableCell className="text-right">
                      {((estadoResultados.utilidadBruta / estadoResultados.ingresos.total) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>

                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>GASTOS OPERATIVOS</TableCell>
                    <TableCell className="text-right">
                      ({formatCurrency(estadoResultados.gastosOperativos.total)})
                    </TableCell>
                    <TableCell className="text-right">
                      {((estadoResultados.gastosOperativos.total / estadoResultados.ingresos.total) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Gastos de Ventas</TableCell>
                    <TableCell className="text-right">
                      ({formatCurrency(estadoResultados.gastosOperativos.gastosVentas)})
                    </TableCell>
                    <TableCell className="text-right">
                      {(
                        (estadoResultados.gastosOperativos.gastosVentas / estadoResultados.ingresos.total) *
                        100
                      ).toFixed(1)}
                      %
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Gastos Administrativos</TableCell>
                    <TableCell className="text-right">
                      ({formatCurrency(estadoResultados.gastosOperativos.gastosAdministrativos)})
                    </TableCell>
                    <TableCell className="text-right">
                      {(
                        (estadoResultados.gastosOperativos.gastosAdministrativos / estadoResultados.ingresos.total) *
                        100
                      ).toFixed(1)}
                      %
                    </TableCell>
                  </TableRow>

                  <TableRow className="font-semibold text-blue-600">
                    <TableCell>UTILIDAD OPERATIVA</TableCell>
                    <TableCell className="text-right">{formatCurrency(estadoResultados.utilidadOperativa)}</TableCell>
                    <TableCell className="text-right">
                      {((estadoResultados.utilidadOperativa / estadoResultados.ingresos.total) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Gastos Financieros</TableCell>
                    <TableCell className="text-right">({formatCurrency(estadoResultados.otrosGastos.total)})</TableCell>
                    <TableCell className="text-right">
                      {((estadoResultados.otrosGastos.total / estadoResultados.ingresos.total) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>

                  <TableRow className="font-semibold">
                    <TableCell>UTILIDAD ANTES DE IMPUESTOS</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(estadoResultados.utilidadAntesImpuestos)}
                    </TableCell>
                    <TableCell className="text-right">
                      {((estadoResultados.utilidadAntesImpuestos / estadoResultados.ingresos.total) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Impuestos</TableCell>
                    <TableCell className="text-right">({formatCurrency(estadoResultados.impuestos)})</TableCell>
                    <TableCell className="text-right">
                      {((estadoResultados.impuestos / estadoResultados.ingresos.total) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>

                  <TableRow className="font-bold text-green-600 bg-green-50">
                    <TableCell>UTILIDAD NETA</TableCell>
                    <TableCell className="text-right">{formatCurrency(estadoResultados.utilidadNeta)}</TableCell>
                    <TableCell className="text-right">
                      {((estadoResultados.utilidadNeta / estadoResultados.ingresos.total) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ratios Financieros</CardTitle>
              <CardDescription>Indicadores de rentabilidad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ratiosFinancieros.map((ratio, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{ratio.concepto}</span>
                  <Badge variant="outline" className="text-lg font-bold">
                    {ratio.valor}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
