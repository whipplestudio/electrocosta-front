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

export default function GastosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")

  const gastosOperativos = [
    {
      id: "GO-2024-001",
      descripcion: "Mantenimiento equipos eléctricos",
      categoria: "Mantenimiento",
      monto: 125000,
      fecha: "2024-01-15",
      proveedor: "Servicios Técnicos CR",
      estado: "Aprobado",
      centroCosto: "Operaciones",
      responsable: "Carlos Méndez",
    },
    {
      id: "GO-2024-002",
      descripcion: "Combustible vehículos",
      categoria: "Combustible",
      monto: 85000,
      fecha: "2024-01-18",
      proveedor: "Combustibles del Pacífico",
      estado: "Pagado",
      centroCosto: "Logística",
      responsable: "Ana García",
    },
    {
      id: "GO-2024-003",
      descripcion: "Materiales de oficina",
      categoria: "Suministros",
      monto: 35000,
      fecha: "2024-01-20",
      proveedor: "Papelería Central",
      estado: "Pendiente",
      centroCosto: "Administración",
      responsable: "María Rodríguez",
    },
  ]

  const categorias = [
    { nombre: "Mantenimiento", total: 125000, color: "bg-blue-50 text-blue-700" },
    { nombre: "Combustible", total: 85000, color: "bg-green-50 text-green-700" },
    { nombre: "Suministros", total: 35000, color: "bg-yellow-50 text-yellow-700" },
    { nombre: "Servicios", total: 95000, color: "bg-purple-50 text-purple-700" },
  ]

  const filteredGastos = gastosOperativos.filter((gasto) => {
    const matchesSearch =
      gasto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gasto.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gasto.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || gasto.categoria.toLowerCase() === filterCategory
    return matchesSearch && matchesCategory
  })

  const totalGastos = filteredGastos.reduce((sum, gasto) => sum + gasto.monto, 0)

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Aprobado":
        return <Badge className="bg-blue-50 text-blue-700">Aprobado</Badge>
      case "Pagado":
        return <Badge className="bg-green-50 text-green-700">Pagado</Badge>
      case "Pendiente":
        return <Badge className="bg-yellow-50 text-yellow-700">Pendiente</Badge>
      case "Rechazado":
        return <Badge className="bg-red-50 text-red-700">Rechazado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gastos Operativos</h1>
          <p className="text-muted-foreground">Gestión de gastos operativos y administrativos</p>
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
                Nuevo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
                <DialogDescription>Registra un gasto operativo en el sistema</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea placeholder="Descripción del gasto..." />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="combustible">Combustible</SelectItem>
                    <SelectItem value="suministros">Suministros</SelectItem>
                    <SelectItem value="servicios">Servicios</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Monto" />
                <Input type="date" placeholder="Fecha" />
                <Input placeholder="Proveedor" />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Centro de costo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operaciones">Operaciones</SelectItem>
                    <SelectItem value="administracion">Administración</SelectItem>
                    <SelectItem value="logistica">Logística</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button>Registrar Gasto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalGastos.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredGastos.length} gastos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              $
              {gastosOperativos
                .filter((g) => g.estado === "Pendiente")
                .reduce((sum, g) => sum + g.monto, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {gastosOperativos.filter((g) => g.estado === "Pendiente").length} gastos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              $
              {gastosOperativos
                .filter((g) => g.estado === "Aprobado")
                .reduce((sum, g) => sum + g.monto, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {gastosOperativos.filter((g) => g.estado === "Aprobado").length} gastos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pagados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              $
              {gastosOperativos
                .filter((g) => g.estado === "Pagado")
                .reduce((sum, g) => sum + g.monto, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {gastosOperativos.filter((g) => g.estado === "Pagado").length} gastos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Carga Masiva de Gastos</CardTitle>
            <CardDescription>Importa múltiples gastos desde archivo Excel</CardDescription>
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
            <CardTitle>Gastos por Categoría</CardTitle>
            <CardDescription>Distribución mensual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categorias.map((categoria, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{categoria.nombre}</div>
                  <div className="text-sm text-muted-foreground">${categoria.total.toLocaleString()}</div>
                </div>
                <Badge className={categoria.color}>{Math.round((categoria.total / 340000) * 100)}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Gastos Operativos</CardTitle>
          <CardDescription>Gastos registrados y su estado actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por descripción, proveedor o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="combustible">Combustible</SelectItem>
                <SelectItem value="suministros">Suministros</SelectItem>
                <SelectItem value="servicios">Servicios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGastos.map((gasto) => (
                  <TableRow key={gasto.id}>
                    <TableCell className="font-medium">{gasto.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{gasto.descripcion}</div>
                        <div className="text-sm text-muted-foreground">{gasto.proveedor}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{gasto.categoria}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">${gasto.monto.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {gasto.fecha}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(gasto.estado)}</TableCell>
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
