"use client"

import { useState, useEffect, useCallback } from "react"
import { reportsService, type DashboardData, type DueDateReportResponse } from "@/services/reports.service"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Download, AlertTriangle, Clock, TrendingDown, DollarSign } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import * as XLSX from 'xlsx'


export default function ReportesCuentasPagar() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [dueDateReport, setDueDateReport] = useState<DueDateReportResponse | null>(null)
  const [periodoFilter, setPeriodoFilter] = useState("mes_actual")
  const [categoriaFilter, setCategoriaFilter] = useState("todas")

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [dashboard, dueDate] = await Promise.all([
        reportsService.getDashboardData(),
        reportsService.getDueDateReport({ daysInAdvance: 7 })
      ])
      setDashboardData(dashboard)
      setDueDateReport(dueDate)
    } catch (error) {
      console.error('Error al cargar reportes:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los reportes"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading || !dashboardData || !dueDateReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Combinar overdue y upcoming
  const allAccounts = [
    ...dueDateReport.overdue.map(acc => ({
      ...acc,
      estado: 'vencido' as const,
      diasVencimiento: acc.daysOverdue || 0
    })),
    ...dueDateReport.upcoming.map(acc => ({
      ...acc,
      estado: acc.daysUntilDue === 0 ? 'hoy' as const : 'proximo' as const,
      diasVencimiento: -(acc.daysUntilDue || 0)
    }))
  ]

  const estadoBadgeVariant = {
    vencido: "destructive",
    hoy: "secondary",
    proximo: "default",
  } as const

  // Función para exportar a Excel
  const handleExportReport = () => {
    try {
      // Preparar datos para exportar
      const dataToExport = allAccounts.map(item => ({
        'Proveedor': item.supplierName || item.supplier?.name || 'N/A',
        'Factura': item.invoiceNumber,
        'Monto': Number(item.amount),
        'Fecha de Vencimiento': formatDate(item.dueDate),
        'Estado': item.estado === 'vencido' ? 'Vencido' : item.estado === 'hoy' ? 'Vence Hoy' : 'Próximo',
        'Categoría': item.category?.name || 'N/A',
        'Días': item.estado === 'vencido' 
          ? `${item.daysOverdue} días vencido` 
          : item.daysUntilDue === 0 
            ? 'Vence hoy' 
            : `Vence en ${item.daysUntilDue} días`
      }))

      // Crear libro de trabajo
      const ws = XLSX.utils.json_to_sheet(dataToExport)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte de Vencimientos')

      // Generar nombre de archivo con fecha
      const fecha = new Date().toLocaleDateString('es-MX').replace(/\//g, '-')
      const fileName = `Reporte_Vencimientos_${fecha}.xlsx`

      // Descargar archivo
      XLSX.writeFile(wb, fileName)

      toast({
        title: "✅ Éxito",
        description: "Reporte exportado exitosamente"
      })
    } catch (error) {
      console.error('Error al exportar:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al exportar el reporte"
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes de Vencimientos</h1>
          <p className="text-muted-foreground">Análisis y seguimiento de cuentas por pagar</p>
        </div>
        <Button onClick={handleExportReport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencido</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${Number(dashboardData.keyMetrics.totalOverdue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pago inmediato requerido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vence Hoy</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">${Number(dueDateReport.summary.upcomingAmount).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Programar pago hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos 7 días</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{dashboardData.keyMetrics.upcomingThisWeek}</div>
            <p className="text-xs text-muted-foreground">pagos a planificar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mes</CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              ${Number(dashboardData.keyMetrics.totalPayable).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Enero 2024</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vencimientos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vencimientos">Vencimientos</TabsTrigger>
          <TabsTrigger value="analisis">Análisis Temporal</TabsTrigger>
          <TabsTrigger value="categorias">Por Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="vencimientos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reporte de Vencimientos</CardTitle>
              <CardDescription>Cuentas por pagar organizadas por fecha de vencimiento</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              <div className="flex gap-4 mb-6">
                <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mes_actual">Mes actual</SelectItem>
                    <SelectItem value="trimestre">Trimestre</SelectItem>
                    <SelectItem value="semestre">Semestre</SelectItem>
                    <SelectItem value="año">Año completo</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las categorías</SelectItem>
                    <SelectItem value="Materiales">Materiales</SelectItem>
                    <SelectItem value="Servicios">Servicios</SelectItem>
                    <SelectItem value="Oficina">Oficina</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tabla de vencimientos */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Factura</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Días</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allAccounts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No hay cuentas pendientes
                        </TableCell>
                      </TableRow>
                    ) : (
                      allAccounts.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.supplierName || item.supplier?.name || 'N/A'}</TableCell>
                          <TableCell>{item.invoiceNumber}</TableCell>
                          <TableCell>${Number(item.amount).toLocaleString()}</TableCell>
                          <TableCell>{formatDate(item.dueDate)}</TableCell>
                          <TableCell>
                            <Badge variant={estadoBadgeVariant[item.estado as keyof typeof estadoBadgeVariant]}>
                              {item.estado === "vencido" ? "Vencido" : item.estado === "hoy" ? "Vence Hoy" : "Próximo"}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.category?.name || 'N/A'}</TableCell>
                          <TableCell>
                            {item.estado === 'vencido'
                              ? `+${item.diasVencimiento}`
                              : item.diasVencimiento === 0
                                ? "Hoy"
                                : `${item.diasVencimiento} días`}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analisis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Vencimiento</CardTitle>
                <CardDescription>Montos por estado de vencimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.agingDistribution.map(item => ({
                        name: item.label,
                        value: Number(item.value),
                        color: item.label.includes('Vencido') ? '#ef4444' : 
                               item.label.includes('1-30') ? '#f97316' :
                               item.label.includes('31-60') ? '#eab308' : '#22c55e'
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dashboardData.agingDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={[
                          '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'
                        ][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Monto"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendencia Mensual</CardTitle>
                <CardDescription>Vencidos vs Pagados por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.categoryBreakdown.slice(0, 4).map(cat => ({
                    mes: cat.category.substring(0, 3),
                    monto: Number(cat.amount),
                    count: cat.count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
                    <Bar dataKey="monto" fill="#3b82f6" name="Monto" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categorias">
          <Card>
            <CardHeader>
              <CardTitle>Análisis por Categorías</CardTitle>
              <CardDescription>Distribución de pagos por tipo de gasto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {dashboardData.categoryBreakdown.slice(0, 3).map((cat) => (
                    <div key={cat.category} className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">{cat.category}</h3>
                      <p className="text-2xl font-bold">${Number(cat.amount).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{cat.percentage.toFixed(1)}% del total</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
