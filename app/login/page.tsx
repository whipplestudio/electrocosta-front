"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { DollarSign, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { authService } from "@/services/auth.service"

// Componente separado que usa useSearchParams
function LoginErrorHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    const message = searchParams.get('message')

    if (error === 'no_permissions' && message) {
      toast.error(decodeURIComponent(message), {
        duration: 6000,
      })
    }
  }, [searchParams])

  return null
}

function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      })

      toast.success(`¡Bienvenido, ${response.user.firstName}!`)
      
      // Redirigir al dashboard principal
      setTimeout(() => {
        router.push("/")
      }, 500)
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Credenciales incorrectas. Verifica tu email y contraseña.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Suspense fallback={null}>
        <LoginErrorHandler />
      </Suspense>
      {/* Fondo mejorado con Material Design 3 */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          {/* Header con mejor diseño */}
          <CardHeader className="space-y-6 text-center pt-8 pb-6">
            <div className="mx-auto w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-lg transition-transform hover:scale-105">
              <DollarSign className="h-12 w-12 text-primary-foreground" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight">Grupo BARREDA</CardTitle>
              <CardDescription className="text-base font-medium">ERP Financiero - Iniciar Sesión</CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            {/* Contenido del formulario mejorado */}
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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold">Contraseña</Label>
                  <Link 
                    href="/recuperar-password" 
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    className="pl-12 pr-12 h-12 text-base"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </CardContent>

            {/* Footer con botón mejorado */}
            <CardFooter className="flex flex-col space-y-4 px-8 pb-8 pt-2">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all" 
                size="lg" 
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  )
}

export default function LoginPage() {
  return <LoginForm />
}
