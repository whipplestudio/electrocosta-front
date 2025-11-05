"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, AlertTriangle, CheckCircle, Clock, Settings, Trash2, Eye } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  timestamp: string
  read: boolean
  module: string
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Cuenta Vencida",
    message: "La factura FAC-2024-001 de Constructora ABC ha vencido hace 15 días",
    type: "error",
    timestamp: "2024-01-15 10:30",
    read: false,
    module: "Cuentas por Cobrar",
  },
  {
    id: "2",
    title: "Pago Recibido",
    message: "Se ha registrado un pago de $150,000 de Empresa XYZ",
    type: "success",
    timestamp: "2024-01-15 09:15",
    read: true,
    module: "Cuentas por Cobrar",
  },
  {
    id: "3",
    title: "Próximo Vencimiento",
    message: "La factura PROV-2024-003 vence en 3 días",
    type: "warning",
    timestamp: "2024-01-15 08:00",
    read: false,
    module: "Cuentas por Pagar",
  },
  {
    id: "4",
    title: "Carga Completada",
    message: "Se han procesado 25 facturas XML exitosamente",
    type: "info",
    timestamp: "2024-01-14 16:45",
    read: true,
    module: "Carga de Información",
  },
]

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroModulo, setFiltroModulo] = useState<string>("todos")

  const notificacionesFiltradas = notifications.filter((notif) => {
    const matchTipo = filtroTipo === "todos" || notif.type === filtroTipo
    const matchModulo = filtroModulo === "todos" || notif.module === filtroModulo
    return matchTipo && matchModulo
  })

  const notificacionesNoLeidas = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Advertencia</Badge>
      case "success":
        return <Badge className="bg-green-100 text-green-800">Éxito</Badge>
      default:
        return <Badge variant="secondary">Info</Badge>
    }
  }

  const marcarComoLeida = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const marcarTodasLeidas = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground">Gestiona alertas y notificaciones del sistema</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {notificacionesNoLeidas} sin leer
          </Badge>
          <Button variant="outline" onClick={() => setIsConfigDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
          <Button onClick={marcarTodasLeidas}>Marcar todas como leídas</Button>
        </div>
      </div>

      <Tabs defaultValue="inbox" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Bandeja de Entrada
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="error">Errores</SelectItem>
                      <SelectItem value="warning">Advertencias</SelectItem>
                      <SelectItem value="success">Éxito</SelectItem>
                      <SelectItem value="info">Información</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Módulo</Label>
                  <Select value={filtroModulo} onValueChange={setFiltroModulo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="Cuentas por Cobrar">Cuentas por Cobrar</SelectItem>
                      <SelectItem value="Cuentas por Pagar">Cuentas por Pagar</SelectItem>
                      <SelectItem value="Carga de Información">Carga de Información</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Notificaciones */}
          <div className="space-y-4">
            {notificacionesFiltradas.map((notification) => (
              <Card key={notification.id} className={`${!notification.read ? "border-l-4 border-l-blue-500" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                            {notification.title}
                          </h3>
                          {getNotificationBadge(notification.type)}
                          <Badge variant="outline" className="text-xs">
                            {notification.module}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button variant="ghost" size="sm" onClick={() => marcarComoLeida(notification.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>Personaliza cómo y cuándo recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notificaciones por Email</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Cuentas Vencidas</Label>
                      <p className="text-sm text-muted-foreground">Recibir email cuando una cuenta venza</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Próximos Vencimientos</Label>
                      <p className="text-sm text-muted-foreground">Alertas 3 días antes del vencimiento</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Pagos Recibidos</Label>
                      <p className="text-sm text-muted-foreground">Confirmación de pagos aplicados</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notificaciones en la App</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Alertas de Sistema</Label>
                      <p className="text-sm text-muted-foreground">Errores y actualizaciones del sistema</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Actividad de Usuarios</Label>
                      <p className="text-sm text-muted-foreground">Accesos y cambios realizados por otros usuarios</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configuración de Email</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email Principal</Label>
                    <Input placeholder="usuario@electrocosta.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Frecuencia de Resumen</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diario">Diario</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensual">Mensual</SelectItem>
                        <SelectItem value="nunca">Nunca</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Guardar Configuración</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
