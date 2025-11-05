"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()

  // Routes where sidebar should be hidden (authentication pages)
  const authRoutes = ["/login", "/registro", "/recuperar-password"]
  const isAuthPage = authRoutes.includes(pathname)

  if (isAuthPage) {
    // Auth pages: no sidebar, full width
    return <div className="min-h-screen bg-background">{children}</div>
  }

  // Regular pages: with sidebar
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
