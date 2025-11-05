"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Building, CreditCard, TrendingUp, Scale } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

const balanceGeneral = {
  activos: {
    corrientes: {
      efectivo: 125000,
      cuentasPorCobrar: 180000,
      inventarios: 95000,
      otrosActivos: 15000,
      total: 415000,
    },
    noCorrientes: {
      propiedadPlantaEquipo: 350000,
      depreciacionAcumulada: -85000,
      inversionesLargoPlazo: 45000,
      otrosActivosLP: 25000,
      total: 335000,
    },
    total: 750000,
  },
  pasivos: {
    corrientes: {
      cuentasPorPagar: 95000,
      prestamosCP: 35000,
      acumulacionesPorPagar: 28000,
      otrosPasivos: 12000,
      total: 170000,
    },
    noCorrientes: {
      prestamosLP: 180000,
      otrosPasivosLP: 25000,
      total: 205000,
    },
    total: 375000,
  },
  patrimonio: {
    capitalSocial: 200000,
    utilidadesRetenidas: 175000,
    total: 375000,
  },
}

const ratiosBalance = [
  {
    nombre: "Liquidez Corriente",
    valor: (balanceGeneral.activos.corrientes.total / balanceGeneral.pasivos.corrientes.total).toFixed(2),
    tipo: "veces",
  },
  {
    nombre: "Prueba Ácida",
    valor: (
      (balanceGeneral.activos.corrientes.total - balanceGeneral.activos.corrientes.inventarios) /
      balanceGeneral.pasivos.corrientes.total
    ).toFixed(2),
    tipo: "veces",
  },
  {
    nombre: "Endeudamiento",
    valor: ((balanceGeneral.pasivos.total / balanceGeneral.activos.total) * 100).toFixed(1),
    tipo: "porcentaje",
  },
  { nombre: "ROE", valor: "22.5", tipo: "porcentaje" },
]

const composicionActivos = [
  { name: "Efectivo", value: balanceGeneral.activos.corrientes.efectivo, color: "#22c55e" },
  { name: "Cuentas por Cobrar", value: balanceGeneral.activos.corrientes.cuentasPorCobrar, color: "#3b82f6" },
  { name: "Inventarios", value: balanceGeneral.activos.corrientes.inventarios, color: "#f59e0b" },
  {
    name: "Propiedad y Equipo",
    value:
      balanceGeneral.activos.noCorrientes.propiedadPlantaEquipo -
      Math.abs(balanceGeneral.activos.noCorrientes.depreciacionAcumulada),
    color: "#8b5cf6",
  },
  {
    name: "Otros",
    value:
      balanceGeneral.activos.corrientes.otrosActivos +
      balanceGeneral.activos.noCorrientes.otrosActivosLP +
      balanceGeneral.activos.noCorrientes.inversionesLargoPlazo,
    color: "#6b7280",
  },
]

const evolucionPatrimonio = [
  { periodo: "2020", patrimonio: 280000 },
  { periodo: "2021", patrimonio: 320000 },
  { periodo: "2022", patrimonio: 345000 },
  { periodo: "2023", patrimonio: 360000 },
  { periodo: "2024", patrimonio: 375000 },
]

export default function BalancePage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Balance General</h1>
          <p className="text-muted-foreground">Estado de situación financiera al 31 de diciembre de 2024</p>
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
            <CardTitle className="text-sm font-medium">Total Activos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balanceGeneral.activos.total)}</div>
            <p className="text-xs text-muted-foreground">+8.5% vs año anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pasivos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balanceGeneral.pasivos.total)}</div>
            <p className="text-xs text-muted-foreground">+3.2% vs año anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patrimonio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(balanceGeneral.patrimonio.total)}</div>
            <p className="text-xs text-muted-foreground">+4.2% vs año anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equilibrio</CardTitle>
            <Scale className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">✓</div>
            <p className="text-xs text-muted-foreground">Activos = Pasivos + Patrimonio</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Composición de Activos</CardTitle>
            <CardDescription>Distribución por tipo de activo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={composicionActivos}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {composicionActivos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Valor"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolución del Patrimonio</CardTitle>
            <CardDescription>Crecimiento patrimonial en los últimos 5 años</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={evolucionPatrimonio}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Patrimonio"]} />
                <Bar dataKey="patrimonio" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Balance General detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Balance General Detallado</CardTitle>
              <CardDescription>Al 31 de diciembre de 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {/* ACTIVOS */}
                  <TableRow className="font-bold bg-blue-50">
                    <TableCell colSpan={2}>ACTIVOS</TableCell>
                    <TableCell className="text-right">{formatCurrency(balanceGeneral.activos.total)}</TableCell>
                  </TableRow>

                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>Activos Corrientes</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(balanceGeneral.activos.corrientes.total)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Efectivo y Equivalentes</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(balanceGeneral.activos.corrientes.efectivo)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Cuentas por Cobrar</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(balanceGeneral.activos.corrientes.cuentasPorCobrar)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Inventarios</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(balanceGeneral.activos.corrientes.inventarios)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Otros Activos Corrientes</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(balanceGeneral.activos.corrientes.otrosActivos)}
                    </TableCell>
                  </TableRow>

                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>Activos No Corrientes</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(balanceGeneral.activos.noCorrientes.total)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Propiedad, Planta y Equipo</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(balanceGeneral.activos.noCorrientes.propiedadPlantaEquipo)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Menos: Depreciación Acumulada</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      ({formatCurrency(Math.abs(balanceGeneral.activos.noCorrientes.depreciacionAcumulada))})
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Inversiones a Largo Plazo</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(balanceGeneral.activos.noCorrientes.inversionesLargoPlazo)}
                    </TableCell>
                  </TableRow>

                  {/* PASIVOS */}
                  <TableRow className="font-bold bg-red-50">
                    <TableCell colSpan={2}>PASIVOS</TableCell>
                    <TableCell className="text-right">{formatCurrency(balanceGeneral.pasivos.total)}</TableCell>
                  </TableRow>

                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>Pasivos Corrientes</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(balanceGeneral.pasivos.corrientes.total)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Cuentas por Pagar</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(balanceGeneral.pasivos.corrientes.cuentasPorPagar)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Préstamos a Corto Plazo</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(balanceGeneral.pasivos.corrientes.prestamosCP)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Acumulaciones por Pagar</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(balanceGeneral.pasivos.corrientes.acumulacionesPorPagar)}
                    </TableCell>
                  </TableRow>

                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>Pasivos No Corrientes</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(balanceGeneral.pasivos.noCorrientes.total)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Préstamos a Largo Plazo</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(balanceGeneral.pasivos.noCorrientes.prestamosLP)}
                    </TableCell>
                  </TableRow>

                  {/* PATRIMONIO */}
                  <TableRow className="font-bold bg-green-50">
                    <TableCell colSpan={2}>PATRIMONIO</TableCell>
                    <TableCell className="text-right">{formatCurrency(balanceGeneral.patrimonio.total)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Capital Social</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(balanceGeneral.patrimonio.capitalSocial)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Utilidades Retenidas</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(balanceGeneral.patrimonio.utilidadesRetenidas)}
                    </TableCell>
                  </TableRow>

                  <TableRow className="font-bold bg-gray-100 border-t-2">
                    <TableCell colSpan={2}>TOTAL PASIVOS + PATRIMONIO</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(balanceGeneral.pasivos.total + balanceGeneral.patrimonio.total)}
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
              <CardDescription>Indicadores de liquidez y solvencia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ratiosBalance.map((ratio, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{ratio.nombre}</span>
                  <Badge variant="outline" className="text-lg font-bold">
                    {ratio.valor}
                    {ratio.tipo === "porcentaje" ? "%" : "x"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Análisis Rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Liquidez saludable (2.44x)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Endeudamiento moderado (50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Crecimiento patrimonial positivo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Balance equilibrado</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
