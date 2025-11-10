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
import { Upload, Download, Plus, Search, FileText, Calendar, Loader2, CheckCircle, AlertCircle } from "lucide-react"
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
  
  // Estados de historial
  const [historial, setHistorial] = useState<HistorialCarga[]>([])
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  
  // Estados para formulario de nuevo gasto
  const [openDialog, setOpenDialog] = useState(false)
  const [nuevoGasto, setNuevoGasto] = useState({
    fechaGasto: new Date().toISOString().split('T')[0],
    concepto: '',
    categoria: 'operativo',
    monto: '',
    proveedorRuc: '',
    proveedorNombre: '',
    areaCentroCosto: '',
    observaciones: ''
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

      setCargando(true)
      const resultado = await expensesUploadService.crearGasto({
        ...nuevoGasto,
        monto: parseFloat(nuevoGasto.monto)
      })
      
      toast({
        title: "Gasto creado",
        description: `Gasto ${resultado.numeroComprobante} creado exitosamente`
      })
      
      // Resetear formulario y cerrar dialog
      setNuevoGasto({
        fechaGasto: new Date().toISOString().split('T')[0],
        concepto: '',
        categoria: 'operativo',
        monto: '',
        proveedorRuc: '',
        proveedorNombre: '',
        areaCentroCosto: '',
        observaciones: ''
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
      id: h.id.substring(0, 12),
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
          <Button variant="outline" onClick={descargarPlantilla}>
            <Download className="h-4 w-4 mr-2" />
            Plantilla Excel
          </Button>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
                <DialogDescription>Registra un gasto operativo en el sistema</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
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
                
                <div className="space-y-2">
                  <Label>Observaciones</Label>
                  <Textarea 
                    placeholder="Observaciones adicionales (opcional)"
                    value={nuevoGasto.observaciones}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, observaciones: e.target.value})}
                  />
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
                    <TableCell className="font-medium">{gasto.id}</TableCell>
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
                        <Button size="sm" variant="outline">
                          Ver
                        </Button>
                        <Button size="sm">Editar</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
