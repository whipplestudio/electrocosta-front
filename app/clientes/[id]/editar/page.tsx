"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Save, ArrowLeft, Building, MapPin, CreditCard, Loader2 } from "lucide-react"
import Link from "next/link"
import { clientsService, CreateClientDto } from "@/services/clients.service"
import { useToast } from "@/hooks/use-toast"

export default function EditarClientePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  
  const [formData, setFormData] = useState({
    razonSocial: "",
    rfc: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    limiteCredito: "",
    diasCredito: "",
    contacto: "",
    notas: "",
  })

  // Cargar datos del cliente
  useEffect(() => {
    const loadClient = async () => {
      try {
        setLoadingData(true)
        const id = params.id as string
        const client = await clientsService.getById(id)
        
        setFormData({
          razonSocial: client.name,
          rfc: client.taxId,
          email: client.email || "",
          telefono: client.phone || "",
          direccion: client.address || "",
          ciudad: client.city || "",
          estado: client.state || "",
          codigoPostal: client.zipCode || "",
          limiteCredito: client.creditLimit?.toString() || "",
          diasCredito: client.paymentTerms?.toString() || "",
          contacto: client.contactPerson || "",
          notas: client.notes || "",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar la información del cliente",
          variant: "destructive",
        })
        router.push('/clientes')
      } finally {
        setLoadingData(false)
      }
    }

    if (params.id) {
      loadClient()
    }
  }, [params.id, router, toast])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)

      const clientData: CreateClientDto = {
        name: formData.razonSocial,
        taxId: formData.rfc,
        email: formData.email || undefined,
        phone: formData.telefono || undefined,
        address: formData.direccion || undefined,
        city: formData.ciudad || undefined,
        state: formData.estado || undefined,
        zipCode: formData.codigoPostal || undefined,
        contactPerson: formData.contacto || undefined,
        creditLimit: formData.limiteCredito ? parseFloat(formData.limiteCredito) : 0,
        paymentTerms: formData.diasCredito ? parseInt(formData.diasCredito) : 30,
        notes: formData.notas || undefined,
        status: 'active',
      }

      const id = params.id as string
      await clientsService.update(id, clientData)
      
      toast({
        title: "✅ Cliente actualizado",
        description: "Los cambios han sido guardados exitosamente",
      })

      router.push(`/clientes/${id}`)
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el cliente",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/clientes/${params.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Editar Cliente</h1>
            <p className="text-muted-foreground">Actualizar información del cliente</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Building className="h-3 w-3 mr-1" />
          Edición
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Información General
            </CardTitle>
            <CardDescription>Datos básicos del cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="razonSocial">Razón Social *</Label>
                <Input
                  id="razonSocial"
                  value={formData.razonSocial}
                  onChange={(e) => handleInputChange("razonSocial", e.target.value)}
                  placeholder="Nombre completo o razón social"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rfc">RFC *</Label>
                <Input
                  id="rfc"
                  value={formData.rfc}
                  onChange={(e) => handleInputChange("rfc", e.target.value)}
                  placeholder="RFC del cliente"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  placeholder="(55) 1234-5678"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contacto">Persona de Contacto</Label>
              <Input
                id="contacto"
                value={formData.contacto}
                onChange={(e) => handleInputChange("contacto", e.target.value)}
                placeholder="Nombre del contacto principal"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dirección */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Dirección
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección Completa</Label>
              <Textarea
                id="direccion"
                value={formData.direccion}
                onChange={(e) => handleInputChange("direccion", e.target.value)}
                placeholder="Calle, número, colonia..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={formData.ciudad}
                  onChange={(e) => handleInputChange("ciudad", e.target.value)}
                  placeholder="Ciudad"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => handleInputChange("estado", e.target.value)}
                  placeholder="Estado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigoPostal">Código Postal</Label>
                <Input
                  id="codigoPostal"
                  value={formData.codigoPostal}
                  onChange={(e) => handleInputChange("codigoPostal", e.target.value)}
                  placeholder="12345"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración Comercial */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Configuración Comercial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="limiteCredito">Límite de Crédito</Label>
                <Input
                  id="limiteCredito"
                  type="number"
                  value={formData.limiteCredito}
                  onChange={(e) => handleInputChange("limiteCredito", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diasCredito">Días de Crédito</Label>
                <Input
                  id="diasCredito"
                  type="number"
                  value={formData.diasCredito}
                  onChange={(e) => handleInputChange("diasCredito", e.target.value)}
                  placeholder="30"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notas">Notas Adicionales</Label>
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => handleInputChange("notas", e.target.value)}
                placeholder="Información adicional sobre el cliente..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-4">
          <Link href={`/clientes/${params.id}`}>
            <Button variant="outline" disabled={loading}>Cancelar</Button>
          </Link>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
