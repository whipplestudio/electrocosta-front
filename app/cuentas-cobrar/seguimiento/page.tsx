"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, Phone, Mail, Calendar, TrendingUp, AlertTriangle, CheckCircle, Loader2, X } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { accountsReceivableService, followUpService } from "@/services/accounts-receivable.service"
import type { AccountReceivable, FollowUp } from "@/types/accounts-receivable"

type AccountStatus = 'vencido' | 'vigente' | 'por_vencer';

interface AccountWithStatus extends AccountReceivable {
  estado: AccountStatus;
  diasVencido: number;
  ultimoSeguimiento?: FollowUp;
}

const estadoBadgeVariant = {
  vencido: "destructive",
  vigente: "default",
  por_vencer: "secondary",
} as const

export default function SeguimientoCuentasCobrar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("todos")
  const [accounts, setAccounts] = useState<AccountWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState<AccountWithStatus | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showCallDialog, setShowCallDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [callNotes, setCallNotes] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")

  // Calcular estado y días vencidos
  const calculateStatus = (account: AccountReceivable): { estado: AccountStatus; diasVencido: number } => {
    const today = new Date()
    const dueDate = new Date(account.dueDate)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { estado: 'vencido', diasVencido: Math.abs(diffDays) }
    } else if (diffDays <= 7) {
      return { estado: 'por_vencer', diasVencido: diffDays }
    } else {
      return { estado: 'vigente', diasVencido: diffDays }
    }
  }

  // Cargar cuentas y seguimientos
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [accountsData, followUpsData] = await Promise.all([
        accountsReceivableService.list({ page: 1, limit: 100 }),
        followUpService.list().catch(() => []), // Si falla, retornar array vacío
      ])

      const accountsWithStatus: AccountWithStatus[] = accountsData.data.map((account) => {
        const status = calculateStatus(account)
        const lastFollowUp = Array.isArray(followUpsData) 
          ? followUpsData
              .filter((f) => f.accountReceivableId === account.id)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
          : undefined

        return {
          ...account,
          ...status,
          ultimoSeguimiento: lastFollowUp,
        }
      })

      setAccounts(accountsWithStatus)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar las cuentas por cobrar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Registrar llamada
  const handleCall = async () => {
    if (!selectedAccount || !callNotes.trim()) {
      toast.error('Por favor ingresa notas de la llamada')
      return
    }
    
    try {
      setActionLoading(true)
      await followUpService.create(selectedAccount.id, {
        type: 'call' as any,
        description: 'Llamada telefónica al cliente',
        result: 'contacted' as any,
        notes: callNotes,
      })
      toast.success('Llamada registrada exitosamente')
      setShowCallDialog(false)
      setSelectedAccount(null)
      setCallNotes('')
      await loadData()
    } catch (error) {
      console.error('Error al registrar llamada:', error)
      toast.error('Error al registrar la llamada')
    } finally {
      setActionLoading(false)
    }
  }

  // Enviar correo
  const handleEmail = async () => {
    if (!selectedAccount || !emailSubject.trim() || !emailBody.trim()) {
      toast.error('Por favor completa todos los campos del correo')
      return
    }
    
    try {
      setActionLoading(true)
      await followUpService.create(selectedAccount.id, {
        type: 'email' as any,
        description: `Correo: ${emailSubject}`,
        result: 'contacted' as any,
        notes: emailBody,
      })
      toast.success('Correo registrado exitosamente')
      setShowEmailDialog(false)
      setSelectedAccount(null)
      setEmailSubject('')
      setEmailBody('')
      await loadData()
    } catch (error) {
      console.error('Error al registrar correo:', error)
      toast.error('Error al registrar el correo')
    } finally {
      setActionLoading(false)
    }
  }

  // Filtrar datos
  const filteredData = accounts.filter((item) => {
    const matchesSearch =
      item.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = estadoFilter === "todos" || item.estado === estadoFilter

    return matchesSearch && matchesEstado
  })

  // Calcular totales
  const totalVencido = accounts
    .filter((item) => item.estado === "vencido")
    .reduce((sum, item) => sum + Number(item.balance || 0), 0)
  const totalPorVencer = accounts
    .filter((item) => item.estado === "por_vencer")
    .reduce((sum, item) => sum + Number(item.balance || 0), 0)
  const totalVigente = accounts
    .filter((item) => item.estado === "vigente")
    .reduce((sum, item) => sum + Number(item.balance || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

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
            <div className="text-2xl font-bold text-destructive">${(totalVencido || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Requiere acción inmediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">${(totalPorVencer || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Próximos 7 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vigente</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${(totalVigente || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">En tiempo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cuentas</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{accounts.length}</div>
            <p className="text-xs text-muted-foreground">En seguimiento</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="seguimiento" className="space-y-4">
        <TabsList>
          <TabsTrigger value="seguimiento">Seguimiento Activo</TabsTrigger>
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
              </div>

              {/* Tabla */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Factura</TableHead>
                      <TableHead>Saldo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Días</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No se encontraron cuentas por cobrar
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.client?.name || 'N/A'}</TableCell>
                          <TableCell>{item.invoiceNumber}</TableCell>
                          <TableCell>${Number(item.balance || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={estadoBadgeVariant[item.estado]}>
                              {item.estado === "vencido"
                                ? "Vencido"
                                : item.estado === "por_vencer"
                                  ? "Por Vencer"
                                  : "Vigente"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.diasVencido > 0 && item.estado === 'vencido'
                              ? `+${item.diasVencido}`
                              : item.estado === 'por_vencer'
                                ? item.diasVencido
                                : '0'}
                          </TableCell>
                          <TableCell>{new Date(item.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedAccount(item)
                                  setShowDetailDialog(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedAccount(item)
                                  setShowCallDialog(true)
                                }}
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedAccount(item)
                                  setEmailSubject(`Seguimiento de factura ${item.invoiceNumber}`)
                                  setShowEmailDialog(true)
                                }}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Ver Detalle */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Cuenta por Cobrar</DialogTitle>
            <DialogDescription>
              Información completa de la factura {selectedAccount?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Cliente</Label>
                  <p className="text-sm">{selectedAccount.client?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Factura</Label>
                  <p className="text-sm">{selectedAccount.invoiceNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Monto Total</Label>
                  <p className="text-sm font-bold">${Number(selectedAccount.amount).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Saldo Pendiente</Label>
                  <p className="text-sm font-bold text-orange-600">${Number(selectedAccount.balance).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fecha de Emisión</Label>
                  <p className="text-sm">{new Date(selectedAccount.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fecha de Vencimiento</Label>
                  <p className="text-sm">{new Date(selectedAccount.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estado</Label>
                  <Badge variant={estadoBadgeVariant[selectedAccount.estado]}>
                    {selectedAccount.estado === "vencido"
                      ? "Vencido"
                      : selectedAccount.estado === "por_vencer"
                        ? "Por Vencer"
                        : "Vigente"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Días {selectedAccount.estado === 'vencido' ? 'Vencidos' : 'para Vencimiento'}</Label>
                  <p className="text-sm font-bold">{selectedAccount.diasVencido}</p>
                </div>
              </div>
              {selectedAccount.description && (
                <div>
                  <Label className="text-sm font-medium">Descripción</Label>
                  <p className="text-sm text-muted-foreground">{selectedAccount.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Registrar Llamada */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Llamada</DialogTitle>
            <DialogDescription>
              Cliente: {selectedAccount?.client?.name} - Factura: {selectedAccount?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="call-notes">Notas de la llamada</Label>
              <Textarea
                id="call-notes"
                placeholder="¿Qué se habló en la llamada? ¿Hubo compromiso de pago?"
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCallDialog(false)
              setCallNotes('')
              setSelectedAccount(null)
            }}>
              Cancelar
            </Button>
            <Button onClick={handleCall} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Registrar Llamada'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Registrar Email */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Correo Enviado</DialogTitle>
            <DialogDescription>
              Cliente: {selectedAccount?.client?.name} - Factura: {selectedAccount?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-subject">Asunto</Label>
              <Input
                id="email-subject"
                placeholder="Asunto del correo"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email-body">Contenido del correo</Label>
              <Textarea
                id="email-body"
                placeholder="Contenido del correo enviado al cliente..."
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEmailDialog(false)
              setEmailSubject('')
              setEmailBody('')
              setSelectedAccount(null)
            }}>
              Cancelar
            </Button>
            <Button onClick={handleEmail} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Registrar Correo'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
