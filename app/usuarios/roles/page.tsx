"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Shield, Users, Layers } from "lucide-react"
import { ActionButton, CreateButton } from "@/components/ui"
import { cn } from "@/lib/utils"
import { rolesService } from "@/services/roles.service"
import { toast } from 'sonner'
import type { Role } from "@/types/users"
import { RouteProtection } from "@/components/route-protection"
import { DynamicForm, FormFieldConfig } from "@/components/forms"

export default function RolesPage() {
  return (
    <RouteProtection requiredPermissions={["usuarios.roles.ver"]}>
      <RolesPageContent />
    </RouteProtection>
  )
}

function RolesPageContent() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [savingRole, setSavingRole] = useState(false)

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      const data = await rolesService.getAll()
      setRoles(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cargar roles')
    }
  }

  // Configuración de campos del formulario de roles
  const roleFormFields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'name',
      label: 'Nombre del rol',
      type: 'text',
      placeholder: 'Ej: Supervisor de Ventas',
      required: true,
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'text',
      placeholder: 'Describe las responsabilidades del rol',
    },
    {
      name: 'level',
      label: 'Nivel',
      type: 'number',
      placeholder: '1-10',
      required: true,
      min: 1,
      max: 10,
    },
  ], [])

  const getDefaultFormValues = () => {
    if (selectedRole) {
      return {
        name: selectedRole.name,
        description: selectedRole.description || '',
        level: selectedRole.level,
      }
    }
    return {
      name: '',
      description: '',
      level: 1,
    }
  }

  const handleCreateRole = () => {
    setSelectedRole(null)
    setIsRoleDialogOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setIsRoleDialogOpen(true)
  }

  const handleSaveRole = async (data: Record<string, any>) => {
    try {
      setSavingRole(true)
      if (selectedRole) {
        await rolesService.update(selectedRole.id, data as any)
        toast.success('El rol ha sido actualizado exitosamente')
      } else {
        await rolesService.create(data as any)
        toast.success('El rol ha sido creado exitosamente')
      }
      setIsRoleDialogOpen(false)
      loadRoles()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar rol')
    } finally {
      setSavingRole(false)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("¿Estás seguro de eliminar este rol?")) return
    
    try {
      await rolesService.delete(roleId)
      toast.success('El rol ha sido eliminado exitosamente')
      loadRoles()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar rol')
    }
  }

  const getRoleCardStyles = (level: number) => {
    if (level >= 8) return { iconBg: 'bg-red-50', iconColor: 'text-red-600', border: 'border-red-100' }
    if (level >= 5) return { iconBg: 'bg-purple-50', iconColor: 'text-purple-600', border: 'border-purple-100' }
    if (level >= 3) return { iconBg: 'bg-blue-50', iconColor: 'text-blue-600', border: 'border-blue-100' }
    return { iconBg: 'bg-green-50', iconColor: 'text-green-600', border: 'border-green-100' }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header - Material Design 3 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e7eb]">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#374151]">Roles</h1>
          <p className="text-[#6b7280]">Gestiona los roles y permisos del sistema</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Search removed - can be added back with FloatingInput if needed */}
          </div>
          <CreateButton onClick={handleCreateRole}>
            Nuevo Rol
          </CreateButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => {
            const styles = getRoleCardStyles(role.level)
            return (
              <Card key={role.id} className={cn("overflow-hidden border", styles.border)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", styles.iconBg)}>
                        <Shield className={cn("h-5 w-5", styles.iconColor)} />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-[#374151]">{role.name}</CardTitle>
                        {role.description && (
                          <CardDescription className="text-sm mt-0.5 line-clamp-1">
                            {role.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Stats row */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm text-[#6b7280]">
                        <Users className="h-4 w-4" />
                        <span className="font-medium text-[#374151]">{role._count?.users || 0}</span>
                        <span>usuarios</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-[#6b7280]">
                        <Layers className="h-4 w-4" />
                        <span>Nivel</span>
                        <span className={cn("font-medium px-2 py-0.5 rounded-md text-xs", styles.iconBg, styles.iconColor)}>
                          {role.level}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <ActionButton
                        variant="edit"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                        fullWidth
                      >
                        Editar
                      </ActionButton>
                      <ActionButton
                        variant="delete"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                        fullWidth
                      >
                        Eliminar
                      </ActionButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Dialog - Material Design 3 */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-xl">
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle className="text-2xl font-semibold text-[#374151]">
              {selectedRole ? "Editar Rol" : "Nuevo Rol"}
            </DialogTitle>
            <DialogDescription className="text-base text-[#6b7280]">
              {selectedRole ? "Modifica los datos del rol" : "Crea un nuevo rol con nivel de acceso específico"}
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            config={{
              fields: roleFormFields,
              columns: 1,
              gap: 'medium',
              variant: 'outlined',
              density: 'comfortable',
              defaultValues: getDefaultFormValues(),
            }}
            onSubmit={handleSaveRole}
            onCancel={() => setIsRoleDialogOpen(false)}
            submitLabel={selectedRole ? "Guardar Cambios" : "Crear Rol"}
            cancelLabel="Cancelar"
            loading={savingRole}
            asDialog
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
