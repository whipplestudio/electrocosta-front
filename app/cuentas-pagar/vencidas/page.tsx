"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, AlertTriangle, Calendar } from "lucide-react"

export default function CuentasPagarVencidasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDays, setFilterDays] = useState("all")

  const cuentasVencidas = [
    {
      id: "CP-2023-045",
      proveedor: "Distribuidora Eléctrica SA",
      monto: 185000,
      fechaVencimiento: "2023-12-15",
      diasVencido: 25,
      categoria: "Materiales",
      contacto: "Luis Ramírez",
      telefono: "+506 2222-3333",
      estado: "Vencida",
    },
    {
      id: "CP-2023-052",
      proveedor: "Servicios Técnicos CR",
      monto: 95000,
      fechaVencimiento: "2023-12-28",
      diasVencido: 12,
      categoria: "Servicios",
      contacto: "Carmen Solís",
      telefono: "+506 3333-4444",
      estado: "Vencida",
    },
    {
      id: "CP-2024-001",
      proveedor: "Transportes del Norte",
      monto: 45000,
      fechaVencimiento: "2024-01-05",
      diasVencido: 5,
      categoria: "Logística",
      contacto: "Roberto Mora",
      telefono: "+506 4444-5555",
      estado: "Vencida",
    },
  ]

  const filteredCuentas = cuentasVencidas.filter((cuenta) => {
    const matchesSearch =
      cuenta.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cuenta.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDays =
      filterDays === "all" ||
      (filterDays === "30" && cuenta.diasVencido <= 30) ||
      (filterDays === "60" && cuenta.diasVencido <= 60) ||
      (filterDays === "90" && cuenta.diasVencido <= 90)
    return matchesSearch && matchesDays
  })

  const totalVencido = filteredCuentas.reduce((sum, cuenta) => sum + cuenta.monto, 0)

  const getSeverityBadge = (dias: number) => {
    if (dias > 60) return <Badge className="bg-red-100 text-red-800">Crítico</Badge>
    if (dias > 30) return <Badge className="bg-orange-100 text-orange-800">Alto</Badge>
    if (dias > 15) return <Badge className="bg-yellow-100 text-yellow-800">Medio</Badge>
    return <Badge className="bg-blue-100 text-blue-800">Reciente</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cuentas por Pagar Vencidas</h1>
          <p className="text-muted-foreground">Gestión de obligaciones vencidas con proveedores</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Vencido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalVencido.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredCuentas.length} facturas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Más de 60 días</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              $
              {cuentasVencidas
                .filter((c) => c.diasVencido > 60)
                .reduce((sum, c) => sum + c.monto, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {cuentasVencidas.filter((c) => c.diasVencido > 60).length} facturas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">30-60 días</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              $
              {cuentasVencidas
                .filter((c) => c.diasVencido > 30 && c.diasVencido <= 60)
                .reduce((sum, c) => sum + c.monto, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {cuentasVencidas.filter((c) => c.diasVencido > 30 && c.diasVencido <= 60).length} facturas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Menos de 30 días</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              $
              {cuentasVencidas
                .filter((c) => c.diasVencido <= 30)
                .reduce((sum, c) => sum + c.monto, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {cuentasVencidas.filter((c) => c.diasVencido <= 30).length} facturas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Cuentas Vencidas</CardTitle>
          <CardDescription>Obligaciones pendientes ordenadas por antigüedad</CardDescription>
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
                <SelectItem value="30">Hasta 30 días</SelectItem>
                <SelectItem value="60">Hasta 60 días</SelectItem>
                <SelectItem value="90">Hasta 90 días</SelectItem>
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
                  <TableHead>Días Vencido</TableHead>
                  <TableHead>Severidad</TableHead>
                  <TableHead>Contacto</TableHead>
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
                    <TableCell className="font-medium text-red-600">${cuenta.monto.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {cuenta.fechaVencimiento}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-600">{cuenta.diasVencido} días</span>
                      </div>
                    </TableCell>
                    <TableCell>{getSeverityBadge(cuenta.diasVencido)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">{cuenta.contacto}</div>
                        <div className="text-xs text-muted-foreground">{cuenta.telefono}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Ver
                        </Button>
                        <Button size="sm">Pagar</Button>
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
