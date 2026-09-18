"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Construction } from "lucide-react"
import { RouteProtection } from "@/components/route-protection"

export default function AuditoriaPage() {
  return (
    <RouteProtection requiredPermissions={["usuarios.usuarios.ver"]}>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Construction size={20} />
              Auditoría
            </CardTitle>
            <CardDescription>Módulo en construcción</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            El registro de auditoría todavía no está disponible. Esta pantalla
            no está enlazada en el menú y no muestra datos del sistema.
          </CardContent>
        </Card>
      </div>
    </RouteProtection>
  )
}
