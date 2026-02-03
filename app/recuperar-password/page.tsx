"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { DollarSign, Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function RecuperarPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simular llamada a API
    setTimeout(() => {
      console.log("[v0] Password recovery request for:", email)
      setEmailSent(true)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        {/* Header mejorado con Material Design 3 */}
        <CardHeader className="space-y-6 text-center pt-8 pb-6">
          <div className="mx-auto w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-lg transition-transform hover:scale-105">
            <DollarSign className="h-12 w-12 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">Recuperar Contraseña</CardTitle>
            <CardDescription className="text-base font-medium">
              {emailSent
                ? "Te hemos enviado un correo con instrucciones"
                : "Ingresa tu correo para recuperar tu contraseña"}
            </CardDescription>
          </div>
        </CardHeader>

        {!emailSent ? (
          <form onSubmit={handleSubmit}>
            {/* Formulario mejorado */}
            <CardContent className="space-y-6 px-8">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@electrocoasta.com"
                    className="pl-12 h-12 text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>

            {/* Footer mejorado */}
            <CardFooter className="flex flex-col space-y-4 px-8 pb-8 pt-2">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all" 
                size="lg" 
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar Instrucciones"}
              </Button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-6 px-8 pb-8">
            <div className="text-center space-y-5">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center shadow-md">
                <Mail className="h-10 w-10 text-green-600" />
              </div>
              <div className="space-y-3">
                <p className="text-base text-muted-foreground leading-relaxed">
                  Hemos enviado un correo a <strong className="text-foreground font-semibold">{email}</strong> con las instrucciones
                  para restablecer tu contraseña.
                </p>
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/login">
                <Button 
                  variant="outline" 
                  className="w-full h-12 font-medium hover:bg-accent transition-all"
                  size="lg"
                >
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
