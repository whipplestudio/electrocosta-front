"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Shield, Key, Loader2 } from "lucide-react"
import { rolesService } from "@/services/roles.service"
import { permissionsService, type Permission } from "@/services/permissions.service"
import { useToast } from "@/hooks/use-toast"
import type { Role } from "@/types/users"
import { RouteProtection } from "@/components/route-protection"

export default function PermisosPage() {
  return (
    <RouteProtection requiredPermissions={["usuarios.permisos.ver"]}>
      <PermisosPageContent />
    </RouteProtection>
  )
}

function PermisosPageContent() {
  const { toast } = useToast()
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [updatingPermission, setUpdatingPermission] = useState<string | null>(null)

  useEffect(() => {
    loadRoles()
    loadPermissions()
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

  const loadPermissions = async () => {
    try {
      const data = await permissionsService.getAll()
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

  const moduleNames: Record<string, string> = {
    usuarios: "Usuarios y Roles",
    cuentas_cobrar: "Cuentas por Cobrar",
    cuentas_pagar: "Cuentas por Pagar",
    reportes: "Reportes",
    dashboard: "Dashboard",
    carga_informacion: "Área de Carga",
    clientes: "Clientes",
  }

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
    clientes: "Clientes",
  }

  const actionNames: Record<string, string> = {
    ver: "Ver",
    crear: "Crear",
    editar: "Editar",
    actualizar: "Actualizar",
    eliminar: "Eliminar",
    asignar: "Asignar",
    aplicar: "Aplicar",
    generar: "Generar",
    descargar: "Descargar",
    programar: "Programar",
    aprobar: "Aprobar",
    acceder: "Acceder",
    listar: "Listar",
    leer: "Leer",
  }

  const handleTogglePermission = async (roleId: string, permissionCode: string, checked: boolean) => {
    const permissionKey = `${roleId}-${permissionCode}`
    
    try {
      setUpdatingPermission(permissionKey)
      
      const role = roles.find((r) => r.id === roleId)
      if (!role) return

      const currentPermissionCodes = (role.permissions || []).map((p: any) => p.code)

      let newPermissionCodes: string[]
      if (checked) {
        if (currentPermissionCodes.includes(permissionCode)) {
          return
        }
        newPermissionCodes = [...currentPermissionCodes, permissionCode]
      } else {
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Permisos</h1>
          <p className="text-muted-foreground">Gestiona la matriz de permisos por rol</p>
        </div>
      </div>

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
    </div>
  )
}
