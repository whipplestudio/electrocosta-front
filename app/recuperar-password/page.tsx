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
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <DollarSign className="h-10 w-10 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
            <CardDescription className="text-base mt-2">
              {emailSent
                ? "Te hemos enviado un correo con instrucciones"
                : "Ingresa tu correo para recuperar tu contraseña"}
            </CardDescription>
          </div>
        </CardHeader>

        {!emailSent ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@electrocoasta.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar Instrucciones"}
              </Button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-secondary/20 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Hemos enviado un correo a <strong className="text-foreground">{email}</strong> con las instrucciones
                para restablecer tu contraseña.
              </p>
              <p className="text-xs text-muted-foreground">
                Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
              </p>
            </div>

            <div className="pt-4">
              <Link href="/login">
                <Button variant="outline" className="w-full bg-transparent">
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
