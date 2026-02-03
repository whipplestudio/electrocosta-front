"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  BarChart3,
} from "lucide-react"
import { toast } from "sonner"
import { projectsService, type ProjectFinancialDashboard, type IncomeStatement } from "@/services/projects.service"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function ProyectoFinancieroPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [dashboard, setDashboard] = useState<ProjectFinancialDashboard | null>(null)
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const data = await projectsService.getFinancialDashboard(projectId)
      setDashboard(data)
    } catch (error) {
      console.error("Error al cargar dashboard:", error)
      toast.error("Error al cargar el dashboard financiero")
    } finally {
      setLoading(false)
    }
  }

  const fetchIncomeStatement = async () => {
    try {
      const data = await projectsService.getIncomeStatement(projectId)
      setIncomeStatement(data)
    } catch (error) {
      console.error("Error al cargar estado de resultados:", error)
      toast.error("Error al cargar el estado de resultados")
    }
  }

  const handleUpdateFinancials = async () => {
    try {
      setUpdating(true)
      await projectsService.updateFinancials(projectId)
      toast.success("Datos financieros actualizados")
      await fetchDashboard()
      await fetchIncomeStatement()
    } catch (error) {
      console.error("Error al actualizar:", error)
      toast.error("Error al actualizar los datos financieros")
    } finally {
      setUpdating(false)
    }
  }

  const handleCreateSnapshot = async () => {
    try {
      await projectsService.createSnapshot(projectId)
      toast.success("Snapshot financiero creado exitosamente")
    } catch (error) {
      console.error("Error al crear snapshot:", error)
      toast.error("Error al crear el snapshot")
    }
  }

  const handleDownloadExcel = async () => {
    try {
      await projectsService.downloadProjectExcel(projectId)
      toast.success("Reporte descargado exitosamente")
    } catch (error) {
      console.error("Error al descargar reporte:", error)
      toast.error("Error al descargar el reporte")
    }
  }

  useEffect(() => {
    fetchDashboard()
    fetchIncomeStatement()
  }, [projectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando datos financieros...</p>
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p className="text-muted-foreground">No se pudo cargar el dashboard</p>
        </div>
      </div>
    )
  }

  const getFinancialStatusBadge = (status: string) => {
    switch (status) {
      case "on_budget":
        return <Badge className="bg-green-100 text-green-800">Dentro del Presupuesto</Badge>
      case "over_budget":
        return <Badge variant="destructive">Sobre Presupuesto</Badge>
      case "under_budget":
        return <Badge className="bg-blue-100 text-blue-800">Bajo Presupuesto</Badge>
      case "at_risk":
        return <Badge className="bg-yellow-100 text-yellow-800">En Riesgo</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{dashboard.projectName}</h1>
            <p className="text-muted-foreground">Código: {dashboard.projectCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getFinancialStatusBadge(dashboard.financialStatus)}
          <Button variant="outline" size="sm" onClick={handleUpdateFinancials} disabled={updating}>
            <RefreshCw className={`h-4 w-4 mr-2 ${updating ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleCreateSnapshot}>
            <Download className="h-4 w-4 mr-2" />
            Snapshot
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
            <Download className="h-4 w-4 mr-2" />
            Descargar Excel
          </Button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presupuesto Inicial</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboard.initialBudget)}</div>
            <p className="text-xs text-muted-foreground">
              Contrato: {formatCurrency(dashboard.contractAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(dashboard.totalInvoiced)}</div>
            <p className="text-xs text-muted-foreground">
              Cobrado: {formatCurrency(dashboard.totalCollected)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egresos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(dashboard.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              Pagado: {formatCurrency(dashboard.paidExpenses)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dashboard.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(dashboard.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Margen: {dashboard.profitMargin.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="income">Ingresos</TabsTrigger>
          <TabsTrigger value="expenses">Egresos</TabsTrigger>
          <TabsTrigger value="statement">Estado de Resultados</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Uso de Presupuesto */}
            <Card>
              <CardHeader>
                <CardTitle>Uso de Presupuesto</CardTitle>
                <CardDescription>
                  {dashboard.budgetUsagePercentage.toFixed(2)}% del presupuesto utilizado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={Math.min(dashboard.budgetUsagePercentage, 100)} />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Presupuesto:</span>
                    <span className="font-medium">{formatCurrency(dashboard.initialBudget)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Gastado:</span>
                    <span className="font-medium">{formatCurrency(dashboard.totalExpenses)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-bold">
                    <span>Variación:</span>
                    <span className={dashboard.budgetVariance >= 0 ? "text-red-600" : "text-green-600"}>
                      {formatCurrency(Math.abs(dashboard.budgetVariance))}
                      {dashboard.budgetVariance >= 0 ? " sobre" : " bajo"}
                    </span>
                  </div>
                </div>
                {dashboard.isOverBudget && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-600">Proyecto sobre presupuesto</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Flujo de Efectivo */}
            <Card>
              <CardHeader>
                <CardTitle>Flujo de Efectivo</CardTitle>
                <CardDescription>Análisis de ingresos y egresos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Facturado</span>
                    <span className="font-medium text-green-600">{formatCurrency(dashboard.totalInvoiced)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cobrado</span>
                    <span className="font-medium text-green-700">{formatCurrency(dashboard.totalCollected)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pendiente cobro</span>
                    <span className="text-sm text-yellow-600">{formatCurrency(dashboard.pendingCollection)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total egresos</span>
                    <span className="font-medium text-red-600">{formatCurrency(dashboard.totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pagado</span>
                    <span className="font-medium text-red-700">{formatCurrency(dashboard.paidExpenses)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pendiente pago</span>
                    <span className="text-sm text-yellow-600">{formatCurrency(dashboard.pendingExpenses)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center font-bold">
                    <span>Utilidad Bruta</span>
                    <span className={dashboard.grossProfit >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(dashboard.grossProfit)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Income Tab */}
        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Ingresos</CardTitle>
              <CardDescription>Ingresos por categoría</CardDescription>
            </CardHeader>
            <CardContent>
              {incomeStatement?.income.byCategory && incomeStatement.income.byCategory.length > 0 ? (
                <div className="space-y-3">
                  {incomeStatement.income.byCategory.map((cat) => (
                    <div key={cat.categoryId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{cat.categoryName}</span>
                      <span className="text-green-600 font-bold">{formatCurrency(cat.amount)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total Ingresos</span>
                    <span className="text-green-600">{formatCurrency(dashboard.totalInvoiced)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No hay ingresos registrados</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Egresos</CardTitle>
              <CardDescription>Egresos por categoría</CardDescription>
            </CardHeader>
            <CardContent>
              {incomeStatement?.expenses.byCategory && incomeStatement.expenses.byCategory.length > 0 ? (
                <div className="space-y-3">
                  {incomeStatement.expenses.byCategory.map((cat) => (
                    <div key={cat.categoryId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{cat.categoryName}</span>
                      <span className="text-red-600 font-bold">{formatCurrency(cat.amount)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total Egresos</span>
                    <span className="text-red-600">{formatCurrency(dashboard.totalExpenses)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No hay egresos registrados</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Income Statement Tab */}
        <TabsContent value="statement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Resultados</CardTitle>
              <CardDescription>
                Período: {incomeStatement ? format(new Date(incomeStatement.period.from), "dd/MM/yyyy", { locale: es }) : ""} - 
                {incomeStatement ? format(new Date(incomeStatement.period.to), "dd/MM/yyyy", { locale: es }) : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {incomeStatement ? (
                <div className="space-y-4">
                  {/* Ingresos */}
                  <div>
                    <h3 className="font-semibold mb-2">INGRESOS</h3>
                    <div className="space-y-2 ml-4">
                      <div className="flex justify-between">
                        <span>Facturado</span>
                        <span className="font-medium">{formatCurrency(incomeStatement.income.invoiced)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cobrado</span>
                        <span className="font-medium">{formatCurrency(incomeStatement.income.collected)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Pendiente de cobro</span>
                        <span>{formatCurrency(incomeStatement.income.pending)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Egresos */}
                  <div>
                    <h3 className="font-semibold mb-2">EGRESOS</h3>
                    <div className="space-y-2 ml-4">
                      <div className="flex justify-between">
                        <span>Total</span>
                        <span className="font-medium">{formatCurrency(incomeStatement.expenses.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pagado</span>
                        <span className="font-medium">{formatCurrency(incomeStatement.expenses.paid)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Pendiente de pago</span>
                        <span>{formatCurrency(incomeStatement.expenses.pending)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Resultados */}
                  <div>
                    <h3 className="font-semibold mb-2">RESULTADOS</h3>
                    <div className="space-y-2 ml-4">
                      <div className="flex justify-between">
                        <span>Utilidad Bruta</span>
                        <span className={`font-medium ${incomeStatement.results.grossProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatCurrency(incomeStatement.results.grossProfit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gastos Operativos</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(incomeStatement.results.operatingExpenses)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Utilidad Neta</span>
                        <span className={incomeStatement.results.netProfit >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatCurrency(incomeStatement.results.netProfit)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Margen de Utilidad</span>
                        <span className="font-medium">{incomeStatement.results.profitMargin.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Cargando estado de resultados...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
