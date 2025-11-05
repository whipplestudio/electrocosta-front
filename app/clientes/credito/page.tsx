"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Search, Edit, AlertTriangle, CheckCircle, XCircle, DollarSign, Users } from "lucide-react"

export default function LimitesCreditoPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") // Updated default value to "all"

  // Datos de ejemplo de límites de crédito
  const limitesCredito = [
    {
      id: "CLI-001",
      cliente: "Distribuidora Norte SA",
      limiteCredito: 100000,
      creditoUtilizado: 75000,
      creditoDisponible: 25000,
      diasCredito: 30,
      ultimaRevision: "2024-01-15",
      estado: "Activo",
      riesgo: "Medio",
      facturasPendientes: 3,
    },
    {
      id: "CLI-002",
      cliente: "Comercial Sur SRL",
      limiteCredito: 50000,
      creditoUtilizado: 48500,
      creditoDisponible: 1500,
      diasCredito: 45,
      ultimaRevision: "2024-01-10",
      estado: "Crítico",
      riesgo: "Alto",
      facturasPendientes: 5,
    },
    {
      id: "CLI-003",
      cliente: "Electro Mayorista",
      limiteCredito: 150000,
      creditoUtilizado: 45000,
      creditoDisponible: 105000,
      diasCredito: 30,
      ultimaRevision: "2024-01-20",
      estado: "Activo",
      riesgo: "Bajo",
      facturasPendientes: 2,
    },
    {
      id: "CLI-004",
      cliente: "Instalaciones Técnicas",
      limiteCredito: 75000,
      creditoUtilizado: 78000,
      creditoDisponible: -3000,
      diasCredito: 60,
      ultimaRevision: "2024-01-05",
      estado: "Excedido",
      riesgo: "Crítico",
      facturasPendientes: 7,
    },
  ]

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Activo":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        )
      case "Crítico":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Crítico
          </Badge>
        )
      case "Excedido":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Excedido
          </Badge>
        )
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const getRiesgoBadge = (riesgo: string) => {
    switch (riesgo) {
      case "Bajo":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200">
            Bajo
          </Badge>
        )
      case "Medio":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-200">
            Medio
          </Badge>
        )
      case "Alto":
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            Alto
          </Badge>
        )
      case "Crítico":
        return (
          <Badge variant="outline" className="text-red-600 border-red-200">
            Crítico
          </Badge>
        )
      default:
        return <Badge variant="outline">{riesgo}</Badge>
    }
  }

  const getUtilizacionColor = (porcentaje: number) => {
    if (porcentaje <= 50) return "bg-green-500"
    if (porcentaje <= 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Cálculos de resumen
  const totalClientes = limitesCredito.length
  const clientesActivos = limitesCredito.filter((c) => c.estado === "Activo").length
  const clientesCriticos = limitesCredito.filter((c) => c.estado === "Crítico" || c.estado === "Excedido").length
  const creditoTotalOtorgado = limitesCredito.reduce((sum, c) => sum + c.limiteCredito, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Límites de Crédito</h1>
          <p className="text-muted-foreground">Gestión y monitoreo de límites crediticios</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Edit className="h-4 w-4 mr-2" />
          Ajustar Límites
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clientes</p>
                <p className="text-2xl font-bold">{totalClientes}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes Activos</p>
                <p className="text-2xl font-bold text-green-600">{clientesActivos}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes Críticos</p>
                <p className="text-2xl font-bold text-red-600">{clientesCriticos}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" /> {/* Updated AlertCircle to XCircle */}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Crédito Total</p>
                <p className="text-2xl font-bold">${creditoTotalOtorgado.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="critico">Crítico</SelectItem>
                <SelectItem value="excedido">Excedido</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Aplicar Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Límites de Crédito */}
      <Card>
        <CardHeader>
          <CardTitle>Límites de Crédito por Cliente</CardTitle>
          <CardDescription>Monitoreo detallado del uso de crédito por cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Límite</TableHead>
                <TableHead>Utilizado</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead>Utilización</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Riesgo</TableHead>
                <TableHead>Facturas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {limitesCredito.map((limite) => {
                const porcentajeUtilizacion = (limite.creditoUtilizado / limite.limiteCredito) * 100
                return (
                  <TableRow key={limite.id}>
                    <TableCell className="font-medium">{limite.cliente}</TableCell>
                    <TableCell>${limite.limiteCredito.toLocaleString()}</TableCell>
                    <TableCell>${limite.creditoUtilizado.toLocaleString()}</TableCell>
                    <TableCell
                      className={limite.creditoDisponible < 0 ? "text-red-600 font-semibold" : "text-green-600"}
                    >
                      ${limite.creditoDisponible.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={Math.min(porcentajeUtilizacion, 100)} className="h-2" />
                        <span className="text-xs text-muted-foreground">{porcentajeUtilizacion.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{getEstadoBadge(limite.estado)}</TableCell>
                    <TableCell>{getRiesgoBadge(limite.riesgo)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{limite.facturasPendientes}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
