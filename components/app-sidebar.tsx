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
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { permissionsService } from "@/services/permissions.service"

interface SidebarProps {
  className?: string
}

interface MenuItem {
  title: string
  icon: any
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
    submenu: [
      { 
        title: "Gestión de Clientes", 
        href: "/clientes",
        requiredPermissionCodes: ["clientes.clientes.ver"]
      },
      { 
        title: "Nuevo Cliente", 
        href: "/clientes/nuevo",
        requiredPermissionCodes: ["clientes.clientes.crear"]
      },
    ],
  },
  {
    title: "Categorías",
    icon: Tag,
    href: "/categorias",
    requiredPermissionCodes: ["categorias.categorias.ver"],
    submenu: [],
  },
  {
    title: "Áreas",
    icon: Building2,
    href: "/areas",
    requiredPermissionCodes: ["areas.ver"],
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
        title: "Seguimiento", 
        href: "/cuentas-cobrar/seguimiento",
        requiredPermissionCodes: ["cuentas_cobrar.seguimiento.ver"]
      },
      { 
        title: "Aplicación de Pagos", 
        href: "/cuentas-cobrar/pagos",
        requiredPermissionCodes: ["cuentas_cobrar.pagos.ver"]
      },
      { 
        title: "Reportes", 
        href: "/cuentas-cobrar/reportes",
        requiredPermissionCodes: ["cuentas_cobrar.reportes.ver"]
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
        title: "Programación", 
        href: "/cuentas-pagar/programacion",
        requiredPermissionCodes: ["cuentas_pagar.programacion.ver"]
      },
      { 
        title: "Aprobación", 
        href: "/cuentas-pagar/aprobacion",
        requiredPermissionCodes: ["cuentas_pagar.aprobacion.ver"]
      },
      { 
        title: "Pagos", 
        href: "/cuentas-pagar/pagos",
        requiredPermissionCodes: ["cuentas_pagar.pagos.ver"]
      },
      { 
        title: "Reportes", 
        href: "/cuentas-pagar/reportes",
        requiredPermissionCodes: ["cuentas_pagar.reportes.ver"]
      },
    ],
  },
  {
    title: "Proyectos",
    icon: Building2,
    href: "/proyectos",
    requiredPermissionCodes: ["carga_informacion.proyectos.ver"],
    submenu: [],
  },
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
        "relative flex flex-col bg-card border-r border-border transition-all duration-300 shadow-sm",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header con mejor diseño */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-border bg-gradient-to-b from-card to-card/95">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md transition-transform hover:scale-105">
              <DollarSign className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">Electro Costa</h2>
              <p className="text-xs text-muted-foreground font-medium">ERP Financiero</p>
            </div>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCollapsed(!collapsed)} 
          className="h-9 w-9 p-0 hover:bg-accent/50 transition-all"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation con mejor espaciado */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
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
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11 rounded-lg font-medium transition-all",
                    collapsed && "justify-center px-2",
                    isActive && "shadow-sm"
                  )}
                  onClick={() => toggleSubmenu(item.href)}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm flex-1 text-left">{item.title}</span>
                  <ChevronRight className={cn("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-90")} />
                </Button>
              ) : (
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-11 rounded-lg font-medium transition-all",
                      collapsed && "justify-center px-2",
                      isActive && "shadow-sm"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm flex-1 text-left">{item.title}</span>}
                  </Button>
                </Link>
              )}

              {hasSubmenu && !collapsed && isExpanded && (
                <div className="ml-8 mt-1.5 space-y-1 border-l-2 border-border/50 pl-3">
                  {item.submenu
                    ?.filter((subitem) => hasModuleAccess((subitem as any).requiredPermissionCodes))
                    .map((subitem) => (
                      <Link key={subitem.href} href={subitem.href}>
                        <Button
                          variant={pathname === subitem.href ? "secondary" : "ghost"}
                          size="sm"
                          className={cn(
                            "w-full justify-start h-9 text-sm rounded-lg transition-all",
                            pathname === subitem.href 
                              ? "text-foreground font-medium shadow-sm" 
                              : "text-muted-foreground hover:text-foreground font-normal"
                          )}
                        >
                          {subitem.title}
                        </Button>
                      </Link>
                    ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer con mejor diseño */}
      <div className="px-4 py-4 border-t border-border space-y-3 bg-gradient-to-t from-card/95 to-card">
        {!collapsed && (
          <div className="text-xs text-muted-foreground space-y-1 px-2 py-2 bg-accent/30 rounded-lg">
            <p className="font-semibold">Usuario: Admin</p>
            <p className="font-medium">Rol: Administrador</p>
            <p className="text-[10px] opacity-70">Versión 1.0.0</p>
          </div>
        )}

        {/* Logout button mejorado */}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-11 rounded-lg font-medium transition-all",
            "text-destructive hover:text-destructive hover:bg-destructive/10 hover:shadow-sm",
            collapsed && "justify-center px-2",
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Cerrar Sesión</span>}
        </Button>
      </div>
    </div>
  )
}
