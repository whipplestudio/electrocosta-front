"use client"

import { useState, useEffect } from "react"
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus, Edit, Trash2, Shield, Users, Key, Loader2 } from "lucide-react"
import { usersService } from "@/services/users.service"
import { rolesService } from "@/services/roles.service"
import { permissionsService, type Permission } from "@/services/permissions.service"
import { useToast } from "@/hooks/use-toast"
import type { User, Role, UserStatus, CreateUserDto, UpdateUserDto } from "@/types/users"
import { RouteProtection } from "@/components/route-protection"

// Los permisos ahora se cargan dinámicamente desde la API

export default function UsuariosPage() {
  return (
    <RouteProtection requiredPermissions={["usuarios.usuarios.ver"]}>
      <UsuariosPageContent />
    </RouteProtection>
  )
}

function UsuariosPageContent() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingUser, setSavingUser] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<UserStatus | "all">("all")
  const [formData, setFormData] = useState<Partial<CreateUserDto>>({})
  const [roleFormData, setRoleFormData] = useState<{name?: string; description?: string; level?: number; permissions?: string[]}>({ permissions: [] })
  const [updatingPermission, setUpdatingPermission] = useState<string | null>(null) // Para trackear roleId-permissionCode siendo actualizado

  // Cargar datos iniciales
  useEffect(() => {
    loadUsers()
    loadRoles()
    loadPermissions()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await usersService.getAll({
        search: searchQuery || undefined,
        role: filterRole || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      })
      setUsers(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar usuarios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const data = await rolesService.getAll()
      setRoles(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar roles",
        variant: "destructive",
      })
    }
  }

  const loadPermissions = async () => {
    try {
      const data = await permissionsService.getAll()
      // Ordenar por módulo, recurso y acción para mejor visualización
      const sorted = data.sort((a, b) => {
        if (a.module !== b.module) return a.module.localeCompare(b.module)
        if (a.resource !== b.resource) return a.resource.localeCompare(b.resource)
        return a.action.localeCompare(b.action)
      })
      setPermissions(sorted)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar permisos",
        variant: "destructive",
      })
    }
  }

  // Agrupar permisos por módulo y recurso
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = {}
    }
    if (!acc[permission.module][permission.resource]) {
      acc[permission.module][permission.resource] = []
    }
    acc[permission.module][permission.resource].push(permission)
    return acc
  }, {} as Record<string, Record<string, Permission[]>>)

  // Nombres legibles para los módulos
  const moduleNames: Record<string, string> = {
    usuarios: "Usuarios y Roles",
    cuentas_cobrar: "Cuentas por Cobrar",
    cuentas_pagar: "Cuentas por Pagar",
    reportes: "Reportes",
    dashboard: "Dashboard",
    carga_informacion: "Área de Carga",
  }

  // Nombres legibles para los recursos
  const resourceNames: Record<string, string> = {
    usuarios: "Usuarios",
    roles: "Roles",
    permisos: "Permisos",
    registro: "Registro",
    seguimiento: "Seguimiento",
    pagos: "Aplicación de Pagos",
    programacion: "Programación",
    aprobacion: "Aprobación",
    reportes: "Reportes",
    detallados: "Reportes Detallados",
    descargables: "Reportes Descargables",
    personalizados: "Reportes Personalizados",
    general: "Dashboard General",
    financiero: "Dashboard Financiero",
    modulo: "Acceso al Módulo",
    ventas: "Ventas",
    gastos: "Gastos",
    proyectos: "Proyectos",
    anticipos: "Anticipos",
  }

  // Nombres legibles para las acciones
  const actionNames: Record<string, string> = {
    ver: "Ver",
    crear: "Crear",
    editar: "Editar",
    eliminar: "Eliminar",
    asignar: "Asignar",
    aplicar: "Aplicar",
    generar: "Generar",
    descargar: "Descargar",
    programar: "Programar",
    aprobar: "Aprobar",
    acceder: "Acceder",
  }

  const handleTogglePermission = async (roleId: string, permissionCode: string, checked: boolean) => {
    const permissionKey = `${roleId}-${permissionCode}`
    
    try {
      setUpdatingPermission(permissionKey)
      
      const role = roles.find((r) => r.id === roleId)
      if (!role) return

      // Trabajar con codes directamente; el backend acepta IDs o codes y los resuelve
      const currentPermissionCodes = (role.permissions || []).map((p: any) => p.code)

      let newPermissionCodes: string[]
      if (checked) {
        // Asignar permiso
        if (currentPermissionCodes.includes(permissionCode)) {
          return
        }
        newPermissionCodes = [...currentPermissionCodes, permissionCode]
      } else {
        // Revocar permiso
        newPermissionCodes = currentPermissionCodes.filter((code) => code !== permissionCode)
      }

      await rolesService.assignPermissions(roleId, newPermissionCodes)
      toast({
        title: "Permiso actualizado",
        description: checked ? "Permiso asignado correctamente" : "Permiso revocado correctamente",
      })
      await loadRoles()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar permiso",
        variant: "destructive",
      })
    } finally {
      setUpdatingPermission(null)
    }
  }

  const handleRestoreUser = async (userId: string) => {
    try {
      setUpdatingUserId(userId)
      await usersService.restore(userId)
      toast({
        title: "Usuario habilitado",
        description: "El usuario ha sido habilitado exitosamente",
      })
      loadUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al habilitar usuario",
        variant: "destructive",
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return
    
    try {
      setUpdatingUserId(userId)
      await usersService.delete(userId)
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente",
      })
      loadUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar usuario",
        variant: "destructive",
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  // Recargar usuarios cuando cambien los filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, filterRole, filterStatus])

  const handleCreateUser = () => {
    setSelectedUser(null)
    setFormData({})
    setIsUserDialogOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      empresa: user.empresa,
      phone: user.phone || "",
      cargo: user.cargo || "",
      roleId: user.roleId,
      departmentId: user.departmentId,
      status: user.status,
    })
    setIsUserDialogOpen(true)
  }

  const handleSaveUser = async () => {
    try {
      setSavingUser(true)
      if (selectedUser) {
        // Editar
        const { email: _email, cargo: _cargo, ...updatePayload } = formData
        await usersService.update(selectedUser.id, updatePayload as UpdateUserDto)
        toast({
          title: "Usuario actualizado",
          description: "El usuario ha sido actualizado exitosamente",
        })
      } else {
        // Crear
        if (!formData.password) {
          toast({
            title: "Error",
            description: "La contraseña es requerida",
            variant: "destructive",
          })
          return
        }
        await usersService.create(formData as CreateUserDto)
        toast({
          title: "Usuario creado",
          description: "El usuario ha sido creado exitosamente",
        })
      }
      setIsUserDialogOpen(false)
      loadUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar usuario",
        variant: "destructive",
      })
    }
    finally {
      setSavingUser(false)
    }
  }

  const handleCreateRole = () => {
    setSelectedRole(null)
    setRoleFormData({ permissions: [], level: 1 })
    setIsRoleDialogOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setRoleFormData({
      name: role.name,
      description: role.description,
      level: role.level,
      permissions: [],
    })
    setIsRoleDialogOpen(true)
  }

  const handleSaveRole = async () => {
    try {
      if (selectedRole) {
        const { permissions: _permissions, ...rolePayload } = roleFormData
        await rolesService.update(selectedRole.id, rolePayload as any)
        toast({
          title: "Rol actualizado",
          description: "El rol ha sido actualizado exitosamente",
        })
      } else {
        const { permissions: _permissions, ...rolePayload } = roleFormData
        await rolesService.create(rolePayload as any)
        toast({
          title: "Rol creado",
          description: "El rol ha sido creado exitosamente",
        })
      }
      setIsRoleDialogOpen(false)
      loadRoles()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar rol",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("¿Estás seguro de eliminar este rol?")) return
    
    try {
      await rolesService.delete(roleId)
      toast({
        title: "Rol eliminado",
        description: "El rol ha sido eliminado exitosamente",
      })
      loadRoles()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar rol",
        variant: "destructive",
      })
    }
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
              <Input placeholder="Buscar usuarios..." className="w-80" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as UserStatus | "all")}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No se encontraron usuarios
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role.name)}>{user.role.name}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === "activo" ? "default" : "secondary"}>
                            {user.status === "activo" ? "Activo" : user.status === "inactivo" ? "Inactivo" : "Pendiente"}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleString("es-MX") : "Nunca"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              disabled={!!updatingUserId}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.deletedAt ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRestoreUser(user.id)}
                                disabled={updatingUserId === user.id}
                              >
                                {updatingUserId === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Shield className="h-4 w-4" />
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={updatingUserId === user.id}
                              >
                                {updatingUserId === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
                    <Badge variant="outline">{role._count?.users || 0} usuarios</Badge>
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Nivel:</Label>
                      <p className="text-sm text-muted-foreground mt-1">Nivel {role.level}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteRole(role.id)}>
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
              <CardDescription>Gestiona los permisos por rol organizados por módulos</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Encabezado de roles */}
              <div className="mb-4 flex gap-2 items-center">
                <div className="flex-1 font-semibold text-sm">Permiso</div>
                {roles.map((role) => (
                  <div key={role.id} className="w-24 text-center">
                    <Badge variant="outline" className="text-xs">
                      {role.name}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Acordeones por módulo */}
              <Accordion type="multiple" className="w-full">
                {Object.entries(groupedPermissions).map(([module, resources]) => (
                  <AccordionItem key={module} value={module}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="font-semibold">{moduleNames[module] || module}</span>
                        <Badge variant="secondary" className="ml-2">
                          {Object.values(resources).flat().length} permisos
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {Object.entries(resources).map(([resource, perms]) => (
                          <div key={resource} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
                              <Key className="h-3 w-3" />
                              {resourceNames[resource] || resource}
                            </h4>
                            <div className="space-y-2">
                              {perms.map((permission) => (
                                <div key={permission.id} className="flex items-center gap-2 py-1">
                                  <div className="flex-1 text-sm text-muted-foreground">
                                    {actionNames[permission.action] || permission.action}
                                  </div>
                                  {roles.map((role) => {
                                    const isChecked = !!role.permissions?.some(
                                      (p: any) => p.code === permission.code
                                    )
                                    const permissionKey = `${role.id}-${permission.code}`
                                    const isUpdating = updatingPermission === permissionKey
                                    const isSuperAdmin = role.name === 'super_admin'

                                    return (
                                      <div key={role.id} className="w-24 flex justify-center items-center">
                                        {isUpdating ? (
                                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        ) : (
                                          <Switch
                                            checked={isChecked}
                                            disabled={updatingPermission !== null || isSuperAdmin}
                                            onCheckedChange={(checked) => {
                                              handleTogglePermission(role.id, permission.code, checked)
                                            }}
                                            className={isSuperAdmin ? "opacity-50 cursor-not-allowed" : ""}
                                          />
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" placeholder="Nombre" value={formData.firstName || ""} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" placeholder="Apellido" value={formData.lastName || ""} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="usuario@electrocosta.com" value={formData.email || ""} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            {!selectedUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" placeholder="********" value={formData.password || ""} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Input id="empresa" placeholder="Nombre de la empresa" value={formData.empresa || ""} onChange={(e) => setFormData({...formData, empresa: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select value={formData.roleId} onValueChange={(value) => setFormData({...formData, roleId: value})}>
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
              <Switch id="active" checked={formData.status === "activo"} onCheckedChange={(checked) => setFormData({...formData, status: checked ? "activo" : "inactivo"})} />
              <Label htmlFor="active">Usuario activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser} disabled={savingUser}>
              {savingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedUser ? (savingUser ? "Guardando..." : "Guardar Cambios") : (savingUser ? "Creando..." : "Crear Usuario")}
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
              <Input id="roleName" placeholder="Ej: Supervisor de Ventas" value={roleFormData.name || ""} onChange={(e) => setRoleFormData({...roleFormData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleDescription">Descripción</Label>
              <Input id="roleDescription" placeholder="Describe las responsabilidades del rol" value={roleFormData.description || ""} onChange={(e) => setRoleFormData({...roleFormData, description: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleLevel">Nivel</Label>
              <Input id="roleLevel" type="number" placeholder="1-10" value={roleFormData.level || 1} onChange={(e) => setRoleFormData({...roleFormData, level: parseInt(e.target.value) || 1})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRole}>{selectedRole ? "Guardar Cambios" : "Crear Rol"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
