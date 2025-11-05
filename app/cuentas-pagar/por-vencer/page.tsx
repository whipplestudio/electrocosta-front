"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Calendar, Clock } from "lucide-react"

export default function CuentasPagarPorVencerPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDays, setFilterDays] = useState("all")

  const cuentasPorVencer = [
    {
      id: "CP-2024-015",
      proveedor: "Materiales Eléctricos SA",
      monto: 225000,
      fechaVencimiento: "2024-01-20",
      diasRestantes: 10,
      categoria: "Materiales",
      contacto: "Patricia Vega",
      telefono: "+506 2555-6666",
      descuento: "2% por pronto pago",
    },
    {
      id: "CP-2024-018",
      proveedor: "Servicios de Mantenimiento",
      monto: 125000,
      fechaVencimiento: "2024-01-25",
      diasRestantes: 15,
      categoria: "Servicios",
      contacto: "Miguel Torres",
      telefono: "+506 2666-7777",
      descuento: null,
    },
    {
      id: "CP-2024-022",
      proveedor: "Combustibles del Pacífico",
      monto: 85000,
      fechaVencimiento: "2024-01-30",
      diasRestantes: 20,
      categoria: "Combustible",
      contacto: "Sandra López",
      telefono: "+506 2777-8888",
      descuento: "1.5% por pronto pago",
    },
  ]

  const filteredCuentas = cuentasPorVencer.filter((cuenta) => {
    const matchesSearch =
      cuenta.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cuenta.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDays =
      filterDays === "all" ||
      (filterDays === "7" && cuenta.diasRestantes <= 7) ||
      (filterDays === "15" && cuenta.diasRestantes <= 15) ||
      (filterDays === "30" && cuenta.diasRestantes <= 30)
    return matchesSearch && matchesDays
  })

  const totalPorVencer = filteredCuentas.reduce((sum, cuenta) => sum + cuenta.monto, 0)

  const getPriorityBadge = (dias: number) => {
    if (dias <= 7) return <Badge className="bg-red-50 text-red-700">Urgente</Badge>
    if (dias <= 15) return <Badge className="bg-yellow-50 text-yellow-700">Próximo</Badge>
    return <Badge className="bg-green-50 text-green-700">Programado</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cuentas por Pagar - Por Vencer</h1>
          <p className="text-muted-foreground">Programación de pagos próximos a vencer</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total por Vencer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPorVencer.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredCuentas.length} facturas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Próximos 7 días</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              $
              {cuentasPorVencer
                .filter((c) => c.diasRestantes <= 7)
                .reduce((sum, c) => sum + c.monto, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {cuentasPorVencer.filter((c) => c.diasRestantes <= 7).length} facturas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Próximos 15 días</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              $
              {cuentasPorVencer
                .filter((c) => c.diasRestantes <= 15)
                .reduce((sum, c) => sum + c.monto, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {cuentasPorVencer.filter((c) => c.diasRestantes <= 15).length} facturas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Con Descuento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              $
              {cuentasPorVencer
                .filter((c) => c.descuento)
                .reduce((sum, c) => sum + c.monto, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {cuentasPorVencer.filter((c) => c.descuento).length} facturas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Cuentas por Vencer</CardTitle>
          <CardDescription>Obligaciones programadas ordenadas por fecha de vencimiento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por proveedor o número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterDays} onValueChange={setFilterDays}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los períodos</SelectItem>
                <SelectItem value="7">Próximos 7 días</SelectItem>
                <SelectItem value="15">Próximos 15 días</SelectItem>
                <SelectItem value="30">Próximos 30 días</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Días Restantes</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCuentas.map((cuenta) => (
                  <TableRow key={cuenta.id}>
                    <TableCell className="font-medium">{cuenta.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{cuenta.proveedor}</div>
                        <div className="text-sm text-muted-foreground">{cuenta.categoria}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${cuenta.monto.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {cuenta.fechaVencimiento}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock
                          className={`h-4 w-4 ${cuenta.diasRestantes <= 7 ? "text-red-500" : cuenta.diasRestantes <= 15 ? "text-yellow-500" : "text-green-500"}`}
                        />
                        {cuenta.diasRestantes} días
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(cuenta.diasRestantes)}</TableCell>
                    <TableCell>
                      {cuenta.descuento ? (
                        <Badge variant="outline" className="text-green-600">
                          {cuenta.descuento}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Ver
                        </Button>
                        <Button size="sm">Programar Pago</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
