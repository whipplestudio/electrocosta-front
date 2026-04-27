"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Shield, Key, Loader2, Lock, Users, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
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
    carga_informacion: "Proyectos",
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
    eliminar: "Eliminar",
    asignar: "Asignar",
    aplicar: "Aplicar",
    generar: "Generar",
    descargar: "Descargar",
    programar: "Programar",
    aprobar: "Aprobar",
    acceder: "Acceder",
    cargar: "Cargar",
    registrar: "Registrar",
  }

  const getModuleIcon = (module: string) => {
    return <Shield className="h-4 w-4 text-[#164e63]" />
  }

  const getModuleColor = (module: string): string => {
    const colors: Record<string, string> = {
      usuarios: 'bg-blue-50 text-blue-700 border-blue-200',
      cuentas_cobrar: 'bg-green-50 text-green-700 border-green-200',
      cuentas_pagar: 'bg-red-50 text-red-700 border-red-200',
      reportes: 'bg-purple-50 text-purple-700 border-purple-200',
      dashboard: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      carga_informacion: 'bg-amber-50 text-amber-700 border-amber-200',
      clientes: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    }
    return colors[module] || 'bg-gray-50 text-gray-700 border-gray-200'
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header - Material Design 3 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e7eb]">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#374151]">Permisos</h1>
          <p className="text-[#6b7280]">Gestiona la matriz de permisos por rol y módulo</p>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] flex items-center justify-center">
            <Users className="h-5 w-5 text-[#164e63]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#374151]">{roles.length}</p>
            <p className="text-xs text-[#6b7280]">Roles configurados</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] flex items-center justify-center">
            <Lock className="h-5 w-5 text-[#164e63]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#374151]">{permissions.length}</p>
            <p className="text-xs text-[#6b7280]">Permisos totales</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#374151]">
              {roles.reduce((acc, role) => acc + (role.permissions?.length || 0), 0)}
            </p>
            <p className="text-xs text-[#6b7280]">Asignaciones activas</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#374151]">{Object.keys(groupedPermissions).length}</p>
            <p className="text-xs text-[#6b7280]">Módulos</p>
          </div>
        </div>
      </div>

      <Card className="border-[#e5e7eb]">
        <CardHeader className="pb-4">
          <CardTitle className="text-[#374151]">Matriz de Permisos</CardTitle>
          <CardDescription className="text-[#6b7280]">Gestiona los permisos por rol organizados por módulos</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Encabezado de roles - MD3 Style */}
          <div className="mb-4 flex gap-2 items-center bg-[#f9fafb] rounded-xl p-3">
            <div className="flex-1 font-semibold text-sm text-[#374151]">Permiso / Recurso</div>
            {roles.map((role) => (
              <div key={role.id} className="w-24 text-center">
                <span className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border",
                  role.name === 'super_admin' 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : 'bg-[#f0fdf4] text-[#164e63] border-[#164e63]/20'
                )}>
                  {role.name}
                </span>
              </div>
            ))}
          </div>

          {/* Acordeones por módulo - MD3 Style */}
          <Accordion type="multiple" className="w-full space-y-2">
            {Object.entries(groupedPermissions).map(([module, resources]) => (
              <AccordionItem key={module} value={module} className="border border-[#e5e7eb] rounded-xl overflow-hidden data-[state=open]:border-[#164e63]/30">
                <AccordionTrigger className="hover:no-underline px-4 py-3 hover:bg-[#f9fafb] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", getModuleColor(module).split(' ')[0])}>
                      {getModuleIcon(module)}
                    </div>
                    <span className="font-semibold text-[#374151]">{moduleNames[module] || module}</span>
                    <span className={cn(
                      "ml-2 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
                      getModuleColor(module)
                    )}>
                      {Object.values(resources).flat().length} permisos
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3 pt-2">
                    {Object.entries(resources).map(([resource, perms]) => (
                      <div key={resource} className="border border-[#e5e7eb] rounded-xl p-4 bg-[#f9fafb]/50">
                        <h4 className="font-medium mb-3 text-sm flex items-center gap-2 text-[#374151]">
                          <div className="w-6 h-6 rounded-md bg-[#164e63]/10 flex items-center justify-center">
                            <Key className="h-3 w-3 text-[#164e63]" />
                          </div>
                          {resourceNames[resource] || resource}
                        </h4>
                        <div className="space-y-2">
                          {perms.map((permission) => (
                            <div key={permission.id} className="flex items-center gap-2 py-2 hover:bg-white rounded-lg px-2 -mx-2 transition-colors">
                              <div className="flex-1 text-sm text-[#6b7280]">
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
                                      <Loader2 className="h-4 w-4 animate-spin text-[#164e63]" />
                                    ) : (
                                      <Switch
                                        checked={isChecked}
                                        disabled={updatingPermission !== null || isSuperAdmin}
                                        onCheckedChange={(checked) => {
                                          handleTogglePermission(role.id, permission.code, checked)
                                        }}
                                        className={cn(
                                          isSuperAdmin && "opacity-50 cursor-not-allowed",
                                          "data-[state=checked]:bg-[#164e63]"
                                        )}
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
