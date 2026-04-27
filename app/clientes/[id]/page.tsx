"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building2, Mail, Phone, Calendar, FileText, Loader2, User, Hash, FileDigit } from "lucide-react"
import Link from "next/link"
import { clientsService, Client } from "@/services/clients.service"
import { toast } from "sonner"
import { ActionButton } from "@/components/ui"

export default function ClienteDetallePage() {
  const router = useRouter()
  const params = useParams()
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
        toast.error("No se pudo cargar la información del cliente")
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#164e63]" />
          <p className="text-sm text-[#475569]">Cargando información del cliente...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return null
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/clientes">
            <ActionButton variant="back" size="sm">
              Volver
            </ActionButton>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">{client.name}</h1>
            <p className="text-sm text-[#64748b]">Información del cliente</p>
          </div>
        </div>
        <Badge 
          variant={client.status === "active" ? "default" : "secondary"} 
          className={`h-9 px-4 py-2 text-sm font-medium ${
            client.status === "active" 
              ? "bg-[#164e63] text-white hover:bg-[#164e63]/90" 
              : "bg-[#94a3b8] text-white"
          }`}
        >
          {client.status === "active" ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información General */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-[#e2e8f0] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#f1f5f9]">
              <CardTitle className="flex items-center gap-2 text-lg text-[#0f172a]">
                <div className="p-1.5 rounded-md bg-[#164e63]/10">
                  <Building2 className="h-5 w-5 text-[#164e63]" />
                </div>
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              {/* Razón Social y RFC */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[#64748b] flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    Razón Social
                  </label>
                  <p className="text-base font-medium text-[#0f172a]">{client.name}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[#64748b] flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5" />
                    RFC / Tax ID
                  </label>
                  <p className="text-base font-mono text-[#334155] bg-[#f8fafc] px-2 py-1 rounded inline-block">
                    {client.taxId}
                  </p>
                </div>
              </div>

              <Separator className="bg-[#e2e8f0]" />

              {/* Email y Teléfono */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[#64748b] flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </label>
                  <p className="text-base text-[#334155]">
                    {client.email ? (
                      <a href={`mailto:${client.email}`} className="text-[#164e63] hover:underline">
                        {client.email}
                      </a>
                    ) : (
                      <span className="text-[#94a3b8] italic">No especificado</span>
                    )}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[#64748b] flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    Teléfono
                  </label>
                  <p className="text-base text-[#334155]">
                    {client.phone ? (
                      <a href={`tel:${client.phone}`} className="text-[#164e63] hover:underline">
                        {client.phone}
                      </a>
                    ) : (
                      <span className="text-[#94a3b8] italic">No especificado</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Persona de Contacto */}
              {client.contactPerson && (
                <>
                  <Separator className="bg-[#e2e8f0]" />
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#64748b] flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Persona de Contacto
                    </label>
                    <p className="text-base font-medium text-[#0f172a]">{client.contactPerson}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notas */}
          {client.notes && (
            <Card className="border-[#e2e8f0] shadow-sm">
              <CardHeader className="pb-3 border-b border-[#f1f5f9]">
                <CardTitle className="flex items-center gap-2 text-lg text-[#0f172a]">
                  <div className="p-1.5 rounded-md bg-[#0ea5e9]/10">
                    <FileText className="h-5 w-5 text-[#0ea5e9]" />
                  </div>
                  Notas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="bg-[#f8fafc] rounded-lg p-4 border border-[#e2e8f0]">
                  <p className="text-sm text-[#334155] whitespace-pre-wrap leading-relaxed">
                    {client.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Información del Sistema */}
        <div className="space-y-6">
          <Card className="border-[#e2e8f0] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#f1f5f9]">
              <CardTitle className="flex items-center gap-2 text-lg text-[#0f172a]">
                <div className="p-1.5 rounded-md bg-[#64748b]/10">
                  <Calendar className="h-5 w-5 text-[#64748b]" />
                </div>
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {/* Estado */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                  Estado
                </label>
                <div>
                  <Badge 
                    variant={client.status === "active" ? "default" : "secondary"}
                    className={`text-sm font-medium ${
                      client.status === "active" 
                        ? "bg-[#164e63] text-white hover:bg-[#164e63]/90" 
                        : "bg-[#94a3b8] text-white"
                    }`}
                  >
                    {client.status === "active" ? "● Activo" : "● Inactivo"}
                  </Badge>
                </div>
              </div>

              <Separator className="bg-[#e2e8f0]" />

              {/* Fechas */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[#64748b] flex items-center gap-1.5">
                    <FileDigit className="h-3.5 w-3.5" />
                    Fecha de Registro
                  </label>
                  <p className="text-sm font-medium text-[#334155]">
                    {new Date(client.createdAt).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[#64748b] flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Última Actualización
                  </label>
                  <p className="text-sm font-medium text-[#334155]">
                    {new Date(client.updatedAt).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
