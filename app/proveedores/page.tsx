"use client"

import { useState } from "react"
import { Plus, Filter, Download, Eye, Edit, Star, Building, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const proveedores = [
  {
    id: "PROV001",
    nombre: "Distribuidora Eléctrica Nacional",
    rfc: "DEN850101DEN",
    email: "ventas@electricanacional.com",
    telefono: "+52 55 1111-2222",
    categoria: "Material Eléctrico",
    calificacion: 5,
    saldoPendiente: 85000,
    ultimaCompra: "2024-01-18",
    estado: "Activo",
    diasCredito: 30,
  },
  {
    id: "PROV002",
    nombre: "Cables y Conductores SA",
    rfc: "CCS901201CCS",
    email: "contacto@cablesyconductores.com",
    telefono: "+52 55 3333-4444",
    categoria: "Cables",
    calificacion: 4,
    saldoPendiente: 125000,
    ultimaCompra: "2024-01-20",
    estado: "Activo",
    diasCredito: 45,
  },
  {
    id: "PROV003",
    nombre: "Herramientas Industriales del Centro",
    rfc: "HIC780301HIC",
    email: "admin@herramientascentro.com",
    telefono: "+52 55 5555-6666",
    categoria: "Herramientas",
    calificacion: 3,
    saldoPendiente: 45000,
    ultimaCompra: "2024-01-15",
    estado: "Evaluación",
    diasCredito: 15,
  },
]

export default function ProveedoresPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("todas")

  const filteredProveedores = proveedores.filter((proveedor) => {
    const matchesSearch =
      proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor.rfc.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "todas" || proveedor.categoria.toLowerCase() === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalSaldo = proveedores.reduce((sum, prov) => sum + prov.saldoPendiente, 0)
  const proveedoresActivos = proveedores.filter((p) => p.estado === "Activo").length
  const promedioCalificacion = proveedores.reduce((sum, prov) => sum + prov.calificacion, 0) / proveedores.length

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Proveedores</h1>
          <p className="text-muted-foreground">Administra tu cadena de suministro y relaciones comerciales</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proveedores</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proveedores.length}</div>
            <p className="text-xs text-muted-foreground">{proveedoresActivos} activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSaldo.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Por pagar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promedioCalificacion.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">De 5 estrellas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Diferentes tipos</p>
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="material eléctrico">Material Eléctrico</SelectItem>
                <SelectItem value="cables">Cables</SelectItem>
                <SelectItem value="herramientas">Herramientas</SelectItem>
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

      {/* Tabla de Proveedores */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Proveedores</CardTitle>
          <CardDescription>{filteredProveedores.length} proveedor(es) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>RFC</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProveedores.map((proveedor) => (
                <TableRow key={proveedor.id}>
                  <TableCell className="font-medium">{proveedor.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{proveedor.nombre}</div>
                      <div className="text-sm text-muted-foreground">Crédito: {proveedor.diasCredito} días</div>
                    </div>
                  </TableCell>
                  <TableCell>{proveedor.rfc}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {proveedor.email}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {proveedor.telefono}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{proveedor.categoria}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < proveedor.calificacion ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm ml-1">{proveedor.calificacion}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-orange-600">${proveedor.saldoPendiente.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={proveedor.estado === "Activo" ? "default" : "secondary"}>{proveedor.estado}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
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
