"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, AlertTriangle, Clock, FileText, Download, Upload, Search, Filter, RefreshCw } from "lucide-react"

const conciliacionesPendientes = [
  {
    id: "CONC-2024-001",
    banco: "BBVA Bancomer",
    cuenta: "****1234",
    periodo: "Enero 2024",
    fechaCorte: "2024-01-31",
    saldoLibros: 2850000,
    saldoBanco: 2845000,
    diferencia: -5000,
    estado: "Pendiente",
    movimientosSinConciliar: 3,
    ultimaActualizacion: "2024-01-26",
  },
  {
    id: "CONC-2024-002",
    banco: "Santander",
    cuenta: "****5678",
    periodo: "Enero 2024",
    fechaCorte: "2024-01-31",
    saldoLibros: 1200000,
    saldoBanco: 1200000,
    diferencia: 0,
    estado: "Conciliado",
    movimientosSinConciliar: 0,
    ultimaActualizacion: "2024-01-25",
  },
  {
    id: "CONC-2024-003",
    banco: "Banorte",
    cuenta: "****9012",
    periodo: "Enero 2024",
    fechaCorte: "2024-01-31",
    saldoLibros: -450000,
    saldoBanco: -448000,
    diferencia: 2000,
    estado: "En Revisión",
    movimientosSinConciliar: 1,
    ultimaActualizacion: "2024-01-24",
  },
]

const movimientosSinConciliar = [
  {
    id: 1,
    fecha: "2024-01-25",
    concepto: "Transferencia pendiente",
    referencia: "TRF-2024-0145",
    montoLibros: -25000,
    montoBanco: null,
    tipo: "Pendiente en banco",
    cuenta: "BBVA Bancomer ****1234",
    seleccionado: false,
  },
  {
    id: 2,
    fecha: "2024-01-24",
    concepto: "Comisión bancaria",
    referencia: "COM-2024-0089",
    montoLibros: null,
    montoBanco: -500,
    tipo: "No registrado en libros",
    cuenta: "BBVA Bancomer ****1234",
    seleccionado: false,
  },
  {
    id: 3,
    fecha: "2024-01-23",
    concepto: "Depósito en tránsito",
    referencia: "DEP-2024-0067",
    montoLibros: 35000,
    montoBanco: null,
    tipo: "Pendiente en banco",
    cuenta: "BBVA Bancomer ****1234",
    seleccionado: false,
  },
]

export default function ConciliacionPage() {
  const [filtroEstado, setFiltroEstado] = useState("all")
  const [filtroBanco, setFiltroBanco] = useState("all")
  const [busqueda, setBusqueda] = useState("")
  const [movimientosSeleccionados, setMovimientosSeleccionados] = useState<number[]>([])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  const getStatusBadge = (estado: string) => {
    const variants = {
      Conciliado: "bg-green-100 text-green-800",
      Pendiente: "bg-yellow-100 text-yellow-800",
      "En Revisión": "bg-blue-100 text-blue-800",
      "Con Diferencias": "bg-red-100 text-red-800",
    }
    return variants[estado as keyof typeof variants] || variants["Pendiente"]
  }

  const getStatusIcon = (estado: string) => {
    const icons = {
      Conciliado: <CheckCircle className="h-4 w-4" />,
      Pendiente: <Clock className="h-4 w-4" />,
      "En Revisión": <AlertTriangle className="h-4 w-4" />,
      "Con Diferencias": <AlertTriangle className="h-4 w-4" />,
    }
    return icons[estado as keyof typeof icons] || icons["Pendiente"]
  }

  const toggleMovimiento = (id: number) => {
    setMovimientosSeleccionados((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const totalConciliaciones = conciliacionesPendientes.length
  const conciliadasCompletas = conciliacionesPendientes.filter((c) => c.estado === "Conciliado").length
  const pendientes = conciliacionesPendientes.filter((c) => c.estado === "Pendiente").length
  const conDiferencias = conciliacionesPendientes.filter((c) => Math.abs(c.diferencia) > 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Conciliación Bancaria</h1>
          <p className="text-muted-foreground">Conciliación de saldos entre libros contables y estados de cuenta</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Cargar Estado de Cuenta
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Nueva Conciliación
          </Button>
        </div>
      </div>

      {/* KPIs de Conciliación */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Conciliaciones</p>
                <p className="text-2xl font-bold">{totalConciliaciones}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conciliadas</p>
                <p className="text-2xl font-bold text-green-600">{conciliadasCompletas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendientes}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Con Diferencias</p>
                <p className="text-2xl font-bold text-red-600">{conDiferencias}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="conciliaciones" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conciliaciones">Conciliaciones</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos Sin Conciliar</TabsTrigger>
        </TabsList>

        <TabsContent value="conciliaciones" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar conciliación..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filtroBanco} onValueChange={setFiltroBanco}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todos los bancos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los bancos</SelectItem>
                    <SelectItem value="bbva">BBVA Bancomer</SelectItem>
                    <SelectItem value="santander">Santander</SelectItem>
                    <SelectItem value="banorte">Banorte</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="conciliado">Conciliado</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="revision">En Revisión</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Conciliaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Conciliaciones</CardTitle>
              <CardDescription>Resumen de conciliaciones bancarias por período</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conciliación</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Saldo Libros</TableHead>
                    <TableHead>Saldo Banco</TableHead>
                    <TableHead>Diferencia</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Sin Conciliar</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conciliacionesPendientes.map((conciliacion) => (
                    <TableRow key={conciliacion.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{conciliacion.id}</p>
                          <p className="text-sm text-muted-foreground">Corte: {conciliacion.fechaCorte}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{conciliacion.banco}</p>
                          <p className="text-sm text-muted-foreground">{conciliacion.cuenta}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{conciliacion.periodo}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatCurrency(conciliacion.saldoLibros)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatCurrency(conciliacion.saldoBanco)}</span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${
                            conciliacion.diferencia === 0
                              ? "text-green-600"
                              : conciliacion.diferencia > 0
                                ? "text-blue-600"
                                : "text-red-600"
                          }`}
                        >
                          {formatCurrency(conciliacion.diferencia)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(conciliacion.estado)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(conciliacion.estado)}
                            {conciliacion.estado}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          {conciliacion.movimientosSinConciliar > 0 ? (
                            <Badge variant="secondary">{conciliacion.movimientosSinConciliar} movimientos</Badge>
                          ) : (
                            <span className="text-green-600 text-sm">Completo</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
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

        <TabsContent value="movimientos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Movimientos Sin Conciliar</CardTitle>
              <CardDescription>Partidas pendientes de conciliación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {movimientosSeleccionados.length} movimientos seleccionados
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={movimientosSeleccionados.length === 0}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Conciliar Seleccionados
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox />
                      </TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Referencia</TableHead>
                      <TableHead>Monto Libros</TableHead>
                      <TableHead>Monto Banco</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cuenta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimientosSinConciliar.map((movimiento) => (
                      <TableRow key={movimiento.id}>
                        <TableCell>
                          <Checkbox
                            checked={movimientosSeleccionados.includes(movimiento.id)}
                            onCheckedChange={() => toggleMovimiento(movimiento.id)}
                          />
                        </TableCell>
                        <TableCell>{movimiento.fecha}</TableCell>
                        <TableCell>
                          <p className="font-medium">{movimiento.concepto}</p>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{movimiento.referencia}</code>
                        </TableCell>
                        <TableCell>
                          {movimiento.montoLibros ? (
                            <span
                              className={`font-medium ${movimiento.montoLibros < 0 ? "text-red-600" : "text-green-600"}`}
                            >
                              {formatCurrency(movimiento.montoLibros)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {movimiento.montoBanco ? (
                            <span
                              className={`font-medium ${movimiento.montoBanco < 0 ? "text-red-600" : "text-green-600"}`}
                            >
                              {formatCurrency(movimiento.montoBanco)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{movimiento.tipo}</Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{movimiento.cuenta}</p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
