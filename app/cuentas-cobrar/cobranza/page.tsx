"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Phone, Mail, MessageSquare, Calendar, Plus, Search } from "lucide-react"

export default function CobranzaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)

  const gestionesCobranza = [
    {
      id: "GC-001",
      cliente: "Constructora ABC S.A.",
      monto: 125000,
      diasVencido: 15,
      ultimaGestion: "2024-01-05",
      proximaGestion: "2024-01-12",
      responsable: "Ana García",
      estado: "En seguimiento",
      prioridad: "Alta",
      telefono: "+506 8888-9999",
      email: "contacto@constructoraabc.com",
    },
    {
      id: "GC-002",
      cliente: "Industrias XYZ Ltda.",
      monto: 85000,
      diasVencido: 8,
      ultimaGestion: "2024-01-08",
      proximaGestion: "2024-01-15",
      responsable: "Carlos Méndez",
      estado: "Promesa de pago",
      prioridad: "Media",
      telefono: "+506 7777-8888",
      email: "pagos@industriasxyz.com",
    },
  ]

  const historialGestiones = [
    {
      fecha: "2024-01-08",
      tipo: "Llamada",
      resultado: "Promesa de pago para el 15/01",
      responsable: "Carlos Méndez",
      observaciones: "Cliente confirma pago parcial de $50,000 el 15/01 y saldo el 30/01",
    },
    {
      fecha: "2024-01-05",
      tipo: "Email",
      resultado: "Enviado estado de cuenta",
      responsable: "Ana García",
      observaciones: "Cliente solicita estado de cuenta detallado",
    },
  ]

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "Alta":
        return "bg-red-50 text-red-700"
      case "Media":
        return "bg-yellow-50 text-yellow-700"
      case "Baja":
        return "bg-green-50 text-green-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Cobranza</h1>
          <p className="text-muted-foreground">Seguimiento y gestión de cuentas por cobrar</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Gestión
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Gestión de Cobranza</DialogTitle>
              <DialogDescription>Registra una nueva gestión de cobranza para seguimiento</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cuenta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gc-001">Constructora ABC S.A.</SelectItem>
                  <SelectItem value="gc-002">Industrias XYZ Ltda.</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de gestión" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="llamada">Llamada telefónica</SelectItem>
                  <SelectItem value="email">Correo electrónico</SelectItem>
                  <SelectItem value="visita">Visita presencial</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="Resultado de la gestión..." />
              <Input type="date" placeholder="Próxima gestión" />
            </div>
            <DialogFooter>
              <Button>Registrar Gestión</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total en Gestión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$210,000</div>
            <p className="text-xs text-muted-foreground">2 cuentas activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Gestiones Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">3</div>
            <p className="text-xs text-muted-foreground">Programadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Promesas de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$85,000</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Efectividad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">75%</div>
            <p className="text-xs text-muted-foreground">Último mes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cuentas en Gestión</CardTitle>
            <CardDescription>Cuentas activas en proceso de cobranza</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar cuenta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-3">
              {gestionesCobranza.map((gestion) => (
                <div key={gestion.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{gestion.cliente}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${gestion.monto.toLocaleString()} • {gestion.diasVencido} días vencido
                      </p>
                    </div>
                    <Badge className={getPrioridadColor(gestion.prioridad)}>{gestion.prioridad}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Responsable: {gestion.responsable}</span>
                    <span>Estado: {gestion.estado}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-1" />
                      Llamar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Gestiones</CardTitle>
            <CardDescription>Últimas gestiones realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {historialGestiones.map((gestion, index) => (
                <div key={index} className="border-l-2 border-blue-200 pl-4 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{gestion.fecha}</span>
                    <Badge variant="outline">{gestion.tipo}</Badge>
                  </div>
                  <p className="text-sm font-medium mb-1">{gestion.resultado}</p>
                  <p className="text-xs text-muted-foreground mb-2">{gestion.observaciones}</p>
                  <p className="text-xs text-muted-foreground">Por: {gestion.responsable}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
