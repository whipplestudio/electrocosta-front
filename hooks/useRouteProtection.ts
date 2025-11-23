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
    requiredPermissions: ['cuentas_cobrar.registro.ver'],
    name: 'Registro Cuentas por Cobrar',
  },
  {
    path: '/cuentas-cobrar/seguimiento',
    requiredPermissions: ['cuentas_cobrar.seguimiento.ver'],
    name: 'Seguimiento',
  },
  {
    path: '/cuentas-cobrar/pagos',
    requiredPermissions: ['cuentas_cobrar.pagos.ver'],
    name: 'Aplicación de Pagos',
  },
  {
    path: '/cuentas-cobrar/reportes',
    requiredPermissions: ['cuentas_cobrar.reportes.ver'],
    name: 'Reportes',
  },
  {
    path: '/cuentas-pagar',
    requiredPermissions: ['cuentas_pagar.registro.ver'],
    name: 'Registro Cuentas por Pagar',
  },
  {
    path: '/cuentas-pagar/programacion',
    requiredPermissions: ['cuentas_pagar.programacion.ver'],
    name: 'Programación',
  },
  {
    path: '/cuentas-pagar/aprobacion',
    requiredPermissions: ['cuentas_pagar.aprobacion.ver'],
    name: 'Aprobación',
  },
  {
    path: '/cuentas-pagar/pagos',
    requiredPermissions: ['cuentas_pagar.pagos.ver'],
    name: 'Pagos',
  },
  {
    path: '/cuentas-pagar/reportes',
    requiredPermissions: ['cuentas_pagar.reportes.ver'],
    name: 'Reportes',
  },
  {
    path: '/carga-informacion/ventas',
    requiredPermissions: ['carga_informacion.ventas.ver'],
    name: 'Carga de Ventas',
  },
  {
    path: '/carga-informacion/gastos',
    requiredPermissions: ['carga_informacion.gastos.ver'],
    name: 'Carga de Gastos',
  },
  {
    path: '/carga-informacion/proyectos',
    requiredPermissions: ['carga_informacion.proyectos.ver'],
    name: 'Carga de Proyectos',
  },
  {
    path: '/reportes',
    requiredPermissions: ['reportes.detallados.ver'],
    name: 'Reportes Detallados',
  },
  {
    path: '/reportes/descargables',
    requiredPermissions: ['reportes.descargables.ver'],
    name: 'Reportes Descargables',
  },
  {
    path: '/reportes/personalizados',
    requiredPermissions: ['reportes.personalizados.ver'],
    name: 'Reportes Personalizados',
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
