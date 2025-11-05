"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Calendar, DollarSign, AlertTriangle, CheckCircle, Search, Plus, Eye } from "lucide-react"

const contratos = [
  {
    id: "CTR-2024-001",
    proveedor: "Distribuidora Eléctrica del Norte",
    tipo: "Suministro",
    fechaInicio: "2024-01-01",
    fechaVencimiento: "2024-12-31",
    valor: 2500000,
    estado: "Activo",
    diasRestantes: 245,
    categoria: "Materiales Eléctricos",
    condicionesPago: "30 días",
    renovacionAutomatica: true,
  },
  {
    id: "CTR-2024-002",
    proveedor: "Servicios Técnicos Especializados",
    tipo: "Servicios",
    fechaInicio: "2024-02-15",
    fechaVencimiento: "2024-08-15",
    valor: 850000,
    estado: "Por Vencer",
    diasRestantes: 45,
    categoria: "Servicios",
    condicionesPago: "15 días",
    renovacionAutomatica: false,
  },
  {
    id: "CTR-2024-003",
    proveedor: "Equipos Industriales SA",
    tipo: "Mantenimiento",
    fechaInicio: "2024-03-01",
    fechaVencimiento: "2025-03-01",
    valor: 1200000,
    estado: "Activo",
    diasRestantes: 365,
    categoria: "Equipos y Herramientas",
    condicionesPago: "45 días",
    renovacionAutomatica: true,
  },
  {
    id: "CTR-2023-015",
    proveedor: "Transportes Logísticos del Centro",
    tipo: "Transporte",
    fechaInicio: "2023-06-01",
    fechaVencimiento: "2024-01-20",
    valor: 450000,
    estado: "Vencido",
    diasRestantes: -15,
    categoria: "Transporte",
    condicionesPago: "30 días",
    renovacionAutomatica: false,
  },
]

export default function ContratosProveedoresPage() {
  const [filtroEstado, setFiltroEstado] = useState("all")
  const [filtroTipo, setFiltroTipo] = useState("all")
  const [busqueda, setBusqueda] = useState("")

  const getStatusBadge = (estado: string, diasRestantes: number) => {
    if (estado === "Vencido") return "bg-red-100 text-red-800"
    if (diasRestantes <= 30) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getStatusIcon = (estado: string, diasRestantes: number) => {
    if (estado === "Vencido") return <AlertTriangle className="h-4 w-4" />
    if (diasRestantes <= 30) return <AlertTriangle className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  // Estadísticas
  const totalContratos = contratos.length
  const contratosActivos = contratos.filter((c) => c.estado === "Activo").length
  const contratosPorVencer = contratos.filter((c) => c.diasRestantes <= 30 && c.diasRestantes > 0).length
  const contratosVencidos = contratos.filter((c) => c.estado === "Vencido").length
  const valorTotal = contratos.reduce((sum, c) => sum + c.valor, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contratos de Proveedores</h1>
          <p className="text-muted-foreground">Gestión y seguimiento de contratos con proveedores</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Contrato
        </Button>
      </div>

      {/* KPIs de Contratos */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Contratos</p>
                <p className="text-2xl font-bold">{totalContratos}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold text-green-600">{contratosActivos}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Por Vencer</p>
                <p className="text-2xl font-bold text-yellow-600">{contratosPorVencer}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{contratosVencidos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(valorTotal)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar contrato o proveedor..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="por-vencer">Por Vencer</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="suministro">Suministro</SelectItem>
                <SelectItem value="servicios">Servicios</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="transporte">Transporte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Contratos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contratos</CardTitle>
          <CardDescription>Contratos activos y su estado de vencimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contrato</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Días Restantes</TableHead>
                <TableHead>Renovación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contratos.map((contrato) => (
                <TableRow key={contrato.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{contrato.id}</p>
                      <p className="text-sm text-muted-foreground">{contrato.categoria}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{contrato.proveedor}</p>
                      <p className="text-sm text-muted-foreground">Pago: {contrato.condicionesPago}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{contrato.tipo}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>Inicio: {contrato.fechaInicio}</p>
                      <p>Vence: {contrato.fechaVencimiento}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{formatCurrency(contrato.valor)}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(contrato.estado, contrato.diasRestantes)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(contrato.estado, contrato.diasRestantes)}
                        {contrato.estado}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {contrato.diasRestantes > 0 ? (
                        <span
                          className={contrato.diasRestantes <= 30 ? "text-yellow-600 font-medium" : "text-green-600"}
                        >
                          {contrato.diasRestantes} días
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          Vencido hace {Math.abs(contrato.diasRestantes)} días
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={contrato.renovacionAutomatica ? "default" : "secondary"}>
                      {contrato.renovacionAutomatica ? "Automática" : "Manual"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
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
