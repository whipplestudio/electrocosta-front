"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Download, Settings, Play, Pause, Trash2 } from "lucide-react"

export default function ReportesDescargablesPage() {
  const [formatoSeleccionado, setFormatoSeleccionado] = useState("excel")
  const [progreso, setProgreso] = useState(0)
  const [generando, setGenerando] = useState(false)

  const tiposReporte = [
    {
      id: "cuentas-cobrar",
      nombre: "Cuentas por Cobrar",
      descripcion: "Reporte detallado de todas las cuentas pendientes de cobro",
      icono: "💰",
      seleccionado: true,
    },
    {
      id: "cuentas-pagar",
      nombre: "Cuentas por Pagar",
      descripcion: "Listado completo de obligaciones pendientes de pago",
      icono: "💳",
      seleccionado: true,
    },
    {
      id: "flujo-efectivo",
      nombre: "Flujo de Efectivo",
      descripcion: "Análisis de entradas y salidas de efectivo por período",
      icono: "📊",
      seleccionado: false,
    },
    {
      id: "estado-resultados",
      nombre: "Estado de Resultados",
      descripcion: "Reporte financiero de ingresos, gastos y utilidades",
      icono: "📈",
      seleccionado: false,
    },
    {
      id: "antiguedad-saldos",
      nombre: "Antigüedad de Saldos",
      descripcion: "Análisis de vencimientos de cuentas por cobrar",
      icono: "⏰",
      seleccionado: false,
    },
  ]

  const reportesProgramados = [
    {
      id: "PROG-001",
      nombre: "Reporte Mensual de Cuentas",
      frecuencia: "Mensual",
      proximaEjecucion: "2024-02-01",
      formato: "Excel",
      estado: "activo",
      ultimaEjecucion: "2024-01-01",
    },
    {
      id: "PROG-002",
      nombre: "Flujo de Efectivo Semanal",
      frecuencia: "Semanal",
      proximaEjecucion: "2024-01-22",
      formato: "PDF",
      estado: "pausado",
      ultimaEjecucion: "2024-01-15",
    },
    {
      id: "PROG-003",
      nombre: "Estado Financiero Trimestral",
      frecuencia: "Trimestral",
      proximaEjecucion: "2024-04-01",
      formato: "Excel + PDF",
      estado: "activo",
      ultimaEjecucion: "2024-01-01",
    },
  ]

  const reportesGenerados = [
    {
      id: "GEN-001",
      nombre: "Cuentas por Cobrar - Enero 2024",
      fechaGeneracion: "2024-01-15 14:30",
      formato: "Excel",
      tamaño: "2.3 MB",
      descargas: 5,
      estado: "disponible",
    },
    {
      id: "GEN-002",
      nombre: "Flujo de Efectivo - Semana 2",
      fechaGeneracion: "2024-01-14 09:15",
      formato: "PDF",
      tamaño: "1.8 MB",
      descargas: 12,
      estado: "disponible",
    },
    {
      id: "GEN-003",
      nombre: "Estado de Resultados - Q4 2023",
      fechaGeneracion: "2024-01-10 16:45",
      formato: "Excel",
      tamaño: "3.1 MB",
      descargas: 8,
      estado: "expirado",
    },
  ]

  const estadoColors = {
    activo: "bg-green-100 text-green-800",
    pausado: "bg-yellow-100 text-yellow-800",
    inactivo: "bg-gray-100 text-gray-800",
    disponible: "bg-blue-100 text-blue-800",
    expirado: "bg-red-100 text-red-800",
  }

  const handleGenerarReporte = () => {
    setGenerando(true)
    setProgreso(0)

    const interval = setInterval(() => {
      setProgreso((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setGenerando(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const handleToggleReporte = (id: string) => {
    // Lógica para activar/pausar reporte programado
    console.log(`Toggling reporte ${id}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes Descargables</h1>
        <p className="text-gray-600">Genera y descarga reportes en múltiples formatos</p>
      </div>

      {/* Generación de Reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Generar Nuevo Reporte</CardTitle>
          <CardDescription>Selecciona los tipos de reporte y formato para generar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selección de Reportes */}
          <div>
            <h4 className="font-medium mb-3">Tipos de Reporte</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tiposReporte.map((tipo) => (
                <div key={tipo.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox id={tipo.id} checked={tipo.seleccionado} onCheckedChange={() => {}} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tipo.icono}</span>
                      <label htmlFor={tipo.id} className="font-medium cursor-pointer">
                        {tipo.nombre}
                      </label>
                    </div>
                    <p className="text-sm text-gray-600">{tipo.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuración */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Formato</label>
              <Select value={formatoSeleccionado} onValueChange={setFormatoSeleccionado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                  <SelectItem value="todos">Todos los formatos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Período</label>
              <Select defaultValue="mes-actual">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes-actual">Mes Actual</SelectItem>
                  <SelectItem value="mes-anterior">Mes Anterior</SelectItem>
                  <SelectItem value="trimestre">Trimestre</SelectItem>
                  <SelectItem value="año">Año Completo</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Incluir Gráficos</label>
              <Select defaultValue="si">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="si">Sí, incluir gráficos</SelectItem>
                  <SelectItem value="no">Solo datos</SelectItem>
                  <SelectItem value="separado">Archivo separado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botón de Generación y Progreso */}
          <div className="space-y-4">
            <Button onClick={handleGenerarReporte} disabled={generando} className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              {generando ? "Generando..." : "Generar Reporte"}
            </Button>

            {generando && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generando reporte...</span>
                  <span>{progreso}%</span>
                </div>
                <Progress value={progreso} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reportes Programados */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Programados</CardTitle>
          <CardDescription>Configura reportes automáticos que se generen periódicamente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="outline" className="mb-4 bg-transparent">
              <Settings className="h-4 w-4 mr-2" />
              Nuevo Reporte Programado
            </Button>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Frecuencia</TableHead>
                  <TableHead>Próxima Ejecución</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportesProgramados.map((reporte) => (
                  <TableRow key={reporte.id}>
                    <TableCell className="font-medium">{reporte.nombre}</TableCell>
                    <TableCell>{reporte.frecuencia}</TableCell>
                    <TableCell>{reporte.proximaEjecucion}</TableCell>
                    <TableCell>{reporte.formato}</TableCell>
                    <TableCell>
                      <Badge className={estadoColors[reporte.estado as keyof typeof estadoColors]}>
                        {reporte.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleToggleReporte(reporte.id)}>
                          {reporte.estado === "activo" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
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

      {/* Reportes Generados */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Disponibles para Descarga</CardTitle>
          <CardDescription>Historial de reportes generados y disponibles para descarga</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Reporte</TableHead>
                <TableHead>Fecha de Generación</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Descargas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportesGenerados.map((reporte) => (
                <TableRow key={reporte.id}>
                  <TableCell className="font-medium">{reporte.nombre}</TableCell>
                  <TableCell>{reporte.fechaGeneracion}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{reporte.formato}</Badge>
                  </TableCell>
                  <TableCell>{reporte.tamaño}</TableCell>
                  <TableCell>{reporte.descargas}</TableCell>
                  <TableCell>
                    <Badge className={estadoColors[reporte.estado as keyof typeof estadoColors]}>
                      {reporte.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {reporte.estado === "disponible" ? (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        No disponible
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
