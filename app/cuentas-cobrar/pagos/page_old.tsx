"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle, Clock, DollarSign, FileText, Plus, Search, Calendar } from "lucide-react"

const pendingPayments = [
  {
    id: "FAC-001",
    cliente: "Constructora ABC",
    monto: 125000,
    montoOriginal: 125000,
    fechaVencimiento: "2024-06-15",
    diasVencido: 5,
    estado: "Vencida",
  },
  {
    id: "FAC-002",
    cliente: "Inmobiliaria XYZ",
    monto: 85000,
    montoOriginal: 85000,
    fechaVencimiento: "2024-06-20",
    diasVencido: 0,
    estado: "Vigente",
  },
  {
    id: "FAC-003",
    cliente: "Desarrollos Norte",
    monto: 45000,
    montoOriginal: 95000,
    fechaVencimiento: "2024-06-10",
    diasVencido: 10,
    estado: "Parcial",
  },
]

const recentPayments = [
  {
    id: "PAG-001",
    factura: "FAC-004",
    cliente: "Eléctricos del Sur",
    monto: 75000,
    metodoPago: "Transferencia",
    fecha: "2024-06-18",
    referencia: "TRF-789456",
  },
  {
    id: "PAG-002",
    factura: "FAC-005",
    cliente: "Instalaciones Pro",
    monto: 120000,
    metodoPago: "Cheque",
    fecha: "2024-06-17",
    referencia: "CHQ-123456",
  },
]

export default function AplicacionPagos() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<any>(null)

  const filteredPayments = pendingPayments.filter(
    (payment) =>
      payment.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Aplicación de Pagos</h2>
          <p className="text-muted-foreground">Registro y aplicación de pagos recibidos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Registrar Pago
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Pago</DialogTitle>
              <DialogDescription>Ingrese los detalles del pago recibido</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="factura">Factura</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar factura" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FAC-001">FAC-001 - Constructora ABC</SelectItem>
                      <SelectItem value="FAC-002">FAC-002 - Inmobiliaria XYZ</SelectItem>
                      <SelectItem value="FAC-003">FAC-003 - Desarrollos Norte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monto">Monto Recibido</Label>
                  <Input id="monto" placeholder="$0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="metodo">Método de Pago</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta de Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha de Pago</Label>
                  <Input id="fecha" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="referencia">Referencia/Folio</Label>
                <Input id="referencia" placeholder="Número de referencia o folio" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea id="observaciones" placeholder="Comentarios adicionales..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancelar</Button>
              <Button>Registrar Pago</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs de Pagos */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$255,000</div>
            <p className="text-xs text-muted-foreground">3 facturas pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos del Día</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$195,000</div>
            <p className="text-xs text-muted-foreground">2 pagos recibidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,250,000</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15%</span> vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efectividad</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">Pagos a tiempo</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pagos Pendientes</TabsTrigger>
          <TabsTrigger value="recent">Pagos Recientes</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facturas Pendientes de Pago</CardTitle>
              <CardDescription>Facturas que requieren aplicación de pagos</CardDescription>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por cliente o factura..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Factura</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Monto Pendiente</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.cliente}</TableCell>
                      <TableCell>${payment.monto.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {payment.fechaVencimiento}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.estado === "Vencida"
                              ? "destructive"
                              : payment.estado === "Parcial"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {payment.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => setSelectedPayment(payment)} className="gap-1">
                          <DollarSign className="h-3 w-3" />
                          Aplicar Pago
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pagos Recientes</CardTitle>
              <CardDescription>Últimos pagos registrados en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Pago</TableHead>
                    <TableHead>Factura</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Referencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.factura}</TableCell>
                      <TableCell>{payment.cliente}</TableCell>
                      <TableCell>${payment.monto.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.metodoPago}</Badge>
                      </TableCell>
                      <TableCell>{payment.fecha}</TableCell>
                      <TableCell className="font-mono text-sm">{payment.referencia}</TableCell>
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
