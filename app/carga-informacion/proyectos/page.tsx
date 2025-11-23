"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, Download, Plus, Search, FileText, Calendar, Loader2, Eye, Edit, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { projectsUploadService, type CrearProyectoData } from "@/services/projects-upload.service"

export default function ProyectosPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estados básicos
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(false)
  
  // Estados para proyectos
  const [proyectos, setProyectos] = useState<any[]>([])
  const [loadingProyectos, setLoadingProyectos] = useState(false)
  
  // Estados para usuarios
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  
  // Estados para carga masiva
  const [archivo, setArchivo] = useState<File | null>(null)
  const [uploadResponse, setUploadResponse] = useState<any>(null)
  const [validacionResultado, setValidacionResultado] = useState<any>(null)
  const [importacionResultado, setImportacionResultado] = useState<any>(null)
  
  // Estados para formulario manual
  const [openDialog, setOpenDialog] = useState(false)
  const [nuevoProyecto, setNuevoProyecto] = useState({
    codigoProyecto: '',
    nombreProyecto: '',
    clienteNombre: '',
    clienteRuc: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFinEstimada: '',
    presupuestoTotal: '',
    presupuestoMateriales: '',
    presupuestoManoObra: '',
    presupuestoOtros: '',
    responsableEmail: '',
    areaId: '',
    estado: 'planificacion',
    prioridad: 'media',
    descripcion: '',
    observaciones: ''
  })

  // Estados para Ver y Editar
  const [verModalOpen, setVerModalOpen] = useState(false)
  const [editarModalOpen, setEditarModalOpen] = useState(false)
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<any>(null)
  const [proyectoParaEditar, setProyectoParaEditar] = useState<any>(null)

  // Cargar proyectos desde la BD
  const cargarProyectos = useCallback(async () => {
    try {
      setLoadingProyectos(true)
      const response = await projectsUploadService.obtenerListadoProyectos({ limit: 50 })
      setProyectos(response.data || [])
    } catch (error) {
      console.error('Error al cargar proyectos:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los proyectos"
      })
    } finally {
      setLoadingProyectos(false)
    }
  }, [toast])

  // Cargar usuarios
  const cargarUsuarios = useCallback(async () => {
    try {
      setLoadingUsuarios(true)
      const response = await fetch('http://localhost:3001/api/v1/users/simple/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUsuarios(data)
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    } finally {
      setLoadingUsuarios(false)
    }
  }, [])

  useEffect(() => {
    cargarProyectos()
    cargarUsuarios()
  }, [cargarProyectos, cargarUsuarios])

  // Función para crear proyecto manual
  const crearNuevoProyecto = async () => {
    try {
      setLoading(true)
      
      // Validación básica
      if (!nuevoProyecto.nombreProyecto || !nuevoProyecto.clienteNombre || !nuevoProyecto.presupuestoTotal) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Por favor completa todos los campos requeridos"
        })
        return
      }

      const data: any = {
        codigoProyecto: nuevoProyecto.codigoProyecto,
        nombreProyecto: nuevoProyecto.nombreProyecto,
        clienteNombre: nuevoProyecto.clienteNombre,
        fechaInicio: nuevoProyecto.fechaInicio,
        presupuestoTotal: parseFloat(nuevoProyecto.presupuestoTotal),
        responsableEmail: nuevoProyecto.responsableEmail,
        estado: nuevoProyecto.estado,
        prioridad: nuevoProyecto.prioridad,
      }

      // Solo agregar campos opcionales si tienen valor
      if (nuevoProyecto.clienteRuc) data.clienteRuc = nuevoProyecto.clienteRuc
      if (nuevoProyecto.fechaFinEstimada) data.fechaFinEstimada = nuevoProyecto.fechaFinEstimada
      if (nuevoProyecto.presupuestoMateriales) data.presupuestoMateriales = parseFloat(nuevoProyecto.presupuestoMateriales)
      if (nuevoProyecto.presupuestoManoObra) data.presupuestoManoObra = parseFloat(nuevoProyecto.presupuestoManoObra)
      if (nuevoProyecto.presupuestoOtros) data.presupuestoOtros = parseFloat(nuevoProyecto.presupuestoOtros)
      if (nuevoProyecto.areaId) data.areaId = nuevoProyecto.areaId
      if (nuevoProyecto.descripcion) data.descripcion = nuevoProyecto.descripcion
      if (nuevoProyecto.observaciones) data.observaciones = nuevoProyecto.observaciones

      await projectsUploadService.crearProyecto(data)
      
      toast({
        title: "Proyecto creado",
        description: "El proyecto se ha creado exitosamente"
      })

      // Resetear formulario
      setNuevoProyecto({
        codigoProyecto: '',
        nombreProyecto: '',
        clienteNombre: '',
        clienteRuc: '',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFinEstimada: '',
        presupuestoTotal: '',
        presupuestoMateriales: '',
        presupuestoManoObra: '',
        presupuestoOtros: '',
        responsableEmail: '',
        areaId: '',
        estado: 'planificacion',
        prioridad: 'media',
        descripcion: '',
        observaciones: ''
      })
      setOpenDialog(false)
      cargarProyectos()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al crear proyecto"
      })
    } finally {
      setLoading(false)
    }
  }

  // Funciones para carga masiva
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
      setLoading(true)
      const response = await projectsUploadService.uploadFile(archivo)
      setUploadResponse(response)
      
      toast({
        title: "Archivo subido",
        description: `${response.registrosDetectados} registros detectados`
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al subir archivo"
      })
    } finally {
      setLoading(false)
    }
  }

  const validarDatos = async () => {
    if (!uploadResponse) return

    try {
      setLoading(true)
      const resultado = await projectsUploadService.validarDatos(uploadResponse.uploadId)
      setValidacionResultado(resultado)
      
      toast({
        title: "Validación completada",
        description: `${resultado.registrosValidos} registros válidos, ${resultado.registrosInvalidos} con errores`
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al validar datos"
      })
    } finally {
      setLoading(false)
    }
  }

  const importarDatos = async () => {
    if (!uploadResponse) return

    try {
      setLoading(true)
      const resultado = await projectsUploadService.importarDatos(uploadResponse.uploadId)
      setImportacionResultado(resultado)
      
      toast({
        title: "Importación exitosa",
        description: `${resultado.registrosImportados} proyectos importados`
      })

      cargarProyectos()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al importar datos"
      })
    } finally {
      setLoading(false)
    }
  }

  const descargarPlantilla = async () => {
    try {
      setDownloadingTemplate(true)
      const blob = await projectsUploadService.descargarPlantilla()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'plantilla_proyectos.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Plantilla descargada",
        description: "La plantilla se ha descargado exitosamente"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo descargar la plantilla"
      })
    } finally {
      setDownloadingTemplate(false)
    }
  }

  // Función para ver detalle de proyecto
  const verDetalleProyecto = async (id: string) => {
    try {
      setLoading(true)
      const proyecto = await projectsUploadService.obtenerProyectoPorId(id)
      setProyectoSeleccionado(proyecto)
      setVerModalOpen(true)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo cargar el proyecto"
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para abrir modal de edición
  const abrirEditarProyecto = async (id: string) => {
    try {
      setLoading(true)
      const proyecto = await projectsUploadService.obtenerProyectoPorId(id)
      
      // Mapear datos del backend al formato del formulario
      setProyectoParaEditar({
        id: proyecto.id,
        codigoProyecto: proyecto.codigoProyecto || '',
        nombreProyecto: proyecto.nombreProyecto || '',
        clienteNombre: proyecto.cliente?.name || '',
        clienteRuc: proyecto.cliente?.taxId || '',
        fechaInicio: proyecto.fechaInicio ? new Date(proyecto.fechaInicio).toISOString().split('T')[0] : '',
        fechaFinEstimada: proyecto.fechaFinEstimada ? new Date(proyecto.fechaFinEstimada).toISOString().split('T')[0] : '',
        presupuestoTotal: proyecto.presupuestoTotal?.toString() || '',
        presupuestoMateriales: proyecto.presupuestoMateriales?.toString() || '',
        presupuestoManoObra: proyecto.presupuestoManoObra?.toString() || '',
        presupuestoOtros: proyecto.presupuestoOtros?.toString() || '',
        responsableEmail: proyecto.responsable?.email || '',
        areaId: proyecto.areaId || '',
        estado: proyecto.estado || 'planificacion',
        prioridad: proyecto.prioridad || 'media',
        descripcion: proyecto.descripcion || '',
        observaciones: proyecto.observaciones || ''
      })
      
      setEditarModalOpen(true)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo cargar el proyecto"
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para guardar cambios del proyecto
  const guardarCambiosProyecto = async () => {
    if (!proyectoParaEditar) return

    try {
      setLoading(true)

      const data: any = {
        codigoProyecto: proyectoParaEditar.codigoProyecto,
        nombreProyecto: proyectoParaEditar.nombreProyecto,
        clienteNombre: proyectoParaEditar.clienteNombre,
        fechaInicio: proyectoParaEditar.fechaInicio,
        presupuestoTotal: parseFloat(proyectoParaEditar.presupuestoTotal),
        responsableEmail: proyectoParaEditar.responsableEmail,
        estado: proyectoParaEditar.estado,
        prioridad: proyectoParaEditar.prioridad,
      }

      // Solo agregar campos opcionales si tienen valor
      if (proyectoParaEditar.clienteRuc) data.clienteRuc = proyectoParaEditar.clienteRuc
      if (proyectoParaEditar.fechaFinEstimada) data.fechaFinEstimada = proyectoParaEditar.fechaFinEstimada
      if (proyectoParaEditar.presupuestoMateriales) data.presupuestoMateriales = parseFloat(proyectoParaEditar.presupuestoMateriales)
      if (proyectoParaEditar.presupuestoManoObra) data.presupuestoManoObra = parseFloat(proyectoParaEditar.presupuestoManoObra)
      if (proyectoParaEditar.presupuestoOtros) data.presupuestoOtros = parseFloat(proyectoParaEditar.presupuestoOtros)
      if (proyectoParaEditar.areaId) data.areaId = proyectoParaEditar.areaId
      if (proyectoParaEditar.descripcion) data.descripcion = proyectoParaEditar.descripcion
      if (proyectoParaEditar.observaciones) data.observaciones = proyectoParaEditar.observaciones

      await projectsUploadService.actualizarProyecto(proyectoParaEditar.id, data)
      
      toast({
        title: "Proyecto actualizado",
        description: "Los cambios se han guardado exitosamente"
      })

      setEditarModalOpen(false)
      setProyectoParaEditar(null)
      cargarProyectos()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al actualizar proyecto"
      })
    } finally {
      setLoading(false)
    }
  }

  // Mapear proyectos del backend al formato de la UI
  const proyectosFormateados = proyectos.map((p: any) => ({
    id: p.id,
    nombre: p.nombreProyecto,
    cliente: p.cliente?.name || 'Cliente',
    valorContrato: Number(p.presupuestoTotal) || 0,
    fechaInicio: new Date(p.fechaInicio).toLocaleDateString('es-MX'),
    fechaFin: new Date(p.fechaFinEstimada).toLocaleDateString('es-MX'),
    estado: p.estado === 'en_progreso' ? 'En Progreso' : 
            p.estado === 'planificacion' ? 'Planificación' : 
            p.estado === 'completado' ? 'Completado' : 
            p.estado === 'pausado' ? 'Pausado' : 'Otro',
    avance: Math.random() * 100, // TODO: calcular avance real
    responsable: p.responsable ? `${p.responsable.firstName} ${p.responsable.lastName}` : 'N/A',
    categoria: p.area?.name || 'General',
  }))

  const filteredProyectos = proyectosFormateados.filter((proyecto) => {
    const matchesSearch =
      proyecto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || proyecto.estado.toLowerCase().replace(" ", "") === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalValor = filteredProyectos.reduce((sum, proyecto) => sum + proyecto.valorContrato, 0)

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "En Progreso":
        return <Badge className="bg-blue-50 text-blue-700">En Progreso</Badge>
      case "Planificación":
        return <Badge className="bg-yellow-50 text-yellow-700">Planificación</Badge>
      case "Completado":
        return <Badge className="bg-green-50 text-green-700">Completado</Badge>
      case "Pausado":
        return <Badge className="bg-red-50 text-red-700">Pausado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carga de Proyectos</h1>
          <p className="text-muted-foreground">Gestión de proyectos y contratos</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={descargarPlantilla} disabled={downloadingTemplate}>
            {downloadingTemplate ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Descargando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Plantilla Excel
              </>
            )}
          </Button>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proyecto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Proyecto</DialogTitle>
                <DialogDescription>Crea un nuevo proyecto en el sistema</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Código del Proyecto *</Label>
                    <Input 
                      placeholder="PROJ-2024-001" 
                      value={nuevoProyecto.codigoProyecto}
                      onChange={(e) => setNuevoProyecto({...nuevoProyecto, codigoProyecto: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Nombre del Proyecto *</Label>
                    <Input 
                      placeholder="Nombre del proyecto" 
                      value={nuevoProyecto.nombreProyecto}
                      onChange={(e) => setNuevoProyecto({...nuevoProyecto, nombreProyecto: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cliente *</Label>
                    <Input 
                      placeholder="Nombre del cliente" 
                      value={nuevoProyecto.clienteNombre}
                      onChange={(e) => setNuevoProyecto({...nuevoProyecto, clienteNombre: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>RUC del Cliente</Label>
                    <Input 
                      placeholder="20123456789" 
                      value={nuevoProyecto.clienteRuc}
                      onChange={(e) => setNuevoProyecto({...nuevoProyecto, clienteRuc: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha Inicio *</Label>
                    <Input 
                      type="date" 
                      value={nuevoProyecto.fechaInicio}
                      onChange={(e) => setNuevoProyecto({...nuevoProyecto, fechaInicio: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Fecha Fin Estimada *</Label>
                    <Input 
                      type="date" 
                      value={nuevoProyecto.fechaFinEstimada}
                      onChange={(e) => setNuevoProyecto({...nuevoProyecto, fechaFinEstimada: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Presupuesto Total *</Label>
                    <Input 
                      type="number" 
                      placeholder="50000.00"
                      value={nuevoProyecto.presupuestoTotal}
                      onChange={(e) => setNuevoProyecto({...nuevoProyecto, presupuestoTotal: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Presupuesto Materiales *</Label>
                    <Input 
                      type="number" 
                      placeholder="20000.00"
                      value={nuevoProyecto.presupuestoMateriales}
                      onChange={(e) => setNuevoProyecto({...nuevoProyecto, presupuestoMateriales: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Presupuesto Mano de Obra *</Label>
                    <Input 
                      type="number" 
                      placeholder="25000.00"
                      value={nuevoProyecto.presupuestoManoObra}
                      onChange={(e) => setNuevoProyecto({...nuevoProyecto, presupuestoManoObra: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Presupuesto Otros *</Label>
                    <Input 
                      type="number" 
                      placeholder="5000.00"
                      value={nuevoProyecto.presupuestoOtros}
                      onChange={(e) => setNuevoProyecto({...nuevoProyecto, presupuestoOtros: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label>Responsable del Proyecto *</Label>
                  <Select 
                    value={nuevoProyecto.responsableEmail} 
                    onValueChange={(value) => setNuevoProyecto({...nuevoProyecto, responsableEmail: value})}
                    disabled={loadingUsuarios}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingUsuarios ? "Cargando usuarios..." : "Selecciona un responsable"} />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.length === 0 ? (
                        <SelectItem value="sin-usuarios" disabled>
                          No hay usuarios disponibles
                        </SelectItem>
                      ) : (
                        usuarios.map((usuario) => (
                          <SelectItem key={usuario.id} value={usuario.email}>
                            {usuario.fullName} ({usuario.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Estado *</Label>
                  <Select value={nuevoProyecto.estado} onValueChange={(value) => setNuevoProyecto({...nuevoProyecto, estado: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planificacion">Planificación</SelectItem>
                      <SelectItem value="en_progreso">En Progreso</SelectItem>
                      <SelectItem value="pausado">Pausado</SelectItem>
                      <SelectItem value="completado">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Textarea 
                  placeholder="Descripción del proyecto..."
                  value={nuevoProyecto.descripcion}
                  onChange={(e) => setNuevoProyecto({...nuevoProyecto, descripcion: e.target.value})}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)} disabled={loading}>
                  Cancelar
                </Button>
                <Button onClick={crearNuevoProyecto} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Proyecto"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValor.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredProyectos.length} proyectos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {proyectosFormateados.filter((p) => p.estado === "En Progreso").length}
            </div>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {proyectosFormateados.filter((p) => p.estado === "Completado").length}
            </div>
            <p className="text-xs text-muted-foreground">Finalizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avance Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {proyectosFormateados.length > 0 
                ? Math.round(proyectosFormateados.reduce((sum, p) => sum + p.avance, 0) / proyectosFormateados.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">General</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Carga Masiva de Proyectos</CardTitle>
          <CardDescription>Importa múltiples proyectos desde archivo Excel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <FileText className="h-4 w-4 mr-2" />
                Seleccionar archivo Excel
              </Button>
              {archivo && (
                <p className="mt-2 text-sm font-medium">
                  Archivo seleccionado: {archivo.name}
                </p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                Arrastra y suelta tu archivo aquí, o haz clic para seleccionar
              </p>
            </div>
          </div>
          
          {uploadResponse && !validacionResultado && (
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm">Archivo subido: {uploadResponse.registrosDetectados} registros detectados</p>
              <Button onClick={validarDatos} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Validar Datos"}
              </Button>
            </div>
          )}

          {validacionResultado && !importacionResultado && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  ✓ {validacionResultado.registrosValidos} registros válidos
                </p>
                {validacionResultado.registrosInvalidos > 0 && (
                  <p className="text-sm text-red-600">
                    ✗ {validacionResultado.registrosInvalidos} registros con errores
                  </p>
                )}
              </div>

              {/* Mostrar errores detallados */}
              {validacionResultado.errores && validacionResultado.errores.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-800 text-base">Errores de Validación</CardTitle>
                    <CardDescription className="text-red-600">
                      Corrige los siguientes errores antes de importar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {validacionResultado.errores.map((error: any, index: number) => (
                        <div key={index} className="p-3 bg-white border border-red-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-red-800">
                                Fila {error.fila}: {error.campo}
                              </p>
                              <p className="text-sm text-red-600 mt-1">
                                {error.error}
                              </p>
                              {error.valor && (
                                <p className="text-xs text-gray-600 mt-1">
                                  Valor: {error.valor}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mostrar advertencias si existen */}
              {validacionResultado.advertencias && validacionResultado.advertencias.length > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-yellow-800 text-base">Advertencias</CardTitle>
                    <CardDescription className="text-yellow-600">
                      Información importante sobre el proceso
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {validacionResultado.advertencias.map((advertencia: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-white border border-yellow-200 rounded">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-yellow-800">{advertencia}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {validacionResultado.puedeImportar ? (
                <Button onClick={importarDatos} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    "Confirmar e Importar"
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    setArchivo(null)
                    setUploadResponse(null)
                    setValidacionResultado(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }} 
                  variant="outline" 
                  className="w-full"
                >
                  Corregir y Cargar Nuevo Archivo
                </Button>
              )}
            </div>
          )}

          {importacionResultado && (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                ✓ Importación completada: {importacionResultado.registrosImportados} proyectos importados
              </p>
              <Button onClick={() => {
                setArchivo(null)
                setUploadResponse(null)
                setValidacionResultado(null)
                setImportacionResultado(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }} className="mt-2" variant="outline">
                Nueva Carga
              </Button>
            </div>
          )}

          {!uploadResponse && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Formatos soportados: .xlsx, .xls, .csv</p>
              <Button onClick={subirArchivo} disabled={!archivo || loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subir Archivo"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Proyectos</CardTitle>
          <CardDescription>Proyectos registrados y su estado actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, cliente o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="enprogreso">En Progreso</SelectItem>
                <SelectItem value="planificacion">Planificación</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Avance</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProyectos.map((proyecto) => (
                  <TableRow key={proyecto.id}>
                    <TableCell className="font-medium">{proyecto.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{proyecto.nombre}</div>
                        <div className="text-sm text-muted-foreground">{proyecto.responsable}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{proyecto.cliente}</div>
                        <div className="text-sm text-muted-foreground">{proyecto.categoria}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${proyecto.valorContrato.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{proyecto.fechaInicio}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Fin: {proyecto.fechaFin}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${proyecto.avance}%` }}></div>
                        </div>
                        <span className="text-sm">{proyecto.avance}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(proyecto.estado)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => verDetalleProyecto(proyecto.id)}
                          disabled={loading}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => abrirEditarProyecto(proyecto.id)}
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Ver Detalle */}
      <Dialog open={verModalOpen} onOpenChange={setVerModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Proyecto</DialogTitle>
          </DialogHeader>
          {proyectoSeleccionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Código</Label>
                  <p className="text-sm font-medium">{proyectoSeleccionado.codigoProyecto}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                  <p className="text-sm font-medium">{proyectoSeleccionado.estado}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nombre del Proyecto</Label>
                <p className="text-sm font-medium">{proyectoSeleccionado.nombreProyecto}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
                  <p className="text-sm">{proyectoSeleccionado.cliente?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">RUC Cliente</Label>
                  <p className="text-sm">{proyectoSeleccionado.cliente?.taxId || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha Inicio</Label>
                  <p className="text-sm">{new Date(proyectoSeleccionado.fechaInicio).toLocaleDateString('es-MX')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha Fin Estimada</Label>
                  <p className="text-sm">{proyectoSeleccionado.fechaFinEstimada ? new Date(proyectoSeleccionado.fechaFinEstimada).toLocaleDateString('es-MX') : 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Presupuesto Total</Label>
                  <p className="text-sm font-medium">${Number(proyectoSeleccionado.presupuestoTotal || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Prioridad</Label>
                  <p className="text-sm">{proyectoSeleccionado.prioridad}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Materiales</Label>
                  <p className="text-sm">${Number(proyectoSeleccionado.presupuestoMateriales || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Mano de Obra</Label>
                  <p className="text-sm">${Number(proyectoSeleccionado.presupuestoManoObra || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Otros</Label>
                  <p className="text-sm">${Number(proyectoSeleccionado.presupuestoOtros || 0).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Responsable</Label>
                <p className="text-sm">{proyectoSeleccionado.responsable ? `${proyectoSeleccionado.responsable.firstName} ${proyectoSeleccionado.responsable.lastName} (${proyectoSeleccionado.responsable.email})` : 'N/A'}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Área</Label>
                <p className="text-sm">{proyectoSeleccionado.area?.name || 'N/A'}</p>
              </div>

              {proyectoSeleccionado.descripcion && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
                  <p className="text-sm">{proyectoSeleccionado.descripcion}</p>
                </div>
              )}

              {proyectoSeleccionado.observaciones && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Observaciones</Label>
                  <p className="text-sm">{proyectoSeleccionado.observaciones}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <Label className="text-xs">Origen de Carga</Label>
                  <p>{proyectoSeleccionado.origenCarga}</p>
                </div>
                <div>
                  <Label className="text-xs">Creado</Label>
                  <p>{new Date(proyectoSeleccionado.createdAt).toLocaleString('es-MX')}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={editarModalOpen} onOpenChange={setEditarModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Proyecto</DialogTitle>
          </DialogHeader>
          {proyectoParaEditar && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Código del Proyecto *</Label>
                  <Input 
                    value={proyectoParaEditar.codigoProyecto}
                    onChange={(e) => setProyectoParaEditar({...proyectoParaEditar, codigoProyecto: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Nombre del Proyecto *</Label>
                  <Input 
                    value={proyectoParaEditar.nombreProyecto}
                    onChange={(e) => setProyectoParaEditar({...proyectoParaEditar, nombreProyecto: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cliente *</Label>
                  <Input 
                    value={proyectoParaEditar.clienteNombre}
                    onChange={(e) => setProyectoParaEditar({...proyectoParaEditar, clienteNombre: e.target.value})}
                  />
                </div>
                <div>
                  <Label>RUC del Cliente</Label>
                  <Input 
                    value={proyectoParaEditar.clienteRuc}
                    onChange={(e) => setProyectoParaEditar({...proyectoParaEditar, clienteRuc: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha Inicio *</Label>
                  <Input 
                    type="date"
                    value={proyectoParaEditar.fechaInicio}
                    onChange={(e) => setProyectoParaEditar({...proyectoParaEditar, fechaInicio: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Fecha Fin Estimada</Label>
                  <Input 
                    type="date"
                    value={proyectoParaEditar.fechaFinEstimada}
                    onChange={(e) => setProyectoParaEditar({...proyectoParaEditar, fechaFinEstimada: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Presupuesto Total *</Label>
                  <Input 
                    type="number"
                    value={proyectoParaEditar.presupuestoTotal}
                    onChange={(e) => setProyectoParaEditar({...proyectoParaEditar, presupuestoTotal: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Presupuesto Materiales</Label>
                  <Input 
                    type="number"
                    value={proyectoParaEditar.presupuestoMateriales}
                    onChange={(e) => setProyectoParaEditar({...proyectoParaEditar, presupuestoMateriales: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Presupuesto Mano de Obra</Label>
                  <Input 
                    type="number"
                    value={proyectoParaEditar.presupuestoManoObra}
                    onChange={(e) => setProyectoParaEditar({...proyectoParaEditar, presupuestoManoObra: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Presupuesto Otros</Label>
                  <Input 
                    type="number"
                    value={proyectoParaEditar.presupuestoOtros}
                    onChange={(e) => setProyectoParaEditar({...proyectoParaEditar, presupuestoOtros: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label>Responsable del Proyecto *</Label>
                <Select 
                  value={proyectoParaEditar.responsableEmail} 
                  onValueChange={(value) => setProyectoParaEditar({...proyectoParaEditar, responsableEmail: value})}
                  disabled={loadingUsuarios}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingUsuarios ? "Cargando usuarios..." : "Selecciona un responsable"} />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.length === 0 ? (
                      <SelectItem value="sin-usuarios" disabled>
                        No hay usuarios disponibles
                      </SelectItem>
                    ) : (
                      usuarios.map((usuario) => (
                        <SelectItem key={usuario.id} value={usuario.email}>
                          {usuario.fullName} ({usuario.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Estado *</Label>
                <Select 
                  value={proyectoParaEditar.estado} 
                  onValueChange={(value) => setProyectoParaEditar({...proyectoParaEditar, estado: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planificacion">Planificación</SelectItem>
                    <SelectItem value="en_progreso">En Progreso</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prioridad *</Label>
                  <Select 
                    value={proyectoParaEditar.prioridad} 
                    onValueChange={(value) => setProyectoParaEditar({...proyectoParaEditar, prioridad: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="critica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Descripción</Label>
                <Textarea 
                  value={proyectoParaEditar.descripcion}
                  onChange={(e) => setProyectoParaEditar({...proyectoParaEditar, descripcion: e.target.value})}
                />
              </div>

              <div>
                <Label>Observaciones</Label>
                <Textarea 
                  value={proyectoParaEditar.observaciones}
                  onChange={(e) => setProyectoParaEditar({...proyectoParaEditar, observaciones: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditarModalOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={guardarCambiosProyecto}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
