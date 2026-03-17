"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, AlertCircle, CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import apiClient from "@/lib/api-client"
import { toast } from "sonner"
import { DateRange } from "react-day-picker"

interface Proyecto {
  id: string
  codigo: string
  nombre: string
  presupuesto: number
  gastoReal: number
  estado: string
}

interface DashboardGeneral {
  proyectosActivos: number
  totalPresupuesto: number
  totalGastoReal: number
  ventaTotal: number
  totalCobrado: number
  saldoPorCobrar: number
  totalPorPagar: number
  totalPagado: number
  saldoPorPagar: number
  utilidadGlobal: number
  proyectos: Proyecto[]
}

interface DashboardProyecto {
  projectId: string
  proyectoNombre: string
  filtrosAplicados: {
    fechaInicio?: string
    fechaFin?: string
  }
  kpis: {
    proyeccionTotal: {
      subtotal: number
      iva: number
      total: number
    }
    cobranza: {
      facturadoYCobrado: number
      saldoEstimadoPendiente: number
    }
    presupuestoGastos: {
      total: number
      materiales: number
      manoObra: number
      otros: number
    }
    ejecucionReal: {
      pagadoRealErogado: number
      pendientePorPagar: number
      materialesReal: number
      manoObraReal: number
      otrosReal: number
    }
    rentabilidad: {
      rentabilidadEsperada: number
      margenEsperado: number
      flujoActual: number
      esFlujoNegativo: boolean
    }
  }
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [dashboardGeneral, setDashboardGeneral] = useState<DashboardGeneral | null>(null)
  const [dashboardProyecto, setDashboardProyecto] = useState<DashboardProyecto | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  useEffect(() => {
    cargarDashboardGeneral()
  }, [])

  useEffect(() => {
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    if (from || to) {
      setDateRange({
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      })
    }
  }, [searchParams])

  useEffect(() => {
    if (selectedProjectId) {
      cargarDashboardProyecto(selectedProjectId)
    }
  }, [selectedProjectId, searchParams])

  const cargarDashboardGeneral = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get("/reports/dashboard/general")
      setDashboardGeneral(response.data)
    } catch (error) {
      console.error("Error al cargar dashboard general:", error)
      toast.error("Error al cargar el dashboard general")
    } finally {
      setLoading(false)
    }
  }

  const cargarDashboardProyecto = async (projectId: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      const from = searchParams.get("from")
      const to = searchParams.get("to")
      if (from) params.append("startDate", from)
      if (to) params.append("endDate", to)

      const url = `/reports/dashboard/${projectId}${params.toString() ? `?${params.toString()}` : ""}`
      const response = await apiClient.get(url)
      setDashboardProyecto(response.data)
    } catch (error) {
      console.error("Error al cargar dashboard del proyecto:", error)
      toast.error("Error al cargar el dashboard del proyecto")
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    const params = new URLSearchParams(searchParams.toString())

    if (range?.from) {
      params.set("from", format(range.from, "yyyy-MM-dd"))
    } else {
      params.delete("from")
    }

    if (range?.to) {
      params.set("to", format(range.to, "yyyy-MM-dd"))
    } else {
      params.delete("to")
    }

    router.push(`/dashboard?${params.toString()}`)
  }

  const clearDateRange = () => {
    setDateRange(undefined)
    router.push("/dashboard")
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  if (loading && !dashboardGeneral) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Financiero</h1>
          <p className="text-muted-foreground">
            Visualización en tiempo real de la salud financiera de tus proyectos
          </p>
        </div>
      </div>

      {dashboardGeneral && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardGeneral.proyectosActivos}</div>
                <p className="text-xs text-muted-foreground">En progreso y planificación</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(dashboardGeneral.ventaTotal)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cobrado: {formatCurrency(dashboardGeneral.totalCobrado)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gastos Reales</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(dashboardGeneral.totalGastoReal)}</div>
                <p className="text-xs text-muted-foreground">
                  Presupuesto: {formatCurrency(dashboardGeneral.totalPresupuesto)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilidad Global</CardTitle>
                {dashboardGeneral.utilidadGlobal >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    dashboardGeneral.utilidadGlobal >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(dashboardGeneral.utilidadGlobal)}
                </div>
                <p className="text-xs text-muted-foreground">Ventas - Gastos</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalle por Proyecto</CardTitle>
              <CardDescription>Selecciona un proyecto y filtra por rango de fechas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Proyecto</label>
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {dashboardGeneral.proyectos.map((proyecto) => (
                        <SelectItem key={proyecto.id} value={proyecto.id}>
                          {proyecto.codigo} - {proyecto.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Rango de Fechas</label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "dd/MM/yyyy", { locale: es })} -{" "}
                                {format(dateRange.to, "dd/MM/yyyy", { locale: es })}
                              </>
                            ) : (
                              format(dateRange.from, "dd/MM/yyyy", { locale: es })
                            )
                          ) : (
                            <span>Seleccionar rango</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={handleDateRangeChange}
                          numberOfMonths={2}
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    {dateRange && (
                      <Button variant="ghost" size="icon" onClick={clearDateRange}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {dashboardProyecto && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{dashboardProyecto.proyectoNombre}</h2>
              {dashboardProyecto.filtrosAplicados.fechaInicio && (
                <p className="text-sm text-muted-foreground">
                  Período: {dashboardProyecto.filtrosAplicados.fechaInicio} -{" "}
                  {dashboardProyecto.filtrosAplicados.fechaFin || "Presente"}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Proyección Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(dashboardProyecto.kpis.proyeccionTotal.total)}
                </div>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div>Subtotal: {formatCurrency(dashboardProyecto.kpis.proyeccionTotal.subtotal)}</div>
                  <div>IVA (6%): {formatCurrency(dashboardProyecto.kpis.proyeccionTotal.iva)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Cobranza</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(dashboardProyecto.kpis.cobranza.facturadoYCobrado)}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Pendiente: {formatCurrency(dashboardProyecto.kpis.cobranza.saldoEstimadoPendiente)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Presupuesto Gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-4">
                  {formatCurrency(dashboardProyecto.kpis.presupuestoGastos.total)}
                </div>
                <div className="space-y-4">
                  {/* Materiales */}
                  {(() => {
                    const presupuesto = dashboardProyecto.kpis.presupuestoGastos.materiales
                    const gastado = dashboardProyecto.kpis.ejecucionReal.materialesReal
                    const porcentaje = presupuesto > 0 ? (gastado / presupuesto) * 100 : 0
                    const restante = presupuesto - gastado
                    const colorClass = porcentaje < 80 ? 'bg-green-500' : porcentaje <= 100 ? 'bg-yellow-500' : 'bg-red-500'
                    
                    return (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium">Materiales</span>
                          <span className="text-xs font-semibold" title={`Gastado: ${formatCurrency(gastado)} de ${formatCurrency(presupuesto)}`}>
                            {porcentaje.toFixed(1)}% ejercido
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden" title={restante >= 0 ? `Falta: ${formatCurrency(restante)}` : `Excedido por: ${formatCurrency(Math.abs(restante))}`}>
                          <div className={`h-2.5 rounded-full transition-all ${colorClass}`} style={{ width: `${Math.min(porcentaje, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span className="text-muted-foreground">
                            Gastado: {formatCurrency(gastado)}
                          </span>
                          <span className={restante >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {restante >= 0 ? `Falta: ${formatCurrency(restante)}` : `Excedido: ${formatCurrency(Math.abs(restante))}`}
                          </span>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Mano de Obra */}
                  {(() => {
                    const presupuesto = dashboardProyecto.kpis.presupuestoGastos.manoObra
                    const gastado = dashboardProyecto.kpis.ejecucionReal.manoObraReal
                    const porcentaje = presupuesto > 0 ? (gastado / presupuesto) * 100 : 0
                    const restante = presupuesto - gastado
                    const colorClass = porcentaje < 80 ? 'bg-green-500' : porcentaje <= 100 ? 'bg-yellow-500' : 'bg-red-500'
                    
                    return (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium">Mano de Obra</span>
                          <span className="text-xs font-semibold" title={`Gastado: ${formatCurrency(gastado)} de ${formatCurrency(presupuesto)}`}>
                            {porcentaje.toFixed(1)}% ejercido
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden" title={restante >= 0 ? `Falta: ${formatCurrency(restante)}` : `Excedido por: ${formatCurrency(Math.abs(restante))}`}>
                          <div className={`h-2.5 rounded-full transition-all ${colorClass}`} style={{ width: `${Math.min(porcentaje, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span className="text-muted-foreground">
                            Gastado: {formatCurrency(gastado)}
                          </span>
                          <span className={restante >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {restante >= 0 ? `Falta: ${formatCurrency(restante)}` : `Excedido: ${formatCurrency(Math.abs(restante))}`}
                          </span>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Otros */}
                  {(() => {
                    const presupuesto = dashboardProyecto.kpis.presupuestoGastos.otros
                    const gastado = dashboardProyecto.kpis.ejecucionReal.otrosReal
                    const porcentaje = presupuesto > 0 ? (gastado / presupuesto) * 100 : 0
                    const restante = presupuesto - gastado
                    const colorClass = porcentaje < 80 ? 'bg-green-500' : porcentaje <= 100 ? 'bg-yellow-500' : 'bg-red-500'
                    
                    return (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium">Otros</span>
                          <span className="text-xs font-semibold" title={`Gastado: ${formatCurrency(gastado)} de ${formatCurrency(presupuesto)}`}>
                            {porcentaje.toFixed(1)}% ejercido
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden" title={restante >= 0 ? `Falta: ${formatCurrency(restante)}` : `Excedido por: ${formatCurrency(Math.abs(restante))}`}>
                          <div className={`h-2.5 rounded-full transition-all ${colorClass}`} style={{ width: `${Math.min(porcentaje, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span className="text-muted-foreground">
                            Gastado: {formatCurrency(gastado)}
                          </span>
                          <span className={restante >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {restante >= 0 ? `Falta: ${formatCurrency(restante)}` : `Excedido: ${formatCurrency(Math.abs(restante))}`}
                          </span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Ejecución Real</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(dashboardProyecto.kpis.ejecucionReal.pagadoRealErogado)}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Por Pagar: {formatCurrency(dashboardProyecto.kpis.ejecucionReal.pendientePorPagar)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rentabilidad del Proyecto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Rentabilidad Esperada - Métrica Principal */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Rentabilidad Esperada</p>
                    <div
                      className={`text-4xl font-bold ${
                        dashboardProyecto.kpis.rentabilidad.rentabilidadEsperada >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(dashboardProyecto.kpis.rentabilidad.rentabilidadEsperada)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Margen Esperado: {formatPercentage(dashboardProyecto.kpis.rentabilidad.margenEsperado)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (Valor Venta - Presupuesto Total)
                    </p>
                  </div>
                  <div className="text-right">
                    {dashboardProyecto.kpis.rentabilidad.rentabilidadEsperada >= 0 ? (
                      <TrendingUp className="h-12 w-12 text-green-600" />
                    ) : (
                      <TrendingDown className="h-12 w-12 text-red-600" />
                    )}
                  </div>
                </div>

                {/* Separador */}
                <div className="border-t pt-3">
                  {/* Flujo de Caja Actual - Métrica Secundaria */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Flujo actual (Cobrado vs Gastado)</p>
                      <div
                        className={`text-2xl font-semibold ${
                          dashboardProyecto.kpis.rentabilidad.esFlujoNegativo
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {formatCurrency(dashboardProyecto.kpis.rentabilidad.flujoActual)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dashboardProyecto.kpis.rentabilidad.esFlujoNegativo 
                          ? "⚠️ Flujo negativo: se ha gastado más de lo cobrado"
                          : "✓ Flujo positivo: se ha cobrado más de lo gastado"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8"><Skeleton className="h-96 w-full" /></div>}>
      <DashboardContent />
    </Suspense>
  )
}
