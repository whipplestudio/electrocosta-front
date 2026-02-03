import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react"
import { validateProjectFinancials, type ProjectFormData } from "@/lib/validations/project-validations"

interface ProjectBudgetValidatorProps {
  formData: ProjectFormData
  showOnlyErrors?: boolean
}

export function ProjectBudgetValidator({ formData, showOnlyErrors = false }: ProjectBudgetValidatorProps) {
  const validation = validateProjectFinancials(formData)

  if (validation.isValid && validation.warnings.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {validation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Errores de Validación</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {validation.errors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {!showOnlyErrors && validation.warnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Advertencias</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-yellow-700">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validation.isValid && validation.warnings.length === 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Validación Exitosa</AlertTitle>
          <AlertDescription className="text-green-700">
            Los datos financieros del proyecto son correctos.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
