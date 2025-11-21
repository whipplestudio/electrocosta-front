"use client"

import { useRouteProtection } from '@/hooks/useRouteProtection'
import { Loader2 } from 'lucide-react'

interface RouteProtectionProps {
  requiredPermissions: string[]
  children: React.ReactNode
}

export function RouteProtection({
  requiredPermissions,
  children,
}: RouteProtectionProps) {
  const { isChecking, hasAccess } = useRouteProtection(requiredPermissions)

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    // Este caso no debería ocurrir porque el hook redirige automáticamente
    // pero lo dejamos como fallback
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
