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
import { Upload, Download, Plus, Search, FileText, Calendar } from "lucide-react"

export default function ProyectosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const proyectos = [
    {
      id: "PROY-2024-001",
      nombre: "Edificio Residencial Torre Norte",
      cliente: "Constructora ABC S.A.",
      valorContrato: 2500000,
      fechaInicio: "2024-01-15",
      fechaFin: "2024-06-15",
      estado: "En Progreso",
      avance: 35,
      responsable: "Ing. Carlos Méndez",
      categoria: "Construcción",
    },
    {
      id: "PROY-2024-002",
      nombre: "Modernización Planta Industrial",
      cliente: "Industrias XYZ Ltda.",
      valorContrato: 1800000,
      fechaInicio: "2024-02-01",
      fechaFin: "2024-08-01",
      estado: "Planificación",
      avance: 10,
      responsable: "Ing. Ana García",
      categoria: "Industrial",
    },
    {
      id: "PROY-2023-015",
      nombre: "Centro Comercial Plaza Sur",
      cliente: "Desarrollos Comerciales SA",
      valorContrato: 3200000,
      fechaInicio: "2023-08-01",
      fechaFin: "2024-01-31",
      estado: "Completado",
      avance: 100,
      responsable: "Ing. María Rodríguez",
      categoria: "Comercial",
    },
  ]

  const filteredProyectos = proyectos.filter((proyecto) => {
    const matchesSearch =
      proyecto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || proyecto.estado.toLowerCase().replace(" ", "") === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalValor = filteredProyectos.reduce((sum, proyecto) => sum + proyecto.valorContrato, 0)

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "En Progreso":
        return <Badge className="bg-blue-50 text-blue-700">En Progreso</Badge>
      case "Planificación":
        return <Badge className="bg-yellow-50 text-yellow-700">Planificación</Badge>
      case "Completado":
        return <Badge className="bg-green-50 text-green-700">Completado</Badge>
      case "Pausado":
        return <Badge className="bg-red-50 text-red-700">Pausado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carga de Proyectos</h1>
          <p className="text-muted-foreground">Gestión de proyectos y contratos</p>
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
                Nuevo Proyecto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Proyecto</DialogTitle>
                <DialogDescription>Crea un nuevo proyecto en el sistema</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Nombre del proyecto" />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente1">Constructora ABC S.A.</SelectItem>
                    <SelectItem value="cliente2">Industrias XYZ Ltda.</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Valor del contrato" />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" placeholder="Fecha inicio" />
                  <Input type="date" placeholder="Fecha fin" />
                </div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carlos">Ing. Carlos Méndez</SelectItem>
                    <SelectItem value="ana">Ing. Ana García</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea placeholder="Descripción del proyecto..." />
              </div>
              <DialogFooter>
                <Button>Crear Proyecto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValor.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredProyectos.length} proyectos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {proyectos.filter((p) => p.estado === "En Progreso").length}
            </div>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {proyectos.filter((p) => p.estado === "Completado").length}
            </div>
            <p className="text-xs text-muted-foreground">Finalizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avance Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(proyectos.reduce((sum, p) => sum + p.avance, 0) / proyectos.length)}%
            </div>
            <p className="text-xs text-muted-foreground">General</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Carga Masiva de Proyectos</CardTitle>
          <CardDescription>Importa múltiples proyectos desde archivo Excel</CardDescription>
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
          <CardTitle>Listado de Proyectos</CardTitle>
          <CardDescription>Proyectos registrados y su estado actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, cliente o ID..."
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
                <SelectItem value="enprogreso">En Progreso</SelectItem>
                <SelectItem value="planificacion">Planificación</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Avance</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProyectos.map((proyecto) => (
                  <TableRow key={proyecto.id}>
                    <TableCell className="font-medium">{proyecto.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{proyecto.nombre}</div>
                        <div className="text-sm text-muted-foreground">{proyecto.responsable}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{proyecto.cliente}</div>
                        <div className="text-sm text-muted-foreground">{proyecto.categoria}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${proyecto.valorContrato.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{proyecto.fechaInicio}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Fin: {proyecto.fechaFin}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${proyecto.avance}%` }}></div>
                        </div>
                        <span className="text-sm">{proyecto.avance}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(proyecto.estado)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Ver
                        </Button>
                        <Button size="sm">Editar</Button>
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
