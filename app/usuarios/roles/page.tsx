"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Shield, Users, Edit, Plus } from "lucide-react"

const roles = [
  {
    id: "admin",
    nombre: "Administrador",
    descripcion: "Acceso completo al sistema",
    usuarios: 2,
    permisos: {
      dashboard: true,
      cuentasCobrar: true,
      cuentasPagar: true,
      reportes: true,
      usuarios: true,
      configuracion: true,
    },
  },
  {
    id: "contador",
    nombre: "Contador",
    descripcion: "Acceso a módulos contables",
    usuarios: 3,
    permisos: {
      dashboard: true,
      cuentasCobrar: true,
      cuentasPagar: true,
      reportes: true,
      usuarios: false,
      configuracion: false,
    },
  },
  {
    id: "vendedor",
    nombre: "Vendedor",
    descripcion: "Solo cuentas por cobrar",
    usuarios: 5,
    permisos: {
      dashboard: true,
      cuentasCobrar: true,
      cuentasPagar: false,
      reportes: false,
      usuarios: false,
      configuracion: false,
    },
  },
]

export default function RolesPermisos() {
  const [rolSeleccionado, setRolSeleccionado] = useState(roles[0])

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
                  rolSeleccionado.id === rol.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
                onClick={() => setRolSeleccionado(rol)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{rol.nombre}</h4>
                    <p className="text-sm text-muted-foreground">{rol.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary">{rol.usuarios}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Permisos - {rolSeleccionado.nombre}</CardTitle>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Dashboard Ejecutivo</h4>
                    <p className="text-sm text-muted-foreground">Ver métricas y KPIs</p>
                  </div>
                  <Switch checked={rolSeleccionado.permisos.dashboard} />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Cuentas por Cobrar</h4>
                    <p className="text-sm text-muted-foreground">Gestionar cobranzas</p>
                  </div>
                  <Switch checked={rolSeleccionado.permisos.cuentasCobrar} />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Cuentas por Pagar</h4>
                    <p className="text-sm text-muted-foreground">Gestionar pagos</p>
                  </div>
                  <Switch checked={rolSeleccionado.permisos.cuentasPagar} />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Reportes</h4>
                    <p className="text-sm text-muted-foreground">Generar reportes</p>
                  </div>
                  <Switch checked={rolSeleccionado.permisos.reportes} />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Usuarios</h4>
                    <p className="text-sm text-muted-foreground">Gestionar usuarios</p>
                  </div>
                  <Switch checked={rolSeleccionado.permisos.usuarios} />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Configuración</h4>
                    <p className="text-sm text-muted-foreground">Configurar sistema</p>
                  </div>
                  <Switch checked={rolSeleccionado.permisos.configuracion} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
