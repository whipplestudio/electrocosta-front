"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { Download, TrendingUp, Calendar, DollarSign, Users, Loader2 } from "lucide-react"
import { accountsReceivableService } from "@/services/accounts-receivable.service"
import { clientsService, Client } from "@/services/clients.service"
import type { DashboardData, AgingReport } from "@/types/accounts-receivable"
import * as XLSX from 'xlsx'

interface AgingBucket {
  range: string
  amount: number
  count: number
}

export default function ReportesCuentasCobrar() {
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedClient, setSelectedClient] = useState("all")
  const [clients, setClients] = useState<Client[]>([])
  const [agingData, setAgingData] = useState<AgingBucket[]>([])
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)

  // Cargar clientes
  const loadClients = useCallback(async () => {
    try {
      const data = await clientsService.list()
      setClients(data)
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    }
  }, [])

  // Cargar dashboard
  const loadDashboard = useCallback(async () => {
    try {
      const data = await accountsReceivableService.getDashboard()
      setDashboard(data)
    } catch (error) {
      console.error('Error al cargar dashboard:', error)
      toast.error('Error al cargar el dashboard')
    }
  }, [])

  // Cargar reporte de antigüedad
  const loadAgingReport = useCallback(async () => {
    try {
      const cutoffDate = dateTo || new Date().toISOString().split('T')[0]
      const response = await accountsReceivableService.getAgingReport(
        selectedClient !== 'all' ? selectedClient : undefined,
        cutoffDate
      )
      
      // Transformar datos para el gráfico
      const buckets: AgingBucket[] = [
        { range: 'Corriente', amount: response.summary.current || 0, count: 0 },
        { range: '1-30 días', amount: response.summary.days1_30 || 0, count: 0 },
        { range: '31-60 días', amount: response.summary.days31_60 || 0, count: 0 },
        { range: '61-90 días', amount: response.summary.days61_90 || 0, count: 0 },
        { range: '91+ días', amount: response.summary.over90 || 0, count: 0 },
      ]
      
      setAgingData(buckets)
    } catch (error) {
      console.error('Error al cargar reporte de antigüedad:', error)
      toast.error('Error al cargar el reporte de antigüedad')
    }
  }, [selectedClient, dateTo])

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          loadClients(),
          loadDashboard(),
          loadAgingReport(),
        ])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [loadClients, loadDashboard, loadAgingReport])

  // Aplicar filtros
  const handleApplyFilters = () => {
    loadAgingReport()
    loadDashboard()
  }

  // Exportar reporte de antigüedad a Excel
  const exportAgingToExcel = () => {
    try {
      // Preparar datos para Excel
      const excelData = agingData.map(item => ({
        'Período': item.range,
        'Monto': item.amount,
        'Porcentaje': totalAmount > 0 
          ? `${((item.amount / totalAmount) * 100).toFixed(1)}%` 
          : '0.0%'
      }))

      // Agregar fila de total
      excelData.push({
        'Período': 'TOTAL',
        'Monto': totalAmount,
        'Porcentaje': '100%'
      })

      // Crear worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData)

      // Ajustar anchos de columnas
      worksheet['!cols'] = [
        { wch: 15 }, // Período
        { wch: 15 }, // Monto
        { wch: 12 }, // Porcentaje
      ]

      // Crear workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Antigüedad de Saldos')

      // Agregar hoja de KPIs
      const kpiData = [
        { 'Indicador': 'Total por Cobrar', 'Valor': `$${(dashboard?.totalPending || 0).toLocaleString()}` },
        { 'Indicador': 'Días Promedio', 'Valor': `${Math.round(dashboard?.averageCollectionDays || 0)} días` },
        { 'Indicador': 'Efectividad', 'Valor': dashboard && dashboard.totalPending > 0 
            ? `${((dashboard.totalCollected / (dashboard.totalCollected + dashboard.totalPending)) * 100).toFixed(1)}%`
            : '0.0%' },
        { 'Indicador': 'Cuentas Vencidas', 'Valor': dashboard?.overdueCount || 0 },
        { 'Indicador': 'Monto Vencido', 'Valor': `$${(dashboard?.totalOverdue || 0).toLocaleString()}` },
      ]
      const kpiWorksheet = XLSX.utils.json_to_sheet(kpiData)
      kpiWorksheet['!cols'] = [{ wch: 20 }, { wch: 20 }]
      XLSX.utils.book_append_sheet(workbook, kpiWorksheet, 'KPIs')

      // Generar archivo
      const fileName = `Reporte_Antiguedad_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)

      toast.success('Reporte exportado exitosamente')
    } catch (error) {
      console.error('Error al exportar:', error)
      toast.error('Error al exportar el reporte')
    }
  }

  // Exportar todo (antigüedad + KPIs)
  const exportToExcel = (reportType: string) => {
    if (reportType === 'general' || reportType === 'antiguedad') {
      exportAgingToExcel()
    } else {
      toast.info(`Exportando reporte: ${reportType}`)
    }
  }

  // Calcular totales
  const totalAmount = agingData.reduce((sum, item) => sum + item.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reportes de Cuentas por Cobrar</h2>
          <p className="text-muted-foreground">Análisis detallado de cartera y cobranza</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => exportToExcel("general")}>
            <Download className="h-4 w-4" />
            Exportar Todo
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
          <CardDescription>Personalice el período y criterios del reporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Fecha Desde</Label>
              <Input 
                id="dateFrom" 
                type="date" 
                value={dateFrom} 
                onChange={(e) => setDateFrom(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Fecha Hasta</Label>
              <Input 
                id="dateTo" 
                type="date" 
                value={dateTo} 
                onChange={(e) => setDateTo(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={handleApplyFilters}>
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs de Reportes */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(dashboard?.totalPending || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total pendiente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Días Promedio</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(dashboard?.averageCollectionDays || 0)} días
            </div>
            <p className="text-xs text-muted-foreground">Promedio de cobro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efectividad</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard && dashboard.totalPending > 0 
                ? ((dashboard.totalCollected / (dashboard.totalCollected + dashboard.totalPending)) * 100).toFixed(1)
                : '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">Tasa de cobro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas Vencidas</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboard?.overdueCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              ${(dashboard?.totalOverdue || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ageing" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ageing">Antigüedad de Saldos</TabsTrigger>
        </TabsList>

        <TabsContent value="ageing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Antigüedad de Saldos
                  <Button size="sm" variant="outline" onClick={() => exportToExcel("antiguedad")}>
                    <Download className="h-3 w-3 mr-1" />
                    Excel
                  </Button>
                </CardTitle>
                <CardDescription>Distribución de cuentas por cobrar por antigüedad</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={agingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                      labelStyle={{ color: '#000' }}
                    />
                    <Bar dataKey="amount" fill="#0088FE" name="Monto" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalle por Período</CardTitle>
                <CardDescription>Montos por rango de antigüedad</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agingData.map((item) => (
                      <TableRow key={item.range}>
                        <TableCell className="font-medium">{item.range}</TableCell>
                        <TableCell>${item.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {totalAmount > 0 
                              ? ((item.amount / totalAmount) * 100).toFixed(1) 
                              : '0.0'}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell>Total</TableCell>
                      <TableCell>${totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge>100%</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
