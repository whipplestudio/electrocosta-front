"use client"

import type React from "react"
import { useState } from "react"

import { usePathname } from "next/navigation"
import { AppSidebar, MobileMenuButton } from "@/components/app-sidebar"
import { ConsolidatedViewBanner } from "@/components/branch-switcher"
import { PermissionsProvider } from "@/hooks/use-permissions"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Routes where sidebar should be hidden (authentication pages)
  const authRoutes = ["/login", "/registro", "/recuperar-password"]
  const isAuthPage = authRoutes.includes(pathname)

  if (isAuthPage) {
    // Auth pages: no sidebar, full width
    return <div className="min-h-screen bg-background">{children}</div>
  }

  // Regular pages: with sidebar. El provider de permisos cuelga solo de esta
  // rama: las páginas de autenticación no tienen sesión con la que pedirlos.
  return (
    <PermissionsProvider>
      <div className="flex h-screen bg-background">
        {/* Mobile Menu Button - only visible on mobile */}
        <MobileMenuButton onClick={() => setMobileMenuOpen(true)} />
      
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <AppSidebar 
          mobileOpen={mobileMenuOpen} 
          onMobileClose={() => setMobileMenuOpen(false)} 
        />
      
        {/* Main content - full width on mobile, flex-1 on desktop */}
        {/* Add pt-12 on mobile to account for menu button, no padding on desktop */}
        <main className="flex-1 overflow-auto w-full pt-12 md:pt-0">
          <ConsolidatedViewBanner />
          {children}
        </main>
      </div>
    </PermissionsProvider>
  )
}
