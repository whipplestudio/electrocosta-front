"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { reportsService } from "@/services/reports.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { FileText, Download, TrendingUp, DollarSign, AlertCircle } from "lucide-react"

export default function ReportesDetalladosPage() {
  const { toast } = useToast()
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("mes-actual")
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas")
  const [loading, setLoading] = useState(false)

  // Estados para datos del backend
  const [metricas, setMetricas] = useState<any>(null)
  const [datosVentas, setDatosVentas] = useState<any[]>([])
  const [datosCategoria, setDatosCategoria] = useState<any[]>([])
  const [flujoEfectivo, setFlujoEfectivo] = useState<any[]>([])
  const [reportesDetallados, setReportesDetallados] = useState<any[]>([])

  // Cargar análisis financiero
  const cargarAnalisisFinanciero = async () => {
    try {
      setLoading(true)
      const data = await reportsService.getFinancialAnalysis({ periodo: periodoSeleccionado })
      setMetricas(data.metricas)
    } catch (error) {
      console.error('Error al cargar análisis financiero:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar el análisis financiero"
      })
    } finally {
      setLoading(false)
    }
  }

  // Cargar gráfico financiero
  const cargarGraficoFinanciero = async () => {
    try {
      const data = await reportsService.getFinancialChart({ periodo: periodoSeleccionado })
      setDatosVentas(data || [])
    } catch (error) {
      console.error('Error al cargar gráfico financiero:', error)
    }
  }

  // Cargar flujo de efectivo
  const cargarFlujoEfectivo = async () => {
    try {
      const data = await reportsService.getCashFlowDetailed({ periodo: periodoSeleccionado })
      setFlujoEfectivo(data || [])
    } catch (error) {
      console.error('Error al cargar flujo de efectivo:', error)
    }
  }

  // Cargar análisis por categorías
  const cargarAnalisisPorCategoria = async () => {
    try {
      const data = await reportsService.getAnalysisByCategory({ periodo: periodoSeleccionado })
      setDatosCategoria(data || [])
    } catch (error) {
      console.error('Error al cargar análisis por categoría:', error)
    }
  }

  // Cargar reportes históricos
  const cargarReportesHistoricos = async () => {
    try {
      const data = await reportsService.getHistoricalReports({ 
        take: 50,
        categoria: categoriaSeleccionada !== 'todas' ? categoriaSeleccionada : undefined
      })
      setReportesDetallados(data.data || [])
    } catch (error) {
      console.error('Error al cargar reportes históricos:', error)
    }
  }

  // Cargar todos los datos al montar o cambiar periodo
  useEffect(() => {
    cargarAnalisisFinanciero()
    cargarGraficoFinanciero()
    cargarFlujoEfectivo()
    cargarAnalisisPorCategoria()
  }, [periodoSeleccionado])

  // Cargar reportes históricos al cambiar categoría
  useEffect(() => {
    cargarReportesHistoricos()
  }, [categoriaSeleccionada])

  const estadoColors = {
    completado: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    procesando: "bg-yellow-100 text-yellow-800",
    processing: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    failed: "bg-red-100 text-red-800",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes Detallados</h1>
        <p className="text-gray-600">Análisis profundo y reportes personalizados del sistema financiero</p>
      </div>

      {/* Controles de Filtro */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes-actual">Mes Actual</SelectItem>
                <SelectItem value="trimestre">Trimestre</SelectItem>
                <SelectItem value="semestre">Semestre</SelectItem>
                <SelectItem value="año">Año Completo</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las Categorías</SelectItem>
                <SelectItem value="financiero">Financiero</SelectItem>
                <SelectItem value="cobranza">Cobranza</SelectItem>
                <SelectItem value="pagos">Pagos</SelectItem>
                <SelectItem value="tesoreria">Tesorería</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              Generar Reporte
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Análisis */}
      <Tabs defaultValue="financiero" className="space-y-4">
        <TabsList>
          <TabsTrigger value="financiero">Análisis Financiero</TabsTrigger>
          <TabsTrigger value="flujo">Flujo de Efectivo</TabsTrigger>
          <TabsTrigger value="categorias">Por Categorías</TabsTrigger>
          <TabsTrigger value="historicos">Reportes Históricos</TabsTrigger>
        </TabsList>

        <TabsContent value="financiero" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ingresos Totales</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${((metricas?.ingresosTotales || 0) / 1000000).toFixed(2)}M
                    </p>
                    <p className={`text-xs ${(metricas?.variacionIngresos || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(metricas?.variacionIngresos || 0) >= 0 ? '+' : ''}{(metricas?.variacionIngresos || 0).toFixed(1)}% vs período anterior
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Gastos Totales</p>
                    <p className="text-2xl font-bold text-red-600">
                      ${((metricas?.gastosTotales || 0) / 1000000).toFixed(2)}M
                    </p>
                    <p className={`text-xs ${(metricas?.variacionGastos || 0) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {(metricas?.variacionGastos || 0) >= 0 ? '+' : ''}{(metricas?.variacionGastos || 0).toFixed(1)}% vs período anterior
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Utilidad Neta</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${((metricas?.utilidadNeta || 0) / 1000).toFixed(0)}K
                    </p>
                    <p className={`text-xs ${(metricas?.variacionUtilidad || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {(metricas?.variacionUtilidad || 0) >= 0 ? '+' : ''}{(metricas?.variacionUtilidad || 0).toFixed(1)}% vs período anterior
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Margen de Utilidad</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {(metricas?.margenUtilidad || 0).toFixed(1)}%
                    </p>
                    <p className="text-xs text-purple-600">
                      Del total de ingresos
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análisis de Ingresos vs Gastos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datosVentas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Bar dataKey="ventas" fill="#3B82F6" name="Ingresos" />
                  <Bar dataKey="gastos" fill="#EF4444" name="Gastos" />
                  <Bar dataKey="utilidad" fill="#10B981" name="Utilidad" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flujo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flujo de Efectivo Detallado</CardTitle>
              <CardDescription>Análisis diario de entradas y salidas de efectivo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={flujoEfectivo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Line type="monotone" dataKey="entrada" stroke="#10B981" name="Entradas" strokeWidth={2} />
                  <Line type="monotone" dataKey="salida" stroke="#EF4444" name="Salidas" strokeWidth={2} />
                  <Line type="monotone" dataKey="saldo" stroke="#3B82F6" name="Saldo Acumulado" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Gastos por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={datosCategoria}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {datosCategoria.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análisis por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {datosCategoria.map((categoria, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: categoria.color }} />
                        <span className="font-medium">{categoria.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{categoria.value}%</p>
                        <p className="text-sm text-gray-600">${(categoria.value * 23200).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="historicos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Generados</CardTitle>
              <CardDescription>Historial de reportes detallados generados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre del Reporte</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Fecha Generación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportesDetallados.map((reporte) => (
                    <TableRow key={reporte.id}>
                      <TableCell className="font-medium">{reporte.id}</TableCell>
                      <TableCell>{reporte.nombre}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{reporte.categoria}</Badge>
                      </TableCell>
                      <TableCell>{reporte.periodo}</TableCell>
                      <TableCell>{reporte.fechaGeneracion}</TableCell>
                      <TableCell>
                        <Badge className={estadoColors[reporte.estado as keyof typeof estadoColors]}>
                          {reporte.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>{reporte.tamaño}</TableCell>
                      <TableCell>
                        {reporte.estado === "completado" && (
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Descargar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
