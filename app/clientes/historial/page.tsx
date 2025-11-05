"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Download, Calendar, DollarSign, TrendingUp, Clock } from "lucide-react"

export default function HistorialPagosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState("all")
  const [dateRange, setDateRange] = useState("all")

  // Datos de ejemplo del historial de pagos
  const historialPagos = [
    {
      id: "PAG-001",
      cliente: "Distribuidora Norte SA",
      factura: "FAC-2024-001",
      fechaPago: "2024-01-15",
      monto: 25000,
      metodoPago: "Transferencia",
      estado: "Completado",
      diasCredito: 30,
      diasRetraso: 0,
    },
    {
      id: "PAG-002",
      cliente: "Comercial Sur SRL",
      factura: "FAC-2024-002",
      fechaPago: "2024-01-18",
      monto: 18500,
      metodoPago: "Cheque",
      estado: "Completado",
      diasCredito: 45,
      diasRetraso: 3,
    },
    {
      id: "PAG-003",
      cliente: "Electro Mayorista",
      factura: "FAC-2024-003",
      fechaPago: "2024-01-20",
      monto: 42000,
      metodoPago: "Efectivo",
      estado: "Completado",
      diasCredito: 30,
      diasRetraso: 0,
    },
    {
      id: "PAG-004",
      cliente: "Instalaciones Técnicas",
      factura: "FAC-2024-004",
      fechaPago: "2024-01-22",
      monto: 15750,
      metodoPago: "Transferencia",
      estado: "Pendiente",
      diasCredito: 60,
      diasRetraso: 12,
    },
  ]

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Completado":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completado</Badge>
      case "Pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendiente</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const getRetrasoColor = (dias: number) => {
    if (dias === 0) return "text-green-600"
    if (dias <= 7) return "text-yellow-600"
    return "text-red-600"
  }

  // Cálculos de resumen
  const totalPagos = historialPagos.filter((p) => p.estado === "Completado").length
  const montoTotal = historialPagos.filter((p) => p.estado === "Completado").reduce((sum, p) => sum + p.monto, 0)
  const promedioRetraso = historialPagos.reduce((sum, p) => sum + p.diasRetraso, 0) / historialPagos.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Historial de Pagos</h1>
          <p className="text-muted-foreground">Seguimiento de pagos de clientes</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pagos</p>
                <p className="text-2xl font-bold">{totalPagos}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monto Total</p>
                <p className="text-2xl font-bold">${montoTotal.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Promedio Retraso</p>
                <p className="text-2xl font-bold">{promedioRetraso.toFixed(1)} días</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{historialPagos.filter((p) => p.estado === "Pendiente").length}</p>
              </div>
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente o factura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                <SelectItem value="distribuidora">Distribuidora Norte SA</SelectItem>
                <SelectItem value="comercial">Comercial Sur SRL</SelectItem>
                <SelectItem value="electro">Electro Mayorista</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los períodos</SelectItem>
                <SelectItem value="7">Últimos 7 días</SelectItem>
                <SelectItem value="30">Últimos 30 días</SelectItem>
                <SelectItem value="90">Últimos 90 días</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Historial */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
          <CardDescription>Registro detallado de todos los pagos recibidos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Pago</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Factura</TableHead>
                <TableHead>Fecha Pago</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Días Retraso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historialPagos.map((pago) => (
                <TableRow key={pago.id}>
                  <TableCell className="font-medium">{pago.id}</TableCell>
                  <TableCell>{pago.cliente}</TableCell>
                  <TableCell>{pago.factura}</TableCell>
                  <TableCell>{new Date(pago.fechaPago).toLocaleDateString()}</TableCell>
                  <TableCell className="font-semibold">${pago.monto.toLocaleString()}</TableCell>
                  <TableCell>{pago.metodoPago}</TableCell>
                  <TableCell>{getEstadoBadge(pago.estado)}</TableCell>
                  <TableCell className={getRetrasoColor(pago.diasRetraso)}>
                    {pago.diasRetraso === 0 ? "A tiempo" : `${pago.diasRetraso} días`}
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
