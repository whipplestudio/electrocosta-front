"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Shield, User as UserIcon, Mail, BadgeCheck, Clock, Building2 } from "lucide-react"
import { ActionButton, CreateButton } from "@/components/ui"
import { usersService } from "@/services/users.service"
import { rolesService } from "@/services/roles.service"
import { authService } from "@/services/auth.service"
import { branchesService } from "@/services/branches.service"
import { useActiveBranch } from "@/hooks/use-active-branch"
import { ALL_BRANCHES } from "@/lib/api-client"
import { toast } from 'sonner'
import { cn } from "@/lib/utils"
import type { User, Role, Branch, UserStatus, CreateUserDto, UpdateUserDto } from "@/types/users"
import { RouteProtection } from "@/components/route-protection"
import { DynamicForm, FormFieldConfig } from "@/components/forms"
import { DataTable, Column, Action, SelectFilter } from "@/components/ui/data-table"

// Los permisos ahora se cargan dinámicamente desde la API

export default function UsuariosPage() {
  return (
    <RouteProtection requiredPermissions={["usuarios.usuarios.ver"]}>
      <UsuariosPageContent />
    </RouteProtection>
  )
}

function UsuariosPageContent() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const { user: actor, isGlobal, activeBranchId } = useActiveBranch()
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingUser, setSavingUser] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)

  // Pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("")

  // Cargar datos iniciales
  useEffect(() => {
    loadRoles()

    // Obtener rol del usuario actual
    const currentUser = authService.getCurrentUser()
    if (currentUser?.role?.name) {
      setCurrentUserRole(currentUser.role.name)
    }
  }, [])

  // Solo un actor GLOBAL elige sucursal; para BRANCH el back la fija a la suya
  useEffect(() => {
    if (!isGlobal) return
    let isMounted = true

    branchesService
      .getBranches()
      .then((data) => {
        if (isMounted) setBranches(data)
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Error al cargar sucursales')
      })

    return () => {
      isMounted = false
    }
  }, [isGlobal])

  // Cargar usuarios cuando cambian filtros o paginación
  useEffect(() => {
    loadUsers()
  }, [page, limit, searchQuery, filterStatus])

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await usersService.getAll({
        page,
        limit,
        search: searchQuery || undefined,
        status: (filterStatus as UserStatus) || undefined,
      })
      setUsers(response.data)
      setTotal(response.total)
      setTotalPages(response.pages)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [page, limit, searchQuery, filterStatus])

  // Memoizados a propósito: DataTable relanza su efecto de búsqueda cada vez
  // que cambia la identidad de onSearchChange, y ese efecto vuelve a poner la
  // página en 1. Con handlers inline, avanzar a la página 2 se deshacía solo.
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    setPage(1)
  }, [])

  const handleFilterChange = useCallback((_key: string, value: string | string[]) => {
    setFilterStatus(value as string)
    setPage(1)
  }, [])

  const handleClearFilters = useCallback(() => {
    setSearchQuery('')
    setFilterStatus('')
    setPage(1)
  }, [])

  const loadRoles = async () => {
    try {
      const data = await rolesService.getAll()
      setRoles(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cargar roles')
    }
  }


  const handleRestoreUser = async (user: User) => {
    try {
      setUpdatingUserId(user.id)
      await usersService.restore(user.id)
      toast.success('El usuario ha sido habilitado exitosamente')
      loadUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al habilitar usuario')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return

    try {
      setUpdatingUserId(user.id)
      await usersService.delete(user.id)
      toast.success('El usuario ha sido eliminado exitosamente')
      loadUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar usuario')
    } finally {
      setUpdatingUserId(null)
    }
  }


  // Configuración de campos del formulario de usuario
  const userFormFields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'firstName',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Nombre',
      required: true,
    },
    {
      name: 'lastName',
      label: 'Apellido',
      type: 'text',
      placeholder: 'Apellido',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'usuario@electrocosta.com',
      required: true,
      autocomplete: 'email',
    },
    {
      name: 'password',
      label: selectedUser ? 'Nueva Contraseña (opcional)' : 'Contraseña',
      type: 'password',
      placeholder: selectedUser ? 'Dejar vacío para no cambiar' : '********',
      required: !selectedUser,
      minLength: 8,
      visibleWhen: () => !selectedUser || currentUserRole === 'super_admin',
    },
    {
      name: 'empresa',
      label: 'Empresa',
      type: 'text',
      placeholder: 'Nombre de la empresa',
      required: true,
    },
    {
      name: 'roleId',
      label: 'Rol',
      type: 'select',
      placeholder: 'Selecciona un rol',
      required: true,
      options: roles.map((role) => ({ label: role.name, value: role.id })),
    },
    {
      name: 'branchId',
      label: 'Sucursal',
      type: 'select',
      placeholder: 'Selecciona una sucursal',
      required: isGlobal,
      disabled: !isGlobal,
      options: isGlobal
        ? branches
            // Una sucursal inactiva solo se ofrece si es la que ya tiene el usuario editado
            .filter((branch) => branch.isActive || branch.id === selectedUser?.branchId)
            .map((branch) => ({ label: branch.name, value: branch.id }))
        : actor?.branch
          ? [{ label: actor.branch.name, value: actor.branch.id }]
          : [],
    },
    {
      name: 'status',
      label: 'Usuario activo',
      type: 'switch',
    },
  ], [roles, selectedUser, currentUserRole, isGlobal, branches, actor])

  const getDefaultFormValues = () => {
    if (selectedUser) {
      return {
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        email: selectedUser.email,
        password: '',
        empresa: selectedUser.empresa,
        roleId: selectedUser.roleId,
        branchId: selectedUser.branchId,
        status: selectedUser.status === 'activo',
      }
    }
    // En "Todas" no hay sucursal que heredar: el campo queda vacío y es obligatorio
    const defaultBranchId = isGlobal
      ? (activeBranchId === ALL_BRANCHES ? '' : activeBranchId ?? '')
      : actor?.branchId ?? ''

    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      empresa: '',
      roleId: '',
      branchId: defaultBranchId,
      status: true,
    }
  }

  const handleCreateUser = () => {
    setSelectedUser(null)
    setIsUserDialogOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsUserDialogOpen(true)
  }

  const handleSaveUser = async (data: Record<string, any>) => {
    try {
      setSavingUser(true)
      
      const payload: any = {
        ...data,
        status: data.status ? 'activo' : 'inactivo',
      }

      // El back solo respeta la sucursal del body para un actor GLOBAL
      if (!isGlobal) {
        delete payload.branchId
      }
      
      if (selectedUser) {
        // Editar - eliminar email del payload de actualización
        delete payload.email
        
        // Si la contraseña está vacía, eliminarla del payload
        if (!payload.password) {
          delete payload.password
        }
        
        await usersService.update(selectedUser.id, payload as UpdateUserDto)
        toast.success('El usuario ha sido actualizado exitosamente')
      } else {
        // Crear
        await usersService.create(payload as CreateUserDto)
        toast.success('El usuario ha sido creado exitosamente')
      }
      setIsUserDialogOpen(false)
      loadUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar usuario')
    } finally {
      setSavingUser(false)
    }
  }


  const getRoleBadgeStyles = (role: string): { bg: string; text: string; border: string } => {
    switch (role) {
      case "Administrador":
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
      case "Contador":
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
      case "Vendedor":
        return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }
      case "Tesorero":
        return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
    }
  }

  const getStatusBadgeStyles = (status: string): { bg: string; text: string; border: string; label: string } => {
    switch (status) {
      case 'activo':
        return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Activo' }
      case 'inactivo':
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Inactivo' }
      case 'pendiente':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pendiente' }
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: status }
    }
  }

  // DataTable columns configuration
  const columns: Column<User>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Usuario',
      render: (user) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-[#164e63]" />
          </div>
          <span className="font-medium text-[#374151]">
            {user.firstName} {user.lastName}
          </span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (user) => (
        <div className="flex items-center gap-2 text-[#6b7280]">
          <Mail className="h-4 w-4" />
          {user.email}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      render: (user) => {
        const styles = getRoleBadgeStyles(user.role.name)
        return (
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-[#6b7280]" />
            <span className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border",
              styles.bg,
              styles.text,
              styles.border
            )}>
              {user.role.name}
            </span>
          </div>
        )
      },
    },
    ...(isGlobal
      ? [{
          key: 'branch',
          header: 'Sucursal',
          // El listado de usuarios solo trae branchId; el nombre sale de GET /branches
          render: (user: User) => (
            <div className="flex items-center gap-2 text-[#6b7280] text-sm">
              <Building2 className="h-4 w-4" />
              {branches.find((branch) => branch.id === user.branchId)?.name ?? '—'}
            </div>
          ),
        }]
      : []),
    {
      key: 'status',
      header: 'Estado',
      render: (user) => {
        const styles = getStatusBadgeStyles(user.status)
        return (
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
            styles.bg,
            styles.text,
            styles.border
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", styles.text.replace('text-', 'bg-'))} />
            {styles.label}
          </span>
        )
      },
    },
    {
      key: 'lastLogin',
      header: 'Último Acceso',
      render: (user) => (
        <div className="flex items-center gap-2 text-[#6b7280] text-sm">
          <Clock className="h-4 w-4" />
          {user.lastLogin ? new Date(user.lastLogin).toLocaleString('es-MX', {
            dateStyle: 'short',
            timeStyle: 'short',
          }) : 'Nunca'}
        </div>
      ),
    },
  ], [isGlobal, branches])

  // DataTable actions configuration
  const actions = useMemo((): Action<User>[] => [
    {
      label: 'Editar',
      icon: <Edit size={16} />,
      onClick: (user: User) => handleEditUser(user),
    },
    {
      label: 'Eliminar',
      icon: <Trash2 size={16} />,
      onClick: (user: User) => handleDeleteUser(user),
      disabled: (user: User) => updatingUserId === user.id,
      hidden: (user: User) => !!user.deletedAt,
    },
    {
      label: 'Habilitar',
      icon: <Shield size={16} />,
      onClick: (user: User) => handleRestoreUser(user),
      disabled: (user: User) => updatingUserId === user.id,
      hidden: (user: User) => !user.deletedAt,
    },
  ], [updatingUserId])

  // Select filters configuration
  const selectFilters: SelectFilter[] = useMemo(() => [
    {
      key: 'status',
      label: 'Estado',
      options: [
        { value: 'activo', label: 'Activo' },
        { value: 'inactivo', label: 'Inactivo' },
      ],
    },
  ], [])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // Reset to first page when changing limit
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header - Material Design 3 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e7eb]">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#374151]">Usuarios</h1>
          <p className="text-[#6b7280]">Gestiona los usuarios del sistema y sus accesos</p>
        </div>
        <ActionButton onClick={handleCreateUser} className="w-full sm:w-auto">
          Nuevo Usuario
        </ActionButton>
      </div>

      {/* DataTable with filters and pagination */}
      <DataTable
        title="Lista de Usuarios"
        columns={columns}
        data={users}
        keyExtractor={(user) => user.id}
        actions={actions}
        loading={loading}
        emptyMessage="No se encontraron usuarios"
        // Filters
        searchFilter={{
          placeholder: 'Buscar por nombre o email...',
          debounceMs: 400,
        }}
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        selectFilters={selectFilters}
        filterValues={{ status: filterStatus }}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        // Pagination
        pagination={{
          page,
          limit,
          total,
          totalPages,
        }}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* Dialog - Material Design 3 */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto rounded-xl p-4 sm:p-6">
          <DialogHeader className="space-y-2 pb-3 sm:pb-4">
            <DialogTitle className="text-xl sm:text-2xl font-semibold text-[#374151]">
              {selectedUser ? "Editar Usuario" : "Nuevo Usuario"}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-[#6b7280]">
              {selectedUser ? "Modifica los datos del usuario" : "Crea un nuevo usuario en el sistema"}
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            config={{
              fields: userFormFields,
              columns: 2,
              gap: 'medium',
              variant: 'outlined',
              density: 'comfortable',
              defaultValues: getDefaultFormValues(),
            }}
            onSubmit={handleSaveUser}
            onCancel={() => setIsUserDialogOpen(false)}
            submitLabel={selectedUser ? "Guardar Cambios" : "Crear Usuario"}
            cancelLabel="Cancelar"
            loading={savingUser}
            asDialog
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
