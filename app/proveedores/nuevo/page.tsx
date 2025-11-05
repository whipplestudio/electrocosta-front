"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NuevoProveedorPage() {
  const [formData, setFormData] = useState({
    razonSocial: "",
    rfc: "",
    email: "",
    telefono: "",
    categoria: "",
    tipoProveedor: "",
    condicionesPago: "",
    limiteCredito: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    contactoPrincipal: "",
    telefonoContacto: "",
    emailContacto: "",
    banco: "",
    numeroCuenta: "",
    clabe: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Nuevo proveedor:", formData)
    // Aquí iría la lógica para guardar el proveedor
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/proveedores">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Nuevo Proveedor</h1>
            <p className="text-muted-foreground">Registrar un nuevo proveedor en el sistema</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Información General
              </CardTitle>
              <CardDescription>Datos básicos del proveedor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="razonSocial">Razón Social *</Label>
                  <Input
                    id="razonSocial"
                    value={formData.razonSocial}
                    onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                    placeholder="Nombre de la empresa"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rfc">RFC *</Label>
                  <Input
                    id="rfc"
                    value={formData.rfc}
                    onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                    placeholder="RFC del proveedor"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="correo@empresa.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="(55) 1234-5678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="materiales">Materiales Eléctricos</SelectItem>
                      <SelectItem value="servicios">Servicios</SelectItem>
                      <SelectItem value="equipos">Equipos y Herramientas</SelectItem>
                      <SelectItem value="transporte">Transporte</SelectItem>
                      <SelectItem value="oficina">Suministros de Oficina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipoProveedor">Tipo de Proveedor</Label>
                  <Select
                    value={formData.tipoProveedor}
                    onValueChange={(value) => setFormData({ ...formData, tipoProveedor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nacional">Nacional</SelectItem>
                      <SelectItem value="internacional">Internacional</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Comercial */}
          <Card>
            <CardHeader>
              <CardTitle>Información Comercial</CardTitle>
              <CardDescription>Condiciones y términos comerciales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="condicionesPago">Condiciones de Pago</Label>
                  <Select
                    value={formData.condicionesPago}
                    onValueChange={(value) => setFormData({ ...formData, condicionesPago: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar condiciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contado">Contado</SelectItem>
                      <SelectItem value="15-dias">15 días</SelectItem>
                      <SelectItem value="30-dias">30 días</SelectItem>
                      <SelectItem value="45-dias">45 días</SelectItem>
                      <SelectItem value="60-dias">60 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limiteCredito">Límite de Crédito</Label>
                  <Input
                    id="limiteCredito"
                    type="number"
                    value={formData.limiteCredito}
                    onChange={(e) => setFormData({ ...formData, limiteCredito: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Dirección completa"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Input
                    id="ciudad"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    placeholder="Ciudad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    placeholder="Estado"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigoPostal">Código Postal</Label>
                  <Input
                    id="codigoPostal"
                    value={formData.codigoPostal}
                    onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                    placeholder="12345"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información de Contacto y Bancaria */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contacto Principal</CardTitle>
              <CardDescription>Información del contacto principal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactoPrincipal">Nombre del Contacto</Label>
                <Input
                  id="contactoPrincipal"
                  value={formData.contactoPrincipal}
                  onChange={(e) => setFormData({ ...formData, contactoPrincipal: e.target.value })}
                  placeholder="Nombre completo"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefonoContacto">Teléfono</Label>
                  <Input
                    id="telefonoContacto"
                    value={formData.telefonoContacto}
                    onChange={(e) => setFormData({ ...formData, telefonoContacto: e.target.value })}
                    placeholder="(55) 1234-5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailContacto">Email</Label>
                  <Input
                    id="emailContacto"
                    type="email"
                    value={formData.emailContacto}
                    onChange={(e) => setFormData({ ...formData, emailContacto: e.target.value })}
                    placeholder="contacto@empresa.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información Bancaria</CardTitle>
              <CardDescription>Datos para pagos y transferencias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="banco">Banco</Label>
                <Input
                  id="banco"
                  value={formData.banco}
                  onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                  placeholder="Nombre del banco"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numeroCuenta">Número de Cuenta</Label>
                <Input
                  id="numeroCuenta"
                  value={formData.numeroCuenta}
                  onChange={(e) => setFormData({ ...formData, numeroCuenta: e.target.value })}
                  placeholder="1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clabe">CLABE</Label>
                <Input
                  id="clabe"
                  value={formData.clabe}
                  onChange={(e) => setFormData({ ...formData, clabe: e.target.value })}
                  placeholder="123456789012345678"
                  maxLength={18}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/proveedores">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Guardar Proveedor
          </Button>
        </div>
      </form>
    </div>
  )
}
