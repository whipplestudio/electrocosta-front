"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Users, Settings, Eye, Edit, Trash2, Plus } from "lucide-react"

const roles = [
  {
    id: 1,
    nombre: "Administrador",
    descripcion: "Acceso completo al sistema",
    usuarios: 2,
    permisos: ["crear", "leer", "actualizar", "eliminar", "administrar"],
    activo: true,
  },
  {
    id: 2,
    nombre: "Contador",
    descripcion: "Acceso a módulos financieros",
    usuarios: 5,
    permisos: ["crear", "leer", "actualizar"],
    activo: true,
  },
  {
    id: 3,
    nombre: "Vendedor",
    descripcion: "Acceso a ventas y clientes",
    usuarios: 8,
    permisos: ["crear", "leer"],
    activo: true,
  },
  {
    id: 4,
    nombre: "Consultor",
    descripcion: "Solo lectura de reportes",
    usuarios: 3,
    permisos: ["leer"],
    activo: false,
  },
]

const modulos = [
  { nombre: "Dashboard", crear: true, leer: true, actualizar: true, eliminar: false },
  { nombre: "Cuentas por Cobrar", crear: true, leer: true, actualizar: true, eliminar: true },
  { nombre: "Cuentas por Pagar", crear: true, leer: true, actualizar: true, eliminar: true },
  { nombre: "Facturas", crear: true, leer: true, actualizar: true, eliminar: false },
  { nombre: "Clientes", crear: true, leer: true, actualizar: true, eliminar: true },
  { nombre: "Proveedores", crear: true, leer: true, actualizar: true, eliminar: true },
  { nombre: "Reportes", crear: false, leer: true, actualizar: false, eliminar: false },
  { nombre: "Usuarios", crear: true, leer: true, actualizar: true, eliminar: true },
  { nombre: "Configuración", crear: false, leer: true, actualizar: true, eliminar: false },
]

export default function RBACPage() {
  const [selectedRole, setSelectedRole] = useState(1)

  const getPermisoBadge = (permiso: string) => {
    const colors = {
      crear: "bg-green-100 text-green-800",
      leer: "bg-blue-100 text-blue-800",
      actualizar: "bg-yellow-100 text-yellow-800",
      eliminar: "bg-red-100 text-red-800",
      administrar: "bg-purple-100 text-purple-800",
    }
    return <Badge className={colors[permiso as keyof typeof colors]}>{permiso}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Control de Accesos (RBAC)</h1>
          <p className="text-muted-foreground">Gestión de roles y permisos del sistema</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Rol
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">3 activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Asignados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">100% con roles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Módulos Protegidos</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9</div>
            <p className="text-xs text-muted-foreground">Con permisos CRUD</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nivel de Seguridad</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Alto</div>
            <p className="text-xs text-muted-foreground">RBAC implementado</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Gestión de Roles</TabsTrigger>
          <TabsTrigger value="permisos">Matriz de Permisos</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Roles del Sistema</CardTitle>
              <CardDescription>Administra los roles y sus permisos asociados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rol</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Usuarios</TableHead>
                    <TableHead>Permisos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((rol) => (
                    <TableRow key={rol.id}>
                      <TableCell className="font-medium">{rol.nombre}</TableCell>
                      <TableCell>{rol.descripcion}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{rol.usuarios} usuarios</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {rol.permisos.map((permiso) => (
                            <div key={permiso}>{getPermisoBadge(permiso)}</div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch checked={rol.activo} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permisos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Permisos por Módulo</CardTitle>
              <CardDescription>Configuración detallada de permisos CRUD para el rol Administrador</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Módulo</TableHead>
                    <TableHead className="text-center">Crear</TableHead>
                    <TableHead className="text-center">Leer</TableHead>
                    <TableHead className="text-center">Actualizar</TableHead>
                    <TableHead className="text-center">Eliminar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modulos.map((modulo, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{modulo.nombre}</TableCell>
                      <TableCell className="text-center">
                        <Switch checked={modulo.crear} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch checked={modulo.leer} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch checked={modulo.actualizar} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch checked={modulo.eliminar} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
