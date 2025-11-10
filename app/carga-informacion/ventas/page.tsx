"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, FileSpreadsheet, CheckCircle, FileX, AlertCircle, FileText, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { salesUploadService, type UploadResponse, type ValidacionResultado, type ImportacionResultado, type HistorialCarga } from "@/services/sales-upload.service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function CargaVentas() {
  const { toast } = useToast()
  
  // Estados para carga Excel/CSV
  const [archivo, setArchivo] = useState<File | null>(null)
  const [periodo, setPeriodo] = useState<string>("")
  const [cargando, setCargando] = useState(false)
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null)
  const [validacionResultado, setValidacionResultado] = useState<ValidacionResultado | null>(null)
  const [importacionResultado, setImportacionResultado] = useState<ImportacionResultado | null>(null)
  
  // Estados para carga XML
  const [archivosXML, setArchivosXML] = useState<FileList | null>(null)
  const [periodoXML, setPeriodoXML] = useState<string>("")
  const [cargandoXML, setCargandoXML] = useState(false)
  const [progresoXML, setProgresoXML] = useState(0)
  const [xmlProcesado, setXmlProcesado] = useState(false)
  const [facturasProcesadas, setFacturasProcesadas] = useState<any[]>([])
  const [erroresXML, setErroresXML] = useState<string[]>([])
  
  // Refs
  const xmlFileInputRef = useRef<HTMLInputElement>(null)
  
  // Estados compartidos
  const [historial, setHistorial] = useState<HistorialCarga[]>([])
  const [loadingHistorial, setLoadingHistorial] = useState(false)

  // ==========================================================================
  // CARGA DE HISTORIAL
  // ==========================================================================
  
  const cargarHistorial = useCallback(async () => {
    try {
      setLoadingHistorial(true)
      const response = await salesUploadService.obtenerHistorial({ limit: 5 })
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

  // ==========================================================================
  // MANEJO DE CARGA EXCEL/CSV
  // ==========================================================================

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
      setUploadResponse(null)
      setValidacionResultado(null)
      setImportacionResultado(null)
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
      const response = await salesUploadService.uploadFile(archivo, {
        periodo: periodo || undefined
      })

      setUploadResponse(response)
      
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
      const resultado = await salesUploadService.validarDatos(uploadResponse.uploadId)
      
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
          description: `Se encontraron ${resultado.registrosInvalidos} registros con errores.`
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
      const resultado = await salesUploadService.importarDatos(uploadResponse.uploadId)
      
      setImportacionResultado(resultado)
      
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
      const blob = await salesUploadService.descargarPlantilla()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'plantilla_ventas.xlsx'
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
  }

  const reiniciarProcesoXML = () => {
    setArchivosXML(null)
    setPeriodoXML('')
    setFacturasProcesadas([])
    setErroresXML([])
    setProgresoXML(0)
    setXmlProcesado(false)
    
    // Resetear el input file
    if (xmlFileInputRef.current) {
      xmlFileInputRef.current.value = ''
    }
  }

  // ==========================================================================
  // MANEJO DE CARGA XML (MOCK - POR IMPLEMENTAR EN BACKEND)
  // ==========================================================================

  const handleXMLFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivosXML(e.target.files)
      setFacturasProcesadas([])
      setErroresXML([])
    }
  }

  const procesarXMLMasivo = async () => {
    if (!archivosXML || archivosXML.length === 0) return

    setCargandoXML(true)
    setProgresoXML(0)
    setFacturasProcesadas([])
    setErroresXML([])

    try {
      // Intentar usar el endpoint real del backend
      const archivosArray = Array.from(archivosXML)
      
      // Simular progreso mientras se suben
      const uploadInterval = setInterval(() => {
        setProgresoXML((prev) => Math.min(prev + 10, 90))
      }, 300)

      try {
        const response = await salesUploadService.uploadXMLFiles(archivosArray, periodoXML)
        clearInterval(uploadInterval)
        setProgresoXML(100)
        
        // Si el backend responde exitosamente
        toast({
          title: "Procesamiento completado",
          description: `${response.archivosSubidos} archivo(s) XML procesados exitosamente`
        })
        
        // Aquí se procesarían los resultados del backend
        // setFacturasProcesadas(response.facturas)
        // setErroresXML(response.errores)
        
        // Marcar como procesado y desactivar estado de carga
        setXmlProcesado(true)
        setCargandoXML(false)
        
      } catch (error: any) {
        clearInterval(uploadInterval)
        
        // Si el endpoint no está disponible, usar procesamiento simulado
        if (error.message?.includes('próximamente')) {
          toast({
            variant: "default",
            title: "Modo Demo",
            description: "Usando procesamiento simulado. Backend en desarrollo."
          })
          
          // Procesamiento simulado
          await procesarXMLSimulado()
        } else {
          throw error
        }
      }
    } catch (error: any) {
      console.error('Error al procesar XML:', error)
      toast({
        variant: "destructive",
        title: "Error al procesar XML",
        description: error.message || "Ocurrió un error al procesar los archivos"
      })
      setCargandoXML(false)
    }
  }

  const procesarXMLSimulado = async () => {
    const facturas: any[] = []
    const erroresTemp: string[] = []

    if (!archivosXML) return

    for (let i = 0; i < archivosXML.length; i++) {
      const archivo = archivosXML[i]

      try {
        const facturaSimulada = {
          archivo: archivo.name,
          folio: `FAC-${Math.floor(Math.random() * 10000)}`,
          fecha: new Date().toLocaleDateString(),
          cliente: `Cliente ${i + 1}`,
          total: (Math.random() * 10000).toFixed(2),
          estado: Math.random() > 0.1 ? "Procesada" : "Error",
        }

        if (facturaSimulada.estado === "Procesada") {
          facturas.push(facturaSimulada)
        } else {
          erroresTemp.push(`Error en ${archivo.name}: Formato XML inválido`)
        }

        setProgresoXML(((i + 1) / archivosXML.length) * 100)
        await new Promise((resolve) => setTimeout(resolve, 200))
      } catch (error) {
        erroresTemp.push(`Error procesando ${archivo.name}: ${error}`)
      }
    }

    setFacturasProcesadas(facturas)
    setErroresXML(erroresTemp)
    setXmlProcesado(true)
    setCargandoXML(false)
    
    toast({
      title: "Procesamiento simulado completado",
      description: `${facturas.length} facturas procesadas, ${erroresTemp.length} errores`
    })
  }

  // ==========================================================================
  // UTILIDADES
  // ==========================================================================

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
    const badges: Record<string, { variant: any; label: string }> = {
      subido: { variant: "secondary", label: "Subido" },
      validando: { variant: "default", label: "Validando" },
      validado: { variant: "secondary", label: "Validado" },
      error_validacion: { variant: "destructive", label: "Error Validación" },
      importando: { variant: "default", label: "Importando" },
      importado: { variant: "default", label: "Importado" },
      error_importacion: { variant: "destructive", label: "Error Importación" },
    }

    const badge = badges[estado] || { variant: "secondary", label: estado }
    return <Badge variant={badge.variant}>{badge.label}</Badge>
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Carga de Información - Ventas</h1>
        <Button variant="outline" onClick={handleDescargarPlantilla}>
          <Download className="h-4 w-4 mr-2" />
          Descargar Plantilla
        </Button>
      </div>

      {/* SECCIÓN PRINCIPAL: CARGA EXCEL/CSV Y CARGA XML */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: CARGA EXCEL/CSV */}
        <Card>
          <CardHeader>
            <CardTitle>Cargar Archivo de Ventas</CardTitle>
            <CardDescription>Sube un archivo Excel o CSV con información de ventas</CardDescription>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="archivo">Archivo Excel/CSV</Label>
              <Input id="archivo" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
              {archivo && <p className="text-sm text-muted-foreground">Archivo seleccionado: {archivo.name}</p>}
            </div>

            {!uploadResponse && (
              <Button onClick={handleUpload} disabled={!archivo || cargando} className="w-full">
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
            )}

            {uploadResponse && !validacionResultado && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{uploadResponse.registrosDetectados} registros</strong> detectados en el archivo
                  </AlertDescription>
                </Alert>
                <Button onClick={handleValidar} disabled={cargando} className="w-full">
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
              </div>
            )}

            {validacionResultado && !importacionResultado && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Válidos</p>
                    <p className="font-bold text-xl text-green-600">{validacionResultado.registrosValidos}</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Inválidos</p>
                    <p className="font-bold text-xl text-red-600">{validacionResultado.registrosInvalidos}</p>
                  </div>
                </div>

                {validacionResultado.errores.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {validacionResultado.errores.length} errores encontrados
                    </AlertDescription>
                  </Alert>
                )}

                {validacionResultado.puedeImportar ? (
                  <Button onClick={handleImportar} disabled={cargando} className="w-full">
                    {cargando ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Confirmar e Importar
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={reiniciarProceso} variant="outline" className="w-full">
                    Cargar Nuevo Archivo
                  </Button>
                )}
              </div>
            )}

            {importacionResultado && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <strong>{importacionResultado.registrosImportados} registros</strong> importados exitosamente
                  </AlertDescription>
                </Alert>
                <Button onClick={reiniciarProceso} variant="outline" className="w-full">
                  Cargar Nuevo Archivo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CARD 2: CARGA MASIVA XML */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileX className="h-5 w-5" />
              Carga Masiva de Facturas XML
            </CardTitle>
            <CardDescription>Procesa múltiples facturas electrónicas en formato XML</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="periodo-xml">Período (Opcional)</Label>
              <Input
                id="periodo-xml"
                type="month"
                value={periodoXML}
                onChange={(e) => setPeriodoXML(e.target.value)}
                placeholder="2024-01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="archivos-xml">Archivos XML de Facturas</Label>
              <Input 
                id="archivos-xml" 
                ref={xmlFileInputRef}
                type="file" 
                accept=".xml" 
                multiple 
                onChange={handleXMLFilesChange} 
              />
              {archivosXML && (
                <p className="text-sm text-muted-foreground">{archivosXML.length} archivo(s) XML seleccionado(s)</p>
              )}
            </div>

            {cargandoXML && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Procesando facturas...</span>
                  <span>{Math.round(progresoXML)}%</span>
                </div>
                <Progress value={progresoXML} className="w-full" />
              </div>
            )}

            {!xmlProcesado ? (
              <Button
                onClick={procesarXMLMasivo}
                disabled={!archivosXML || archivosXML.length === 0 || cargandoXML}
                className="w-full"
              >
                {cargandoXML ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando XML...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Procesar Facturas XML
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-2">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Facturas XML procesadas exitosamente
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={reiniciarProcesoXML}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Cargar Otras Facturas XML
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RESULTADOS DE PROCESAMIENTO XML */}
      {(facturasProcesadas.length > 0 || erroresXML.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {facturasProcesadas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Facturas Procesadas ({facturasProcesadas.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {facturasProcesadas.map((factura, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{factura.folio}</p>
                        <p className="text-xs text-muted-foreground">{factura.cliente}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">${factura.total}</p>
                        <Badge variant="secondary" className="text-xs">
                          {factura.estado}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {erroresXML.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Errores de Procesamiento ({erroresXML.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {erroresXML.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* INSTRUCCIONES */}
      <Card>
        <CardHeader>
          <CardTitle>Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Formato del archivo Excel/CSV:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Formato: Excel (.xlsx) o CSV</li>
                <li>• Columnas requeridas: fecha_venta, numero_factura, cliente_ruc, producto_servicio, cantidad, precio_unitario, subtotal, igv, total, forma_pago</li>
                <li>• Máximo 10MB de tamaño</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Carga masiva de XML:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Archivos XML de facturas electrónicas</li>
                <li>• Selecciona múltiples archivos XML</li>
                <li>• Procesamiento automático de datos fiscales</li>
                <li>• Validación de estructura XML</li>
              </ul>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleDescargarPlantilla}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Descargar Plantilla de Ejemplo
          </Button>
        </CardContent>
      </Card>

      {/* HISTORIAL */}
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
            <div className="space-y-3">
              {historial.map((carga) => (
                <div key={carga.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {carga.estado === 'importado' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                    <div>
                      <p className="font-medium">{carga.nombreArchivo}</p>
                      <p className="text-sm text-muted-foreground">
                        {carga.registrosImportados > 0 
                          ? `${carga.registrosImportados} / ${carga.registrosDetectados} registros procesados` 
                          : `${carga.registrosDetectados} registros`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getEstadoBadge(carga.estado)}
                    <p className="text-sm text-muted-foreground mt-1">{formatDate(carga.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
