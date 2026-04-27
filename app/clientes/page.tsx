"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Edit, Users, Building2, Mail, Phone, User, CheckCircle2, Save, Upload, FileSpreadsheet, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { clientsService, Client, CreateClientDto } from "@/services/clients.service"
import { useToast } from "@/hooks/use-toast"
import { ActionButton, CreateButton, KpiCard, DataTable, Column, Action } from "@/components/ui"
import { FloatingInput } from "@/components/ui"
import { DynamicForm, FormSection } from "@/components/forms"
import { BulkUploadDialog } from "@/components/bulk-upload-dialog"
import { cn } from "@/lib/utils"

export default function ClientesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  
  // Search state for DataTable
  const [searchTerm, setSearchTerm] = useState("")
  
  // Debounce timer ref
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  
  // Bulk upload dialog states (similar to proyectos)
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [uploadResponse, setUploadResponse] = useState<any>(null)
  const [validacionResultado, setValidacionResultado] = useState<any>(null)
  const [importacionResultado, setImportacionResultado] = useState<any>(null)
  const [uploadLoading, setUploadLoading] = useState(false)

  // Función para cargar clientes con paginación
  const loadClients = async (search?: string, currentPage?: number, currentLimit?: number) => {
    try {
      setLoading(true)
      const response = await clientsService.list({ 
        search, 
        page: currentPage || page, 
        limit: currentLimit || limit 
      })
      setClients(response.data)
      setTotal(response.total)
      setPages(response.pages)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      })
      console.error("Error loading clients:", error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClients()
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [])

  // Handlers para paginación y búsqueda
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    loadClients(searchTerm, newPage, limit)
  }, [searchTerm, limit])

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
    loadClients(searchTerm, 1, newLimit)
  }, [searchTerm])

  const handleSearchChange = useCallback((value: string) => {
    // Clear previous timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
    
    setSearchTerm(value)
    setPage(1)
    
    // Set new timer
    searchTimerRef.current = setTimeout(() => {
      loadClients(value, 1, limit)
    }, 400)
  }, [limit])

  // Calcular KPIs
  const clientesActivos = clients.filter((c) => c.status === "active").length
  const clientesInactivos = clients.filter((c) => c.status !== "active").length

  // DataTable columns configuration
  const clientColumns: Column<Client>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Cliente',
      render: (client) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] flex items-center justify-center">
            <Building2 className="h-5 w-5 text-[#164e63]" />
          </div>
          <div>
            <div className="font-medium text-[#374151]">{client.name}</div>
            {client.contactPerson && (
              <div className="text-sm text-[#6b7280] flex items-center gap-1">
                <User className="h-3 w-3" />
                {client.contactPerson}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'taxId',
      header: 'RFC',
      render: (client) => (
        <span className="font-mono text-sm text-[#6b7280] bg-[#f9fafb] px-2 py-1 rounded-md">
          {client.taxId}
        </span>
      ),
    },
    {
      key: 'contact',
      header: 'Contacto',
      render: (client) => (
        <div className="text-sm space-y-1">
          {client.email && (
            <div className="flex items-center gap-1.5 text-[#374151]">
              <Mail className="h-3.5 w-3.5 text-[#6b7280]" />
              {client.email}
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-1.5 text-[#6b7280]">
              <Phone className="h-3.5 w-3.5" />
              {client.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (client) => (
        <span className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
          client.status === "active"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-red-50 text-red-700 border-red-200"
        )}>
          <span className={cn(
            "w-1.5 h-1.5 rounded-full mr-1.5",
            client.status === "active" ? "bg-green-500" : "bg-red-500"
          )} />
          {client.status === "active" ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ], [])

  // DataTable actions configuration
  const clientActions = useMemo((): Action<Client>[] => [
    {
      label: 'Ver',
      icon: <span className="text-sm">Ver</span>,
      onClick: (client: Client) => router.push(`/clientes/${client.id}`),
    },
    {
      label: 'Editar',
      icon: <Edit size={16} />,
      onClick: (client: Client) => handleOpenEdit(client),
    },
  ], [router])

  // Form sections configuration - title/description removed (shown in DialogHeader)
  const clientFormSections: FormSection[] = [
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
          placeholder: 'RFC del cliente',
          required: true,
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'correo@ejemplo.com',
        },
        {
          name: 'phone',
          label: 'Teléfono',
          type: 'tel',
          placeholder: '(55) 1234-5678',
        },
        {
          name: 'contactPerson',
          label: 'Persona de Contacto',
          type: 'text',
          placeholder: 'Nombre del contacto principal',
        },
        {
          name: 'notes',
          label: 'Notas',
          type: 'textarea',
          placeholder: 'Información adicional sobre el cliente...',
        },
      ],
    },
  ]

  // Modal handlers
  const handleOpenCreate = () => {
    setIsCreateModalOpen(true)
  }

  const handleOpenEdit = (client: Client) => {
    setSelectedClient(client)
    setIsEditModalOpen(true)
  }

  const handleCloseModals = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setSelectedClient(null)
  }

  // Form submit handlers
  const handleCreateSubmit = async (data: Record<string, any>) => {
    try {
      setFormLoading(true)

      const clientData: CreateClientDto = {
        name: data.name,
        taxId: data.taxId,
        email: data.email || undefined,
        phone: data.phone || undefined,
        contactPerson: data.contactPerson || undefined,
        notes: data.notes || undefined,
        status: 'active',
      }

      await clientsService.create(clientData)
      
      toast({
        title: "✅ Cliente creado",
        description: "El cliente ha sido registrado exitosamente",
      })
      
      handleCloseModals()
      loadClients(searchTerm)
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "No se pudo crear el cliente",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditSubmit = async (data: Record<string, any>) => {
    if (!selectedClient) return
    
    try {
      setFormLoading(true)

      const updateData: CreateClientDto = {
        name: data.name,
        taxId: data.taxId,
        email: data.email || undefined,
        phone: data.phone || undefined,
        contactPerson: data.contactPerson || undefined,
        notes: data.notes || undefined,
        status: 'active',
      }

      await clientsService.update(selectedClient.id, updateData)
      
      toast({
        title: "✅ Cliente actualizado",
        description: "Los cambios han sido guardados exitosamente",
      })

      handleCloseModals()
      loadClients(searchTerm)
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el cliente",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
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
      const result = await clientsService.bulkUpload(archivo)
      
      // Simular uploadResponse con los datos del archivo
      setUploadResponse({
        uploadId: 'client-bulk-' + Date.now(),
        registrosDetectados: result.success + result.failed,
      })
      
      // Simular validacionResultado con los datos de la respuesta
      setValidacionResultado({
        registrosValidos: result.success,
        registrosInvalidos: result.failed,
        puedeImportar: result.success > 0,
        errores: result.errors.map((err: string) => ({
          fila: 0,
          campo: 'General',
          error: err,
        })),
      })
      
      if (result.failed > 0) {
        toast({
          title: `⚠️ Validación completada`,
          description: `${result.success} válidos, ${result.failed} con errores`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "No se pudo procesar el archivo",
        variant: "destructive",
      })
    } finally {
      setUploadLoading(false)
    }
  }

  // Para clientes, la importación ya se hizo en subirArchivo
  // Esta función solo confirma y recarga la lista
  const importarDatos = async () => {
    setImportacionResultado({
      registrosImportados: validacionResultado?.registrosValidos || 0,
      errores: validacionResultado?.errores || [],
    })
    
    // Recargar lista si hay registros importados
    if (validacionResultado?.registrosValidos > 0) {
      loadClients(searchTerm)
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
      const blob = await clientsService.descargarPlantilla()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'plantilla_clientes.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "✅ Descarga completada",
        description: "La plantilla se ha descargado exitosamente",
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo descargar la plantilla",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header - Material Design 3 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e7eb]">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#374151]">Gestión de Clientes</h1>
          <p className="text-[#6b7280]">Administra la información de tus clientes y contactos</p>
        </div>
        <div className="flex gap-2">
          <ActionButton
            variant="outline"
            size="sm"
            startIcon={<Upload className="h-4 w-4" />}
            onClick={() => setShowBulkUploadDialog(true)}
          >
            Carga Masiva
          </ActionButton>
          <ActionButton
            variant="outline"
            size="sm"
            startIcon={<FileSpreadsheet className="h-4 w-4" />}
            onClick={descargarPlantilla}
          >
            Plantilla
          </ActionButton>
          <CreateButton onClick={handleOpenCreate}>
            Nuevo Cliente
          </CreateButton>
        </div>
      </div>

      {/* KPIs - Reusable Components */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          title="Total Clientes"
          value={total}
          subtitle={`${clientesActivos} activos • ${clientesInactivos} inactivos`}
          icon={<Users className="h-4 w-4" />}
          variant="primary"
        />
        <KpiCard
          title="Clientes Activos"
          value={clientesActivos}
          subtitle="En operación actualmente"
          icon={<CheckCircle2 className="h-4 w-4" />}
          variant="success"
        />
        <KpiCard
          title="Estado del Sistema"
          value={loading ? "Cargando" : "Operativo"}
          subtitle={loading ? "Sincronizando datos..." : "Todos los sistemas activos"}
          icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
          variant={loading ? "warning" : "default"}
        />
      </div>

      {/* Tabla de Clientes - DataTable con paginación y búsqueda */}
      <DataTable
        title="Listado de Clientes"
        columns={clientColumns}
        data={clients}
        keyExtractor={(client) => client.id}
        actions={clientActions}
        loading={loading}
        emptyMessage="No se encontraron clientes. Intenta con otra búsqueda o crea un nuevo cliente."
        
        // Search filter integrated in DataTable
        searchFilter={{ placeholder: 'Buscar por nombre, RFC, email...', debounceMs: 400 }}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        
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

      {/* Create Client Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-2xl rounded-xl">
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle className="text-2xl font-semibold text-[#374151]">
              Nuevo Cliente
            </DialogTitle>
            <DialogDescription className="text-base text-[#6b7280]">
              Registrar un nuevo cliente en el sistema
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            id="create-client-form"
            config={{
              sections: clientFormSections,
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
              <>
                <ActionButton variant="ghost" onClick={handleCloseModals} disabled={formLoading}>
                  Cancelar
                </ActionButton>
                <ActionButton
                  type="submit"
                  form="create-client-form"
                  variant="save"
                  disabled={formLoading}
                  startIcon={formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                >
                  {formLoading ? 'Guardando...' : 'Guardar Cliente'}
                </ActionButton>
              </>
            }
          />
        </DialogContent>
      </Dialog>

      {/* Edit Client Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-2xl rounded-xl">
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle className="text-2xl font-semibold text-[#374151]">
              Editar Cliente
            </DialogTitle>
            <DialogDescription className="text-base text-[#6b7280]">
              Actualizar información del cliente
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            id="edit-client-form"
            config={{
              sections: clientFormSections,
              columns: 2,
              gap: 'medium',
              variant: 'outlined',
              density: 'comfortable',
              defaultValues: selectedClient ? {
                name: selectedClient.name,
                taxId: selectedClient.taxId,
                email: selectedClient.email || '',
                phone: selectedClient.phone || '',
                contactPerson: selectedClient.contactPerson || '',
                notes: selectedClient.notes || '',
              } : {},
            }}
            onSubmit={handleEditSubmit}
            loading={formLoading}
            showSubmit={false}
            showCancel={false}
            footerClassName="flex justify-end gap-3 pt-4 border-t border-[#e5e7eb]"
            extraButtons={
              <>
                <ActionButton variant="ghost" onClick={handleCloseModals} disabled={formLoading}>
                  Cancelar
                </ActionButton>
                <ActionButton
                  type="submit"
                  form="edit-client-form"
                  variant="save"
                  disabled={formLoading}
                  startIcon={formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                >
                  {formLoading ? 'Guardando...' : 'Guardar Cambios'}
                </ActionButton>
              </>
            }
          />
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <BulkUploadDialog
        open={showBulkUploadDialog}
        onOpenChange={setShowBulkUploadDialog}
        title="Carga Masiva de Clientes"
        description="Importa múltiples clientes desde un archivo Excel. Verifica que el RFC no esté duplicado."
        archivo={archivo}
        uploadResponse={uploadResponse}
        validacionResultado={validacionResultado}
        importacionResultado={importacionResultado}
        loading={uploadLoading}
        onFileChange={handleFileChange}
        onUpload={subirArchivo}
        onValidate={() => {}} // No needed for clients - validation happens on upload
        onImport={importarDatos}
        onReset={handleResetBulkUpload}
      />
    </div>
  )
}
