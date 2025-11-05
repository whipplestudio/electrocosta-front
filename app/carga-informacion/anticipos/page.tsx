"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { Upload, Download, Plus, Search, FileText } from "lucide-react"

export default function AnticiposPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const anticipos = [
    {
      id: "ANT-2024-001",
      cliente: "Constructora ABC S.A.",
      proyecto: "Edificio Residencial Torre Norte",
      monto: 500000,
      fecha: "2024-01-05",
      estado: "Activo",
      saldoPendiente: 350000,
      porcentajeUsado: 30,
    },
    {
      id: "ANT-2024-002",
      cliente: "Industrias XYZ Ltda.",
      proyecto: "Modernización Planta Industrial",
      monto: 300000,
      fecha: "2024-01-08",
      estado: "Parcial",
      saldoPendiente: 150000,
      porcentajeUsado: 50,
    },
    {
      id: "ANT-2024-003",
      cliente: "Comercial 123 S.A.",
      proyecto: "Instalación Sistema Eléctrico",
      monto: 150000,
      fecha: "2024-01-10",
      estado: "Liquidado",
      saldoPendiente: 0,
      porcentajeUsado: 100,
    },
  ]

  const filteredAnticipos = anticipos.filter((anticipo) => {
    const matchesSearch =
      anticipo.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anticipo.proyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anticipo.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || anticipo.estado.toLowerCase() === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalAnticipos = filteredAnticipos.reduce((sum, anticipo) => sum + anticipo.monto, 0)
  const totalPendiente = filteredAnticipos.reduce((sum, anticipo) => sum + anticipo.saldoPendiente, 0)

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Activo":
        return <Badge className="bg-green-50 text-green-700">Activo</Badge>
      case "Parcial":
        return <Badge className="bg-yellow-50 text-yellow-700">Parcial</Badge>
      case "Liquidado":
        return <Badge className="bg-blue-50 text-blue-700">Liquidado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carga de Anticipos</h1>
          <p className="text-muted-foreground">Gestión de anticipos de clientes por proyecto</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Plantilla Excel
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Anticipo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Anticipo</DialogTitle>
                <DialogDescription>Registra un anticipo recibido de cliente</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente1">Constructora ABC S.A.</SelectItem>
                    <SelectItem value="cliente2">Industrias XYZ Ltda.</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Nombre del proyecto" />
                <Input type="number" placeholder="Monto del anticipo" />
                <Input type="date" placeholder="Fecha de recepción" />
                <Textarea placeholder="Observaciones..." />
              </div>
              <DialogFooter>
                <Button>Registrar Anticipo</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Anticipos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAnticipos.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredAnticipos.length} anticipos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Saldo Pendiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${totalPendiente.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Por liquidar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Anticipos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {anticipos.filter((a) => a.estado === "Activo").length}
            </div>
            <p className="text-xs text-muted-foreground">En proceso</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Liquidados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {anticipos.filter((a) => a.estado === "Liquidado").length}
            </div>
            <p className="text-xs text-muted-foreground">Completados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Carga Masiva de Anticipos</CardTitle>
          <CardDescription>Importa múltiples anticipos desde archivo Excel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Seleccionar archivo Excel
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">
                Arrastra y suelta tu archivo aquí, o haz clic para seleccionar
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Formatos soportados: .xlsx, .xls</p>
            <Button>Procesar Archivo</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Anticipos</CardTitle>
          <CardDescription>Anticipos registrados y su estado actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por cliente, proyecto o ID..."
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
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="parcial">Parcial</SelectItem>
                <SelectItem value="liquidado">Liquidado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Saldo Pendiente</TableHead>
                  <TableHead>% Usado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnticipos.map((anticipo) => (
                  <TableRow key={anticipo.id}>
                    <TableCell className="font-medium">{anticipo.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{anticipo.cliente}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{anticipo.proyecto}</div>
                    </TableCell>
                    <TableCell className="font-medium">${anticipo.monto.toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-orange-600">
                      ${anticipo.saldoPendiente.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${anticipo.porcentajeUsado}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{anticipo.porcentajeUsado}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(anticipo.estado)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Ver
                        </Button>
                        <Button size="sm">Liquidar</Button>
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
