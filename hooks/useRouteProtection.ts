import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { usePermissions } from '@/hooks/use-permissions'

interface RoutePermissionMap {
  path: string
  requiredPermissions: string[]
  name: string
}

// Mapa de rutas y sus permisos requeridos.
// Solo rutas con página real bajo `app/`: esta lista es además el origen del
// fallback de redirección (ver `availableRoutes` más abajo), así que una
// entrada sin página mandaría al usuario a un 404. `/dashboard` va primero
// para que sea el aterrizaje preferente de quien tenga acceso a él.
const ROUTE_PERMISSIONS: RoutePermissionMap[] = [
  {
    path: '/dashboard',
    requiredPermissions: ['dashboard.general.ver'],
    name: 'Dashboard',
  },
  {
    path: '/usuarios',
    requiredPermissions: ['usuarios.usuarios.ver'],
    name: 'Usuarios y Roles',
  },
  {
    path: '/clientes',
    requiredPermissions: ['clientes.clientes.ver'],
    name: 'Clientes',
  },
  {
    path: '/categorias',
    requiredPermissions: ['categorias.categorias.ver'],
    name: 'Categorías',
  },
  {
    path: '/proyectos',
    requiredPermissions: ['carga_informacion.proyectos.ver'],
    name: 'Proyectos',
  },
  {
    path: '/cuentas-cobrar',
    requiredPermissions: ['cuentas_cobrar.registro.ver'],
    name: 'Registro Cuentas por Cobrar',
  },
  {
    path: '/cuentas-cobrar/pagos',
    requiredPermissions: ['cuentas_cobrar.pagos.ver'],
    name: 'Aplicación de Pagos',
  },
  {
    path: '/cuentas-pagar',
    requiredPermissions: ['cuentas_pagar.registro.ver'],
    name: 'Registro Cuentas por Pagar',
  },
  {
    path: '/cuentas-pagar/pagos',
    requiredPermissions: ['cuentas_pagar.pagos.ver'],
    name: 'Aplicación de Pagos',
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
  // Permisos del contexto: ya los pidió el provider una sola vez por sesión.
  // Si la carga falló, llegan vacíos (falla cerrado) y este guard trata el caso
  // como "sin acceso a ningún módulo".
  const { permissionCodes, isLoading: permissionsLoading } = usePermissions()
  const [isChecking, setIsChecking] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    // Mientras el provider resuelve no se decide nada: concluir aquí con la
    // lista vacía cerraría la sesión de un usuario legítimo.
    if (permissionsLoading) {
      setIsChecking(true)
      return
    }

    setIsChecking(true)

    // Verificar si tiene al menos uno de los permisos requeridos
    const hasRequiredPermission = requiredPermissions.some((permission) =>
      permissionCodes.includes(permission)
    )

    if (hasRequiredPermission) {
      setHasAccess(true)
      setIsChecking(false)
      return
    }

    setHasAccess(false)

    // No tiene acceso a esta ruta, buscar una ruta alternativa
    const availableRoutes = ROUTE_PERMISSIONS.filter((route) =>
      route.requiredPermissions.some((perm) => permissionCodes.includes(perm))
    )

    if (availableRoutes.length > 0) {
      // Redirigir a la primera ruta disponible
      router.replace(availableRoutes[0].path)
    } else {
      // No tiene acceso a ninguna ruta, cerrar sesión

      // Limpiar sesión
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('currentUser')
      localStorage.removeItem('activeBranchId')
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

    setIsChecking(false)
    // requiredPermissions queda fuera de las dependencias a propósito: llega
    // como literal de array y su referencia cambia en cada render.
  }, [permissionCodes, permissionsLoading, pathname, router])

  return { isChecking, hasAccess }
}
