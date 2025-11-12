"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
}

const menuItems = [
  {
    title: "Usuarios y Roles",
    icon: Shield,
    href: "/usuarios",
    submenu: [
      { title: "Gestión de Usuarios", href: "/usuarios" },
      // { title: "Roles y Permisos", href: "/usuarios/roles" }, // Comentado temporalmente - se usará en el futuro
    ],
  },
  {
    title: "Cuentas por Cobrar",
    icon: TrendingUp,
    href: "/cuentas-cobrar",
    submenu: [
      { title: "Registro", href: "/cuentas-cobrar" },
      { title: "Seguimiento", href: "/cuentas-cobrar/seguimiento" },
      { title: "Aplicación de Pagos", href: "/cuentas-cobrar/pagos" },
      { title: "Reportes", href: "/cuentas-cobrar/reportes" },
    ],
  },
  {
    title: "Cuentas por Pagar",
    icon: TrendingDown,
    href: "/cuentas-pagar",
    submenu: [
      { title: "Registro", href: "/cuentas-pagar" },
      { title: "Programación", href: "/cuentas-pagar/programacion" },
      { title: "Aprobación", href: "/cuentas-pagar/aprobacion" },
      { title: "Reportes de Vencimientos", href: "/cuentas-pagar/reportes" },
    ],
  },
  {
    title: "Área de Carga",
    icon: Upload,
    href: "/carga-informacion",
    submenu: [
      { title: "Ventas", href: "/carga-informacion/ventas" },
      { title: "Gastos", href: "/carga-informacion/gastos" },
      { title: "Proyectos", href: "/carga-informacion/proyectos" },
      { title: "Anticipos", href: "/carga-informacion/anticipos" },
    ],
  },
  {
    title: "Reportes",
    icon: Download,
    href: "/reportes",
    submenu: [
      { title: "Detallados", href: "/reportes/detallados" },
      { title: "Descargables", href: "/reportes/descargables" },
      { title: "Personalizados", href: "/reportes/personalizados" },
    ],
  },
]

export function AppSidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const pathname = usePathname()
  const router = useRouter()

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
        "relative flex flex-col bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Electro Costa</h2>
              <p className="text-xs text-muted-foreground">ERP Financiero</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const hasSubmenu = item.submenu && item.submenu.length > 0
          const isExpanded = expandedMenus.includes(item.href)
          const isActive = isActiveRoute(item.href, item.submenu)

          return (
            <div key={item.href}>
              {hasSubmenu && !collapsed ? (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start gap-3 h-10", collapsed && "justify-center px-2")}
                  onClick={() => toggleSubmenu(item.href)}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium flex-1 text-left">{item.title}</span>
                  <ChevronRight className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-90")} />
                </Button>
              ) : (
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn("w-full justify-start gap-3 h-10", collapsed && "justify-center px-2")}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium flex-1 text-left">{item.title}</span>}
                  </Button>
                </Link>
              )}

              {hasSubmenu && !collapsed && isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.submenu?.map((subitem) => (
                    <Link key={subitem.href} href={subitem.href}>
                      <Button
                        variant={pathname === subitem.href ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start h-8 text-xs text-muted-foreground hover:text-foreground"
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

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-3">
        {!collapsed && (
          <div className="text-xs text-muted-foreground">
            <p>Usuario: Admin</p>
            <p>Rol: Administrador</p>
            <p>Versión 1.0.0</p>
          </div>
        )}

        {/* Logout button */}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-10 text-destructive hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2",
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Cerrar Sesión</span>}
        </Button>
      </div>
    </div>
  )
}
