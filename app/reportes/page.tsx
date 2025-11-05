"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CalendarIcon,
  Download,
  FileSpreadsheet,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building,
  Clock,
  Filter,
  Play,
  Eye,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Reporte {
  id: string
  nombre: string
  descripcion: string
  categoria: "financiero" | "operativo" | "comercial"
  tipo: "excel" | "csv" | "pdf"
  fechaCreacion: string
  usuario: string
  estado: "generando" | "completado" | "error"
  tamaño?: string
}

interface ReporteTemplate {
  id: string
  nombre: string
  descripcion: string
  categoria: "financiero" | "operativo" | "comercial"
  icono: any
  campos: string[]
  filtros: string[]
}

const mockReportes: Reporte[] = [
  {
    id: "1",
    nombre: "Cuentas por Cobrar - Enero 2024",
    descripcion: "Reporte detallado de cuentas pendientes de cobro",
    categoria: "financiero",
    tipo: "excel",
    fechaCreacion: "2024-01-15 14:30",
    usuario: "María González",
    estado: "completado",
    tamaño: "2.3 MB",
  },
  {
    id: "2",
    nombre: "Análisis de Ventas por Cliente",
    descripcion: "Ranking de clientes por volumen de ventas",
    categoria: "comercial",
    tipo: "pdf",
    fechaCreacion: "2024-01-14 10:15",
    usuario: "Carlos Rodríguez",
    estado: "completado",
    tamaño: "1.8 MB",
  },
  {
    id: "3",
    nombre: "Flujo de Caja Mensual",
    descripcion: "Proyección de ingresos y egresos",
    categoria: "financiero",
    tipo: "excel",
    fechaCreacion: "2024-01-13 16:45",
    usuario: "Juan Pérez",
    estado: "generando",
  },
]

const reporteTemplates: ReporteTemplate[] = [
  {
    id: "cuentas_cobrar",
    nombre: "Cuentas por Cobrar",
    descripcion: "Reporte detallado de facturas pendientes de cobro",
    categoria: "financiero",
    icono: TrendingUp,
    campos: ["Cliente", "Factura", "Monto", "Fecha Vencimiento", "Días Vencido", "Estado"],
    filtros: ["Rango de fechas", "Estado", "Cliente", "Monto mínimo"],
  },
  {
    id: "cuentas_pagar",
    nombre: "Cuentas por Pagar",
    descripcion: "Obligaciones pendientes de pago a proveedores",
    categoria: "financiero",
    icono: TrendingDown,
    campos: ["Proveedor", "Factura", "Monto", "Fecha Vencimiento", "Estado", "Método Pago"],
    filtros: ["Rango de fechas", "Estado", "Proveedor", "Categoría"],
  },
  {
    id: "flujo_caja",
    nombre: "Flujo de Caja",
    descripcion: "Análisis de ingresos y egresos por período",
    categoria: "financiero",
    icono: DollarSign,
    campos: ["Fecha", "Concepto", "Ingresos", "Egresos", "Saldo Acumulado"],
    filtros: ["Rango de fechas", "Tipo de movimiento", "Categoría"],
  },
  {
    id: "ventas_cliente",
    nombre: "Ventas por Cliente",
    descripcion: "Análisis de ventas segmentado por cliente",
    categoria: "comercial",
    icono: Users,
    campos: ["Cliente", "Total Ventas", "Número Facturas", "Promedio Factura", "Última Compra"],
    filtros: ["Rango de fechas", "Cliente", "Monto mínimo"],
  },
  {
    id: "antiguedad_saldos",
    nombre: "Antigüedad de Saldos",
    descripción: "Análisis de vencimientos de cuentas por cobrar",
    categoria: "financiero",
    icono: Clock,
    campos: ["Cliente", "0-30 días", "31-60 días", "61-90 días", "+90 días", "Total"],
    filtros: ["Fecha de corte", "Cliente"],
  },
  {
    id: "proveedores",
    nombre: "Análisis de Proveedores",
    descripcion: "Reporte de compras y pagos a proveedores",
    categoria: "operativo",
    icono: Building,
    campos: ["Proveedor", "Total Compras", "Pagos Realizados", "Saldo Pendiente", "Días Promedio Pago"],
    filtros: ["Rango de fechas", "Proveedor", "Estado"],
  },
]

export default function ReportesPage() {
  const [reportes, setReportes] = useState<Reporte[]>(mockReportes)
  const [reporteSeleccionado, setReporteSeleccionado] = useState<string>("")
  const [formatoSeleccionado, setFormatoSeleccionado] = useState<string>("excel")
  const [fechaDesde, setFechaDesde] = useState<Date>()
  const [fechaHasta, setFechaHasta] = useState<Date>()
  const [filtros, setFiltros] = useState<Record<string, any>>({})
  const [generando, setGenerando] = useState(false)

  const handleGenerarReporte = async () => {
    if (!reporteSeleccionado) return

    setGenerando(true)

    // Simular generación de reporte
    setTimeout(() => {
      const template = reporteTemplates.find((t) => t.id === reporteSeleccionado)
      if (template) {
        const nuevoReporte: Reporte = {
          id: Date.now().toString(),
          nombre: `${template.nombre} - ${format(new Date(), "dd/MM/yyyy")}`,
          descripcion: template.descripcion,
          categoria: template.categoria,
          tipo: formatoSeleccionado as "excel" | "csv" | "pdf",
          fechaCreacion: new Date().toLocaleString(),
          usuario: "Usuario Actual",
          estado: "completado",
          tamaño: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
        }
        setReportes((prev) => [nuevoReporte, ...prev])
      }
      setGenerando(false)
    }, 3000)
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "completado":
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>
      case "generando":
        return <Badge className="bg-blue-100 text-blue-800">Generando</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const getCategoriaBadge = (categoria: string) => {
    const colores = {
      financiero: "bg-blue-100 text-blue-800",
      operativo: "bg-green-100 text-green-800",
      comercial: "bg-purple-100 text-purple-800",
    }
    return (
      <Badge className={colores[categoria as keyof typeof colores]}>
        {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
      </Badge>
    )
  }

  const descargarReporte = (reporte: Reporte) => {
    console.log(`Descargando reporte: ${reporte.nombre}`)
  }

  const templateSeleccionado = reporteTemplates.find((t) => t.id === reporteSeleccionado)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Reportes</h1>
          <p className="text-muted-foreground">Genera y descarga reportes financieros y operativos</p>
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generar Reportes</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="scheduled">Reportes Programados</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Selección de reporte */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Seleccionar Tipo de Reporte</CardTitle>
                  <CardDescription>Elige el reporte que deseas generar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reporteTemplates.map((template) => {
                      const Icon = template.icono
                      return (
                        <div
                          key={template.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            reporteSeleccionado === template.id
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setReporteSeleccionado(template.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 text-primary mt-1" />
                            <div className="flex-1">
                              <h3 className="font-medium">{template.nombre}</h3>
                              <p className="text-sm text-gray-600 mt-1">{template.descripcion}</p>
                              <div className="mt-2">{getCategoriaBadge(template.categoria)}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {templateSeleccionado && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Configurar Filtros
                    </CardTitle>
                    <CardDescription>Personaliza los parámetros del reporte</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Fecha Desde</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal bg-transparent"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {fechaDesde ? format(fechaDesde, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={fechaDesde} onSelect={setFechaDesde} />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha Hasta</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal bg-transparent"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {fechaHasta ? format(fechaHasta, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={fechaHasta} onSelect={setFechaHasta} />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {templateSeleccionado.filtros.includes("Estado") && (
                      <div className="space-y-2">
                        <Label>Estado</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos los estados" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="vigente">Vigente</SelectItem>
                            <SelectItem value="vencido">Vencido</SelectItem>
                            <SelectItem value="pagado">Pagado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {templateSeleccionado.filtros.includes("Cliente") && (
                      <div className="space-y-2">
                        <Label>Cliente Específico</Label>
                        <Input placeholder="Buscar cliente..." />
                      </div>
                    )}

                    {templateSeleccionado.filtros.includes("Monto mínimo") && (
                      <div className="space-y-2">
                        <Label>Monto Mínimo</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Panel de configuración */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Exportación</CardTitle>
                  <CardDescription>Selecciona el formato de salida</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Formato de Archivo</Label>
                    <Select value={formatoSeleccionado} onValueChange={setFormatoSeleccionado}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excel">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            Excel (.xlsx)
                          </div>
                        </SelectItem>
                        <SelectItem value="csv">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            CSV (.csv)
                          </div>
                        </SelectItem>
                        <SelectItem value="pdf">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            PDF (.pdf)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Opciones Adicionales</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="incluir_graficos" />
                        <Label htmlFor="incluir_graficos" className="text-sm">
                          Incluir gráficos
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="incluir_totales" defaultChecked />
                        <Label htmlFor="incluir_totales" className="text-sm">
                          Incluir totales
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="agrupar_categoria" />
                        <Label htmlFor="agrupar_categoria" className="text-sm">
                          Agrupar por categoría
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerarReporte}
                    disabled={!reporteSeleccionado || generando}
                    className="w-full"
                  >
                    {generando ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Generar Reporte
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {templateSeleccionado && (
                <Card>
                  <CardHeader>
                    <CardTitle>Vista Previa</CardTitle>
                    <CardDescription>Campos que incluirá el reporte</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {templateSeleccionado.campos.map((campo, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          {campo}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Reportes</CardTitle>
              <CardDescription>Reportes generados recientemente</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre del Reporte</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportes.map((reporte) => (
                    <TableRow key={reporte.id}>
                      <TableCell className="font-medium">{reporte.nombre}</TableCell>
                      <TableCell>{getCategoriaBadge(reporte.categoria)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{reporte.tipo.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>{reporte.fechaCreacion}</TableCell>
                      <TableCell>{reporte.usuario}</TableCell>
                      <TableCell>{getEstadoBadge(reporte.estado)}</TableCell>
                      <TableCell>{reporte.tamaño || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => descargarReporte(reporte)}
                            disabled={reporte.estado !== "completado"}
                          >
                            <Download className="h-4 w-4" />
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

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Programados</CardTitle>
              <CardDescription>Configura reportes automáticos periódicos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Próximamente</h3>
                <p className="text-gray-600 mb-4">
                  La funcionalidad de reportes programados estará disponible en una próxima actualización.
                </p>
                <Button variant="outline">Solicitar Acceso Beta</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
