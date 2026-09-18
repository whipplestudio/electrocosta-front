import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ACTIVE_BRANCH_KEY, ALL_BRANCHES } from '@/lib/api-client'
import type { User } from '@/types/users'

// Avisa a las demás instancias del hook (sidebar, aviso de consolidado) en la misma pestaña
const ACTIVE_BRANCH_EVENT = 'active-branch-change'

interface ActiveBranchState {
  user: Partial<User> | null
  activeBranchId: string | null
}

const readState = (): ActiveBranchState => {
  const userStr = localStorage.getItem('currentUser')
  let user: Partial<User> | null = null
  if (userStr) {
    try {
      user = JSON.parse(userStr) as Partial<User>
    } catch {
      user = null
    }
  }

  // Sin elección guardada, la vista es la sucursal de origen (el back hace lo mismo sin cabecera)
  const activeBranchId = localStorage.getItem(ACTIVE_BRANCH_KEY) ?? user?.branchId ?? null
  return { user, activeBranchId }
}

export function useActiveBranch() {
  const router = useRouter()
  const [state, setState] = React.useState<ActiveBranchState>({ user: null, activeBranchId: null })

  React.useEffect(() => {
    const sync = () => setState(readState())
    sync()
    window.addEventListener(ACTIVE_BRANCH_EVENT, sync)
    // Otra pestaña cambió la sucursal o cerró sesión
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(ACTIVE_BRANCH_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const setActiveBranch = React.useCallback(
    (branchId: string) => {
      localStorage.setItem(ACTIVE_BRANCH_KEY, branchId)
      window.dispatchEvent(new Event(ACTIVE_BRANCH_EVENT))
      router.refresh()
    },
    [router],
  )

  const isGlobal = state.user?.role?.scope === 'GLOBAL'

  return {
    user: state.user,
    isGlobal,
    activeBranchId: state.activeBranchId,
    isConsolidated: isGlobal && state.activeBranchId === ALL_BRANCHES,
    setActiveBranch,
  }
}
