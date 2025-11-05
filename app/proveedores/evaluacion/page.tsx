"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Star, TrendingUp, AlertTriangle, CheckCircle, Search } from "lucide-react"

const proveedoresEvaluacion = [
  {
    id: 1,
    nombre: "Distribuidora Eléctrica del Norte",
    categoria: "Materiales Eléctricos",
    calificacionGeneral: 4.5,
    calidad: 4.8,
    puntualidad: 4.2,
    precio: 4.0,
    servicio: 4.5,
    ultimaEvaluacion: "2024-01-15",
    estado: "Aprobado",
    riesgo: "Bajo",
    pedidosCompletados: 45,
    pedidosPendientes: 2,
  },
  {
    id: 2,
    nombre: "Servicios Técnicos Especializados",
    categoria: "Servicios",
    calificacionGeneral: 3.8,
    calidad: 4.0,
    puntualidad: 3.5,
    precio: 3.8,
    servicio: 4.0,
    ultimaEvaluacion: "2024-01-10",
    estado: "En Revisión",
    riesgo: "Medio",
    pedidosCompletados: 28,
    pedidosPendientes: 5,
  },
  {
    id: 3,
    nombre: "Equipos Industriales SA",
    categoria: "Equipos y Herramientas",
    calificacionGeneral: 4.2,
    calidad: 4.5,
    puntualidad: 4.0,
    precio: 3.8,
    servicio: 4.3,
    ultimaEvaluacion: "2024-01-08",
    estado: "Aprobado",
    riesgo: "Bajo",
    pedidosCompletados: 32,
    pedidosPendientes: 1,
  },
]

export default function EvaluacionProveedoresPage() {
  const [filtroCategoria, setFiltroCategoria] = useState("all")
  const [filtroEstado, setFiltroEstado] = useState("all")
  const [busqueda, setBusqueda] = useState("")

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  const getRiskBadge = (riesgo: string) => {
    const variants = {
      Bajo: "bg-green-100 text-green-800",
      Medio: "bg-yellow-100 text-yellow-800",
      Alto: "bg-red-100 text-red-800",
    }
    return variants[riesgo as keyof typeof variants] || variants.Medio
  }

  const getStatusBadge = (estado: string) => {
    const variants = {
      Aprobado: "bg-green-100 text-green-800",
      "En Revisión": "bg-yellow-100 text-yellow-800",
      Rechazado: "bg-red-100 text-red-800",
    }
    return variants[estado as keyof typeof variants] || variants["En Revisión"]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Evaluación de Proveedores</h1>
          <p className="text-muted-foreground">Calificación y seguimiento del desempeño de proveedores</p>
        </div>
        <Button>
          <TrendingUp className="h-4 w-4 mr-2" />
          Nueva Evaluación
        </Button>
      </div>

      {/* KPIs de Evaluación */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Promedio General</p>
                <p className="text-2xl font-bold">4.2</p>
              </div>
              <div className="flex">{renderStars(4.2)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Proveedores Aprobados</p>
                <p className="text-2xl font-bold text-green-600">85%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Revisión</p>
                <p className="text-2xl font-bold text-yellow-600">12%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Riesgo Alto</p>
                <p className="text-2xl font-bold text-red-600">3%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
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
                  placeholder="Buscar proveedor..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="materiales">Materiales Eléctricos</SelectItem>
                <SelectItem value="servicios">Servicios</SelectItem>
                <SelectItem value="equipos">Equipos y Herramientas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="revision">En Revisión</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Evaluaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluaciones de Proveedores</CardTitle>
          <CardDescription>Calificaciones detalladas por proveedor</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>Calidad</TableHead>
                <TableHead>Puntualidad</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Riesgo</TableHead>
                <TableHead>Pedidos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proveedoresEvaluacion.map((proveedor) => (
                <TableRow key={proveedor.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{proveedor.nombre}</p>
                      <p className="text-sm text-muted-foreground">Última evaluación: {proveedor.ultimaEvaluacion}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{proveedor.categoria}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{proveedor.calificacionGeneral}</span>
                      <div className="flex">{renderStars(proveedor.calificacionGeneral)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{proveedor.calidad}</span>
                      </div>
                      <Progress value={proveedor.calidad * 20} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{proveedor.puntualidad}</span>
                      </div>
                      <Progress value={proveedor.puntualidad * 20} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{proveedor.precio}</span>
                      </div>
                      <Progress value={proveedor.precio * 20} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{proveedor.servicio}</span>
                      </div>
                      <Progress value={proveedor.servicio * 20} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(proveedor.estado)}>{proveedor.estado}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRiskBadge(proveedor.riesgo)}>{proveedor.riesgo}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="text-green-600">{proveedor.pedidosCompletados} completados</p>
                      <p className="text-yellow-600">{proveedor.pedidosPendientes} pendientes</p>
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
