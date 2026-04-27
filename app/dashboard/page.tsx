"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, AlertCircle, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import apiClient from "@/lib/api-client"
import { toast } from "sonner"
import { FloatingDatePicker, DateSelection, KpiCard, FloatingSelect, SelectOption } from "@/components/ui"

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
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>()
  
  // Datos de cuentas por pagar por proyecto
  const [accountsPayableByProject, setAccountsPayableByProject] = useState<{
    total: number
    pagado: number
    pendiente: number
    porCategoria: {
      materiales: { total: number; pagado: number; pendiente: number }
      manoObra: { total: number; pagado: number; pendiente: number }
      otros: { total: number; pagado: number; pendiente: number }
    }
  } | null>(null)

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
      cargarCuentasPorPagarProyecto(selectedProjectId)
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

  const cargarCuentasPorPagarProyecto = async (projectId: string) => {
    try {
      const params = new URLSearchParams()
      params.append("projectId", projectId)
      params.append("limit", "1000")
      
      const from = searchParams.get("from")
      const to = searchParams.get("to")
      if (from) params.append("dateFrom", from)
      if (to) params.append("dateTo", to)

      const response = await apiClient.get(`/accounts-payable?${params.toString()}`)
      const accounts = response.data.data || []
      
      // Calcular totales por categoría
      const porCategoria = {
        materiales: { total: 0, pagado: 0, pendiente: 0 },
        manoObra: { total: 0, pagado: 0, pendiente: 0 },
        otros: { total: 0, pagado: 0, pendiente: 0 },
      }
      
      let total = 0
      let pagado = 0
      let pendiente = 0
      
      accounts.forEach((account: any) => {
        const amount = Number(account.amount || 0)
        const paidAmount = Number(account.paidAmount || 0)
        const balance = Number(account.balance || 0)
        
        total += amount
        pagado += paidAmount
        pendiente += balance
        
        const clasificacion = account.macroClasificacion || account.category?.macroClasificacion
        
        switch (clasificacion) {
          case 'MATERIALES':
            porCategoria.materiales.total += amount
            porCategoria.materiales.pagado += paidAmount
            porCategoria.materiales.pendiente += balance
            break
          case 'MANO_DE_OBRA':
            porCategoria.manoObra.total += amount
            porCategoria.manoObra.pagado += paidAmount
            porCategoria.manoObra.pendiente += balance
            break
          default:
            porCategoria.otros.total += amount
            porCategoria.otros.pagado += paidAmount
            porCategoria.otros.pendiente += balance
        }
      })
      
      setAccountsPayableByProject({
        total,
        pagado,
        pendiente,
        porCategoria
      })
    } catch (error) {
      console.error("Error al cargar cuentas por pagar del proyecto:", error)
    }
  }

  const handleDateRangeChange = (value: DateSelection) => {
    const range = value as { from?: Date; to?: Date } | undefined
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
    
    // Recargar cuentas por pagar si hay proyecto seleccionado
    if (selectedProjectId) {
      setTimeout(() => {
        cargarCuentasPorPagarProyecto(selectedProjectId)
      }, 100)
    }
  }

  const clearDateRange = () => {
    setDateRange(undefined)
    router.push("/dashboard")
    
    // Recargar cuentas por pagar si hay proyecto seleccionado
    if (selectedProjectId) {
      setTimeout(() => {
        cargarCuentasPorPagarProyecto(selectedProjectId)
      }, 100)
    }
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
            <KpiCard
              title="Proyectos Activos"
              value={dashboardGeneral.proyectosActivos}
              subtitle="En progreso y planificación"
              icon={<AlertCircle className="h-4 w-4" />}
              variant="default"
            />
            <KpiCard
              title="Ventas Totales"
              value={formatCurrency(dashboardGeneral.ventaTotal)}
              subtitle={`Cobrado: ${formatCurrency(dashboardGeneral.totalCobrado)}`}
              icon={<DollarSign className="h-4 w-4" />}
              variant="success"
            />
            <KpiCard
              title="Gastos Reales"
              value={formatCurrency(dashboardGeneral.totalGastoReal)}
              subtitle={`Presupuesto: ${formatCurrency(dashboardGeneral.totalPresupuesto)}`}
              icon={<CreditCard className="h-4 w-4" />}
              variant="warning"
            />
            <KpiCard
              title="Utilidad Global"
              value={formatCurrency(dashboardGeneral.utilidadGlobal)}
              subtitle="Ventas - Gastos"
              icon={dashboardGeneral.utilidadGlobal >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              variant={dashboardGeneral.utilidadGlobal >= 0 ? "success" : "danger"}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalle por Proyecto</CardTitle>
              <CardDescription>Selecciona un proyecto y filtra por rango de fechas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <FloatingSelect
                    label="Proyecto"
                    value={selectedProjectId}
                    onChange={(value) => setSelectedProjectId(value as string)}
                    options={[
                      { value: '', label: 'Selecciona un proyecto' },
                      ...dashboardGeneral.proyectos.map((proyecto): SelectOption => ({
                        value: proyecto.id,
                        label: `${proyecto.codigo} - ${proyecto.nombre}`,
                      }))
                    ]}
                    placeholder="Selecciona un proyecto"
                  />
                </div>

                <div>
                  <FloatingDatePicker
                    label="Rango de Fechas"
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    mode="range"
                    placeholder="Seleccionar rango de fechas"
                    containerClassName="min-w-[280px]"
                  />
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
            <KpiCard
              title="Proyección Total"
              value={formatCurrency(dashboardProyecto.kpis.proyeccionTotal.total)}
              subtitle={`Subtotal: ${formatCurrency(dashboardProyecto.kpis.proyeccionTotal.subtotal)} • IVA: ${formatCurrency(dashboardProyecto.kpis.proyeccionTotal.iva)}`}
              icon={<DollarSign className="h-4 w-4" />}
              variant="primary"
            />
            <KpiCard
              title="Cobranza"
              value={formatCurrency(dashboardProyecto.kpis.cobranza.facturadoYCobrado)}
              subtitle={`Pendiente: ${formatCurrency(dashboardProyecto.kpis.cobranza.saldoEstimadoPendiente)}`}
              icon={<Wallet className="h-4 w-4" />}
              variant="success"
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Presupuesto Gastos</CardTitle>
                {accountsPayableByProject && (
                  <p className="text-xs text-muted-foreground mt-1">
                    CxP: {formatCurrency(accountsPayableByProject.total)} total
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600 mb-4">
                  {formatCurrency(dashboardProyecto.kpis.presupuestoGastos.total)}
                </div>
                <div className="space-y-4">
                  {/* Materiales */}
                  {(() => {
                    const presupuesto = dashboardProyecto.kpis.presupuestoGastos.materiales
                    const cxpData = accountsPayableByProject?.porCategoria.materiales
                    const gastadoCxP = cxpData?.pagado || 0
                    const pendienteCxP = cxpData?.pendiente || 0
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
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden" title={restante >= 0 ? `Gastar: ${formatCurrency(restante)}` : `Excedido por: ${formatCurrency(Math.abs(restante))}`}>
                          <div className={`h-2.5 rounded-full transition-all ${colorClass}`} style={{ width: `${Math.min(porcentaje, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span className="text-muted-foreground">
                            Gastado: {formatCurrency(gastado)}
                          </span>
                          <span className={restante >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {restante >= 0 ? `Gastar: ${formatCurrency(restante)}` : `Excedido: ${formatCurrency(Math.abs(restante))}`}
                          </span>
                        </div>
                        {cxpData && cxpData.total > 0 && (
                          <div className="text-xs text-muted-foreground mt-1 pl-2 border-l-2 border-blue-300">
                            CxP: {formatCurrency(gastadoCxP)} pagado / {formatCurrency(pendienteCxP)} pendiente
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Mano de Obra */}
                  {(() => {
                    const presupuesto = dashboardProyecto.kpis.presupuestoGastos.manoObra
                    const cxpData = accountsPayableByProject?.porCategoria.manoObra
                    const gastadoCxP = cxpData?.pagado || 0
                    const pendienteCxP = cxpData?.pendiente || 0
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
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden" title={restante >= 0 ? `Gastar: ${formatCurrency(restante)}` : `Excedido por: ${formatCurrency(Math.abs(restante))}`}>
                          <div className={`h-2.5 rounded-full transition-all ${colorClass}`} style={{ width: `${Math.min(porcentaje, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span className="text-muted-foreground">
                            Gastado: {formatCurrency(gastado)}
                          </span>
                          <span className={restante >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {restante >= 0 ? `Gastar: ${formatCurrency(restante)}` : `Excedido: ${formatCurrency(Math.abs(restante))}`}
                          </span>
                        </div>
                        {cxpData && cxpData.total > 0 && (
                          <div className="text-xs text-muted-foreground mt-1 pl-2 border-l-2 border-blue-300">
                            CxP: {formatCurrency(gastadoCxP)} pagado / {formatCurrency(pendienteCxP)} pendiente
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Otros */}
                  {(() => {
                    const presupuesto = dashboardProyecto.kpis.presupuestoGastos.otros
                    const cxpData = accountsPayableByProject?.porCategoria.otros
                    const gastadoCxP = cxpData?.pagado || 0
                    const pendienteCxP = cxpData?.pendiente || 0
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
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden" title={restante >= 0 ? `Gastar: ${formatCurrency(restante)}` : `Excedido por: ${formatCurrency(Math.abs(restante))}`}>
                          <div className={`h-2.5 rounded-full transition-all ${colorClass}`} style={{ width: `${Math.min(porcentaje, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span className="text-muted-foreground">
                            Gastado: {formatCurrency(gastado)}
                          </span>
                          <span className={restante >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {restante >= 0 ? `Gastar: ${formatCurrency(restante)}` : `Excedido: ${formatCurrency(Math.abs(restante))}`}
                          </span>
                        </div>
                        {cxpData && cxpData.total > 0 && (
                          <div className="text-xs text-muted-foreground mt-1 pl-2 border-l-2 border-blue-300">
                            CxP: {formatCurrency(gastadoCxP)} pagado / {formatCurrency(pendienteCxP)} pendiente
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>

            <KpiCard
              title="Ejecución Real"
              value={formatCurrency(dashboardProyecto.kpis.ejecucionReal.pagadoRealErogado)}
              subtitle={`Por Pagar: ${formatCurrency(dashboardProyecto.kpis.ejecucionReal.pendientePorPagar)}${accountsPayableByProject ? ` • CxP: ${formatCurrency(accountsPayableByProject.total)}` : ''}`}
              icon={<CreditCard className="h-4 w-4" />}
              variant="danger"
            />
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
                        (dashboardProyecto.kpis.rentabilidad.rentabilidadEsperada ?? 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(dashboardProyecto.kpis.rentabilidad.rentabilidadEsperada ?? 0)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Margen Esperado: {formatPercentage(dashboardProyecto.kpis.rentabilidad.margenEsperado ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (Valor Venta - Presupuesto Total)
                    </p>
                  </div>
                  <div className="text-right">
                    {(dashboardProyecto.kpis.rentabilidad.rentabilidadEsperada ?? 0) >= 0 ? (
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
                          (dashboardProyecto.kpis.rentabilidad.esFlujoNegativo ?? false)
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {formatCurrency(dashboardProyecto.kpis.rentabilidad.flujoActual ?? 0)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(dashboardProyecto.kpis.rentabilidad.esFlujoNegativo ?? false)
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
