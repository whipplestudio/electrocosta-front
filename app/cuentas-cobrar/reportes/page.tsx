"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Download, TrendingUp, Calendar, DollarSign, Users } from "lucide-react"

const ageingData = [
  { periodo: "0-30 días", monto: 450000, facturas: 12 },
  { periodo: "31-60 días", monto: 280000, facturas: 8 },
  { periodo: "61-90 días", monto: 150000, facturas: 5 },
  { periodo: "91+ días", monto: 85000, facturas: 3 },
]

const clientAnalysis = [
  { name: "Constructora ABC", value: 35, color: "#0088FE" },
  { name: "Inmobiliaria XYZ", value: 25, color: "#00C49F" },
  { name: "Desarrollos Norte", value: 20, color: "#FFBB28" },
  { name: "Otros", value: 20, color: "#FF8042" },
]

const collectionData = [
  {
    cliente: "Constructora ABC",
    totalFacturado: 850000,
    totalCobrado: 720000,
    pendiente: 130000,
    efectividad: 84.7,
    diasPromedio: 42,
  },
  {
    cliente: "Inmobiliaria XYZ",
    totalFacturado: 650000,
    totalCobrado: 580000,
    pendiente: 70000,
    efectividad: 89.2,
    diasPromedio: 35,
  },
  {
    cliente: "Desarrollos Norte",
    totalFacturado: 420000,
    totalCobrado: 350000,
    pendiente: 70000,
    efectividad: 83.3,
    diasPromedio: 48,
  },
]

export default function ReportesCuentasCobrar() {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedClient, setSelectedClient] = useState("all")

  const exportToExcel = (reportType: string) => {
    // Simular exportación
    console.log(`Exportando reporte: ${reportType}`)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reportes de Cuentas por Cobrar</h2>
          <p className="text-muted-foreground">Análisis detallado de cartera y cobranza</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => exportToExcel("general")}>
            <Download className="h-4 w-4" />
            Exportar Todo
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
          <CardDescription>Personalice el período y criterios del reporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Fecha Desde</Label>
              <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Fecha Hasta</Label>
              <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  <SelectItem value="constructora">Constructora ABC</SelectItem>
                  <SelectItem value="inmobiliaria">Inmobiliaria XYZ</SelectItem>
                  <SelectItem value="desarrollos">Desarrollos Norte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">Aplicar Filtros</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs de Reportes */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$965,000</div>
            <p className="text-xs text-muted-foreground">28 facturas pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Días Promedio</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42 días</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+5 días</span> vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efectividad</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85.7%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.3%</span> vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Con saldo pendiente</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ageing" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ageing">Antigüedad de Saldos</TabsTrigger>
          <TabsTrigger value="clients">Análisis por Cliente</TabsTrigger>
          <TabsTrigger value="collection">Efectividad de Cobranza</TabsTrigger>
        </TabsList>

        <TabsContent value="ageing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Antigüedad de Saldos
                  <Button size="sm" variant="outline" onClick={() => exportToExcel("antiguedad")}>
                    <Download className="h-3 w-3 mr-1" />
                    Excel
                  </Button>
                </CardTitle>
                <CardDescription>Distribución de cuentas por cobrar por antigüedad</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="monto" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalle por Período</CardTitle>
                <CardDescription>Montos y cantidad de facturas</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Facturas</TableHead>
                      <TableHead>%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ageingData.map((item) => (
                      <TableRow key={item.periodo}>
                        <TableCell className="font-medium">{item.periodo}</TableCell>
                        <TableCell>${item.monto.toLocaleString()}</TableCell>
                        <TableCell>{item.facturas}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{((item.monto / 965000) * 100).toFixed(1)}%</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Concentración por Cliente
                  <Button size="sm" variant="outline" onClick={() => exportToExcel("clientes")}>
                    <Download className="h-3 w-3 mr-1" />
                    Excel
                  </Button>
                </CardTitle>
                <CardDescription>Distribución porcentual de la cartera</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={clientAnalysis}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {clientAnalysis.map((entry, index) => (
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
                <CardTitle>Top Clientes por Saldo</CardTitle>
                <CardDescription>Principales deudores del período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {collectionData.map((client, index) => (
                    <div key={client.cliente} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{client.cliente}</p>
                        <p className="text-sm text-muted-foreground">Pendiente: ${client.pendiente.toLocaleString()}</p>
                      </div>
                      <Badge variant={client.efectividad > 85 ? "default" : "secondary"}>{client.efectividad}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="collection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Efectividad de Cobranza por Cliente
                <Button size="sm" variant="outline" onClick={() => exportToExcel("efectividad")}>
                  <Download className="h-3 w-3 mr-1" />
                  Excel
                </Button>
              </CardTitle>
              <CardDescription>Análisis de efectividad y tiempos de cobranza</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total Facturado</TableHead>
                    <TableHead>Total Cobrado</TableHead>
                    <TableHead>Pendiente</TableHead>
                    <TableHead>Efectividad</TableHead>
                    <TableHead>Días Promedio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collectionData.map((client) => (
                    <TableRow key={client.cliente}>
                      <TableCell className="font-medium">{client.cliente}</TableCell>
                      <TableCell>${client.totalFacturado.toLocaleString()}</TableCell>
                      <TableCell>${client.totalCobrado.toLocaleString()}</TableCell>
                      <TableCell>${client.pendiente.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={client.efectividad > 85 ? "default" : "secondary"}>{client.efectividad}%</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.diasPromedio <= 40 ? "default" : "destructive"}>
                          {client.diasPromedio} días
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
