"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Plus, Search, CheckCircle } from "lucide-react"

export default function ProgramacionPagosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const pagosProgramados = [
    {
      id: "PP-001",
      proveedor: "Materiales Eléctricos SA",
      monto: 225000,
      fechaProgramada: "2024-01-18",
      metodoPago: "Transferencia",
      estado: "Programado",
      referencia: "CP-2024-015",
      banco: "Banco Nacional",
      responsable: "Ana García",
    },
    {
      id: "PP-002",
      proveedor: "Servicios de Mantenimiento",
      monto: 125000,
      fechaProgramada: "2024-01-22",
      metodoPago: "Cheque",
      estado: "Aprobado",
      referencia: "CP-2024-018",
      banco: "BCR",
      responsable: "Carlos Méndez",
    },
    {
      id: "PP-003",
      proveedor: "Combustibles del Pacífico",
      monto: 85000,
      fechaProgramada: "2024-01-25",
      metodoPago: "Transferencia",
      estado: "Ejecutado",
      referencia: "CP-2024-022",
      banco: "Banco Popular",
      responsable: "María Rodríguez",
    },
  ]

  const filteredPagos = pagosProgramados.filter((pago) => {
    const matchesSearch =
      pago.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || pago.estado.toLowerCase() === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalProgramado = filteredPagos.reduce((sum, pago) => sum + pago.monto, 0)

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Programado":
        return <Badge className="bg-blue-50 text-blue-700">Programado</Badge>
      case "Aprobado":
        return <Badge className="bg-yellow-50 text-yellow-700">Aprobado</Badge>
      case "Ejecutado":
        return <Badge className="bg-green-50 text-green-700">Ejecutado</Badge>
      case "Cancelado":
        return <Badge className="bg-red-50 text-red-700">Cancelado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Programación de Pagos</h1>
          <p className="text-muted-foreground">Gestión y seguimiento de pagos programados</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Programar Pago
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Programar Nuevo Pago</DialogTitle>
              <DialogDescription>Programa un pago para una cuenta por pagar</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cuenta por pagar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cp-001">CP-2024-025 - Proveedor ABC</SelectItem>
                  <SelectItem value="cp-002">CP-2024-026 - Servicios XYZ</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" placeholder="Fecha de pago" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transferencia">Transferencia bancaria</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Banco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bn">Banco Nacional</SelectItem>
                  <SelectItem value="bcr">Banco de Costa Rica</SelectItem>
                  <SelectItem value="bp">Banco Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button>Programar Pago</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Programado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalProgramado.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredPagos.length} pagos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              $
              {pagosProgramados
                .filter((p) => p.estado === "Programado")
                .reduce((sum, p) => sum + p.monto, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {pagosProgramados.filter((p) => p.estado === "Programado").length} pagos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              $
              {pagosProgramados
                .filter((p) => p.estado === "Aprobado")
                .reduce((sum, p) => sum + p.monto, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {pagosProgramados.filter((p) => p.estado === "Aprobado").length} pagos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ejecutados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              $
              {pagosProgramados
                .filter((p) => p.estado === "Ejecutado")
                .reduce((sum, p) => sum + p.monto, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {pagosProgramados.filter((p) => p.estado === "Ejecutado").length} pagos
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pagos Programados</CardTitle>
          <CardDescription>Lista de pagos programados y su estado actual</CardDescription>
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="programado">Programado</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="ejecutado">Ejecutado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Pago</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha Programada</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPagos.map((pago) => (
                  <TableRow key={pago.id}>
                    <TableCell className="font-medium">{pago.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pago.proveedor}</div>
                        <div className="text-sm text-muted-foreground">Ref: {pago.referencia}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${pago.monto.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {pago.fechaProgramada}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">{pago.metodoPago}</div>
                        <div className="text-xs text-muted-foreground">{pago.banco}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(pago.estado)}</TableCell>
                    <TableCell className="text-sm">{pago.responsable}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {pago.estado === "Programado" && (
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                        )}
                        {pago.estado === "Aprobado" && <Button size="sm">Ejecutar</Button>}
                        <Button size="sm" variant="outline">
                          Ver
                        </Button>
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
