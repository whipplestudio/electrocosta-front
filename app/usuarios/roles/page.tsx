"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { rolesService } from "@/services/roles.service"
import { useToast } from "@/hooks/use-toast"
import type { Role } from "@/types/users"
import { RouteProtection } from "@/components/route-protection"

export default function RolesPage() {
  return (
    <RouteProtection requiredPermissions={["usuarios.roles.ver"]}>
      <RolesPageContent />
    </RouteProtection>
  )
}

function RolesPageContent() {
  const { toast } = useToast()
  const [roles, setRoles] = useState<Role[]>([])
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [roleFormData, setRoleFormData] = useState<{name?: string; description?: string; level?: number}>({ level: 1 })

  useEffect(() => {
    loadRoles()
  }, [])

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

  const handleCreateRole = () => {
    setSelectedRole(null)
    setRoleFormData({ level: 1 })
    setIsRoleDialogOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setRoleFormData({
      name: role.name,
      description: role.description,
      level: role.level,
    })
    setIsRoleDialogOpen(true)
  }

  const handleSaveRole = async () => {
    try {
      if (selectedRole) {
        await rolesService.update(selectedRole.id, roleFormData as any)
        toast({
          title: "Rol actualizado",
          description: "El rol ha sido actualizado exitosamente",
        })
      } else {
        await rolesService.create(roleFormData as any)
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles</h1>
          <p className="text-muted-foreground">Gestiona los roles del sistema</p>
        </div>
      </div>

      <div className="space-y-6">
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
      </div>

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
