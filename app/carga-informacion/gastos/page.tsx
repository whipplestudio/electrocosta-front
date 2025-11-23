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
import { Upload, Download, Plus, Search, FileText, Calendar, Loader2, CheckCircle, AlertCircle, Eye, Edit, DollarSign } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import {
  expensesUploadService,
  type UploadResponse,
  type ValidacionResultado,
  type ImportacionResultado,
  type HistorialCarga,
} from "@/services/expenses-upload.service"

export default function GastosPage() {
  const { toast } = useToast()
  
  // Estados de carga masiva
  const [archivo, setArchivo] = useState<File | null>(null)
  const [periodo, setPeriodo] = useState<string>("")
  const [sobrescribir, setSobrescribir] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null)
  const [validacionResultado, setValidacionResultado] = useState<ValidacionResultado | null>(null)
  const [importacionResultado, setImportacionResultado] = useState<ImportacionResultado | null>(null)
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estados de listado
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  
  // Estados para Ver y Editar
  const [gastoSeleccionado, setGastoSeleccionado] = useState<any>(null)
  const [modalVerOpen, setModalVerOpen] = useState(false)
  const [modalEditarOpen, setModalEditarOpen] = useState(false)
  const [guardandoEdicion, setGuardandoEdicion] = useState(false)
  
  // Estados de historial
  const [historial, setHistorial] = useState<HistorialCarga[]>([])
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  
  // Estados para formulario de nuevo gasto
  const [openDialog, setOpenDialog] = useState(false)
  const [generarCuentaPorPagar, setGenerarCuentaPorPagar] = useState(false)
  const [modoCuentaPorPagar, setModoCuentaPorPagar] = useState<'crear' | 'vincular'>('crear')
  const [cuentasPorPagar, setCuentasPorPagar] = useState<any[]>([])
  const [cuentaPorPagarSeleccionada, setCuentaPorPagarSeleccionada] = useState('')
  const [nuevoGasto, setNuevoGasto] = useState({
    fechaGasto: new Date().toISOString().split('T')[0],
    concepto: '',
    categoria: 'operativo',
    monto: '',
    proveedorRuc: '',
    proveedorNombre: '',
    formaPago: 'contado',
    areaCentroCosto: '',
    observaciones: '',
    // Campos para cuenta por pagar
    montoPorPagar: '',
    fechaVencimiento: '',
    numeroFactura: ''
  })

  // Cargar TODOS los gastos (manuales y masivos) desde la tabla gasto
  const cargarHistorial = useCallback(async () => {
    try {
      setLoadingHistorial(true)
      // Obtener TODOS los gastos de la BD (tanto manuales como masivos)
      const gastosResponse = await expensesUploadService.obtenerListadoGastos({ limit: 50 })
      
      // Formatear para que se muestren en la UI
      const gastosFormateados = gastosResponse.data.map((g: any) => ({
        id: g.id,
        nombreArchivo: `${g.concepto} - ${g.numeroComprobante}`,
        tipo: g.origenCarga === 'formulario_web' ? 'gasto_manual' : 'gasto_masivo',
        estado: 'importado',
        registrosDetectados: 1,
        registrosImportados: 1,
        usuarioId: '',
        createdAt: g.createdAt,
        updatedAt: g.createdAt,
        // Datos completos del gasto
        gastoData: g
      }))
      
      setHistorial(gastosFormateados)
    } catch (error) {
      console.error('Error al cargar gastos:', error)
    } finally {
      setLoadingHistorial(false)
    }
  }, [])

  useEffect(() => {
    cargarHistorial()
  }, [cargarHistorial])

  // Cargar cuentas por pagar disponibles
  const cargarCuentasPorPagar = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/accounts-payable', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        // Filtrar solo las pendientes con saldo
        const pendientes = (data.data || []).filter((cp: any) => 
          cp.status === 'pending' && parseFloat(cp.balance) > 0
        )
        setCuentasPorPagar(pendientes)
      }
    } catch (error) {
      console.error('Error al cargar cuentas por pagar:', error)
    }
  }

  // Cargar cuentas por pagar al abrir el dialog
  useEffect(() => {
    if (openDialog) {
      cargarCuentasPorPagar()
    }
  }, [openDialog])

  // Funciones de carga
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
      setCargando(true)
      const response = await expensesUploadService.uploadFile(archivo, { periodo, sobrescribir })
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
      setCargando(false)
    }
  }

  const validarDatos = async () => {
    if (!uploadResponse) return

    try {
      setCargando(true)
      const resultado = await expensesUploadService.validarDatos(uploadResponse.uploadId)
      setValidacionResultado(resultado)
      
      toast({
        title: resultado.puedeImportar ? "Validación exitosa" : "Validación con errores",
        description: `${resultado.registrosValidos} válidos, ${resultado.registrosInvalidos} inválidos`
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al validar datos"
      })
    } finally {
      setCargando(false)
    }
  }

  const importarDatos = async () => {
    if (!uploadResponse || !validacionResultado?.puedeImportar) return

    try {
      setCargando(true)
      const resultado = await expensesUploadService.importarDatos(uploadResponse.uploadId)
      setImportacionResultado(resultado)
      
      toast({
        title: "Importación completada",
        description: `${resultado.registrosImportados} gastos importados`
      })
      
      // Recargar historial
      cargarHistorial()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al importar datos"
      })
    } finally {
      setCargando(false)
    }
  }

  const descargarPlantilla = async () => {
    try {
      setDownloadingTemplate(true)
      const blob = await expensesUploadService.descargarPlantilla()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'plantilla_gastos.xlsx'
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

  const reiniciarProceso = () => {
    setArchivo(null)
    setUploadResponse(null)
    setValidacionResultado(null)
    setImportacionResultado(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Funciones para Ver y Editar gastos
  const handleVerGasto = async (id: string) => {
    console.log('🔍 Ver gasto con ID:', id)
    try {
      const gasto = await expensesUploadService.obtenerGastoPorId(id)
      console.log('✅ Gasto obtenido:', gasto)
      setGastoSeleccionado(gasto)
      setModalVerOpen(true)
    } catch (error: any) {
      console.error('❌ Error al obtener gasto:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo obtener el gasto"
      })
    }
  }

  const handleEditarGasto = async (id: string) => {
    console.log('✏️ Editar gasto con ID:', id)
    try {
      const gasto = await expensesUploadService.obtenerGastoPorId(id)
      console.log('✅ Gasto obtenido para editar:', gasto)
      setGastoSeleccionado(gasto)
      // Preparar datos para edición
      setNuevoGasto({
        fechaGasto: gasto.fechaGasto.split('T')[0],
        concepto: gasto.concepto,
        categoria: gasto.categoriaGasto,
        monto: gasto.total,
        proveedorRuc: gasto.proveedor?.taxId || '',
        proveedorNombre: gasto.proveedor?.name || '',
        formaPago: gasto.formaPago || 'contado',
        areaCentroCosto: gasto.area?.id || '',
        observaciones: gasto.observaciones || '',
        montoPorPagar: '',
        fechaVencimiento: '',
        numeroFactura: ''
      })
      setModalEditarOpen(true)
    } catch (error: any) {
      console.error('❌ Error al obtener gasto para editar:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo obtener el gasto"
      })
    }
  }

  const guardarEdicion = async () => {
    if (!gastoSeleccionado) return

    try {
      setGuardandoEdicion(true)
      await expensesUploadService.actualizarGasto(gastoSeleccionado.id, {
        ...nuevoGasto,
        monto: parseFloat(nuevoGasto.monto) || 0
      })
      
      toast({
        title: "Gasto actualizado",
        description: "El gasto se ha actualizado correctamente"
      })

      setModalEditarOpen(false)
      setGastoSeleccionado(null)
      // Recargar lista de gastos
      cargarHistorial()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar el gasto"
      })
    } finally {
      setGuardandoEdicion(false)
    }
  }

  const crearNuevoGasto = async () => {
    try {
      // Validación básica
      if (!nuevoGasto.concepto || !nuevoGasto.monto || !nuevoGasto.proveedorRuc || !nuevoGasto.proveedorNombre) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Por favor completa todos los campos requeridos"
        })
        return
      }

      // Validaciones de cuenta por pagar
      if (generarCuentaPorPagar) {
        if (modoCuentaPorPagar === 'crear') {
          // Validaciones para crear nueva
          if (!nuevoGasto.montoPorPagar || parseFloat(nuevoGasto.montoPorPagar) <= 0) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "El monto por pagar debe ser mayor a 0"
            })
            return
          }
          if (parseFloat(nuevoGasto.montoPorPagar) > parseFloat(nuevoGasto.monto)) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "El monto por pagar no puede ser mayor al gasto total"
            })
            return
          }
          if (!nuevoGasto.fechaVencimiento) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Debes especificar la fecha de vencimiento de la cuenta por pagar"
            })
            return
          }
        } else {
          // Validaciones para vincular existente
          if (!cuentaPorPagarSeleccionada) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Debes seleccionar una cuenta por pagar existente"
            })
            return
          }
        }
      }

      setCargando(true)
      
      const dataToSend: any = {
        fechaGasto: nuevoGasto.fechaGasto,
        concepto: nuevoGasto.concepto,
        categoria: nuevoGasto.categoria,
        monto: parseFloat(nuevoGasto.monto),
        proveedorRuc: nuevoGasto.proveedorRuc,
        proveedorNombre: nuevoGasto.proveedorNombre,
        formaPago: nuevoGasto.formaPago,
        areaCentroCosto: nuevoGasto.areaCentroCosto,
        observaciones: nuevoGasto.observaciones
      }

      // Agregar datos de cuenta por pagar según el modo
      if (generarCuentaPorPagar) {
        if (modoCuentaPorPagar === 'crear') {
          // Crear nueva cuenta por pagar
          dataToSend.generarCuentaPorPagar = true
          dataToSend.montoPorPagar = parseFloat(nuevoGasto.montoPorPagar)
          dataToSend.fechaVencimiento = nuevoGasto.fechaVencimiento
          dataToSend.numeroFactura = nuevoGasto.numeroFactura
        } else {
          // Vincular a cuenta existente
          dataToSend.accountPayableId = cuentaPorPagarSeleccionada
        }
      }

      const resultado = await expensesUploadService.crearGasto(dataToSend)
      
      toast({
        title: "Gasto creado",
        description: `Gasto ${resultado.numeroComprobante} creado exitosamente`
      })
      
      // Resetear formulario y cerrar dialog
      setGenerarCuentaPorPagar(false)
      setModoCuentaPorPagar('crear')
      setCuentaPorPagarSeleccionada('')
      setNuevoGasto({
        fechaGasto: new Date().toISOString().split('T')[0],
        concepto: '',
        categoria: 'operativo',
        monto: '',
        proveedorRuc: '',
        proveedorNombre: '',
        formaPago: 'contado',
        areaCentroCosto: '',
        observaciones: '',
        montoPorPagar: '',
        fechaVencimiento: '',
        numeroFactura: ''
      })
      setOpenDialog(false)
      
      // Recargar historial
      cargarHistorial()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al crear gasto"
      })
    } finally {
      setCargando(false)
    }
  }

  // Mapear los gastos reales desde el historial
  const gastosOperativos = historial.map((h: any) => {
    const gastoData = h.gastoData
    return {
      id: h.id, // ✅ ID COMPLETO para poder ver/editar
      descripcion: gastoData?.concepto || h.nombreArchivo,
      categoria: gastoData?.categoriaGasto || "Operativo",
      monto: gastoData?.total || 0,
      fecha: new Date(h.createdAt).toLocaleDateString('es-MX'),
      proveedor: gastoData?.proveedor?.name || "Proveedor",
      estado: "Registrado",
      centroCosto: gastoData?.area?.name || "General",
      responsable: h.usuario ? `${h.usuario.firstName} ${h.usuario.lastName}` : "Sistema",
      numeroComprobante: gastoData?.numeroComprobante || "",
      origenCarga: gastoData?.origenCarga || h.tipo,
    }
  })

  // Calcular totales por categoría desde los gastos reales
  const categoriasMap = gastosOperativos.reduce((acc: any, gasto) => {
    const cat = gasto.categoria || 'otros'
    if (!acc[cat]) {
      acc[cat] = { total: 0, cantidad: 0 }
    }
    acc[cat].total += gasto.monto
    acc[cat].cantidad += 1
    return acc
  }, {})

  const categorias = Object.entries(categoriasMap).map(([nombre, data]: [string, any]) => ({
    nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
    total: data.total,
    cantidad: data.cantidad,
    color: "bg-blue-50 text-blue-700"
  }))

  const filteredGastos = gastosOperativos.filter((gasto) => {
    const matchesSearch =
      gasto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gasto.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gasto.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || gasto.categoria.toLowerCase() === filterCategory
    return matchesSearch && matchesCategory
  })

  const totalGastos = filteredGastos.reduce((sum, gasto) => sum + gasto.monto, 0)

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Aprobado":
        return <Badge className="bg-blue-50 text-blue-700">Aprobado</Badge>
      case "Pagado":
        return <Badge className="bg-green-50 text-green-700">Pagado</Badge>
      case "Pendiente":
        return <Badge className="bg-yellow-50 text-yellow-700">Pendiente</Badge>
      case "Rechazado":
        return <Badge className="bg-red-50 text-red-700">Rechazado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gastos Operativos</h1>
          <p className="text-muted-foreground">Gestión de gastos operativos y administrativos</p>
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
                Nuevo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
                <DialogDescription>Registra un gasto operativo en el sistema</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Fecha del Gasto *</Label>
                  <Input 
                    type="date" 
                    value={nuevoGasto.fechaGasto}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, fechaGasto: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Descripción/Concepto *</Label>
                  <Textarea 
                    placeholder="Descripción del gasto..."
                    value={nuevoGasto.concepto}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, concepto: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select value={nuevoGasto.categoria} onValueChange={(value) => setNuevoGasto({...nuevoGasto, categoria: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operativo">Operativo</SelectItem>
                      <SelectItem value="administrativo">Administrativo</SelectItem>
                      <SelectItem value="ventas">Ventas</SelectItem>
                      <SelectItem value="financiero">Financiero</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Monto Total (incluyendo IGV) *</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="1500.00"
                    value={nuevoGasto.monto}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>RUC del Proveedor *</Label>
                  <Input 
                    placeholder="20123456789"
                    maxLength={11}
                    value={nuevoGasto.proveedorRuc}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, proveedorRuc: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Nombre del Proveedor *</Label>
                  <Input 
                    placeholder="Nombre o Razón Social"
                    value={nuevoGasto.proveedorNombre}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, proveedorNombre: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Observaciones</Label>
                  <Textarea 
                    placeholder="Observaciones adicionales (opcional)"
                    value={nuevoGasto.observaciones}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, observaciones: e.target.value})}
                    rows={2}
                  />
                </div>

                {/* Sección de Cuenta por Pagar */}
                <div className="border-t pt-4 space-y-4 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="generarCuentaPorPagar"
                      checked={generarCuentaPorPagar}
                      onCheckedChange={(checked) => {
                        setGenerarCuentaPorPagar(checked as boolean)
                        if (checked && nuevoGasto.monto) {
                          setNuevoGasto({...nuevoGasto, montoPorPagar: nuevoGasto.monto})
                        }
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="generarCuentaPorPagar"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Generar Cuenta por Pagar
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Crear automáticamente una cuenta por pagar al proveedor
                      </p>
                    </div>
                  </div>

                  {generarCuentaPorPagar && (
                    <div className="space-y-4 bg-blue-50 p-5 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-900">Gestión de Cuenta por Pagar</span>
                      </div>

                      {/* Toggle entre crear nueva y vincular existente */}
                      <div className="flex gap-2 bg-white p-1 rounded-md border border-blue-300">
                        <button
                          type="button"
                          onClick={() => setModoCuentaPorPagar('crear')}
                          className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                            modoCuentaPorPagar === 'crear'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-600 hover:bg-blue-100'
                          }`}
                        >
                          Crear Nueva
                        </button>
                        <button
                          type="button"
                          onClick={() => setModoCuentaPorPagar('vincular')}
                          className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                            modoCuentaPorPagar === 'vincular'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-600 hover:bg-blue-100'
                          }`}
                        >
                          Vincular Existente
                        </button>
                      </div>

                      {modoCuentaPorPagar === 'crear' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Monto por Pagar *</Label>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="Monto pendiente de pago"
                              value={nuevoGasto.montoPorPagar}
                              onChange={(e) => setNuevoGasto({...nuevoGasto, montoPorPagar: e.target.value})}
                            />
                            <p className="text-xs text-muted-foreground">
                              Monto total del gasto: ${nuevoGasto.monto || '0.00'}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label>Número de Factura/Comprobante</Label>
                            <Input 
                              placeholder="F001-00001234"
                              value={nuevoGasto.numeroFactura}
                              onChange={(e) => setNuevoGasto({...nuevoGasto, numeroFactura: e.target.value})}
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label>Fecha de Vencimiento *</Label>
                            <Input 
                              type="date" 
                              value={nuevoGasto.fechaVencimiento}
                              onChange={(e) => setNuevoGasto({...nuevoGasto, fechaVencimiento: e.target.value})}
                              min={nuevoGasto.fechaGasto}
                            />
                          </div>

                          {parseFloat(nuevoGasto.montoPorPagar) < parseFloat(nuevoGasto.monto) && nuevoGasto.montoPorPagar && nuevoGasto.monto && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 md:col-span-2">
                              <p className="text-sm text-yellow-800">
                                <strong>Pago parcial:</strong> Se registró anticipo de ${(parseFloat(nuevoGasto.monto) - parseFloat(nuevoGasto.montoPorPagar)).toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Label>Seleccionar Cuenta por Pagar Existente *</Label>
                          <Select value={cuentaPorPagarSeleccionada} onValueChange={setCuentaPorPagarSeleccionada}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una cuenta por pagar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {cuentasPorPagar.length === 0 ? (
                                <SelectItem value="sin-cuentas" disabled>
                                  No hay cuentas por pagar pendientes
                                </SelectItem>
                              ) : (
                                cuentasPorPagar.map((cp) => (
                                  <SelectItem key={cp.id} value={cp.id}>
                                    {cp.invoiceNumber} - {cp.supplier?.name} - ${parseFloat(cp.balance).toLocaleString()} - Vence: {new Date(cp.dueDate).toLocaleDateString('es-MX')}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          {cuentaPorPagarSeleccionada && cuentasPorPagar.length > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded p-3">
                              {(() => {
                                const cp = cuentasPorPagar.find(c => c.id === cuentaPorPagarSeleccionada)
                                return cp && (
                                  <div className="text-sm">
                                    <p className="font-medium text-green-900">Cuenta seleccionada:</p>
                                    <p className="text-green-800">Proveedor: {cp.supplier?.name}</p>
                                    <p className="text-green-800">Saldo: ${parseFloat(cp.balance).toLocaleString()}</p>
                                    <p className="text-green-800">Vencimiento: {new Date(cp.dueDate).toLocaleDateString('es-MX')}</p>
                                  </div>
                                )
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)} disabled={cargando}>
                  Cancelar
                </Button>
                <Button onClick={crearNuevoGasto} disabled={cargando}>
                  {cargando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Registrar Gasto"
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
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalGastos.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredGastos.length} gastos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              $
              {gastosOperativos
                .filter((g) => g.estado === "Pendiente")
                .reduce((sum, g) => sum + g.monto, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {gastosOperativos.filter((g) => g.estado === "Pendiente").length} gastos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              $
              {gastosOperativos
                .filter((g) => g.estado === "Aprobado")
                .reduce((sum, g) => sum + g.monto, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {gastosOperativos.filter((g) => g.estado === "Aprobado").length} gastos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pagados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              $
              {gastosOperativos
                .filter((g) => g.estado === "Pagado")
                .reduce((sum, g) => sum + g.monto, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {gastosOperativos.filter((g) => g.estado === "Pagado").length} gastos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Carga Masiva de Gastos</CardTitle>
            <CardDescription>Importa múltiples gastos desde archivo Excel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!uploadResponse && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="periodo-gasto">Período (Opcional)</Label>
                  <Input
                    id="periodo-gasto"
                    type="month"
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                    placeholder="2024-01"
                  />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Input
                      ref={fileInputRef}
                      id="file-upload-gastos"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Label htmlFor="file-upload-gastos">
                      <Button variant="outline" type="button" asChild>
                        <span>
                          <FileText className="h-4 w-4 mr-2" />
                          Seleccionar archivo Excel
                        </span>
                      </Button>
                    </Label>
                    {archivo && (
                      <p className="mt-2 text-sm font-medium text-green-600">
                        {archivo.name}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-muted-foreground">
                      Arrastra y suelta tu archivo aquí, o haz clic para seleccionar
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Formatos soportados: .xlsx, .xls, .csv</p>
                  <Button onClick={subirArchivo} disabled={!archivo || cargando}>
                    {cargando ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Subir Archivo
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {uploadResponse && !importacionResultado && (
              <>
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Archivo subido: {uploadResponse.registrosDetectados} registros detectados
                  </AlertDescription>
                </Alert>

                {!validacionResultado && (
                  <Button onClick={validarDatos} disabled={cargando} className="w-full">
                    {cargando ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Validando...
                      </>
                    ) : (
                      "Validar Datos"
                    )}
                  </Button>
                )}

                {validacionResultado && (
                  <>
                    <Alert className={validacionResultado.puedeImportar ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
                      {validacionResultado.puedeImportar ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                      <AlertDescription className={validacionResultado.puedeImportar ? "text-green-800" : "text-yellow-800"}>
                        {validacionResultado.registrosValidos} registros válidos, {validacionResultado.registrosInvalidos} con errores
                      </AlertDescription>
                    </Alert>

                    {validacionResultado.puedeImportar && (
                      <Button onClick={importarDatos} disabled={cargando} className="w-full">
                        {cargando ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Importando...
                          </>
                        ) : (
                          "Confirmar e Importar"
                        )}
                      </Button>
                    )}
                  </>
                )}
              </>
            )}

            {importacionResultado && (
              <>
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Importación completada: {importacionResultado.registrosImportados} gastos importados
                  </AlertDescription>
                </Alert>
                <Button onClick={reiniciarProceso} variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Cargar Otros Gastos
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
            <CardDescription>Distribución mensual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categorias.length > 0 ? (
              categorias.map((categoria, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{categoria.nombre}</div>
                    <div className="text-sm text-muted-foreground">
                      ${categoria.total.toLocaleString()} · {categoria.cantidad} gasto{categoria.cantidad !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <Badge className={categoria.color}>
                    {totalGastos > 0 ? Math.round((categoria.total / totalGastos) * 100) : 0}%
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay gastos registrados
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Gastos Operativos</CardTitle>
          <CardDescription>Gastos registrados y su estado actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por descripción, proveedor o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="combustible">Combustible</SelectItem>
                <SelectItem value="suministros">Suministros</SelectItem>
                <SelectItem value="servicios">Servicios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGastos.map((gasto) => (
                  <TableRow key={gasto.id}>
                    <TableCell className="font-medium">
                      <div className="text-xs font-mono">{gasto.numeroComprobante || gasto.id.substring(0, 8)}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{gasto.descripcion}</div>
                        <div className="text-sm text-muted-foreground">{gasto.proveedor}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{gasto.categoria}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">${gasto.monto.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {gasto.fecha}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(gasto.estado)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleVerGasto(gasto.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleEditarGasto(gasto.id)}
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

      {/* Modal Ver Gasto */}
      <Dialog open={modalVerOpen} onOpenChange={setModalVerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Gasto</DialogTitle>
            <DialogDescription>
              Información completa del gasto seleccionado
            </DialogDescription>
          </DialogHeader>
          {gastoSeleccionado && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Número de Comprobante</Label>
                  <p className="text-sm font-medium mt-1">{gastoSeleccionado.numeroComprobante}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha</Label>
                  <p className="text-sm mt-1">{new Date(gastoSeleccionado.fechaGasto).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Concepto</Label>
                <p className="text-sm mt-1">{gastoSeleccionado.concepto}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Categoría</Label>
                  <Badge variant="outline" className="mt-1">{gastoSeleccionado.categoriaGasto}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Forma de Pago</Label>
                  <p className="text-sm mt-1 capitalize">{gastoSeleccionado.formaPago}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Subtotal</Label>
                  <p className="text-sm font-medium mt-1">${gastoSeleccionado.subtotal?.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">IGV</Label>
                  <p className="text-sm font-medium mt-1">${gastoSeleccionado.igv?.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total</Label>
                  <p className="text-lg font-bold mt-1 text-primary">${gastoSeleccionado.total?.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Proveedor</Label>
                <p className="text-sm mt-1">{gastoSeleccionado.proveedor?.name}</p>
                <p className="text-xs text-muted-foreground">RUC: {gastoSeleccionado.proveedor?.taxId}</p>
              </div>

              {gastoSeleccionado.area && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Área</Label>
                  <p className="text-sm mt-1">{gastoSeleccionado.area.name}</p>
                </div>
              )}

              {gastoSeleccionado.observaciones && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Observaciones</Label>
                  <p className="text-sm mt-1">{gastoSeleccionado.observaciones}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Origen</Label>
                <Badge variant="secondary" className="mt-1">
                  {gastoSeleccionado.origenCarga === 'carga_masiva' ? 'Carga Masiva' : 'Formulario Web'}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalVerOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Gasto */}
      <Dialog open={modalEditarOpen} onOpenChange={setModalEditarOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Gasto</DialogTitle>
            <DialogDescription>
              Modifica los datos del gasto
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fecha">Fecha del Gasto *</Label>
                <Input
                  id="edit-fecha"
                  type="date"
                  value={nuevoGasto.fechaGasto}
                  onChange={(e) => setNuevoGasto({...nuevoGasto, fechaGasto: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-categoria">Categoría *</Label>
                <Select
                  value={nuevoGasto.categoria}
                  onValueChange={(value) => setNuevoGasto({...nuevoGasto, categoria: value})}
                >
                  <SelectTrigger id="edit-categoria">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operativo">Operativo</SelectItem>
                    <SelectItem value="administrativo">Administrativo</SelectItem>
                    <SelectItem value="ventas">Ventas</SelectItem>
                    <SelectItem value="financiero">Financiero</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-concepto">Concepto *</Label>
              <Input
                id="edit-concepto"
                value={nuevoGasto.concepto}
                onChange={(e) => setNuevoGasto({...nuevoGasto, concepto: e.target.value})}
                placeholder="Descripción del gasto"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-monto">Monto Total *</Label>
                <Input
                  id="edit-monto"
                  type="number"
                  step="0.01"
                  value={nuevoGasto.monto}
                  onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-formaPago">Forma de Pago *</Label>
                <Select
                  value={nuevoGasto.formaPago}
                  onValueChange={(value) => setNuevoGasto({...nuevoGasto, formaPago: value})}
                >
                  <SelectTrigger id="edit-formaPago">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contado">Contado</SelectItem>
                    <SelectItem value="credito">Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ruc">RUC del Proveedor *</Label>
                <Input
                  id="edit-ruc"
                  value={nuevoGasto.proveedorRuc}
                  onChange={(e) => setNuevoGasto({...nuevoGasto, proveedorRuc: e.target.value})}
                  placeholder="20123456789"
                  maxLength={11}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nombre-prov">Nombre del Proveedor *</Label>
                <Input
                  id="edit-nombre-prov"
                  value={nuevoGasto.proveedorNombre}
                  onChange={(e) => setNuevoGasto({...nuevoGasto, proveedorNombre: e.target.value})}
                  placeholder="Nombre o Razón Social"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-observaciones">Observaciones</Label>
              <Textarea
                id="edit-observaciones"
                value={nuevoGasto.observaciones}
                onChange={(e) => setNuevoGasto({...nuevoGasto, observaciones: e.target.value})}
                placeholder="Notas adicionales..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalEditarOpen(false)} disabled={guardandoEdicion}>
              Cancelar
            </Button>
            <Button onClick={guardarEdicion} disabled={guardandoEdicion}>
              {guardandoEdicion ? (
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
