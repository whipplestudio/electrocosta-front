"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Eye, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

const auditLogs = [
  {
    id: 1,
    usuario: "Juan Pérez",
    accion: "Inicio de sesión",
    modulo: "Sistema",
    fecha: "2024-01-15 09:30:00",
    ip: "192.168.1.100",
    estado: "exitoso",
    detalles: "Acceso desde navegador Chrome",
  },
  {
    id: 2,
    usuario: "María García",
    accion: "Modificación de factura",
    modulo: "Facturas",
    fecha: "2024-01-15 10:15:00",
    ip: "192.168.1.105",
    estado: "exitoso",
    detalles: "Factura #F-2024-001 - Cambio de monto",
  },
  {
    id: 3,
    usuario: "Carlos López",
    accion: "Intento de acceso fallido",
    modulo: "Sistema",
    fecha: "2024-01-15 11:00:00",
    ip: "192.168.1.110",
    estado: "fallido",
    detalles: "Contraseña incorrecta - 3 intentos",
  },
  {
    id: 4,
    usuario: "Ana Rodríguez",
    accion: "Eliminación de cliente",
    modulo: "Clientes",
    fecha: "2024-01-15 14:20:00",
    ip: "192.168.1.102",
    estado: "exitoso",
    detalles: "Cliente: Empresa ABC S.A.",
  },
  {
    id: 5,
    usuario: "Luis Martínez",
    accion: "Exportación de reporte",
    modulo: "Reportes",
    fecha: "2024-01-15 16:45:00",
    ip: "192.168.1.108",
    estado: "exitoso",
    detalles: "Reporte de flujo de efectivo - Enero 2024",
  },
]

export default function AuditoriaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterModulo, setFilterModulo] = useState("todos")
  const [filterEstado, setFilterEstado] = useState("todos")

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.detalles.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesModulo = filterModulo === "todos" || log.modulo.toLowerCase() === filterModulo
    const matchesEstado = filterEstado === "todos" || log.estado === filterEstado

    return matchesSearch && matchesModulo && matchesEstado
  })

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "exitoso":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Exitoso
          </Badge>
        )
      case "fallido":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Fallido
          </Badge>
        )
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Auditoría del Sistema</h1>
          <p className="text-muted-foreground">Registro de actividades y accesos al sistema</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Exportar Logs
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+12% desde ayer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accesos Exitosos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,198</div>
            <p className="text-xs text-muted-foreground">96.1% tasa de éxito</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intentos Fallidos</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">49</div>
            <p className="text-xs text-muted-foreground">3.9% del total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Seguridad</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuario, acción o detalles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterModulo} onValueChange={setFilterModulo}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los módulos</SelectItem>
                <SelectItem value="sistema">Sistema</SelectItem>
                <SelectItem value="facturas">Facturas</SelectItem>
                <SelectItem value="clientes">Clientes</SelectItem>
                <SelectItem value="reportes">Reportes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="exitoso">Exitoso</SelectItem>
                <SelectItem value="fallido">Fallido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de logs */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Auditoría</CardTitle>
          <CardDescription>
            Mostrando {filteredLogs.length} de {auditLogs.length} eventos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.usuario}</TableCell>
                  <TableCell>{log.accion}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.modulo}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{log.fecha}</TableCell>
                  <TableCell className="text-sm font-mono">{log.ip}</TableCell>
                  <TableCell>{getEstadoBadge(log.estado)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{log.detalles}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
