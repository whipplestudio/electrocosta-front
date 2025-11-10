"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Loader2, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { 
  expensesUploadService, 
  type UploadResponse, 
  type ValidacionResultado, 
  type ImportacionResultado,
  type HistorialCarga 
} from "@/services/expenses-upload.service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function CargaGastos() {
  const { toast } = useToast()
  const [archivo, setArchivo] = useState<File | null>(null)
  const [periodo, setPeriodo] = useState<string>("")
  const [cargando, setCargando] = useState(false)
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null)
  const [validacionResultado, setValidacionResultado] = useState<ValidacionResultado | null>(null)
  const [importacionResultado, setImportacionResultado] = useState<ImportacionResultado | null>(null)
  const [historial, setHistorial] = useState<HistorialCarga[]>([])
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  const [paso, setPaso] = useState<'upload' | 'validacion' | 'importacion' | 'completado'>('upload')

  const cargarHistorial = useCallback(async () => {
    try {
      setLoadingHistorial(true)
      const response = await expensesUploadService.obtenerHistorial({ limit: 5 })
      setHistorial(response.data)
    } catch (error) {
      console.error('Error al cargar historial:', error)
    } finally {
      setLoadingHistorial(false)
    }
  }, [])

  useEffect(() => {
    cargarHistorial()
  }, [cargarHistorial])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Validar tipo de archivo
      const validExtensions = ['.xlsx', '.xls', '.csv']
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      
      if (!validExtensions.includes(fileExtension)) {
        toast({
          variant: "destructive",
          title: "Archivo inválido",
          description: "Solo se permiten archivos Excel (.xlsx, .xls) o CSV (.csv)"
        })
        return
      }

      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "Archivo demasiado grande",
          description: "El archivo no puede superar los 10MB"
        })
        return
      }

      setArchivo(file)
      // Resetear estados al seleccionar nuevo archivo
      setUploadResponse(null)
      setValidacionResultado(null)
      setImportacionResultado(null)
      setPaso('upload')
    }
  }

  const handleUpload = async () => {
    if (!archivo) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor selecciona un archivo"
      })
      return
    }

    try {
      setCargando(true)
      const response = await expensesUploadService.uploadFile(archivo, {
        periodo: periodo || undefined
      })

      setUploadResponse(response)
      setPaso('validacion')
      
      toast({
        title: "Archivo subido",
        description: `${response.registrosDetectados} registros detectados. Puedes proceder a validar.`
      })
    } catch (error: any) {
      console.error('Error al subir archivo:', error)
      toast({
        variant: "destructive",
        title: "Error al subir archivo",
        description: error.response?.data?.message || "Ocurrió un error al procesar el archivo"
      })
    } finally {
      setCargando(false)
    }
  }

  const handleValidar = async () => {
    if (!uploadResponse) return

    try {
      setCargando(true)
      const resultado = await expensesUploadService.validarDatos(uploadResponse.uploadId)
      
      setValidacionResultado(resultado)
      
      if (resultado.puedeImportar) {
        toast({
          title: "Validación completada",
          description: `${resultado.registrosValidos} registros válidos. Puedes proceder a importar.`
        })
      } else {
        toast({
          variant: "destructive",
          title: "Errores de validación",
          description: `Se encontraron ${resultado.registrosInvalidos} registros con errores. Por favor corrígelos antes de importar.`
        })
      }
    } catch (error: any) {
      console.error('Error al validar:', error)
      toast({
        variant: "destructive",
        title: "Error en la validación",
        description: error.response?.data?.message || "Ocurrió un error al validar los datos"
      })
    } finally {
      setCargando(false)
    }
  }

  const handleImportar = async () => {
    if (!uploadResponse || !validacionResultado?.puedeImportar) return

    try {
      setCargando(true)
      const resultado = await expensesUploadService.importarDatos(uploadResponse.uploadId)
      
      setImportacionResultado(resultado)
      setPaso('completado')
      
      toast({
        title: "Importación completada",
        description: `${resultado.registrosImportados} registros importados exitosamente`
      })

      // Recargar historial
      cargarHistorial()
    } catch (error: any) {
      console.error('Error al importar:', error)
      toast({
        variant: "destructive",
        title: "Error en la importación",
        description: error.response?.data?.message || "Ocurrió un error al importar los datos"
      })
    } finally {
      setCargando(false)
    }
  }

  const handleDescargarPlantilla = async () => {
    try {
      const blob = await expensesUploadService.descargarPlantilla()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'plantilla_gastos.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Plantilla descargada",
        description: "La plantilla se ha descargado exitosamente"
      })
    } catch (error) {
      console.error('Error al descargar plantilla:', error)
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
    setPaso('upload')
  }

  const continuarCarga = async (carga: HistorialCarga) => {
    // Scroll hacia arriba para ver la sección de carga
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Establecer el uploadResponse desde el historial
    setUploadResponse({
      uploadId: carga.id,
      nombreArchivo: carga.nombreArchivo,
      registrosDetectados: carga.registrosDetectados,
      estado: carga.estado as any,
    })

    // Dependiendo del estado, ir al paso correspondiente
    if (carga.estado === 'subido') {
      setPaso('validacion')
      setValidacionResultado(null)
      setImportacionResultado(null)
      toast({
        title: "Carga recuperada",
        description: "Puedes continuar con la validación de los datos"
      })
    } else if (carga.estado === 'validado') {
      // Si ya está validado, mostrar resultado simulado para permitir importar
      setPaso('validacion')
      setValidacionResultado({
        uploadId: carga.id,
        registrosValidos: carga.registrosDetectados - (carga.registrosInvalidos || 0),
        registrosInvalidos: carga.registrosInvalidos || 0,
        errores: [],
        advertencias: ['Este archivo ya fue validado anteriormente. Puedes proceder a importar.'],
        puedeImportar: true,
      })
      setImportacionResultado(null)
      toast({
        title: "Carga recuperada",
        description: "Este archivo ya fue validado. Puedes proceder a importar."
      })
    } else if (carga.estado === 'error_validacion') {
      // Si tiene errores, mostrar mensaje indicando que debe corregir
      setPaso('validacion')
      setValidacionResultado({
        uploadId: carga.id,
        registrosValidos: carga.registrosDetectados - (carga.registrosInvalidos || 0),
        registrosInvalidos: carga.registrosInvalidos || 0,
        errores: [{
          fila: 0,
          campo: 'archivo',
          valor: '',
          error: 'Este archivo tiene errores de validación. Descarga la plantilla, corrige los errores y vuelve a subir el archivo.'
        }],
        advertencias: [],
        puedeImportar: false,
      })
      toast({
        variant: "destructive",
        title: "Carga con errores",
        description: "Este archivo tiene errores. Debes corregirlo y volver a subirlo."
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { variant: any; label: string; icon?: string }> = {
      subido: { variant: "secondary", label: "Subido", icon: "⏸️" },
      validando: { variant: "default", label: "Validando" },
      validado: { variant: "secondary", label: "Validado", icon: "⏸️" },
      error_validacion: { variant: "destructive", label: "Error Validación", icon: "⚠️" },
      importando: { variant: "default", label: "Importando" },
      importado: { variant: "default", label: "Importado" },
      error_importacion: { variant: "destructive", label: "Error Importación" },
    }

    const badge = badges[estado] || { variant: "secondary", label: estado }
    return (
      <Badge variant={badge.variant}>
        {badge.icon && <span className="mr-1">{badge.icon}</span>}
        {badge.label}
      </Badge>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Carga de Información - Gastos</h1>
        <Button variant="outline" onClick={handleDescargarPlantilla}>
          <Download className="h-4 w-4 mr-2" />
          Descargar Plantilla
        </Button>
      </div>

      {/* Progreso del proceso */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${uploadResponse ? 'text-green-600' : paso === 'upload' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                uploadResponse ? 'bg-green-600 text-white' : paso === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                {uploadResponse ? '✓' : '1'}
              </div>
              <span className="font-medium">Subir Archivo</span>
            </div>
            
            <div className={`flex-1 h-0.5 ${uploadResponse ? 'bg-green-600' : 'bg-gray-200'} mx-4`} />
            
            <div className={`flex items-center gap-2 ${validacionResultado ? 'text-green-600' : paso === 'validacion' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                validacionResultado ? 'bg-green-600 text-white' : paso === 'validacion' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                {validacionResultado ? '✓' : '2'}
              </div>
              <span className="font-medium">Validar Datos</span>
            </div>
            
            <div className={`flex-1 h-0.5 ${validacionResultado ? 'bg-green-600' : 'bg-gray-200'} mx-4`} />
            
            <div className={`flex items-center gap-2 ${importacionResultado ? 'text-green-600' : (paso === 'importacion' || paso === 'completado') ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                importacionResultado ? 'bg-green-600 text-white' : (paso === 'importacion' || paso === 'completado') ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                {importacionResultado ? '✓' : '3'}
              </div>
              <span className="font-medium">Importar</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de carga */}
      {paso === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>1. Cargar Archivo de Ventas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="periodo">Período (Opcional)</Label>
              <Input
                id="periodo"
                type="month"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                placeholder="2024-01"
              />
              <p className="text-xs text-muted-foreground">
                Formato: YYYY-MM (ejemplo: 2024-03 para Marzo 2024)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="archivo">Archivo Excel/CSV</Label>
              <Input 
                id="archivo" 
                type="file" 
                accept=".xlsx,.xls,.csv" 
                onChange={handleFileChange} 
              />
              {archivo && (
                <p className="text-sm text-muted-foreground">
                  Archivo seleccionado: {archivo.name} ({(archivo.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <Button 
              onClick={handleUpload} 
              disabled={!archivo || cargando} 
              className="w-full"
            >
              {cargando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir y Analizar Archivo
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resultado de carga */}
      {uploadResponse && paso === 'validacion' && !validacionResultado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Archivo Cargado Exitosamente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre del archivo</p>
                <p className="font-medium">{uploadResponse.nombreArchivo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registros detectados</p>
                <p className="font-medium text-2xl">{uploadResponse.registrosDetectados}</p>
              </div>
            </div>

            <Button 
              onClick={handleValidar} 
              disabled={cargando} 
              className="w-full"
            >
              {cargando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validar Datos
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resultado de validación */}
      {validacionResultado && paso !== 'completado' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validacionResultado.puedeImportar ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Resultado de Validación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Registros válidos</p>
                <p className="font-medium text-2xl text-green-600">{validacionResultado.registrosValidos}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Registros inválidos</p>
                <p className="font-medium text-2xl text-red-600">{validacionResultado.registrosInvalidos}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="font-medium text-lg">
                  {validacionResultado.puedeImportar ? (
                    <Badge variant="default">Listo para importar</Badge>
                  ) : (
                    <Badge variant="destructive">Requiere corrección</Badge>
                  )}
                </p>
              </div>
            </div>

            {validacionResultado.advertencias && validacionResultado.advertencias.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Advertencias</h4>
                {validacionResultado.advertencias.map((adv, idx) => (
                  <Alert key={idx}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{adv}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {validacionResultado.errores && validacionResultado.errores.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Errores ({validacionResultado.errores.length})</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {validacionResultado.errores.slice(0, 10).map((error, idx) => (
                    <Alert key={idx} variant="destructive">
                      <AlertDescription className="text-sm">
                        <strong>Fila {error.fila}</strong> - Campo: {error.campo} - {error.error}
                      </AlertDescription>
                    </Alert>
                  ))}
                  {validacionResultado.errores.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ... y {validacionResultado.errores.length - 10} errores más
                    </p>
                  )}
                </div>
              </div>
            )}

            {validacionResultado.puedeImportar && !importacionResultado && (
              <Button 
                onClick={handleImportar} 
                disabled={cargando} 
                className="w-full"
              >
                {cargando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Confirmar e Importar Datos
                  </>
                )}
              </Button>
            )}
            
            {!validacionResultado.puedeImportar && (
              <>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Debes corregir los errores antes de importar. Descarga el archivo, corrígelo y súbelo nuevamente.
                  </AlertDescription>
                </Alert>
                <Button onClick={reiniciarProceso} variant="outline" className="w-full">
                  Cargar Nuevo Archivo
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resultado de importación */}
      {importacionResultado && paso === 'completado' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Importación Completada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-green-50">
                <p className="text-sm text-muted-foreground">Registros importados</p>
                <p className="font-medium text-2xl text-green-600">{importacionResultado.registrosImportados}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Gastos creados</p>
                <p className="font-medium text-2xl">{importacionResultado.gastosCreados.length}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">CxP generadas</p>
                <p className="font-medium text-2xl">{importacionResultado.cuentasPorPagarGeneradas.length}</p>
              </div>
            </div>

            {importacionResultado.errores && importacionResultado.errores.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Se encontraron {importacionResultado.errores.length} errores durante la importación.
                  {importacionResultado.errores.slice(0, 3).map((error, idx) => (
                    <div key={idx} className="mt-1 text-sm">{error}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={reiniciarProceso} variant="outline" className="w-full">
              Cargar Nuevo Archivo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle>Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Formato del archivo:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Formato: Excel (.xlsx, .xls) o CSV</li>
                <li>• Columnas requeridas: Fecha, Proveedor, Categoría, Monto, Descripción</li>
                <li>• Máximo 10MB de tamaño</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Validaciones:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Fechas en formato DD/MM/YYYY</li>
                <li>• Montos sin símbolos de moneda</li>
                <li>• Proveedores deben existir en el sistema</li>
              </ul>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleDescargarPlantilla}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Descargar Plantilla de Ejemplo
          </Button>
        </CardContent>
      </Card>

      {/* Historial */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Cargas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHistorial ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : historial.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay cargas recientes</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Registros</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historial.map((carga) => {
                  const puedeContin = ['subido', 'validado', 'error_validacion'].includes(carga.estado)
                  
                  return (
                    <TableRow key={carga.id}>
                      <TableCell className="font-medium">{carga.nombreArchivo}</TableCell>
                      <TableCell>
                        {carga.registrosImportados > 0 
                          ? `${carga.registrosImportados} / ${carga.registrosDetectados}` 
                          : carga.registrosDetectados}
                      </TableCell>
                      <TableCell>{getEstadoBadge(carga.estado)}</TableCell>
                      <TableCell>{formatDate(carga.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        {puedeContin && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => continuarCarga(carga)}
                            disabled={cargando}
                          >
                            {carga.estado === 'subido' && 'Validar'}
                            {carga.estado === 'validado' && 'Importar'}
                            {carga.estado === 'error_validacion' && 'Ver Errores'}
                          </Button>
                        )}
                        {carga.estado === 'importado' && (
                          <span className="text-sm text-green-600">✓ Completado</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
