"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  Upload,
  Download,
  LogOut,
  Users,
  Tag,
  Building2,
  LayoutDashboard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { permissionsService } from "@/services/permissions.service"

interface SidebarProps {
  className?: string
}

interface MenuItem {
  title: string
  icon?: any
  href: string
  requiredPermissionCodes?: string[]
  submenu?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    requiredPermissionCodes: ["dashboard.general.ver"],
    submenu: [],
  },
  {
    title: "Usuarios y Roles",
    icon: Shield,
    href: "/usuarios",
    requiredPermissionCodes: ["usuarios.usuarios.ver"],
    submenu: [
      { 
        title: "Usuarios", 
        href: "/usuarios",
        requiredPermissionCodes: ["usuarios.usuarios.ver"]
      },
      { 
        title: "Roles", 
        href: "/usuarios/roles",
        requiredPermissionCodes: ["usuarios.roles.ver"]
      },
      { 
        title: "Permisos", 
        href: "/usuarios/permisos",
        requiredPermissionCodes: ["usuarios.permisos.ver"]
      },
    ],
  },
  {
    title: "Clientes",
    icon: Users,
    href: "/clientes",
    requiredPermissionCodes: ["clientes.clientes.ver"],
    submenu: [],
  },
  {
    title: "Categorías",
    icon: Tag,
    href: "/categorias",
    requiredPermissionCodes: ["categorias.categorias.ver"],
    submenu: [],
  },
  {
    title: "Proyectos",
    icon: Building2,
    href: "/proyectos",
    requiredPermissionCodes: ["carga_informacion.proyectos.ver"],
    submenu: [],
  },
  {
    title: "Cuentas por Cobrar",
    icon: TrendingUp,
    href: "/cuentas-cobrar",
    requiredPermissionCodes: ["cuentas_cobrar.registro.ver"],
    submenu: [
      { 
        title: "Registro", 
        href: "/cuentas-cobrar",
        requiredPermissionCodes: ["cuentas_cobrar.registro.ver"]
      },
      { 
        title: "Aplicación de Pagos", 
        href: "/cuentas-cobrar/pagos",
        requiredPermissionCodes: ["cuentas_cobrar.pagos.ver"]
      },
    ],
  },
  {
    title: "Cuentas por Pagar",
    icon: TrendingDown,
    href: "/cuentas-pagar",
    requiredPermissionCodes: ["cuentas_pagar.registro.ver"],
    submenu: [
      { 
        title: "Registro", 
        href: "/cuentas-pagar",
        requiredPermissionCodes: ["cuentas_pagar.registro.ver"]
      },
      { 
        title: "Aplicación de Pagos", 
        href: "/cuentas-pagar/pagos",
        requiredPermissionCodes: ["cuentas_pagar.pagos.ver"]
      },
    ],
  }
]

export function AppSidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const [userPermissionCodes, setUserPermissionCodes] = useState<string[]>([])
  const [permissionsLoading, setPermissionsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  // Cargar permisos del usuario autenticado al montar el sidebar
  useEffect(() => {
    let isMounted = true

    permissionsService
      .getMyPermissionCodes()
      .then((codes) => {
        if (isMounted) {
          console.log('🔑 Permisos del usuario cargados:', codes)
          setUserPermissionCodes(codes)
          setPermissionsLoading(false)
        }
      })
      .catch((error) => {
        console.error('Error cargando permisos del usuario:', error)
        if (isMounted) {
          // Si falla la carga, establecemos permisos vacíos (sin acceso)
          setUserPermissionCodes([])
          setPermissionsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const isActiveRoute = (href: string, submenu?: { href: string }[]) => {
    if (pathname === href) return true
    if (submenu) {
      return submenu.some((sub) => pathname === sub.href)
    }
    return false
  }

  const toggleSubmenu = (href: string) => {
    setExpandedMenus((prev) => (prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]))
  }

  const hasModuleAccess = (requiredCodes?: string[]) => {
    // Si no se requieren permisos específicos, permitir acceso
    if (!requiredCodes || requiredCodes.length === 0) return true
    
    // Si los permisos están cargando, no mostrar nada aún
    if (permissionsLoading) return false
    
    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    return requiredCodes.some((code) => userPermissionCodes.includes(code))
  }

  // Nueva función: Verifica si el usuario tiene acceso a CUALQUIER submenú del módulo
  const hasAnySubmenuAccess = (submenu?: Array<{ requiredPermissionCodes?: string[] }>) => {
    if (!submenu || submenu.length === 0) return false
    if (permissionsLoading) return false
    
    return submenu.some((subitem) => 
      hasModuleAccess((subitem as any).requiredPermissionCodes)
    )
  }

  const handleLogout = () => {
    // Clear localStorage/sessionStorage if you're storing tokens
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
      localStorage.removeItem("userData")
      sessionStorage.clear()
    }

    // Redirect to login page
    router.push("/login")
  }

  return (
    <div
      className={cn(
        "relative flex flex-col bg-white border-r border-[#e5e7eb] transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header - Material Design 3 */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#e5e7eb]">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#164e63] rounded-xl flex items-center justify-center shadow-sm transition-transform hover:scale-105">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight text-[#374151]">Grupo BARREDA</h2>
              <p className="text-xs text-[#6b7280] font-medium">ERP Financiero</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-9 w-9 rounded-lg flex items-center justify-center text-[#6b7280] hover:bg-[#f0fdf4] hover:text-[#164e63] transition-all"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation - Material Design 3 */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          // Verificar si tiene acceso directo al módulo O a algún submenú
          const hasDirectAccess = hasModuleAccess(item.requiredPermissionCodes)
          const hasSubmenuAccess = hasAnySubmenuAccess(item.submenu as any)
          
          if (!hasDirectAccess && !hasSubmenuAccess) {
            return null
          }

          const Icon = item.icon
          const hasSubmenu = item.submenu && item.submenu.length > 0
          const isExpanded = expandedMenus.includes(item.href)
          const isActive = isActiveRoute(item.href, item.submenu)

          return (
            <div key={item.href}>
              {hasSubmenu && !collapsed ? (
                <button
                  className={cn(
                    "w-full flex items-center gap-3 h-11 px-3 rounded-xl font-medium text-sm transition-all duration-200",
                    isActive 
                      ? "bg-[#f0fdf4] text-[#164e63]" 
                      : "text-[#374151] hover:bg-[#f9fafb]"
                  )}
                  onClick={() => toggleSubmenu(item.href)}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                    isActive ? "bg-[#164e63]/10" : "bg-transparent"
                  )}>
                    <Icon className="h-5 w-5 flex-shrink-0" />
                  </div>
                  <span className="flex-1 text-left">{item.title}</span>
                  <ChevronRight className={cn("h-4 w-4 text-[#6b7280] transition-transform duration-200", isExpanded && "rotate-90")} />
                </button>
              ) : (
                <Link href={item.href} className="block">
                  <div
                    className={cn(
                      "flex items-center gap-3 h-11 px-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer",
                      collapsed && "justify-center px-2",
                      isActive 
                        ? "bg-[#f0fdf4] text-[#164e63]" 
                        : "text-[#374151] hover:bg-[#f9fafb]"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                      isActive ? "bg-[#164e63]/10" : "bg-transparent"
                    )}>
                      <Icon className="h-5 w-5 flex-shrink-0" />
                    </div>
                    {!collapsed && <span className="flex-1 text-left">{item.title}</span>}
                  </div>
                </Link>
              )}

              {hasSubmenu && !collapsed && isExpanded && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {item.submenu
                    ?.filter((subitem) => hasModuleAccess((subitem as any).requiredPermissionCodes))
                    .map((subitem) => {
                      const isSubActive = pathname === subitem.href
                      return (
                        <Link key={subitem.href} href={subitem.href} className="block">
                          <div
                            className={cn(
                              "flex items-center h-9 px-3 pl-11 text-sm rounded-xl transition-all duration-200 cursor-pointer",
                              isSubActive 
                                ? "bg-[#f0fdf4] text-[#164e63] font-medium" 
                                : "text-[#6b7280] hover:text-[#374151] hover:bg-[#f9fafb]"
                            )}
                          >
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full mr-2",
                              isSubActive ? "bg-[#164e63]" : "bg-[#d1d5db]"
                            )} />
                            {subitem.title}
                          </div>
                        </Link>
                      )
                    })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer - Material Design 3 */}
      <div className="px-3 py-4 border-t border-[#e5e7eb] space-y-2">
        {!collapsed && (
          <div className="text-xs text-[#6b7280] space-y-1 px-3 py-2 bg-[#f9fafb] rounded-xl">
            <p className="font-semibold text-[#374151]">Usuario: Admin</p>
            <p className="font-medium">Rol: Administrador</p>
            <p className="text-[10px] text-[#9ca3af]">Versión 1.0.0</p>
          </div>
        )}

        {/* Logout button - MD3 */}
        <button
          className={cn(
            "w-full flex items-center gap-3 h-11 px-3 rounded-xl font-medium text-sm transition-all duration-200",
            "text-red-600 hover:bg-red-50",
            collapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg">
            <LogOut className="h-5 w-5 flex-shrink-0" />
          </div>
          {!collapsed && <span className="flex-1 text-left">Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  )
}
