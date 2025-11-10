"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
} from "@/components/ui/dialog"
import { Upload, Download, Plus, Search, FileText, Loader2, Eye, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import anticiposUploadService from "@/services/anticipos-upload.service"

export default function AnticiposPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estados para listado
  const [anticipos, setAnticipos] = useState<any[]>([])
  const [loadingAnticipos, setLoadingAnticipos] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  
  // Estados para formulario manual
  const [openDialog, setOpenDialog] = useState(false)
  const [nuevoAnticipo, setNuevoAnticipo] = useState({
    fechaAnticipo: new Date().toISOString().split('T')[0],
    numeroOperacion: '',
    proveedorNombre: '',
    proveedorRuc: '',
    montoAnticipo: '',
    metodoPago: 'transferencia',
    numeroCuentaDestino: '',
    bancoDestino: '',
    proyectoId: '',
    concepto: '',
    fechaAplicacionEstimada: '',
    observaciones: ''
  })
  
  // Estados para Ver y Editar
  const [verModalOpen, setVerModalOpen] = useState(false)
  const [editarModalOpen, setEditarModalOpen] = useState(false)
  const [anticipoSeleccionado, setAnticipoSeleccionado] = useState<any>(null)
  const [anticipoParaEditar, setAnticipoParaEditar] = useState<any>(null)
  
  // Estados para carga masiva
  const [archivo, setArchivo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadResponse, setUploadResponse] = useState<any>(null)
  const [validacionResultado, setValidacionResultado] = useState<any>(null)
  const [importacionResultado, setImportacionResultado] = useState<any>(null)

  // Cargar anticipos desde la BD
  const cargarAnticipos = useCallback(async () => {
    try {
      setLoadingAnticipos(true)
      const response = await anticiposUploadService.obtenerListadoAnticipos({ limit: 50 })
      setAnticipos(response.data || [])
    } catch (error) {
      console.error('Error al cargar anticipos:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los anticipos"
      })
    } finally {
      setLoadingAnticipos(false)
    }
  }, [toast])

  useEffect(() => {
    cargarAnticipos()
  }, [cargarAnticipos])

  // Función para crear anticipo manual
  const crearAnticipoManual = async () => {
    try {
      setLoading(true)

      const data: any = {
        fechaAnticipo: nuevoAnticipo.fechaAnticipo,
        numeroOperacion: nuevoAnticipo.numeroOperacion,
        proveedorNombre: nuevoAnticipo.proveedorNombre,
        proveedorRuc: nuevoAnticipo.proveedorRuc,
        montoAnticipo: parseFloat(nuevoAnticipo.montoAnticipo),
        metodoPago: nuevoAnticipo.metodoPago,
        numeroCuentaDestino: nuevoAnticipo.numeroCuentaDestino,
        bancoDestino: nuevoAnticipo.bancoDestino,
        concepto: nuevoAnticipo.concepto,
      }

      // Solo agregar campos opcionales si tienen valor
      if (nuevoAnticipo.proyectoId) data.proyectoId = nuevoAnticipo.proyectoId
      if (nuevoAnticipo.fechaAplicacionEstimada) data.fechaAplicacionEstimada = nuevoAnticipo.fechaAplicacionEstimada
      if (nuevoAnticipo.observaciones) data.observaciones = nuevoAnticipo.observaciones

      await anticiposUploadService.crearAnticipoManual(data)
      
      toast({
        title: "Anticipo creado",
        description: "El anticipo se ha registrado exitosamente"
      })

      setOpenDialog(false)
      setNuevoAnticipo({
        fechaAnticipo: new Date().toISOString().split('T')[0],
        numeroOperacion: '',
        proveedorNombre: '',
        proveedorRuc: '',
        montoAnticipo: '',
        metodoPago: 'transferencia',
        numeroCuentaDestino: '',
        bancoDestino: '',
        proyectoId: '',
        concepto: '',
        fechaAplicacionEstimada: '',
        observaciones: ''
      })
      
      cargarAnticipos()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Error al crear anticipo"
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para ver detalle de anticipo
  const verDetalleAnticipo = async (id: string) => {
    try {
      setLoading(true)
      const anticipo = await anticiposUploadService.obtenerAnticipoPorId(id)
      setAnticipoSeleccionado(anticipo)
      setVerModalOpen(true)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo cargar el anticipo"
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para abrir modal de edición
  const abrirEditarAnticipo = async (id: string) => {
    try {
      setLoading(true)
      const anticipo = await anticiposUploadService.obtenerAnticipoPorId(id)
      
      setAnticipoParaEditar({
        id: anticipo.id,
        fechaAnticipo: anticipo.fechaAnticipo ? new Date(anticipo.fechaAnticipo).toISOString().split('T')[0] : '',
        numeroOperacion: anticipo.numeroOperacion || '',
        proveedorNombre: anticipo.proveedor?.name || '',
        proveedorRuc: anticipo.proveedor?.taxId || '',
        montoAnticipo: anticipo.montoAnticipo?.toString() || '',
        metodoPago: anticipo.metodoPago || 'transferencia',
        numeroCuentaDestino: anticipo.numeroCuentaDestino || '',
        bancoDestino: anticipo.bancoDestino || '',
        proyectoId: anticipo.proyectoId || '',
        concepto: anticipo.concepto || '',
        fechaAplicacionEstimada: anticipo.fechaAplicacionEstimada ? new Date(anticipo.fechaAplicacionEstimada).toISOString().split('T')[0] : '',
        observaciones: anticipo.observaciones || ''
      })
      
      setEditarModalOpen(true)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo cargar el anticipo"
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para guardar cambios del anticipo
  const guardarCambiosAnticipo = async () => {
    if (!anticipoParaEditar) return

    try {
      setLoading(true)

      const data: any = {
        fechaAnticipo: anticipoParaEditar.fechaAnticipo,
        numeroOperacion: anticipoParaEditar.numeroOperacion,
        proveedorNombre: anticipoParaEditar.proveedorNombre,
        proveedorRuc: anticipoParaEditar.proveedorRuc,
        montoAnticipo: parseFloat(anticipoParaEditar.montoAnticipo),
        metodoPago: anticipoParaEditar.metodoPago,
        numeroCuentaDestino: anticipoParaEditar.numeroCuentaDestino,
        bancoDestino: anticipoParaEditar.bancoDestino,
        concepto: anticipoParaEditar.concepto,
      }

      if (anticipoParaEditar.proyectoId) data.proyectoId = anticipoParaEditar.proyectoId
      if (anticipoParaEditar.fechaAplicacionEstimada) data.fechaAplicacionEstimada = anticipoParaEditar.fechaAplicacionEstimada
      if (anticipoParaEditar.observaciones) data.observaciones = anticipoParaEditar.observaciones

      await anticiposUploadService.actualizarAnticipo(anticipoParaEditar.id, data)
      
      toast({
        title: "Anticipo actualizado",
        description: "Los cambios se han guardado exitosamente"
      })

      setEditarModalOpen(false)
      setAnticipoParaEditar(null)
      cargarAnticipos()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al actualizar anticipo"
      })
    } finally {
      setLoading(false)
    }
  }

  // Funciones para carga masiva
  const descargarPlantilla = async () => {
    try {
      const blob = await anticiposUploadService.descargarPlantilla()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'plantilla_anticipos.xlsx'
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
    }
  }

  const subirArchivo = async () => {
    if (!archivo) return

    try {
      setLoading(true)
      const response = await anticiposUploadService.subirArchivo(archivo)
      setUploadResponse(response)
      
      toast({
        title: "Archivo subido",
        description: "El archivo se ha procesado exitosamente"
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al subir archivo",
        description: error.response?.data?.message || "Error al procesar el archivo"
      })
    } finally {
      setLoading(false)
    }
  }

  const validarArchivo = async () => {
    if (!uploadResponse) return

    try {
      setLoading(true)
      const resultado = await anticiposUploadService.validarArchivo(uploadResponse.uploadId)
      setValidacionResultado(resultado)
      
      if (resultado.puedeImportar) {
        toast({
          title: "Validación exitosa",
          description: `${resultado.registrosValidos} registros válidos`
        })
      } else {
        toast({
          variant: "destructive",
          title: "Errores de validación",
          description: `${resultado.registrosInvalidos} registros con errores`
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error en validación",
        description: error.response?.data?.message || "Error al validar datos"
      })
    } finally {
      setLoading(false)
    }
  }

  const importarDatos = async () => {
    if (!uploadResponse) return

    try {
      setLoading(true)
      const resultado = await anticiposUploadService.importarAnticipos(uploadResponse.uploadId)
      setImportacionResultado(resultado)
      
      toast({
        title: "Importación completada",
        description: `${resultado.registrosImportados} anticipos importados`
      })
      
      cargarAnticipos()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error en importación",
        description: error.response?.data?.message || "Error al importar datos"
      })
    } finally {
      setLoading(false)
    }
  }

  // Mapear anticipos del backend al formato de la UI
  const anticiposFormateados = anticipos.map((a: any) => ({
    id: a.id,
    proveedor: a.proveedor?.name || 'Proveedor',
    proyecto: a.proyecto?.nombreProyecto || 'Sin proyecto',
    numeroOperacion: a.numeroOperacion,
    monto: Number(a.montoAnticipo) || 0,
    fecha: new Date(a.fechaAnticipo).toLocaleDateString('es-MX'),
    estado: a.estado === 'pendiente' ? 'Activo' : 
            a.estado === 'parcialmente_aplicado' ? 'Parcial' : 
            a.estado === 'aplicado' ? 'Liquidado' : 'Cancelado',
    saldoPendiente: Number(a.saldoPendiente) || 0,
    porcentajeUsado: a.montoAnticipo > 0 ? Math.round(((a.montoAnticipo - a.saldoPendiente) / a.montoAnticipo) * 100) : 0,
  }))

  const filteredAnticipos = anticiposFormateados.filter((anticipo) => {
    const matchesSearch =
      anticipo.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anticipo.proyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anticipo.numeroOperacion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || anticipo.estado.toLowerCase() === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalAnticipos = filteredAnticipos.reduce((sum, anticipo) => sum + anticipo.monto, 0)
  const totalPendiente = filteredAnticipos.reduce((sum, anticipo) => sum + anticipo.saldoPendiente, 0)

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Activo":
        return <Badge className="bg-green-50 text-green-700">Activo</Badge>
      case "Parcial":
        return <Badge className="bg-yellow-50 text-yellow-700">Parcial</Badge>
      case "Liquidado":
        return <Badge className="bg-blue-50 text-blue-700">Liquidado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carga de Anticipos</h1>
          <p className="text-muted-foreground">Gestión de anticipos de proveedores por proyecto</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={descargarPlantilla}>
            <Download className="h-4 w-4 mr-2" />
            Plantilla Excel
          </Button>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Anticipo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Anticipos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAnticipos.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredAnticipos.length} anticipos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Saldo Pendiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${totalPendiente.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Por liquidar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Anticipos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredAnticipos.filter((a) => a.estado === "Activo").length}
            </div>
            <p className="text-xs text-muted-foreground">En proceso</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Liquidados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filteredAnticipos.filter((a) => a.estado === "Liquidado").length}
            </div>
            <p className="text-xs text-muted-foreground">Completados</p>
          </CardContent>
        </Card>
      </div>

      {/* Formulario Nuevo Anticipo */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Anticipo</DialogTitle>
            <DialogDescription>Registra un anticipo recibido de proveedor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha Anticipo *</Label>
                <Input 
                  type="date"
                  value={nuevoAnticipo.fechaAnticipo}
                  onChange={(e) => setNuevoAnticipo({...nuevoAnticipo, fechaAnticipo: e.target.value})}
                />
              </div>
              <div>
                <Label>Número de Operación *</Label>
                <Input 
                  value={nuevoAnticipo.numeroOperacion}
                  onChange={(e) => setNuevoAnticipo({...nuevoAnticipo, numeroOperacion: e.target.value})}
                  placeholder="OP-2024-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Proveedor *</Label>
                <Input 
                  value={nuevoAnticipo.proveedorNombre}
                  onChange={(e) => setNuevoAnticipo({...nuevoAnticipo, proveedorNombre: e.target.value})}
                  placeholder="Nombre del proveedor"
                />
              </div>
              <div>
                <Label>RUC del Proveedor *</Label>
                <Input 
                  value={nuevoAnticipo.proveedorRuc}
                  onChange={(e) => setNuevoAnticipo({...nuevoAnticipo, proveedorRuc: e.target.value})}
                  placeholder="20123456789"
                  maxLength={11}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Monto del Anticipo *</Label>
                <Input 
                  type="number"
                  value={nuevoAnticipo.montoAnticipo}
                  onChange={(e) => setNuevoAnticipo({...nuevoAnticipo, montoAnticipo: e.target.value})}
                  placeholder="10000.00"
                />
              </div>
              <div>
                <Label>Método de Pago *</Label>
                <Select 
                  value={nuevoAnticipo.metodoPago} 
                  onValueChange={(value) => setNuevoAnticipo({...nuevoAnticipo, metodoPago: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Número de Cuenta Destino *</Label>
                <Input 
                  value={nuevoAnticipo.numeroCuentaDestino}
                  onChange={(e) => setNuevoAnticipo({...nuevoAnticipo, numeroCuentaDestino: e.target.value})}
                  placeholder="1234567890"
                />
              </div>
              <div>
                <Label>Banco Destino *</Label>
                <Input 
                  value={nuevoAnticipo.bancoDestino}
                  onChange={(e) => setNuevoAnticipo({...nuevoAnticipo, bancoDestino: e.target.value})}
                  placeholder="Banco Nacional"
                />
              </div>
            </div>

            <div>
              <Label>Concepto *</Label>
              <Input 
                value={nuevoAnticipo.concepto}
                onChange={(e) => setNuevoAnticipo({...nuevoAnticipo, concepto: e.target.value})}
                placeholder="Anticipo para servicios de consultoría"
              />
            </div>

            <div>
              <Label>Fecha Aplicación Estimada (opcional)</Label>
              <Input 
                type="date"
                value={nuevoAnticipo.fechaAplicacionEstimada}
                onChange={(e) => setNuevoAnticipo({...nuevoAnticipo, fechaAplicacionEstimada: e.target.value})}
              />
            </div>

            <div>
              <Label>Observaciones (opcional)</Label>
              <Textarea 
                value={nuevoAnticipo.observaciones}
                onChange={(e) => setNuevoAnticipo({...nuevoAnticipo, observaciones: e.target.value})}
                placeholder="Información adicional..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={crearAnticipoManual} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Registrar Anticipo"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ver Detalle */}
      <Dialog open={verModalOpen} onOpenChange={setVerModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Anticipo</DialogTitle>
          </DialogHeader>
          {anticipoSeleccionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Número de Operación</Label>
                  <div className="font-medium">{anticipoSeleccionado.numeroOperacion}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fecha</Label>
                  <div className="font-medium">
                    {new Date(anticipoSeleccionado.fechaAnticipo).toLocaleDateString('es-MX')}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Proveedor</Label>
                  <div className="font-medium">{anticipoSeleccionado.proveedor?.name}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">RUC</Label>
                  <div className="font-medium">{anticipoSeleccionado.proveedor?.taxId}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Monto</Label>
                  <div className="font-medium text-lg">${Number(anticipoSeleccionado.montoAnticipo).toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Saldo Pendiente</Label>
                  <div className="font-medium text-lg text-orange-600">
                    ${Number(anticipoSeleccionado.saldoPendiente).toLocaleString()}
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Concepto</Label>
                <div className="font-medium">{anticipoSeleccionado.concepto}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Método de Pago</Label>
                  <div className="font-medium capitalize">{anticipoSeleccionado.metodoPago}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <div className="font-medium">
                    <Badge className={
                      anticipoSeleccionado.estado === 'pendiente' ? 'bg-green-50 text-green-700' :
                      anticipoSeleccionado.estado === 'parcialmente_aplicado' ? 'bg-yellow-50 text-yellow-700' :
                      anticipoSeleccionado.estado === 'aplicado' ? 'bg-blue-50 text-blue-700' :
                      'bg-gray-50 text-gray-700'
                    }>
                      {anticipoSeleccionado.estado === 'pendiente' ? 'Activo' :
                       anticipoSeleccionado.estado === 'parcialmente_aplicado' ? 'Parcial' :
                       anticipoSeleccionado.estado === 'aplicado' ? 'Liquidado' : 'Cancelado'}
                    </Badge>
                  </div>
                </div>
              </div>
              {anticipoSeleccionado.observaciones && (
                <div>
                  <Label className="text-muted-foreground">Observaciones</Label>
                  <div className="font-medium">{anticipoSeleccionado.observaciones}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={editarModalOpen} onOpenChange={setEditarModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Anticipo</DialogTitle>
            <DialogDescription>Modifica los datos del anticipo</DialogDescription>
          </DialogHeader>
          {anticipoParaEditar && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha Anticipo *</Label>
                  <Input 
                    type="date"
                    value={anticipoParaEditar.fechaAnticipo}
                    onChange={(e) => setAnticipoParaEditar({...anticipoParaEditar, fechaAnticipo: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Número de Operación *</Label>
                  <Input 
                    value={anticipoParaEditar.numeroOperacion}
                    onChange={(e) => setAnticipoParaEditar({...anticipoParaEditar, numeroOperacion: e.target.value})}
                    placeholder="OP-2024-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Proveedor *</Label>
                  <Input 
                    value={anticipoParaEditar.proveedorNombre}
                    onChange={(e) => setAnticipoParaEditar({...anticipoParaEditar, proveedorNombre: e.target.value})}
                    placeholder="Nombre del proveedor"
                  />
                </div>
                <div>
                  <Label>RUC del Proveedor *</Label>
                  <Input 
                    value={anticipoParaEditar.proveedorRuc}
                    onChange={(e) => setAnticipoParaEditar({...anticipoParaEditar, proveedorRuc: e.target.value})}
                    placeholder="20123456789"
                    maxLength={11}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monto del Anticipo *</Label>
                  <Input 
                    type="number"
                    value={anticipoParaEditar.montoAnticipo}
                    onChange={(e) => setAnticipoParaEditar({...anticipoParaEditar, montoAnticipo: e.target.value})}
                    placeholder="10000.00"
                  />
                </div>
                <div>
                  <Label>Método de Pago *</Label>
                  <Select 
                    value={anticipoParaEditar.metodoPago} 
                    onValueChange={(value) => setAnticipoParaEditar({...anticipoParaEditar, metodoPago: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Número de Cuenta Destino *</Label>
                  <Input 
                    value={anticipoParaEditar.numeroCuentaDestino}
                    onChange={(e) => setAnticipoParaEditar({...anticipoParaEditar, numeroCuentaDestino: e.target.value})}
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <Label>Banco Destino *</Label>
                  <Input 
                    value={anticipoParaEditar.bancoDestino}
                    onChange={(e) => setAnticipoParaEditar({...anticipoParaEditar, bancoDestino: e.target.value})}
                    placeholder="Banco Nacional"
                  />
                </div>
              </div>

              <div>
                <Label>Concepto *</Label>
                <Input 
                  value={anticipoParaEditar.concepto}
                  onChange={(e) => setAnticipoParaEditar({...anticipoParaEditar, concepto: e.target.value})}
                  placeholder="Anticipo para servicios de consultoría"
                />
              </div>

              <div>
                <Label>Fecha Aplicación Estimada (opcional)</Label>
                <Input 
                  type="date"
                  value={anticipoParaEditar.fechaAplicacionEstimada}
                  onChange={(e) => setAnticipoParaEditar({...anticipoParaEditar, fechaAplicacionEstimada: e.target.value})}
                />
              </div>

              <div>
                <Label>Observaciones (opcional)</Label>
                <Textarea 
                  value={anticipoParaEditar.observaciones}
                  onChange={(e) => setAnticipoParaEditar({...anticipoParaEditar, observaciones: e.target.value})}
                  placeholder="Información adicional..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditarModalOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={guardarCambiosAnticipo} disabled={loading}>
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

      {/* Carga Masiva */}
      <Card>
        <CardHeader>
          <CardTitle>Carga Masiva de Anticipos</CardTitle>
          <CardDescription>Importa múltiples anticipos desde archivo Excel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setArchivo(file)
                  }
                }}
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <FileText className="h-4 w-4 mr-2" />
                Seleccionar archivo Excel
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">
                {archivo ? archivo.name : 'Arrastra y suelta tu archivo aquí, o haz clic para seleccionar'}
              </p>
            </div>
          </div>

          {archivo && !uploadResponse && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setArchivo(null)} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={subirArchivo} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  'Subir Archivo'
                )}
              </Button>
            </div>
          )}

          {uploadResponse && !validacionResultado && (
            <div className="flex justify-end">
              <Button onClick={validarArchivo} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validando...
                  </>
                ) : (
                  'Validar Datos'
                )}
              </Button>
            </div>
          )}

          {validacionResultado && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">
                      {validacionResultado.registrosValidos}
                    </div>
                    <p className="text-sm text-muted-foreground">Registros válidos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">
                      {validacionResultado.registrosInvalidos}
                    </div>
                    <p className="text-sm text-muted-foreground">Con errores</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {validacionResultado.registrosValidos + validacionResultado.registrosInvalidos}
                    </div>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </CardContent>
                </Card>
              </div>

              {validacionResultado.puedeImportar ? (
                <div className="flex justify-end">
                  <Button onClick={importarDatos} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      'Confirmar Importación'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-red-600 text-sm">
                  No se puede importar. Corrija los errores y vuelva a intentar.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Anticipos */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Anticipos</CardTitle>
          <CardDescription>Anticipos registrados y su estado actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por proveedor, proyecto o número..."
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
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="parcial">Parcial</SelectItem>
                <SelectItem value="liquidado">Liquidado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loadingAnticipos ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número Operación</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Saldo Pendiente</TableHead>
                    <TableHead>% Usado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnticipos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No se encontraron anticipos
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAnticipos.map((anticipo) => (
                      <TableRow key={anticipo.id}>
                        <TableCell className="font-medium">{anticipo.numeroOperacion}</TableCell>
                        <TableCell>
                          <div className="font-medium">{anticipo.proveedor}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{anticipo.proyecto}</div>
                        </TableCell>
                        <TableCell className="font-medium">${anticipo.monto.toLocaleString()}</TableCell>
                        <TableCell className="font-medium text-orange-600">
                          ${anticipo.saldoPendiente.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${anticipo.porcentajeUsado}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{anticipo.porcentajeUsado}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(anticipo.estado)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => verDetalleAnticipo(anticipo.id)}
                              disabled={loading}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => abrirEditarAnticipo(anticipo.id)}
                              disabled={loading}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
