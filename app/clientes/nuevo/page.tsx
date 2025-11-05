"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, ArrowLeft, Building, MapPin, CreditCard } from "lucide-react"
import Link from "next/link"

export default function NuevoClientePage() {
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
    categoria: "",
    contacto: "",
    notas: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Nuevo cliente creado:", formData)
    // Aquí iría la lógica para guardar el cliente
  }

  return (
    <div className="space-y-6">
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
            <h1 className="text-2xl font-bold">Nuevo Cliente</h1>
            <p className="text-muted-foreground">Registrar un nuevo cliente en el sistema</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Building className="h-3 w-3 mr-1" />
          Registro
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mayorista">Mayorista</SelectItem>
                    <SelectItem value="minorista">Minorista</SelectItem>
                    <SelectItem value="distribuidor">Distribuidor</SelectItem>
                    <SelectItem value="gobierno">Gobierno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
          <Link href="/clientes">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Guardar Cliente
          </Button>
        </div>
      </form>
    </div>
  )
}
