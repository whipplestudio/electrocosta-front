"use client"

import { useState } from "react"
import Link from "next/link"
import { DollarSign, Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DynamicForm, FormFieldConfig } from "@/components/forms"
import { toast } from "sonner"

// Configuración de campos del formulario de recuperación
const recoveryFields: FormFieldConfig[] = [
  {
    name: 'email',
    label: 'Correo Electrónico',
    type: 'email',
    placeholder: 'usuario@electrocosta.com',
    required: true,
    autocomplete: 'email',
  },
]

export default function RecuperarPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (data: Record<string, any>) => {
    setIsLoading(true)
    setEmail(data.email)

    try {
      // TODO: Integrar con authService.forgotPassword cuando esté disponible
      // await authService.forgotPassword({ email: data.email });
      
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Password recovery request for:", data.email)
      setEmailSent(true)
      toast.success('Se han enviado las instrucciones a tu correo')
    } catch (error) {
      console.error('Recovery error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al enviar el correo')
    } finally {
      setIsLoading(false)
    }
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
          <CardContent className="px-8 pb-8">
            {/* Formulario usando DynamicForm */}
            <DynamicForm
              config={{
                fields: recoveryFields,
                columns: 1,
                gap: 'medium',
                variant: 'outlined',
                density: 'comfortable',
              }}
              onSubmit={handleSubmit}
              loading={isLoading}
              submitLabel="Enviar Instrucciones"
              showCancel={false}
              footerClassName="pt-4 flex-col gap-4"
              extraButtons={
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio de sesión
                </Link>
              }
            />
          </CardContent>
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
