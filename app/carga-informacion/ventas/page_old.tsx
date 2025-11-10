"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, FileSpreadsheet, CheckCircle, FileX, AlertCircle, FileText } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function CargaVentas() {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [cargando, setCargando] = useState(false)
  const [archivosXML, setArchivosXML] = useState<FileList | null>(null)
  const [progreso, setProgreso] = useState(0)
  const [facturasProcesadas, setFacturasProcesadas] = useState<any[]>([])
  const [errores, setErrores] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0])
    }
  }

  const handleXMLFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivosXML(e.target.files)
      setFacturasProcesadas([])
      setErrores([])
    }
  }

  const procesarArchivo = async () => {
    if (!archivo) return
    setCargando(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setCargando(false)
  }

  const procesarXMLMasivo = async () => {
    if (!archivosXML || archivosXML.length === 0) return

    setCargando(true)
    setProgreso(0)
    setFacturasProcesadas([])
    setErrores([])

    const facturas: any[] = []
    const erroresTemp: string[] = []

    for (let i = 0; i < archivosXML.length; i++) {
      const archivo = archivosXML[i]

      try {
        const contenido = await archivo.text()

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

        setProgreso(((i + 1) / archivosXML.length) * 100)

        await new Promise((resolve) => setTimeout(resolve, 200))
      } catch (error) {
        erroresTemp.push(`Error procesando ${archivo.name}: ${error}`)
      }
    }

    setFacturasProcesadas(facturas)
    setErrores(erroresTemp)
    setCargando(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Carga de Información - Ventas</h1>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Descargar Plantilla
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cargar Archivo de Ventas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="periodo">Período</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-03">Marzo 2024</SelectItem>
                  <SelectItem value="2024-02">Febrero 2024</SelectItem>
                  <SelectItem value="2024-01">Enero 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sucursal">Sucursal</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sucursal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="central">Central</SelectItem>
                  <SelectItem value="norte">Norte</SelectItem>
                  <SelectItem value="sur">Sur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="archivo">Archivo Excel/CSV</Label>
              <Input id="archivo" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
              {archivo && <p className="text-sm text-muted-foreground">Archivo seleccionado: {archivo.name}</p>}
            </div>

            <Button onClick={procesarArchivo} disabled={!archivo || cargando} className="w-full">
              {cargando ? (
                "Procesando..."
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Cargar Información
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileX className="h-5 w-5" />
              Carga Masiva de Facturas XML
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="periodo-xml">Período</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-03">Marzo 2024</SelectItem>
                  <SelectItem value="2024-02">Febrero 2024</SelectItem>
                  <SelectItem value="2024-01">Enero 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="archivos-xml">Archivos XML de Facturas</Label>
              <Input id="archivos-xml" type="file" accept=".xml" multiple onChange={handleXMLFilesChange} />
              {archivosXML && (
                <p className="text-sm text-muted-foreground">{archivosXML.length} archivo(s) XML seleccionado(s)</p>
              )}
            </div>

            {cargando && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Procesando facturas...</span>
                  <span>{Math.round(progreso)}%</span>
                </div>
                <Progress value={progreso} className="w-full" />
              </div>
            )}

            <Button
              onClick={procesarXMLMasivo}
              disabled={!archivosXML || archivosXML.length === 0 || cargando}
              className="w-full"
            >
              {cargando ? (
                "Procesando XML..."
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Procesar Facturas XML
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {(facturasProcesadas.length > 0 || errores.length > 0) && (
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

          {errores.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Errores de Procesamiento ({errores.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {errores.map((error, index) => (
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
                <li>• Columnas requeridas: Fecha, Cliente, Producto, Cantidad, Precio</li>
                <li>• Máximo 10,000 registros por archivo</li>
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

          <div className="space-y-2">
            <h4 className="font-medium">Validaciones:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Fechas en formato DD/MM/YYYY</li>
              <li>• Montos sin símbolos de moneda</li>
              <li>• Clientes deben existir en el sistema</li>
              <li>• XML debe cumplir con estructura de factura electrónica</li>
            </ul>
          </div>

          <Button variant="outline" className="w-full bg-transparent">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Ver Ejemplo de Plantilla
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Cargas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">ventas_marzo_2024.xlsx</p>
                  <p className="text-sm text-muted-foreground">1,245 registros procesados</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">15/03/2024</p>
                <p className="text-sm text-muted-foreground">10:30 AM</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
