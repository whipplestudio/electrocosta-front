"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Phone, Mail, AlertTriangle } from "lucide-react"

const cuentasVencidas = [
  {
    id: "001",
    cliente: "Constructora ABC",
    factura: "F-2024-001",
    monto: 125000,
    fechaVencimiento: "2024-01-15",
    diasVencido: 45,
    telefono: "+506 2222-3333",
    email: "pagos@constructoraabc.com",
  },
  {
    id: "002",
    cliente: "Empresa XYZ",
    factura: "F-2024-002",
    monto: 89500,
    fechaVencimiento: "2024-01-20",
    diasVencido: 40,
    telefono: "+506 2444-5555",
    email: "contabilidad@xyz.com",
  },
  {
    id: "003",
    cliente: "Comercial 123",
    factura: "F-2024-003",
    monto: 67800,
    fechaVencimiento: "2024-02-01",
    diasVencido: 28,
    telefono: "+506 2666-7777",
    email: "finanzas@comercial123.com",
  },
]

export default function CuentasVencidas() {
  const [busqueda, setBusqueda] = useState("")

  const cuentasFiltradas = cuentasVencidas.filter(
    (cuenta) =>
      cuenta.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      cuenta.factura.toLowerCase().includes(busqueda.toLowerCase()),
  )

  const totalVencido = cuentasFiltradas.reduce((sum, cuenta) => sum + cuenta.monto, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h1 className="text-2xl font-bold">Cuentas por Cobrar Vencidas</h1>
        </div>
        <Badge variant="destructive" className="text-lg px-3 py-1">
          ${totalVencido.toLocaleString()}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Listado de Cuentas Vencidas</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente o factura..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Factura</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Días Vencido</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cuentasFiltradas.map((cuenta) => (
                <TableRow key={cuenta.id}>
                  <TableCell className="font-medium">{cuenta.cliente}</TableCell>
                  <TableCell>{cuenta.factura}</TableCell>
                  <TableCell className="font-semibold text-red-600">${cuenta.monto.toLocaleString()}</TableCell>
                  <TableCell>{cuenta.fechaVencimiento}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">{cuenta.diasVencido} días</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-3 w-3 mr-1" />
                        Llamar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
