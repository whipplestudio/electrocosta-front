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
    <div className="container mx-auto p-6 space-y-8">
      {/* Header mejorado con Material Design 3 */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Usuarios</h1>
        <p className="text-lg text-muted-foreground">Gestiona los usuarios del sistema y sus accesos</p>
      </div>

      {/* Controles con mejor diseño */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/50 p-4 rounded-xl border shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <Input 
            placeholder="Buscar usuarios..." 
            className="w-full sm:w-80 h-11" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as UserStatus | "all")}>
            <SelectTrigger className="w-full sm:w-44 h-11">
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
        <Button 
          onClick={handleCreateUser}
          size="lg"
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Card de tabla con mejor diseño */}
      <Card className="shadow-md border-0">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-semibold">Lista de Usuarios</CardTitle>
          <CardDescription className="text-base">Gestiona los usuarios del sistema y sus accesos</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Usuario</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Rol</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold">Último Acceso</TableHead>
                  <TableHead className="font-semibold text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <p className="text-base text-muted-foreground">No se encontraron usuarios</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-semibold">{user.firstName} {user.lastName}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={`${getRoleColor(user.role.name)} font-medium`}>{user.role.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.status === "activo" ? "default" : "secondary"}
                          className="font-medium"
                        >
                          {user.status === "activo" ? "Activo" : user.status === "inactivo" ? "Inactivo" : "Pendiente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString("es-MX") : "Nunca"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            disabled={!!updatingUserId}
                            className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.deletedAt ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRestoreUser(user.id)}
                              disabled={updatingUserId === user.id}
                              className="h-9 w-9 p-0 hover:bg-green-100 hover:text-green-700 transition-all"
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
                              className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive transition-all"
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
          </div>
        </CardContent>
      </Card>

      {/* Dialog mejorado con Material Design 3 */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle className="text-2xl font-semibold">
              {selectedUser ? "Editar Usuario" : "Nuevo Usuario"}
            </DialogTitle>
            <DialogDescription className="text-base">
              {selectedUser ? "Modifica los datos del usuario" : "Crea un nuevo usuario en el sistema"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-semibold">Nombre *</Label>
                <Input 
                  id="firstName" 
                  placeholder="Nombre" 
                  className="h-11"
                  value={formData.firstName || ""} 
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-semibold">Apellido *</Label>
                <Input 
                  id="lastName" 
                  placeholder="Apellido" 
                  className="h-11"
                  value={formData.lastName || ""} 
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email *</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="usuario@electrocosta.com" 
                className="h-11"
                value={formData.email || ""} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>
            {(!selectedUser || currentUserRole === 'super_admin') && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">
                  {selectedUser ? "Nueva Contraseña (opcional)" : "Contraseña *"}
                </Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder={selectedUser ? "Dejar vacío para no cambiar" : "********"} 
                    value={formData.password || ""} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    required={!selectedUser}
                    className="pr-10 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="empresa" className="text-sm font-semibold">Empresa *</Label>
              <Input 
                id="empresa" 
                placeholder="Nombre de la empresa" 
                className="h-11"
                value={formData.empresa || ""} 
                onChange={(e) => setFormData({...formData, empresa: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-semibold">Rol *</Label>
              <Select value={formData.roleId} onValueChange={(value) => setFormData({...formData, roleId: value})}>
                <SelectTrigger className="h-11">
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
            <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
              <Switch 
                id="active" 
                checked={formData.status === "activo"} 
                onCheckedChange={(checked) => setFormData({...formData, status: checked ? "activo" : "inactivo"})} 
              />
              <Label htmlFor="active" className="text-sm font-medium cursor-pointer">Usuario activo</Label>
            </div>
          </div>
          <DialogFooter className="gap-3 pt-6">
            <Button 
              variant="outline" 
              size="lg"
              className="font-medium"
              onClick={() => {
                setIsUserDialogOpen(false)
                setShowPassword(false)
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveUser} 
              disabled={savingUser}
              size="lg"
              className="bg-primary hover:bg-primary/90 font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {savingUser && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {selectedUser ? (savingUser ? "Guardando..." : "Guardar Cambios") : (savingUser ? "Creando..." : "Crear Usuario")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
