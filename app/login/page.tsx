"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { authService } from "@/services/auth.service"
import { DynamicForm, FormFieldConfig } from "@/components/forms"

// Configuración de campos del formulario de login
const loginFields: FormFieldConfig[] = [
  {
    name: 'email',
    label: 'Correo Electrónico',
    type: 'email',
    placeholder: 'usuario@electrocosta.com',
    required: true,
    autocomplete: 'email',
  },
  {
    name: 'password',
    label: 'Contraseña',
    type: 'password',
    placeholder: 'Ingresa tu contraseña',
    required: true,
    minLength: 8,
    autocomplete: 'current-password',
  },
]

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
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: Record<string, any>) => {
    setIsLoading(true)

    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
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

          <CardContent className="px-8 pb-8">
            {/* Formulario usando DynamicForm */}
            <DynamicForm
              config={{
                fields: loginFields,
                columns: 1,
                gap: 'medium',
                variant: 'outlined',
                density: 'comfortable',
              }}
              onSubmit={handleSubmit}
              loading={isLoading}
              submitLabel="Iniciar Sesión"
              showCancel={false}
              footerClassName="pt-4"
              extraButtons={
                <Link
                  href="/recuperar-password"
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              }
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default function LoginPage() {
  return <LoginForm />
}
