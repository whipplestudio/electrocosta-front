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
    path: '/clientes',
    requiredPermissions: ['clientes.clientes.listar', 'clientes.clientes.leer'],
    name: 'Clientes',
  },
  {
    path: '/clientes/nuevo',
    requiredPermissions: ['clientes.clientes.crear'],
    name: 'Nuevo Cliente',
  },
  {
    path: '/clientes/:id',
    requiredPermissions: ['clientes.clientes.leer', 'clientes.clientes.listar'],
    name: 'Detalle Cliente',
  },
  {
    path: '/clientes/:id/editar',
    requiredPermissions: ['clientes.clientes.actualizar'],
    name: 'Editar Cliente',
  },
  {
    path: '/cuentas-cobrar',
    requiredPermissions: ['cuentas_cobrar.registro.ver', 'cuentas_cobrar.cuentas.leer'],
    name: 'Cuentas por Cobrar',
  },
  {
    path: '/cuentas-pagar',
    requiredPermissions: ['cuentas_pagar.registro.ver', 'cuentas_pagar.cuentas.leer'],
    name: 'Cuentas por Pagar',
  },
  {
    path: '/carga-informacion',
    requiredPermissions: ['carga_informacion.modulo.acceder'],
    name: 'Área de Carga',
  },
  {
    path: '/carga-informacion/ventas',
    requiredPermissions: ['carga_informacion.ventas.cargar'],
    name: 'Área de Carga - Ventas',
  },
  {
    path: '/carga-informacion/gastos',
    requiredPermissions: ['carga_informacion.gastos.cargar'],
    name: 'Área de Carga - Gastos',
  },
  {
    path: '/carga-informacion/proyectos',
    requiredPermissions: ['carga_informacion.proyectos.cargar'],
    name: 'Área de Carga - Proyectos',
  },
  {
    path: '/carga-informacion/anticipos',
    requiredPermissions: ['carga_informacion.anticipos.cargar'],
    name: 'Área de Carga - Anticipos',
  },
  {
    path: '/reportes',
    requiredPermissions: ['reportes.detallados.ver', 'reportes.reportes.leer'],
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
