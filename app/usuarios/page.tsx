"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Shield, Users, Key } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  lastLogin: string
  permissions: string[]
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan.perez@electrocosta.com",
    role: "Administrador",
    status: "active",
    lastLogin: "2024-01-15 10:30",
    permissions: ["all"],
  },
  {
    id: "2",
    name: "María González",
    email: "maria.gonzalez@electrocosta.com",
    role: "Contador",
    status: "active",
    lastLogin: "2024-01-15 09:15",
    permissions: ["cuentas_cobrar", "cuentas_pagar", "reportes"],
  },
  {
    id: "3",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@electrocosta.com",
    role: "Vendedor",
    status: "inactive",
    lastLogin: "2024-01-10 16:45",
    permissions: ["cuentas_cobrar", "clientes"],
  },
]

const mockRoles: Role[] = [
  {
    id: "1",
    name: "Administrador",
    description: "Acceso completo al sistema",
    permissions: ["all"],
    userCount: 1,
  },
  {
    id: "2",
    name: "Contador",
    description: "Gestión de cuentas y reportes financieros",
    permissions: ["cuentas_cobrar", "cuentas_pagar", "reportes", "facturas"],
    userCount: 3,
  },
  {
    id: "3",
    name: "Vendedor",
    description: "Gestión de clientes y cuentas por cobrar",
    permissions: ["cuentas_cobrar", "clientes", "facturas"],
    userCount: 5,
  },
  {
    id: "4",
    name: "Tesorero",
    description: "Gestión de pagos y tesorería",
    permissions: ["cuentas_pagar", "tesoreria", "reportes"],
    userCount: 2,
  },
]

const availablePermissions = [
  { id: "dashboard", name: "Dashboard Ejecutivo" },
  { id: "cuentas_cobrar", name: "Cuentas por Cobrar" },
  { id: "cuentas_pagar", name: "Cuentas por Pagar" },
  { id: "carga_informacion", name: "Carga de Información" },
  { id: "reportes", name: "Reportes" },
  { id: "facturas", name: "Facturas" },
  { id: "clientes", name: "Clientes" },
  { id: "proveedores", name: "Proveedores" },
  { id: "tesoreria", name: "Tesorería" },
  { id: "usuarios", name: "Usuarios y Accesos" },
  { id: "configuracion", name: "Configuración" },
]

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [roles, setRoles] = useState<Role[]>(mockRoles)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const handleCreateUser = () => {
    setSelectedUser(null)
    setIsUserDialogOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsUserDialogOpen(true)
  }

  const handleCreateRole = () => {
    setSelectedRole(null)
    setIsRoleDialogOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setIsRoleDialogOpen(true)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Administrador":
        return "bg-red-100 text-red-800"
      case "Contador":
        return "bg-blue-100 text-blue-800"
      case "Vendedor":
        return "bg-green-100 text-green-800"
      case "Tesorero":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuarios y Control de Accesos</h1>
          <p className="text-muted-foreground">Gestiona usuarios, roles y permisos del sistema</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Permisos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Input placeholder="Buscar usuarios..." className="w-80" />
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="contador">Contador</SelectItem>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateUser}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>Gestiona los usuarios del sistema y sus accesos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "default" : "secondary"}>
                          {user.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="roles" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Input placeholder="Buscar roles..." className="w-80" />
            </div>
            <Button onClick={handleCreateRole}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Rol
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <Badge variant="outline">{role.userCount} usuarios</Badge>
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Permisos:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {role.permissions.includes("all") ? (
                          <Badge variant="secondary">Todos los permisos</Badge>
                        ) : (
                          role.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {availablePermissions.find((p) => p.id === permission)?.name || permission}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Permisos</CardTitle>
              <CardDescription>Visualiza y gestiona los permisos por rol</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Módulo</th>
                      {roles.map((role) => (
                        <th key={role.id} className="text-center p-2 min-w-24">
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {availablePermissions.map((permission) => (
                      <tr key={permission.id} className="border-b">
                        <td className="p-2 font-medium">{permission.name}</td>
                        {roles.map((role) => (
                          <td key={role.id} className="text-center p-2">
                            <Switch
                              checked={role.permissions.includes("all") || role.permissions.includes(permission.id)}
                              disabled={role.permissions.includes("all")}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para crear/editar usuario */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
            <DialogDescription>
              {selectedUser ? "Modifica los datos del usuario" : "Crea un nuevo usuario en el sistema"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" placeholder="Ingresa el nombre completo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="usuario@electrocosta.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="active" />
              <Label htmlFor="active">Usuario activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsUserDialogOpen(false)}>
              {selectedUser ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear/editar rol */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedRole ? "Editar Rol" : "Nuevo Rol"}</DialogTitle>
            <DialogDescription>
              {selectedRole ? "Modifica los permisos del rol" : "Crea un nuevo rol con permisos específicos"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Nombre del rol</Label>
              <Input id="roleName" placeholder="Ej: Supervisor de Ventas" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleDescription">Descripción</Label>
              <Input id="roleDescription" placeholder="Describe las responsabilidades del rol" />
            </div>
            <div className="space-y-2">
              <Label>Permisos</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Switch id={permission.id} />
                    <Label htmlFor={permission.id} className="text-sm">
                      {permission.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsRoleDialogOpen(false)}>{selectedRole ? "Guardar Cambios" : "Crear Rol"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
