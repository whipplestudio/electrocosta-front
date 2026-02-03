"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  CalendarIcon,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Search,
  ChevronDown,
  Building2,
} from "lucide-react"
import { toast } from "sonner"
import { projectsService, type ConsolidatedIncomeStatement } from "@/services/projects.service"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function EstadoResultadosConsolidadoPage() {
  const [data, setData] = useState<ConsolidatedIncomeStatement | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all")
  const [searchProject, setSearchProject] = useState("")
  const [openProjectSelector, setOpenProjectSelector] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const dateFromStr = dateFrom ? dateFrom.toISOString() : undefined
      const dateToStr = dateTo ? dateTo.toISOString() : undefined
      const result = await projectsService.getConsolidatedIncomeStatement(dateFromStr, dateToStr)
      setData(result)
    } catch (error) {
      console.error("Error al cargar estado consolidado:", error)
      toast.error("Error al cargar el estado de resultados consolidado")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApplyFilters = () => {
    fetchData()
  }

  const handleClearFilters = () => {
    setDateFrom(undefined)
    setDateTo(undefined)
    setTimeout(() => fetchData(), 100)
  }

  const handleDownloadExcel = async () => {
    try {
      const dateFromStr = dateFrom ? dateFrom.toISOString() : undefined
      const dateToStr = dateTo ? dateTo.toISOString() : undefined
      await projectsService.downloadConsolidatedExcel(dateFromStr, dateToStr)
      toast.success("Reporte consolidado descargado exitosamente")
    } catch (error) {
      console.error("Error al descargar reporte:", error)
      toast.error("Error al descargar el reporte")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando estado de resultados...</p>
        </div>
      </div>
    )
  }

  // Filtrar proyectos para el selector
  const filteredProjects = data?.projects.filter((project) =>
    project.projectName.toLowerCase().includes(searchProject.toLowerCase()) ||
    project.projectCode.toLowerCase().includes(searchProject.toLowerCase())
  ) || []

  // Obtener proyecto seleccionado
  const selectedProject = selectedProjectId === "all" 
    ? null 
    : data?.projects.find(p => p.projectId === selectedProjectId)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estado de Resultados</h1>
          <p className="text-muted-foreground mt-1">Análisis financiero por proyecto</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
      </div>

      {/* Tabs para Consolidado vs Por Proyecto */}
      <Tabs defaultValue="consolidated" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="consolidated">Vista Consolidada</TabsTrigger>
          <TabsTrigger value="by-project">Por Proyecto</TabsTrigger>
        </TabsList>

        {/* Vista Consolidada */}
        <TabsContent value="consolidated" className="space-y-6 mt-6">
          {/* Filtros */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">Filtros de Período</CardTitle>
              <CardDescription>Filtra el estado de resultados por rango de fechas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label>Fecha Desde</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 space-y-2">
              <Label>Fecha Hasta</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

                <Button onClick={handleApplyFilters}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Aplicar
                </Button>
                <Button variant="outline" onClick={handleClearFilters}>
                  Limpiar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* KPIs Totales */}
          <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data ? formatCurrency(data.totals.totalIncome) : "$0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              De {data?.projects.length || 0} proyectos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egresos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data ? formatCurrency(data.totals.totalExpenses) : "$0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Gastos operativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilidad Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data && data.totals.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {data ? formatCurrency(data.totals.totalProfit) : "$0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Margen: {data ? data.profitMargin.toFixed(2) : "0.00"}%
            </p>
          </CardContent>
          </Card>
          </div>

          {/* Tabla de Proyectos */}
          <Card className="border-2">
        <CardHeader>
          <CardTitle>Detalle por Proyecto</CardTitle>
          <CardDescription>Estado de resultados de cada proyecto</CardDescription>
        </CardHeader>
        <CardContent>
          {data && data.projects.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proyecto</TableHead>
                    <TableHead className="text-right">Ingresos</TableHead>
                    <TableHead className="text-right">Egresos</TableHead>
                    <TableHead className="text-right">Utilidad</TableHead>
                    <TableHead className="text-right">Margen %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.projects.map((project) => (
                    <TableRow key={project.projectId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{project.projectName}</div>
                          <div className="text-sm text-muted-foreground">{project.projectCode}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        {formatCurrency(project.income.invoiced)}
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        {formatCurrency(project.expenses.total)}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${project.results.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(project.results.netProfit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {project.results.profitMargin.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gray-50 font-bold">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(data.totals.totalIncome)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatCurrency(data.totals.totalExpenses)}
                    </TableCell>
                    <TableCell className={`text-right ${data.totals.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(data.totals.totalProfit)}
                    </TableCell>
                    <TableCell className="text-right">
                      {data.profitMargin.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay proyectos con datos financieros
            </p>
          )}
        </CardContent>
      </Card>

          {/* Resumen Detallado */}
          {data && data.projects.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.projects.map((project) => (
                  <div key={project.projectId} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                    <span className="text-sm">{project.projectName}</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(project.income.invoiced)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">{formatCurrency(data.totals.totalIncome)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Egresos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.projects.map((project) => (
                  <div key={project.projectId} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                    <span className="text-sm">{project.projectName}</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(project.expenses.total)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span className="text-red-600">{formatCurrency(data.totals.totalExpenses)}</span>
                </div>
              </div>
            </CardContent>
            </Card>
            </div>
          )}
        </TabsContent>

        {/* Vista Por Proyecto */}
        <TabsContent value="by-project" className="space-y-6 mt-6">
          {/* Selector de Proyecto */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">Seleccionar Proyecto</CardTitle>
              <CardDescription>Elige un proyecto para ver su estado de resultados detallado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Proyecto</Label>
                  <Popover open={openProjectSelector} onOpenChange={setOpenProjectSelector}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openProjectSelector}
                        className="w-full justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {selectedProjectId === "all"
                            ? "Selecciona un proyecto"
                            : selectedProject
                            ? `${selectedProject.projectCode} - ${selectedProject.projectName}`
                            : "Selecciona un proyecto"}
                        </div>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0" align="start">
                      <Command>
                        <CommandInput 
                          placeholder="Buscar proyecto..." 
                          value={searchProject}
                          onValueChange={setSearchProject}
                        />
                        <CommandEmpty>No se encontraron proyectos.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {filteredProjects.map((project) => (
                            <CommandItem
                              key={project.projectId}
                              value={project.projectId}
                              onSelect={() => {
                                setSelectedProjectId(project.projectId)
                                setOpenProjectSelector(false)
                                setSearchProject("")
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{project.projectName}</span>
                                <span className="text-sm text-muted-foreground">{project.projectCode}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1 space-y-2">
                  <Label>Fecha Desde</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1 space-y-2">
                  <Label>Fecha Hasta</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button onClick={handleApplyFilters}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Aplicar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mostrar datos del proyecto seleccionado */}
          {selectedProject ? (
            <>
              {/* KPIs del Proyecto */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Proyecto</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">{selectedProject.projectName}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedProject.projectCode}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedProject.income.invoiced)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Facturado
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Egresos</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(selectedProject.expenses.total)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Gastos totales
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Utilidad</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${
                      selectedProject.results.netProfit >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {formatCurrency(selectedProject.results.netProfit)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Margen: {selectedProject.results.profitMargin.toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Detalles del Proyecto */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Desglose de Ingresos</CardTitle>
                    <CardDescription>Ingresos facturados del proyecto</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium">Total Facturado</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(selectedProject.income.invoiced)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Desglose de Egresos</CardTitle>
                    <CardDescription>Gastos del proyecto</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-sm font-medium">Total Gastos</span>
                        <span className="text-lg font-bold text-red-600">
                          {formatCurrency(selectedProject.expenses.total)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resumen Financiero */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Resumen Financiero</CardTitle>
                  <CardDescription>Análisis de rentabilidad del proyecto</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Ingresos Totales</span>
                      <span className="text-lg font-semibold text-green-600">
                        {formatCurrency(selectedProject.income.invoiced)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Gastos Totales</span>
                      <span className="text-lg font-semibold text-red-600">
                        {formatCurrency(selectedProject.expenses.total)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <div>
                        <span className="text-base font-bold">Utilidad Neta</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          Margen de utilidad: {selectedProject.results.profitMargin.toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-2xl font-bold ${
                          selectedProject.results.netProfit >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {formatCurrency(selectedProject.results.netProfit)}
                        </span>
                        <Badge 
                          variant={selectedProject.results.netProfit >= 0 ? "default" : "destructive"}
                          className="ml-2"
                        >
                          {selectedProject.results.netProfit >= 0 ? "Positivo" : "Negativo"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecciona un Proyecto</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Elige un proyecto del selector para ver su estado de resultados detallado
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
