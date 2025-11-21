import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { permissionsService } from '@/services/permissions.service'

interface RoutePermissionMap {
  path: string
  requiredPermissions: string[]
  name: string
}

// Mapa de rutas y sus permisos requeridos
const ROUTE_PERMISSIONS: RoutePermissionMap[] = [
  {
    path: '/usuarios',
    requiredPermissions: ['usuarios.usuarios.ver'],
    name: 'Usuarios y Roles',
  },
  {
    path: '/cuentas-cobrar',
    requiredPermissions: ['cuentas_cobrar.registro.ver'],
    name: 'Cuentas por Cobrar',
  },
  {
    path: '/cuentas-pagar',
    requiredPermissions: ['cuentas_pagar.registro.ver'],
    name: 'Cuentas por Pagar',
  },
  {
    path: '/carga-informacion',
    requiredPermissions: ['carga_informacion.modulo.acceder'],
    name: 'Área de Carga',
  },
  {
    path: '/reportes',
    requiredPermissions: ['reportes.detallados.ver'],
    name: 'Reportes',
  },
]

interface UseRouteProtectionResult {
  isChecking: boolean
  hasAccess: boolean
}

export function useRouteProtection(
  requiredPermissions: string[]
): UseRouteProtectionResult {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function checkAccess() {
      try {
        setIsChecking(true)

        // Obtener permisos del usuario
        const userPermissions = await permissionsService.getMyPermissionCodes()

        if (!isMounted) return

        // Verificar si tiene al menos uno de los permisos requeridos
        const hasRequiredPermission = requiredPermissions.some((permission) =>
          userPermissions.includes(permission)
        )

        if (hasRequiredPermission) {
          setHasAccess(true)
          setIsChecking(false)
          return
        }

        // No tiene acceso a esta ruta, buscar una ruta alternativa
        const availableRoutes = ROUTE_PERMISSIONS.filter((route) =>
          route.requiredPermissions.some((perm) =>
            userPermissions.includes(perm)
          )
        )

        if (availableRoutes.length > 0) {
          // Redirigir a la primera ruta disponible
          console.log(
            `Redirigiendo a ${availableRoutes[0].name}: ${availableRoutes[0].path}`
          )
          router.replace(availableRoutes[0].path)
        } else {
          // No tiene acceso a ninguna ruta, cerrar sesión
          console.log('Usuario sin permisos para ningún módulo')
          
          // Limpiar sesión
          localStorage.removeItem('authToken')
          localStorage.removeItem('userData')
          sessionStorage.clear()

          // Redirigir al login con mensaje de error
          router.replace(
            '/login?error=no_permissions&message=' +
              encodeURIComponent(
                'No tienes permisos para acceder a ningún módulo. Contacta con un administrador.'
              )
          )
        }
      } catch (error) {
        console.error('Error verificando permisos:', error)
        
        if (!isMounted) return

        // En caso de error, cerrar sesión por seguridad
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        sessionStorage.clear()
        router.replace('/login')
      } finally {
        if (isMounted) {
          setIsChecking(false)
        }
      }
    }

    checkAccess()

    return () => {
      isMounted = false
    }
  }, [pathname, requiredPermissions, router])

  return { isChecking, hasAccess }
}
