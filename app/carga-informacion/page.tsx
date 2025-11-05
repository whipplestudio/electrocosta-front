"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle, AlertCircle, Clock, Download, Eye, Trash2, FileSpreadsheet } from "lucide-react"

interface ArchivoSubido {
  id: string
  nombre: string
  tipo: "ventas" | "anticipos" | "proyectos"
  fechaSubida: string
  estado: "procesando" | "completado" | "error"
  registros: number
  errores: number
  usuario: string
}

const mockArchivos: ArchivoSubido[] = [
  {
    id: "1",
    nombre: "ventas_enero_2024.xlsx",
    tipo: "ventas",
    fechaSubida: "2024-01-15 10:30",
    estado: "completado",
    registros: 150,
    errores: 0,
    usuario: "María González",
  },
  {
    id: "2",
    nombre: "anticipos_clientes.csv",
    tipo: "anticipos",
    fechaSubida: "2024-01-14 16:45",
    estado: "completado",
    registros: 45,
    errores: 2,
    usuario: "Carlos Rodríguez",
  },
  {
    id: "3",
    nombre: "proyectos_construccion.xlsx",
    tipo: "proyectos",
    fechaSubida: "2024-01-13 09:15",
    estado: "procesando",
    registros: 0,
    errores: 0,
    usuario: "Juan Pérez",
  },
]

export default function CargaInformacionPage() {
  const [archivos, setArchivos] = useState<ArchivoSubido[]>(mockArchivos)
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>("")
  const [progresoCarga, setProgresoCarga] = useState(0)
  const [cargando, setCargando] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setArchivoSeleccionado(file)
    }
  }

  const handleUpload = async () => {
    if (!archivoSeleccionado || !tipoSeleccionado) return

    setCargando(true)
    setProgresoCarga(0)

    // Simular progreso de carga
    const interval = setInterval(() => {
      setProgresoCarga((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setCargando(false)
          // Agregar archivo a la lista
          const nuevoArchivo: ArchivoSubido = {
            id: Date.now().toString(),
            nombre: archivoSeleccionado.name,
            tipo: tipoSeleccionado as "ventas" | "anticipos" | "proyectos",
            fechaSubida: new Date().toLocaleString(),
            estado: "completado",
            registros: Math.floor(Math.random() * 200) + 50,
            errores: Math.floor(Math.random() * 5),
            usuario: "Usuario Actual",
          }
          setArchivos((prev) => [nuevoArchivo, ...prev])
          setArchivoSeleccionado(null)
          setTipoSeleccionado("")
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "completado":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completado
          </Badge>
        )
      case "procesando":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Procesando
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const getTipoBadge = (tipo: string) => {
    const colores = {
      ventas: "bg-blue-100 text-blue-800",
      anticipos: "bg-purple-100 text-purple-800",
      proyectos: "bg-orange-100 text-orange-800",
    }
    return (
      <Badge className={colores[tipo as keyof typeof colores]}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</Badge>
    )
  }

  const descargarPlantilla = (tipo: string) => {
    console.log(`Descargando plantilla para ${tipo}...`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carga de Información por Área</h1>
          <p className="text-muted-foreground">Importa datos de ventas, anticipos y proyectos</p>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Subir Archivos</TabsTrigger>
          <TabsTrigger value="history">Historial de Cargas</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulario de carga */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Subir Nuevo Archivo
                </CardTitle>
                <CardDescription>Selecciona el archivo y el tipo de información a cargar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Información</Label>
                  <Select value={tipoSeleccionado} onValueChange={setTipoSeleccionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ventas">Ventas</SelectItem>
                      <SelectItem value="anticipos">Anticipos</SelectItem>
                      <SelectItem value="proyectos">Proyectos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="archivo">Archivo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="archivo"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="archivo" className="cursor-pointer">
                      <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        {archivoSeleccionado ? archivoSeleccionado.name : "Haz clic para seleccionar un archivo"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Formatos soportados: Excel (.xlsx, .xls) y CSV</p>
                    </label>
                  </div>
                </div>

                {cargando && (
                  <div className="space-y-2">
                    <Label>Progreso de Carga</Label>
                    <Progress value={progresoCarga} className="w-full" />
                    <p className="text-sm text-gray-600">{progresoCarga}% completado</p>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!archivoSeleccionado || !tipoSeleccionado || cargando}
                  className="w-full"
                >
                  {cargando ? "Cargando..." : "Subir Archivo"}
                </Button>
              </CardContent>
            </Card>

            {/* Instrucciones */}
            <Card>
              <CardHeader>
                <CardTitle>Instrucciones de Carga</CardTitle>
                <CardDescription>Sigue estas pautas para una carga exitosa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Descarga la plantilla</h4>
                      <p className="text-sm text-gray-600">
                        Usa las plantillas oficiales para asegurar el formato correcto
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Completa los datos</h4>
                      <p className="text-sm text-gray-600">Llena todos los campos obligatorios marcados en rojo</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Verifica los formatos</h4>
                      <p className="text-sm text-gray-600">
                        Fechas en formato DD/MM/AAAA, montos sin símbolos de moneda
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">Sube el archivo</h4>
                      <p className="text-sm text-gray-600">Selecciona el tipo correcto antes de subir</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Importante</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Los archivos con errores se procesarán parcialmente. Revisa el reporte de errores después de la
                    carga.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Cargas</CardTitle>
              <CardDescription>Revisa el estado de todas las cargas realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha de Carga</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Registros</TableHead>
                    <TableHead>Errores</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivos.map((archivo) => (
                    <TableRow key={archivo.id}>
                      <TableCell className="font-medium">{archivo.nombre}</TableCell>
                      <TableCell>{getTipoBadge(archivo.tipo)}</TableCell>
                      <TableCell>{archivo.fechaSubida}</TableCell>
                      <TableCell>{getEstadoBadge(archivo.estado)}</TableCell>
                      <TableCell>{archivo.registros}</TableCell>
                      <TableCell>
                        {archivo.errores > 0 ? (
                          <span className="text-red-600 font-medium">{archivo.errores}</span>
                        ) : (
                          <span className="text-green-600">0</span>
                        )}
                      </TableCell>
                      <TableCell>{archivo.usuario}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Plantilla de Ventas
                </CardTitle>
                <CardDescription>Formato para cargar información de ventas y facturación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p>Campos incluidos:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Cliente</li>
                    <li>Número de factura</li>
                    <li>Fecha de emisión</li>
                    <li>Fecha de vencimiento</li>
                    <li>Monto total</li>
                    <li>Estado de pago</li>
                  </ul>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => descargarPlantilla("ventas")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Plantilla
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  Plantilla de Anticipos
                </CardTitle>
                <CardDescription>Formato para registrar anticipos de clientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p>Campos incluidos:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Cliente</li>
                    <li>Monto del anticipo</li>
                    <li>Fecha de recepción</li>
                    <li>Proyecto asociado</li>
                    <li>Estado del anticipo</li>
                    <li>Observaciones</li>
                  </ul>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => descargarPlantilla("anticipos")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Plantilla
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  Plantilla de Proyectos
                </CardTitle>
                <CardDescription>Formato para información de proyectos y contratos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p>Campos incluidos:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Nombre del proyecto</li>
                    <li>Cliente</li>
                    <li>Valor del contrato</li>
                    <li>Fecha de inicio</li>
                    <li>Fecha estimada de fin</li>
                    <li>Estado del proyecto</li>
                  </ul>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => descargarPlantilla("proyectos")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Plantilla
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Especificaciones Técnicas</CardTitle>
              <CardDescription>Requisitos y limitaciones para la carga de archivos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Formatos Soportados</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Excel (.xlsx, .xls)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      CSV (separado por comas)
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Máximo 10 MB por archivo
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Máximo 5,000 registros por archivo
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Validaciones</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Validación de formatos de fecha
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Verificación de campos obligatorios
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Detección de duplicados
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Validación de rangos numéricos
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
