"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Send, Edit, Trash2, Plus } from "lucide-react"

export default function NotificacionesEmailPage() {
  const [configuracionActiva, setConfiguracionActiva] = useState(true)

  const plantillasEmail = [
    {
      id: "TEMP-001",
      nombre: "Recordatorio de Pago",
      asunto: "Recordatorio: Factura {numero} vence en {dias} días",
      tipo: "cuentas-cobrar",
      activa: true,
      ultimoUso: "2024-01-15",
    },
    {
      id: "TEMP-002",
      nombre: "Pago Vencido",
      asunto: "URGENTE: Factura {numero} vencida desde {fecha}",
      tipo: "cuentas-cobrar",
      activa: true,
      ultimoUso: "2024-01-14",
    },
    {
      id: "TEMP-003",
      nombre: "Aprobación de Pago",
      asunto: "Solicitud de aprobación: Pago por ${monto}",
      tipo: "cuentas-pagar",
      activa: true,
      ultimoUso: "2024-01-13",
    },
    {
      id: "TEMP-004",
      nombre: "Reporte Mensual",
      asunto: "Reporte financiero mensual - {mes} {año}",
      tipo: "reportes",
      activa: false,
      ultimoUso: "2024-01-01",
    },
  ]

  const destinatarios = [
    {
      id: "DEST-001",
      nombre: "Juan Pérez",
      email: "juan.perez@electrocostacrm.com",
      rol: "Gerente Financiero",
      modulos: ["cuentas-cobrar", "cuentas-pagar", "reportes"],
      activo: true,
    },
    {
      id: "DEST-002",
      nombre: "María González",
      email: "maria.gonzalez@electrocostacrm.com",
      rol: "Contador",
      modulos: ["cuentas-pagar", "reportes"],
      activo: true,
    },
    {
      id: "DEST-003",
      nombre: "Carlos Ruiz",
      email: "carlos.ruiz@electrocostacrm.com",
      rol: "Director General",
      modulos: ["reportes"],
      activo: true,
    },
  ]

  const historialEnvios = [
    {
      id: "ENV-001",
      plantilla: "Recordatorio de Pago",
      destinatario: "cliente@empresa.com",
      asunto: "Recordatorio: Factura F-001 vence en 3 días",
      fechaEnvio: "2024-01-15 14:30",
      estado: "entregado",
    },
    {
      id: "ENV-002",
      plantilla: "Aprobación de Pago",
      destinatario: "juan.perez@electrocostacrm.com",
      asunto: "Solicitud de aprobación: Pago por $125,000",
      fechaEnvio: "2024-01-15 10:15",
      estado: "leido",
    },
    {
      id: "ENV-003",
      plantilla: "Pago Vencido",
      destinatario: "moroso@empresa.com",
      asunto: "URGENTE: Factura F-002 vencida desde 15/01/2024",
      fechaEnvio: "2024-01-14 16:45",
      estado: "rebotado",
    },
  ]

  const estadoColors = {
    entregado: "bg-green-100 text-green-800",
    leido: "bg-blue-100 text-blue-800",
    rebotado: "bg-red-100 text-red-800",
    pendiente: "bg-yellow-100 text-yellow-800",
  }

  const tipoColors = {
    "cuentas-cobrar": "bg-blue-100 text-blue-800",
    "cuentas-pagar": "bg-orange-100 text-orange-800",
    reportes: "bg-purple-100 text-purple-800",
    general: "bg-gray-100 text-gray-800",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notificaciones por Email</h1>
        <p className="text-gray-600">Configura alertas automáticas y plantillas de email</p>
      </div>

      {/* Configuración General */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>Configuración global del sistema de notificaciones por email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notificaciones Activas</h4>
                  <p className="text-sm text-gray-600">Habilitar envío automático de emails</p>
                </div>
                <Switch checked={configuracionActiva} onCheckedChange={setConfiguracionActiva} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Servidor SMTP</label>
                <Input defaultValue="smtp.gmail.com" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Puerto</label>
                <Input defaultValue="587" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Remitente</label>
                <Input defaultValue="noreply@electrocostacrm.com" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nombre Remitente</label>
                <Input defaultValue="Electro Costa CRM" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Frecuencia de Envío</label>
                <Select defaultValue="inmediato">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inmediato">Inmediato</SelectItem>
                    <SelectItem value="cada-hora">Cada hora</SelectItem>
                    <SelectItem value="diario">Diario (9:00 AM)</SelectItem>
                    <SelectItem value="semanal">Semanal (Lunes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Settings className="h-4 w-4 mr-2" />
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Gestión */}
      <Tabs defaultValue="plantillas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plantillas">Plantillas de Email</TabsTrigger>
          <TabsTrigger value="destinatarios">Destinatarios</TabsTrigger>
          <TabsTrigger value="historial">Historial de Envíos</TabsTrigger>
        </TabsList>

        <TabsContent value="plantillas" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Plantillas de Email</CardTitle>
                  <CardDescription>Gestiona las plantillas para diferentes tipos de notificaciones</CardDescription>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Plantilla
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Asunto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último Uso</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plantillasEmail.map((plantilla) => (
                    <TableRow key={plantilla.id}>
                      <TableCell className="font-medium">{plantilla.nombre}</TableCell>
                      <TableCell className="max-w-xs truncate">{plantilla.asunto}</TableCell>
                      <TableCell>
                        <Badge className={tipoColors[plantilla.tipo as keyof typeof tipoColors]}>
                          {plantilla.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={plantilla.activa ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {plantilla.activa ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                      <TableCell>{plantilla.ultimoUso}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="destinatarios" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Destinatarios</CardTitle>
                  <CardDescription>Configura quién recibe notificaciones de cada módulo</CardDescription>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Destinatario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Módulos Suscritos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {destinatarios.map((destinatario) => (
                    <TableRow key={destinatario.id}>
                      <TableCell className="font-medium">{destinatario.nombre}</TableCell>
                      <TableCell>{destinatario.email}</TableCell>
                      <TableCell>{destinatario.rol}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {destinatario.modulos.map((modulo) => (
                            <Badge
                              key={modulo}
                              variant="outline"
                              className={tipoColors[modulo as keyof typeof tipoColors]}
                            >
                              {modulo}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={destinatario.activo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {destinatario.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="historial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Envíos</CardTitle>
              <CardDescription>Registro de todos los emails enviados por el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-4">
                <Input placeholder="Buscar por destinatario o asunto..." className="flex-1" />
                <Select defaultValue="todos">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="entregado">Entregados</SelectItem>
                    <SelectItem value="leido">Leídos</SelectItem>
                    <SelectItem value="rebotado">Rebotados</SelectItem>
                    <SelectItem value="pendiente">Pendientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plantilla</TableHead>
                    <TableHead>Destinatario</TableHead>
                    <TableHead>Asunto</TableHead>
                    <TableHead>Fecha de Envío</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historialEnvios.map((envio) => (
                    <TableRow key={envio.id}>
                      <TableCell className="font-medium">{envio.plantilla}</TableCell>
                      <TableCell>{envio.destinatario}</TableCell>
                      <TableCell className="max-w-xs truncate">{envio.asunto}</TableCell>
                      <TableCell>{envio.fechaEnvio}</TableCell>
                      <TableCell>
                        <Badge className={estadoColors[envio.estado as keyof typeof estadoColors]}>
                          {envio.estado}
                        </Badge>
                      </TableCell>
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
