"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, Phone, Mail, Calendar, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

const seguimientoData = [
  {
    id: "CC-001",
    cliente: "Constructora ABC",
    factura: "F-2024-001",
    monto: 125000,
    fechaVencimiento: "2024-01-15",
    diasVencido: 5,
    estado: "vencido",
    ultimoContacto: "2024-01-10",
    proximaAccion: "Llamada telefónica",
    responsable: "Ana García",
    notas: "Cliente solicita prórroga de 15 días",
  },
  {
    id: "CC-002",
    cliente: "Industrias XYZ",
    factura: "F-2024-002",
    monto: 85000,
    fechaVencimiento: "2024-01-25",
    diasVencido: 0,
    estado: "vigente",
    ultimoContacto: "2024-01-18",
    proximaAccion: "Recordatorio por email",
    responsable: "Carlos López",
    notas: "Cliente con buen historial de pago",
  },
  {
    id: "CC-003",
    cliente: "Comercial DEF",
    factura: "F-2024-003",
    monto: 67500,
    fechaVencimiento: "2024-01-22",
    diasVencido: -2,
    estado: "por_vencer",
    ultimoContacto: "2024-01-15",
    proximaAccion: "Visita presencial",
    responsable: "María Rodríguez",
    notas: "Requiere seguimiento especial",
  },
]

const estadoBadgeVariant = {
  vencido: "destructive",
  vigente: "default",
  por_vencer: "secondary",
} as const

export default function SeguimientoCuentasCobrar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("todos")
  const [responsableFilter, setResponsableFilter] = useState("todos")

  const filteredData = seguimientoData.filter((item) => {
    const matchesSearch =
      item.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.factura.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = estadoFilter === "todos" || item.estado === estadoFilter
    const matchesResponsable = responsableFilter === "todos" || item.responsable === responsableFilter

    return matchesSearch && matchesEstado && matchesResponsable
  })

  const totalVencido = seguimientoData
    .filter((item) => item.estado === "vencido")
    .reduce((sum, item) => sum + item.monto, 0)
  const totalPorVencer = seguimientoData
    .filter((item) => item.estado === "por_vencer")
    .reduce((sum, item) => sum + item.monto, 0)
  const totalVigente = seguimientoData
    .filter((item) => item.estado === "vigente")
    .reduce((sum, item) => sum + item.monto, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seguimiento de Cuentas por Cobrar</h1>
          <p className="text-muted-foreground">Gestión y seguimiento de cobranza</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vencido</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${totalVencido.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Requiere acción inmediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">${totalPorVencer.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Próximos 7 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vigente</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${totalVigente.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">En tiempo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efectividad</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">87%</div>
            <p className="text-xs text-muted-foreground">Cobranza este mes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="seguimiento" className="space-y-4">
        <TabsList>
          <TabsTrigger value="seguimiento">Seguimiento Activo</TabsTrigger>
          <TabsTrigger value="acciones">Próximas Acciones</TabsTrigger>
          <TabsTrigger value="historial">Historial de Contactos</TabsTrigger>
        </TabsList>

        <TabsContent value="seguimiento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cuentas en Seguimiento</CardTitle>
              <CardDescription>Gestión activa de cobranza por cliente</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por cliente o factura..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="por_vencer">Por vencer</SelectItem>
                    <SelectItem value="vigente">Vigente</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={responsableFilter} onValueChange={setResponsableFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Ana García">Ana García</SelectItem>
                    <SelectItem value="Carlos López">Carlos López</SelectItem>
                    <SelectItem value="María Rodríguez">María Rodríguez</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tabla */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Factura</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Días</TableHead>
                      <TableHead>Último Contacto</TableHead>
                      <TableHead>Próxima Acción</TableHead>
                      <TableHead>Responsable</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.cliente}</TableCell>
                        <TableCell>{item.factura}</TableCell>
                        <TableCell>${item.monto.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={estadoBadgeVariant[item.estado as keyof typeof estadoBadgeVariant]}>
                            {item.estado === "vencido"
                              ? "Vencido"
                              : item.estado === "por_vencer"
                                ? "Por Vencer"
                                : "Vigente"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.diasVencido > 0
                            ? `+${item.diasVencido}`
                            : item.diasVencido < 0
                              ? item.diasVencido
                              : "0"}
                        </TableCell>
                        <TableCell>{item.ultimoContacto}</TableCell>
                        <TableCell>{item.proximaAccion}</TableCell>
                        <TableCell>{item.responsable}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Mail className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="acciones">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Acciones Programadas</CardTitle>
              <CardDescription>Actividades de cobranza pendientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seguimientoData.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{item.proximaAccion}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.cliente} - {item.factura}
                      </p>
                      <p className="text-xs text-muted-foreground">Responsable: {item.responsable}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.monto.toLocaleString()}</p>
                      <Badge
                        variant={estadoBadgeVariant[item.estado as keyof typeof estadoBadgeVariant]}
                        className="text-xs"
                      >
                        {item.estado === "vencido"
                          ? "Vencido"
                          : item.estado === "por_vencer"
                            ? "Por Vencer"
                            : "Vigente"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Contactos</CardTitle>
              <CardDescription>Registro de todas las gestiones de cobranza</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Historial de contactos se mostrará aquí</p>
                  <p className="text-sm">Registra llamadas, emails y visitas realizadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
