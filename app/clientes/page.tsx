"use client"

import { useState } from "react"
import { Plus, Filter, Download, Eye, Edit, CreditCard, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const clientes = [
  {
    id: "CLI001",
    nombre: "Constructora ABC S.A.",
    rfc: "CABC850101ABC",
    email: "contacto@constructoraabc.com",
    telefono: "+52 55 1234-5678",
    credito: 500000,
    saldo: 125000,
    estado: "Activo",
    ultimoPago: "2024-01-15",
    diasCredito: 30,
  },
  {
    id: "CLI002",
    nombre: "Desarrollos Inmobiliarios XYZ",
    rfc: "DIXYZ901201XYZ",
    email: "ventas@desarrollosxyz.com",
    telefono: "+52 55 9876-5432",
    credito: 750000,
    saldo: 0,
    estado: "Activo",
    ultimoPago: "2024-01-20",
    diasCredito: 45,
  },
  {
    id: "CLI003",
    nombre: "Servicios Eléctricos del Norte",
    rfc: "SEN780301SEN",
    email: "admin@electricosnorte.com",
    telefono: "+52 81 2468-1357",
    credito: 300000,
    saldo: 85000,
    estado: "Suspendido",
    ultimoPago: "2023-12-10",
    diasCredito: 15,
  },
]

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")

  const filteredClientes = clientes.filter((cliente) => {
    const matchesSearch =
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.rfc.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "todos" || cliente.estado.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalCredito = clientes.reduce((sum, cliente) => sum + cliente.credito, 0)
  const totalSaldo = clientes.reduce((sum, cliente) => sum + cliente.saldo, 0)
  const clientesActivos = clientes.filter((c) => c.estado === "Activo").length

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1>
          <p className="text-muted-foreground">Administra la información y créditos de tus clientes</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientes.length}</div>
            <p className="text-xs text-muted-foreground">{clientesActivos} activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crédito Total</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCredito.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Límite autorizado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Pendiente</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSaldo.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Por cobrar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilización</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((totalSaldo / totalCredito) * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Del crédito total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre o RFC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="suspendido">Suspendido</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Más Filtros
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Clientes</CardTitle>
          <CardDescription>{filteredClientes.length} cliente(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>RFC</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Límite Crédito</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Pago</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{cliente.nombre}</div>
                      <div className="text-sm text-muted-foreground">Crédito: {cliente.diasCredito} días</div>
                    </div>
                  </TableCell>
                  <TableCell>{cliente.rfc}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{cliente.email}</div>
                      <div className="text-muted-foreground">{cliente.telefono}</div>
                    </div>
                  </TableCell>
                  <TableCell>${cliente.credito.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={cliente.saldo > 0 ? "text-orange-600" : "text-green-600"}>
                      ${cliente.saldo.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={cliente.estado === "Activo" ? "default" : "destructive"}>{cliente.estado}</Badge>
                  </TableCell>
                  <TableCell>{cliente.ultimoPago}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <History className="h-4 w-4" />
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
