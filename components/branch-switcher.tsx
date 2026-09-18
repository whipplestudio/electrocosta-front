"use client"

import { useEffect, useState } from "react"
import { Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ALL_BRANCHES } from "@/lib/api-client"
import { useActiveBranch } from "@/hooks/use-active-branch"
import { branchesService } from "@/services/branches.service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Branch } from "@/types/users"

interface BranchSwitcherProps {
  collapsed?: boolean
}

// Sucursal en la que opera el usuario: selector para alcance GLOBAL, texto fijo para BRANCH
export function BranchSwitcher({ collapsed = false }: BranchSwitcherProps) {
  const { user, isGlobal, activeBranchId, isConsolidated, setActiveBranch } = useActiveBranch()
  const [branches, setBranches] = useState<Branch[]>([])

  useEffect(() => {
    if (!isGlobal) return
    let isMounted = true

    branchesService
      .getBranches()
      .then((data) => {
        if (isMounted) setBranches(data.filter((branch) => branch.isActive))
      })
      .catch((error) => {
        console.error("Error cargando sucursales:", error)
      })

    return () => {
      isMounted = false
    }
  }, [isGlobal])

  // Sesión previa al despliegue de sucursales: el currentUser guardado no trae branch
  if (!user?.branch) return null

  const activeBranchName = isConsolidated
    ? "Todas las sucursales"
    : branches.find((branch) => branch.id === activeBranchId)?.name ?? user.branch.name

  if (collapsed) {
    return (
      <div
        title={`Sucursal: ${activeBranchName}`}
        className={cn(
          "flex items-center justify-center h-9 rounded-xl",
          isConsolidated ? "bg-amber-100 text-amber-700" : "text-[#6b7280]"
        )}
      >
        <Building2 className="h-4 w-4" />
      </div>
    )
  }

  if (!isGlobal) {
    return (
      <div className="flex items-center gap-2 px-3 text-xs text-[#6b7280]">
        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="font-medium truncate">Sucursal: {user.branch.name}</span>
      </div>
    )
  }

  return (
    <div className="space-y-1 px-1">
      <Select value={activeBranchId ?? undefined} onValueChange={setActiveBranch}>
        <SelectTrigger
          size="sm"
          aria-label="Sucursal activa"
          className={cn(
            "w-full text-xs",
            isConsolidated && "border-amber-400 bg-amber-50 text-amber-800"
          )}
        >
          <Building2 className="h-3.5 w-3.5" />
          <SelectValue placeholder={user.branch.name} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_BRANCHES}>Todas las sucursales</SelectItem>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isConsolidated && (
        <p className="px-2 text-[10px] font-medium text-amber-700">Vista consolidada: solo consulta</p>
      )}
    </div>
  )
}

// Aviso persistente en el área de contenido mientras un usuario GLOBAL está en "Todas"
export function ConsolidatedViewBanner() {
  const { isConsolidated } = useActiveBranch()

  if (!isConsolidated) return null

  return (
    <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-amber-300 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800">
      <Building2 className="h-4 w-4 flex-shrink-0" />
      <span>
        Vista consolidada de todas las sucursales: solo consulta. Para capturar, elija una sucursal en el menú lateral.
      </span>
    </div>
  )
}
