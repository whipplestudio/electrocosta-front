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
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Shield, Loader2, Eye, EyeOff } from "lucide-react"
import { usersService } from "@/services/users.service"
import { rolesService } from "@/services/roles.service"
import { authService } from "@/services/auth.service"
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
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingUser, setSavingUser] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<UserStatus | "all">("all")
  const [formData, setFormData] = useState<Partial<CreateUserDto>>({})
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    loadUsers()
    loadRoles()
    
    // Obtener rol del usuario actual
    const currentUser = authService.getCurrentUser()
    console.log("👤 Usuario actual:", currentUser)
    
    if (currentUser?.role?.name) {
      // Usuario guardado en localStorage (tiene rol completo)
      console.log("✅ Rol detectado:", currentUser.role.name)
      setCurrentUserRole(currentUser.role.name)
    } else {
      console.warn("⚠️ No se pudo detectar el rol. Por favor, cierra sesión e inicia sesión nuevamente.")
    }
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
    setShowPassword(false)
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
      password: "", // Limpiar contraseña al editar
    })
    setShowPassword(false)
    setIsUserDialogOpen(true)
  }

  const handleSaveUser = async () => {
    try {
      setSavingUser(true)
      if (selectedUser) {
        // Editar
        const { email: _email, cargo: _cargo, ...updatePayload } = formData
        
        // Si la contraseña está vacía, eliminarla del payload
        if (!updatePayload.password) {
          delete updatePayload.password
        }
        
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
        if (!formData.roleId) {
          toast({
            title: "Error",
            description: "El rol es requerido",
            variant: "destructive",
          })
          return
        }
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.empresa) {
          toast({
            title: "Error",
            description: "Todos los campos son requeridos",
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
      setShowPassword(false)
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
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona los usuarios del sistema y sus accesos</p>
        </div>
      </div>

      <div className="space-y-6">
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
      </div>

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
                <Label htmlFor="firstName">Nombre *</Label>
                <Input id="firstName" placeholder="Nombre" value={formData.firstName || ""} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input id="lastName" placeholder="Apellido" value={formData.lastName || ""} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="usuario@electrocosta.com" value={formData.email || ""} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>
            {(!selectedUser || currentUserRole === 'super_admin') && (
              <div className="space-y-2">
                <Label htmlFor="password">{selectedUser ? "Nueva Contraseña (opcional)" : "Contraseña *"}</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder={selectedUser ? "Dejar vacío para no cambiar" : "********"} 
                    value={formData.password || ""} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    required={!selectedUser}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa *</Label>
              <Input id="empresa" placeholder="Nombre de la empresa" value={formData.empresa || ""} onChange={(e) => setFormData({...formData, empresa: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol *</Label>
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
            <Button variant="outline" onClick={() => {
              setIsUserDialogOpen(false)
              setShowPassword(false)
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser} disabled={savingUser}>
              {savingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedUser ? (savingUser ? "Guardando..." : "Guardar Cambios") : (savingUser ? "Creando..." : "Crear Usuario")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
