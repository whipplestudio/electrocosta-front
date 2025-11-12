"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Shield, Users, Edit, Plus, Loader2 } from "lucide-react"
import { rolesService } from "@/services/roles.service"
import { permissionsService, type Permission } from "@/services/permissions.service"
import { useToast } from "@/hooks/use-toast"
import type { Role } from "@/types/users"

// Mapeo de permisos a descripciones amigables
const permissionLabels: { [key: string]: { title: string; description: string } } = {
  "dashboard.general.ver": { title: "Dashboard Ejecutivo", description: "Ver métricas y KPIs" },
  "cuentas_cobrar.cuentas.listar": { title: "Cuentas por Cobrar", description: "Gestionar cobranzas" },
  "cuentas_pagar.cuentas.listar": { title: "Cuentas por Pagar", description: "Gestionar pagos" },
  "reportes.detallados.generar": { title: "Reportes", description: "Generar reportes" },
  "usuarios.usuarios.listar": { title: "Usuarios", description: "Gestionar usuarios" },
  "usuarios.roles.listar": { title: "Configuración", description: "Configurar sistema" },
}

export default function RolesPermisos() {
  const { toast } = useToast()
  const [roles, setRoles] = useState<any[]>([])
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [rolSeleccionado, setRolSeleccionado] = useState<any | null>(null)
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [rolesData, permissionsData] = await Promise.all([
        rolesService.getAll(),
        permissionsService.getAll(),
      ])
      setRoles(rolesData)
      setAllPermissions(permissionsData)
      if (rolesData.length > 0) {
        handleSelectRole(rolesData[0])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRole = async (role: any) => {
    setRolSeleccionado(role)
    try {
      const permData = await rolesService.getPermissions(role.id)
      setRolePermissions(permData.permissions || [])
    } catch (error) {
      console.error("Error loading permissions:", error)
      setRolePermissions(role.permissions || [])
    }
  }

  const togglePermission = (permissionId: string) => {
    const hasPermission = rolePermissions.some(p => p.id === permissionId)
    if (hasPermission) {
      setRolePermissions(rolePermissions.filter(p => p.id !== permissionId))
    } else {
      const perm = allPermissions.find(p => p.id === permissionId)
      if (perm) {
        setRolePermissions([...rolePermissions, perm])
      }
    }
  }

  const handleSavePermissions = async () => {
    if (!rolSeleccionado) return
    
    try {
      setSaving(true)
      const permissionIds = rolePermissions.map(p => p.id)
      await rolesService.assignPermissions(rolSeleccionado.id, permissionIds)
      toast({
        title: "Permisos actualizados",
        description: "Los permisos del rol han sido actualizados exitosamente",
      })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar permisos",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getDisplayPermissions = () => {
    // Mostrar todos los permisos disponibles
    return allPermissions
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Roles y Permisos</h1>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Rol
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Roles del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {roles.map((rol) => (
                <div
                  key={rol.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    rolSeleccionado?.id === rol.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleSelectRole(rol)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{rol.name}</h4>
                      <p className="text-sm text-muted-foreground">{rol.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary">{rol.userCount || 0}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Permisos - {rolSeleccionado?.name || "Sin seleccionar"}</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSavePermissions}
                  disabled={saving || !rolSeleccionado}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Guardar
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getDisplayPermissions().map((permission) => {
                    const label = permissionLabels[permission.code] || {
                      title: permission.name,
                      description: permission.description,
                    }
                    const isChecked = rolePermissions.some(p => p.id === permission.id)
                    
                    return (
                      <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{label.title}</h4>
                          <p className="text-sm text-muted-foreground">{label.description}</p>
                        </div>
                        <Switch 
                          checked={isChecked}
                          onCheckedChange={() => togglePermission(permission.id)}
                          disabled={!rolSeleccionado}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
