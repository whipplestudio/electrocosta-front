"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Edit, Trash2, RotateCcw, Truck, FileCheck, FileX, Receipt, Save, Upload, FileSpreadsheet, HelpCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { suppliersService, CreateSupplierDto } from "@/services/suppliers.service"
import type { Supplier, SupplierStats } from "@/types/suppliers"
import type { ForbiddenPermissionError } from "@/types/permissions"
import { getForbiddenPermissionError } from "@/lib/api-client"
import { toast } from "sonner"
import { ActionButton, CreateButton, KpiCard, DataTable, Column, Action } from "@/components/ui"
import { DynamicForm, FormSection } from "@/components/forms"
import { BulkUploadDialog, erroresDeCargaDirecta, type ErrorValidacionCarga } from "@/components/bulk-upload-dialog"
import { BulkUploadGuideDialogProveedores } from "@/components/bulk-upload-guide-dialog-proveedores"
import { ConfirmActionDialog } from "@/components/confirm-action-dialog"
import { PermissionDenied } from "@/components/permission-denied"
import { cn } from "@/lib/utils"
import { RouteProtection } from "@/components/route-protection"

// Sin `status` el back devuelve sólo activos; el filtro siempre manda uno explícito
type SupplierStatusFilter = 'active' | 'inactive'

const DEFAULT_STATUS_FILTER: SupplierStatusFilter = 'active'

export default function ProveedoresPage() {
  return (
    <RouteProtection requiredPermissions={["proveedores.proveedores.ver"]}>
      <ProveedoresPageContent />
    </RouteProtection>
  )
}

function ProveedoresPageContent() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [suppliersForbidden, setSuppliersForbidden] = useState<ForbiddenPermissionError | null>(null)

  // KPIs (GET /suppliers/stats)
  const [stats, setStats] = useState<SupplierStats | null>(null)

  // Pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  // Search and status filter state for DataTable
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<SupplierStatusFilter>(DEFAULT_STATUS_FILTER)

  // Debounce timer ref
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Confirmación de eliminar / reactivar
  const [accionPendiente, setAccionPendiente] = useState<{ tipo: 'eliminar' | 'reactivar'; proveedor: Supplier } | null>(null)

  // Bulk upload dialog states (adaptado a BulkUploadDialog como en clientes)
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [uploadResponse, setUploadResponse] = useState<any>(null)
  const [validacionResultado, setValidacionResultado] = useState<any>(null)
  const [importacionResultado, setImportacionResultado] = useState<any>(null)
  const [uploadLoading, setUploadLoading] = useState(false)

  // Función para cargar proveedores con paginación
  const loadSuppliers = async (
    search?: string,
    currentPage?: number,
    currentLimit?: number,
    currentStatus?: SupplierStatusFilter,
  ) => {
    try {
      setLoading(true)
      const response = await suppliersService.list({
        search,
        status: currentStatus || statusFilter,
        page: currentPage || page,
        limit: currentLimit || limit,
      })
      setSuppliers(response.data)
      setTotal(response.total)
      setPages(response.pages)
      setSuppliersForbidden(null)
    } catch (error) {
      console.error("Error loading suppliers:", error)
      const forbidden = getForbiddenPermissionError(error)
      if (forbidden) {
        // La tabla se vacía a propósito: dejar filas viejas debajo de un
        // "sin acceso" haría creer que el listado sigue actualizándose.
        setSuppliers([])
        setTotal(0)
        setPages(1)
        setSuppliersForbidden(forbidden)
      } else {
        toast.error('No se pudieron cargar los proveedores')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      setStats(await suppliersService.getStats())
    } catch (error) {
      console.error("Error loading supplier stats:", error)
      // El 403 ya lo explica el bloque de la tabla (mismo permiso): aquí sólo
      // se avisa de los demás errores.
      setStats(null)
      if (!getForbiddenPermissionError(error)) {
        toast.error('No se pudieron cargar los indicadores de proveedores')
      }
    }
  }

  // Tras cada alta, edición, carga, borrado o reactivación
  const refreshSuppliers = () => {
    loadSuppliers(searchTerm)
    loadStats()
  }

  // Cargar proveedores e indicadores al montar el componente
  useEffect(() => {
    loadSuppliers()
    loadStats()
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [])

  // Handlers para paginación, búsqueda y filtro de estado
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    loadSuppliers(searchTerm, newPage, limit, statusFilter)
  }, [searchTerm, limit, statusFilter])

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
    loadSuppliers(searchTerm, 1, newLimit, statusFilter)
  }, [searchTerm, statusFilter])

  const handleSearchChange = useCallback((value: string) => {
    // Clear previous timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }

    setSearchTerm(value)
    setPage(1)

    // Set new timer
    searchTimerRef.current = setTimeout(() => {
      loadSuppliers(value, 1, limit, statusFilter)
    }, 400)
  }, [limit, statusFilter])

  const handleFilterChange = useCallback((key: string, value: string | string[]) => {
    if (key !== 'status') return
    const nextStatus: SupplierStatusFilter = value === 'inactive' ? 'inactive' : DEFAULT_STATUS_FILTER
    setStatusFilter(nextStatus)
    setPage(1)
    loadSuppliers(searchTerm, 1, limit, nextStatus)
  }, [searchTerm, limit])

  const handleClearFilters = useCallback(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
    setSearchTerm("")
    setStatusFilter(DEFAULT_STATUS_FILTER)
    setPage(1)
    loadSuppliers("", 1, limit, DEFAULT_STATUS_FILTER)
  }, [limit])

  // DataTable columns configuration
  const supplierColumns: Column<Supplier>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Razón Social',
      render: (supplier) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] flex items-center justify-center">
            <Truck className="h-5 w-5 text-[#164e63]" />
          </div>
          <div className="font-medium text-[#374151]">{supplier.name}</div>
        </div>
      ),
    },
    {
      key: 'taxId',
      header: 'RFC',
      render: (supplier) => supplier.taxId ? (
        <span className="font-mono text-sm text-[#6b7280] bg-[#f9fafb] px-2 py-1 rounded-md">
          {supplier.taxId}
        </span>
      ) : (
        <span className="text-sm text-[#6b7280]">—</span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (supplier) => (
        <span className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
          supplier.status === "active"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-red-50 text-red-700 border-red-200"
        )}>
          <span className={cn(
            "w-1.5 h-1.5 rounded-full mr-1.5",
            supplier.status === "active" ? "bg-green-500" : "bg-red-500"
          )} />
          {supplier.status === "active" ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ], [])

  // DataTable actions configuration: en la vista de inactivos sólo se reactiva
  const showingInactive = statusFilter === 'inactive'
  const supplierActions = useMemo((): Action<Supplier>[] => [
    {
      label: 'Editar',
      icon: <Edit size={16} />,
      onClick: (supplier: Supplier) => handleOpenEdit(supplier),
      hidden: () => showingInactive,
      permissionCode: 'proveedores.proveedores.editar',
    },
    {
      label: 'Eliminar',
      icon: <Trash2 size={16} />,
      onClick: (supplier: Supplier) => setAccionPendiente({ tipo: 'eliminar', proveedor: supplier }),
      hidden: () => showingInactive,
      permissionCode: 'proveedores.proveedores.eliminar',
    },
    {
      label: 'Reactivar',
      icon: <RotateCcw size={16} />,
      onClick: (supplier: Supplier) => setAccionPendiente({ tipo: 'reactivar', proveedor: supplier }),
      hidden: () => !showingInactive,
      permissionCode: 'proveedores.proveedores.editar',
    },
  ], [showingInactive])

  // Form sections configuration - title/description removed (shown in DialogHeader)
  const supplierFormSections: FormSection[] = [
    {
      fields: [
        {
          name: 'name',
          label: 'Razón Social',
          type: 'text',
          placeholder: 'Nombre completo o razón social',
          required: true,
        },
        {
          name: 'taxId',
          label: 'RFC',
          type: 'text',
          placeholder: 'Ej. ABC010203XY1 (opcional)',
        },
      ],
    },
  ]

  // Modal handlers
  const handleOpenCreate = () => {
    setIsCreateModalOpen(true)
  }

  const handleOpenEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsEditModalOpen(true)
  }

  const handleCloseModals = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setSelectedSupplier(null)
  }

  // El RFC es opcional: vacío se manda como null para que el back lo limpie
  const toSupplierDto = (data: Record<string, any>): CreateSupplierDto => ({
    name: data.name,
    taxId: data.taxId?.trim() ? data.taxId : null,
  })

  // Form submit handlers
  const handleCreateSubmit = async (data: Record<string, any>) => {
    try {
      setFormLoading(true)

      await suppliersService.create(toSupplierDto(data))

      toast.success('El proveedor se ha creado exitosamente')

      handleCloseModals()
      refreshSuppliers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo crear el proveedor')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditSubmit = async (data: Record<string, any>) => {
    if (!selectedSupplier) return

    try {
      setFormLoading(true)

      await suppliersService.update(selectedSupplier.id, toSupplierDto(data))

      toast.success('Los cambios se han guardado exitosamente')

      handleCloseModals()
      refreshSuppliers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el proveedor')
    } finally {
      setFormLoading(false)
    }
  }

  const handleConfirmarAccionProveedor = async () => {
    if (!accionPendiente) return
    const { tipo, proveedor } = accionPendiente
    try {
      if (tipo === 'eliminar') {
        await suppliersService.remove(proveedor.id)
        toast.success('Proveedor eliminado')
      } else {
        await suppliersService.reactivate(proveedor.id)
        toast.success('Proveedor reactivado')
      }
      setAccionPendiente(null)
      refreshSuppliers()
    } catch (error) {
      // El 409 del back (CxP abiertas) llega con su mensaje tal cual
      const fallback = tipo === 'eliminar' ? 'No se pudo eliminar el proveedor' : 'No se pudo reactivar el proveedor'
      toast.error(error instanceof Error ? error.message : fallback)
    }
  }

  // Bulk upload handlers (adapted for BulkUploadDialog)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivo(e.target.files[0])
      setUploadResponse(null)
      setValidacionResultado(null)
      setImportacionResultado(null)
    }
  }

  const subirArchivo = async () => {
    if (!archivo) return

    try {
      setUploadLoading(true)
      const result = await suppliersService.bulkUpload(archivo)

      // Simular uploadResponse con los datos del archivo
      setUploadResponse({
        uploadId: 'supplier-bulk-' + Date.now(),
        registrosDetectados: result.success + result.failed,
      })

      // Simular validacionResultado con los datos de la respuesta
      setValidacionResultado({
        registrosValidos: result.success,
        registrosInvalidos: result.failed,
        puedeImportar: result.success > 0,
        errores: erroresDeCargaDirecta(result.errors),
      })

      if (result.failed > 0) {
        toast.error(`${result.success} válidos, ${result.failed} con errores`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo procesar el archivo')
    } finally {
      setUploadLoading(false)
    }
  }

  // Para proveedores, la importación ya se hizo en subirArchivo
  // Esta función solo confirma y recarga la lista
  const importarDatos = async () => {
    setImportacionResultado({
      registrosImportados: validacionResultado?.registrosValidos || 0,
      errores: (validacionResultado?.errores || []).map(
        (e: ErrorValidacionCarga) => `Fila ${e.fila}: ${e.error}`,
      ),
    })

    // Recargar lista e indicadores si hay registros importados
    if (validacionResultado?.registrosValidos > 0) {
      refreshSuppliers()
    }
  }

  const handleResetBulkUpload = () => {
    setArchivo(null)
    setUploadResponse(null)
    setValidacionResultado(null)
    setImportacionResultado(null)
  }

  const descargarPlantilla = async () => {
    try {
      const blob = await suppliersService.descargarPlantilla()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'plantilla_proveedores.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('La plantilla se ha descargado exitosamente')
    } catch (error) {
      toast.error('No se pudo descargar la plantilla')
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header - Material Design 3 - Mobile First */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#e5e7eb]">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#374151]">Gestión de Proveedores</h1>
          <p className="text-sm md:text-base text-[#6b7280]">Administra el catálogo de proveedores de las cuentas por pagar</p>
        </div>
        {/* Toolbar buttons - 2 cols on mobile, horizontal on desktop */}
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-nowrap md:justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <ActionButton
                  variant="ghost"
                  size="sm"
                  className="w-full md:w-auto md:h-9 md:px-3"
                  startIcon={<HelpCircle className="h-4 w-4" />}
                  onClick={() => setGuideOpen(true)}
                >
                  Guía
                </ActionButton>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs bg-slate-700 dark:bg-slate-200 border-slate-600 dark:border-slate-300">
                <div className="space-y-1">
                  <p className="font-semibold text-white dark:text-slate-900">Guía de carga masiva</p>
                  <p className="text-xs text-slate-200 dark:text-slate-700">
                    Ver instrucciones detalladas sobre cómo usar la plantilla Excel
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <ActionButton
                  variant="outline"
                  size="sm"
                  className="w-full md:w-auto md:h-9 md:px-3"
                  startIcon={<FileSpreadsheet className="h-4 w-4" />}
                  onClick={descargarPlantilla}
                  permissionCode="proveedores.proveedores.crear"
                >
                  Plantilla
                </ActionButton>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs bg-slate-700 dark:bg-slate-200 border-slate-600 dark:border-slate-300">
                <div className="space-y-1">
                  <p className="font-semibold text-white dark:text-slate-900">Plantilla para carga masiva</p>
                  <p className="text-xs text-slate-200 dark:text-slate-700">
                    Descarga el archivo Excel con el formato correcto para importar múltiples proveedores a la vez
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <ActionButton
                  variant="outline"
                  size="sm"
                  className="w-full md:w-auto md:h-9 md:px-3"
                  startIcon={<Upload className="h-4 w-4" />}
                  onClick={() => setShowBulkUploadDialog(true)}
                  permissionCode="proveedores.proveedores.crear"
                >
                  Carga Masiva
                </ActionButton>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs bg-slate-700 dark:bg-slate-200 border-slate-600 dark:border-slate-300">
                <div className="space-y-1">
                  <p className="font-semibold text-white dark:text-slate-900">Importación masiva de proveedores</p>
                  <p className="text-xs text-slate-200 dark:text-slate-700">
                    Sube un archivo Excel con múltiples proveedores a la vez
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <CreateButton onClick={handleOpenCreate} size="sm" className="w-full md:w-auto md:h-9 md:px-3" permissionCode="proveedores.proveedores.crear">
            Nuevo Proveedor
          </CreateButton>
        </div>
      </div>

      {/* KPIs desde GET /suppliers/stats (sólo activos) - Mobile First */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Proveedores"
          value={stats?.total ?? "—"}
          subtitle="Proveedores activos"
          icon={<Truck className="h-4 w-4" />}
          variant="primary"
        />
        <KpiCard
          title="Con RFC"
          value={stats?.conRfc ?? "—"}
          subtitle="Identificados fiscalmente"
          icon={<FileCheck className="h-4 w-4" />}
          variant="success"
        />
        <KpiCard
          title="Sin RFC"
          value={stats?.sinRfc ?? "—"}
          subtitle="Pendientes de capturar RFC"
          icon={<FileX className="h-4 w-4" />}
          variant="warning"
        />
        <KpiCard
          title="Con Cuentas por Pagar"
          value={stats?.conCuentasPorPagar ?? "—"}
          subtitle="En la sucursal activa"
          icon={<Receipt className="h-4 w-4" />}
          variant="default"
        />
      </div>

      {/* Tabla de Proveedores - DataTable con paginación, búsqueda y estado */}
      <DataTable
        title="Listado de Proveedores"
        columns={supplierColumns}
        data={suppliers}
        keyExtractor={(supplier) => supplier.id}
        actions={supplierActions}
        loading={loading}
        emptyMessage={showingInactive
          ? "No hay proveedores inactivos con los filtros aplicados."
          : "No se encontraron proveedores. Intenta con otra búsqueda o crea un nuevo proveedor."}
        emptyState={suppliersForbidden ? <PermissionDenied error={suppliersForbidden} /> : undefined}

        // Search filter integrated in DataTable
        searchFilter={{ placeholder: 'Buscar por razón social o RFC...', debounceMs: 400 }}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}

        // Status filter
        selectFilters={[
          {
            key: 'status',
            label: 'Estado',
            options: [
              { label: 'Activos', value: 'active' },
              { label: 'Inactivos', value: 'inactive' },
            ],
            placeholder: 'Filtrar por estado',
          }
        ]}
        filterValues={{ status: statusFilter }}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}

        // Backend pagination
        pagination={{
          page,
          limit,
          total,
          totalPages: pages,
        }}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleLimitChange}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />

      {/* Create Supplier Modal - Mobile First */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-4 sm:p-6">
          <DialogHeader className="space-y-2 pb-3 sm:pb-4">
            <DialogTitle className="text-xl sm:text-2xl font-semibold text-[#374151]">
              Nuevo Proveedor
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-[#6b7280]">
              Registrar un nuevo proveedor en el catálogo
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            id="create-supplier-form"
            config={{
              sections: supplierFormSections,
              columns: 2,
              gap: 'medium',
              variant: 'outlined',
              density: 'comfortable',
            }}
            onSubmit={handleCreateSubmit}
            loading={formLoading}
            showSubmit={false}
            showCancel={false}
            footerClassName="flex justify-end gap-3 pt-4 border-t border-[#e5e7eb]"
            extraButtons={
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <ActionButton
                  type="button"
                  variant="ghost"
                  onClick={handleCloseModals}
                  disabled={formLoading}
                  className="flex-1 sm:flex-none"
                  size="md"
                >
                  Cancelar
                </ActionButton>
                <ActionButton
                  type="submit"
                  form="create-supplier-form"
                  variant="save"
                  disabled={formLoading}
                  size="md"
                  loading={formLoading}
                  loadingText="Guardando..."
                  className="flex-1 sm:flex-none"
                  startIcon={<Save className="h-4 w-4" />}
                >
                  Guardar Proveedor
                </ActionButton>
              </div>
            }
          />
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Modal - Mobile First */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-4 sm:p-6">
          <DialogHeader className="space-y-2 pb-3 sm:pb-4">
            <DialogTitle className="text-xl sm:text-2xl font-semibold text-[#374151]">
              Editar Proveedor
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-[#6b7280]">
              Actualizar información del proveedor
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            id="edit-supplier-form"
            config={{
              sections: supplierFormSections,
              columns: 2,
              gap: 'medium',
              variant: 'outlined',
              density: 'comfortable',
              defaultValues: selectedSupplier ? {
                name: selectedSupplier.name,
                taxId: selectedSupplier.taxId || '',
              } : {},
            }}
            onSubmit={handleEditSubmit}
            loading={formLoading}
            showSubmit={false}
            showCancel={false}
            footerClassName="flex justify-end gap-3 pt-4 border-t border-[#e5e7eb]"
            extraButtons={
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <ActionButton
                  type="button"
                  variant="ghost"
                  onClick={handleCloseModals}
                  disabled={formLoading}
                  className="flex-1 sm:flex-none"
                  size="md"
                >
                  Cancelar
                </ActionButton>
                <ActionButton
                  type="submit"
                  form="edit-supplier-form"
                  variant="save"
                  disabled={formLoading}
                  size="md"
                  loading={formLoading}
                  loadingText="Guardando..."
                  className="flex-1 sm:flex-none"
                  startIcon={<Save className="h-4 w-4" />}
                >
                  Guardar Cambios
                </ActionButton>
              </div>
            }
          />
        </DialogContent>
      </Dialog>

      {/* Confirmación de eliminar / reactivar */}
      <ConfirmActionDialog
        open={accionPendiente !== null}
        onOpenChange={(open) => { if (!open) setAccionPendiente(null) }}
        title={accionPendiente?.tipo === 'reactivar' ? "Reactivar proveedor" : "Eliminar proveedor"}
        icon={accionPendiente?.tipo === 'reactivar' ? <RotateCcw className="h-5 w-5" /> : <Trash2 className="h-5 w-5" />}
        description={
          accionPendiente?.tipo === 'reactivar' ? (
            <>
              <strong>{accionPendiente.proveedor.name}</strong> vuelve al catálogo de activos y podrá elegirse
              de nuevo en las cuentas por pagar.
            </>
          ) : (
            <>
              <strong>{accionPendiente?.proveedor.name}</strong> deja de aparecer en el catálogo y en el alta de
              cuentas por pagar. Podrás reactivarlo desde el filtro de inactivos.
            </>
          )
        }
        confirmLabel={accionPendiente?.tipo === 'reactivar' ? "Reactivar" : "Eliminar"}
        loadingText={accionPendiente?.tipo === 'reactivar' ? "Reactivando…" : "Eliminando…"}
        confirmVariant={accionPendiente?.tipo === 'reactivar' ? "primary" : "danger"}
        onConfirm={handleConfirmarAccionProveedor}
      />

      {/* Bulk Upload Dialog */}
      <BulkUploadDialog
        open={showBulkUploadDialog}
        onOpenChange={setShowBulkUploadDialog}
        title="Carga Masiva de Proveedores"
        description="Importa múltiples proveedores desde un archivo Excel. La razón social y el RFC no pueden estar duplicados."
        archivo={archivo}
        uploadResponse={uploadResponse}
        validacionResultado={validacionResultado}
        importacionResultado={importacionResultado}
        loading={uploadLoading}
        onFileChange={handleFileChange}
        onUpload={subirArchivo}
        onValidate={() => {}} // No needed for suppliers - validation happens on upload
        onImport={importarDatos}
        onReset={handleResetBulkUpload}
      />

      {/* Dialog de Guía de Carga Masiva */}
      <BulkUploadGuideDialogProveedores
        open={guideOpen}
        onOpenChange={setGuideOpen}
      />
    </div>
  )
}
