"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Loader2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { clientsService, Client } from "@/services/clients.service"
import { useToast } from "@/hooks/use-toast"

export default function ClientesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  // Función para cargar clientes
  const loadClients = async (search?: string) => {
    try {
      setLoading(true)
      const response = await clientsService.list({ search, limit: 100 })
      setClients(response.data)
      setTotal(response.total)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      })
      console.error("Error loading clients:", error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClients()
  }, [])

  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadClients(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Calcular KPIs
  const clientesActivos = clients.filter((c) => c.status === "active").length
  const totalCredito = clients.reduce((sum, c) => sum + (c.creditLimit || 0), 0)

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1>
          <p className="text-muted-foreground">Administra la información y créditos de tus clientes</p>
        </div>
        <Button className="gap-2" onClick={() => router.push('/clientes/nuevo')}>
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">{clientesActivos} activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crédito Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCredito.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Límite autorizado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "Cargando..." : "Listo"}</div>
            <p className="text-xs text-muted-foreground">Sistema operativo</p>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Búsqueda</CardTitle>
          <CardDescription>Busca por nombre, RFC, email o persona de contacto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Clientes</CardTitle>
          <CardDescription>
            {loading ? "Cargando..." : `${clients.length} cliente(s) encontrado(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No se encontraron clientes
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>RFC</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Límite Crédito</TableHead>
                  <TableHead>Días Crédito</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        {client.contactPerson && (
                          <div className="text-sm text-muted-foreground">
                            Contacto: {client.contactPerson}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{client.taxId}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {client.email && <div>{client.email}</div>}
                        {client.phone && (
                          <div className="text-muted-foreground">{client.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.creditLimit 
                        ? `$${client.creditLimit.toLocaleString()}` 
                        : "Sin límite"}
                    </TableCell>
                    <TableCell>
                      {client.paymentTerms ? `${client.paymentTerms} días` : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={client.status === "active" ? "default" : "destructive"}
                      >
                        {client.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/clientes/${client.id}`)}
                        >
                          Ver
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/clientes/${client.id}/editar`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
