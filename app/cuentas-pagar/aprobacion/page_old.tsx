"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Clock, AlertTriangle, Search } from "lucide-react"

export default function AprobacionPage() {
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [busqueda, setBusqueda] = useState("")

  const pagosAprobacion = [
    {
      id: "PAG-001",
      proveedor: "Schneider Electric",
      concepto: "Materiales eléctricos - Proyecto Centro Comercial",
      monto: 125000,
      fechaSolicitud: "2024-01-15",
      solicitadoPor: "Juan Pérez",
      estado: "pendiente",
      nivel: 2,
      montoLimite: 100000,
      urgencia: "alta",
    },
    {
      id: "PAG-002",
      proveedor: "CFE Suministradores",
      concepto: "Transformadores para proyecto residencial",
      monto: 85000,
      fechaSolicitud: "2024-01-14",
      solicitadoPor: "María González",
      estado: "aprobado",
      nivel: 1,
      montoLimite: 100000,
      urgencia: "media",
    },
    {
      id: "PAG-003",
      proveedor: "Condumex",
      concepto: "Cable de media tensión",
      monto: 250000,
      fechaSolicitud: "2024-01-13",
      solicitadoPor: "Carlos Ruiz",
      estado: "rechazado",
      nivel: 3,
      montoLimite: 200000,
      urgencia: "baja",
    },
  ]

  const estadoColors = {
    pendiente: "bg-yellow-100 text-yellow-800",
    aprobado: "bg-green-100 text-green-800",
    rechazado: "bg-red-100 text-red-800",
  }

  const urgenciaColors = {
    alta: "bg-red-100 text-red-800",
    media: "bg-yellow-100 text-yellow-800",
    baja: "bg-green-100 text-green-800",
  }

  const pagosFiltrados = pagosAprobacion.filter((pago) => {
    const matchEstado = filtroEstado === "todos" || pago.estado === filtroEstado
    const matchBusqueda =
      pago.proveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
      pago.concepto.toLowerCase().includes(busqueda.toLowerCase())
    return matchEstado && matchBusqueda
  })

  const handleAprobar = (id: string) => {
    console.log(`Aprobando pago ${id}`)
  }

  const handleRechazar = (id: string) => {
    console.log(`Rechazando pago ${id}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Aprobación de Pagos</h1>
        <p className="text-gray-600">Gestiona las solicitudes de pago que requieren aprobación</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">3</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aprobados Hoy</p>
                <p className="text-2xl font-bold text-green-600">8</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monto Pendiente</p>
                <p className="text-2xl font-bold text-blue-600">$460K</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-purple-600">2.5h</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
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
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por proveedor o concepto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="aprobado">Aprobados</SelectItem>
                <SelectItem value="rechazado">Rechazados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Pagos */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Pago</CardTitle>
          <CardDescription>Revisa y aprueba las solicitudes de pago según los niveles de autorización</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Solicitado Por</TableHead>
                <TableHead>Urgencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagosFiltrados.map((pago) => (
                <TableRow key={pago.id}>
                  <TableCell className="font-medium">{pago.id}</TableCell>
                  <TableCell>{pago.proveedor}</TableCell>
                  <TableCell className="max-w-xs truncate">{pago.concepto}</TableCell>
                  <TableCell className="font-semibold">${pago.monto.toLocaleString()}</TableCell>
                  <TableCell>{pago.solicitadoPor}</TableCell>
                  <TableCell>
                    <Badge className={urgenciaColors[pago.urgencia as keyof typeof urgenciaColors]}>
                      {pago.urgencia}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={estadoColors[pago.estado as keyof typeof estadoColors]}>{pago.estado}</Badge>
                  </TableCell>
                  <TableCell>
                    {pago.estado === "pendiente" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAprobar(pago.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRechazar(pago.id)}>
                          <XCircle className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Workflow de Aprobación */}
      <Card>
        <CardHeader>
          <CardTitle>Niveles de Aprobación</CardTitle>
          <CardDescription>Configuración de límites y niveles de autorización</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-green-700">Nivel 1 - Supervisor</h4>
                <p className="text-sm text-gray-600">Hasta $100,000</p>
                <p className="text-xs text-gray-500">Aprobación automática</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-yellow-700">Nivel 2 - Gerente</h4>
                <p className="text-sm text-gray-600">$100,001 - $500,000</p>
                <p className="text-xs text-gray-500">Requiere aprobación manual</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-red-700">Nivel 3 - Director</h4>
                <p className="text-sm text-gray-600">Más de $500,000</p>
                <p className="text-xs text-gray-500">Requiere doble aprobación</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
