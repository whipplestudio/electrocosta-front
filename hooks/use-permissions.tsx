'use client'

import * as React from 'react'
import { permissionsService } from '@/services/permissions.service'

interface PermissionsContextValue {
  permissionCodes: string[]
  isLoading: boolean
  // Un código exacto del catálogo (`modulo.recurso.accion`)
  hasPermission: (code: string) => boolean
  // Al menos uno de los códigos; sin códigos requeridos, acceso libre
  hasAnyPermission: (codes?: string[]) => boolean
}

const PermissionsContext = React.createContext<PermissionsContextValue | null>(null)

// Monta este provider solo dentro de las páginas autenticadas: en /login no hay
// sesión y la petición saldría sin token.
export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const [permissionCodes, setPermissionCodes] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Los permisos se piden UNA sola vez por sesión: un cambio de rol no se
  // refleja hasta recargar, y eso es lo acordado (los cambios de rol son raros).
  React.useEffect(() => {
    let isMounted = true

    permissionsService
      .getMyPermissionCodes()
      .then((codes) => {
        if (!isMounted) return
        setPermissionCodes(codes)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Error cargando permisos del usuario:', error)
        if (!isMounted) return
        // Falla cerrado: sin permisos conocidos, no se concede ninguno
        setPermissionCodes([])
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const value = React.useMemo<PermissionsContextValue>(() => {
    // Mientras carga no se concede nada, para no pintar controles que luego
    // desaparecen
    const hasPermission = (code: string) =>
      !isLoading && permissionCodes.includes(code)

    return {
      permissionCodes,
      isLoading,
      hasPermission,
      hasAnyPermission: (codes?: string[]) => {
        if (!codes || codes.length === 0) return true
        return codes.some(hasPermission)
      },
    }
  }, [permissionCodes, isLoading])

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>
}

export function usePermissions(): PermissionsContextValue {
  const context = React.useContext(PermissionsContext)
  if (!context) {
    throw new Error('usePermissions debe usarse dentro de <PermissionsProvider>')
  }
  return context
}

// Resuelve un código de permiso OPCIONAL, para los componentes compartidos
// (ActionButton, DataTable) que también se renderizan fuera del provider: el
// formulario de /login usa ActionButton y ahí no hay sesión ni permisos.
// Sin código requerido devuelve `true` sin mirar el contexto; con código y sin
// provider lanza, para que un control gateado colgado de una página sin
// proveedor se note en el acto en vez de desaparecer en silencio.
export function usePermissionGate(): (code?: string) => boolean {
  const context = React.useContext(PermissionsContext)

  return React.useCallback(
    (code?: string) => {
      if (!code) return true
      if (!context) {
        throw new Error(
          `Se requiere el permiso "${code}" pero no hay <PermissionsProvider> en el árbol`
        )
      }
      return context.hasPermission(code)
    },
    [context]
  )
}
