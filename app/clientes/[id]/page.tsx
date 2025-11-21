"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Building, Mail, Phone, MapPin, CreditCard, Calendar, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { clientsService, Client } from "@/services/clients.service"
import { useToast } from "@/hooks/use-toast"

export default function ClienteDetallePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadClient = async () => {
      try {
        setLoading(true)
        const id = params.id as string
        const clientData = await clientsService.getById(id)
        setClient(clientData)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar la información del cliente",
          variant: "destructive",
        })
        router.push('/clientes')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadClient()
    }
  }, [params.id, router, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!client) {
    return null
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clientes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground">Información del cliente</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/clientes/${client.id}/editar`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Badge variant={client.status === "active" ? "default" : "destructive"} className="h-9 px-4">
            {client.status === "active" ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información General */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Razón Social</label>
                  <p className="text-base font-medium">{client.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">RFC / Tax ID</label>
                  <p className="text-base font-mono">{client.taxId}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-base">{client.email || "No especificado"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                    <p className="text-base">{client.phone || "No especificado"}</p>
                  </div>
                </div>
              </div>

              {client.contactPerson && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Persona de Contacto</label>
                    <p className="text-base font-medium">{client.contactPerson}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Dirección */}
          {(client.address || client.city || client.state) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Dirección
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.address && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dirección</label>
                    <p className="text-base">{client.address}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {client.city && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ciudad</label>
                      <p className="text-base">{client.city}</p>
                    </div>
                  )}
                  {client.state && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Estado</label>
                      <p className="text-base">{client.state}</p>
                    </div>
                  )}
                  {client.zipCode && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Código Postal</label>
                      <p className="text-base">{client.zipCode}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas */}
          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base whitespace-pre-wrap">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Información Comercial */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Información Comercial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Límite de Crédito</label>
                <p className="text-2xl font-bold text-primary">
                  {client.creditLimit ? `$${client.creditLimit.toLocaleString()}` : "Sin límite"}
                </p>
              </div>
              
              <Separator />

              <div>
                <label className="text-sm font-medium text-muted-foreground">Días de Crédito</label>
                <p className="text-xl font-semibold">
                  {client.paymentTerms ? `${client.paymentTerms} días` : "N/A"}
                </p>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                <div className="mt-2">
                  <Badge variant={client.status === "active" ? "default" : "destructive"}>
                    {client.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha de Registro</label>
                <p className="text-sm">
                  {new Date(client.createdAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Última Actualización</label>
                <p className="text-sm">
                  {new Date(client.updatedAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
