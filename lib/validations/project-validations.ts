export interface ProjectFormData {
  name: string
  code: string
  initialBudget: number
  budgetMaterials?: number
  budgetLabor?: number
  budgetOther?: number
  contractAmount?: number
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validateProjectFinancials(data: ProjectFormData): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validar presupuesto inicial
  if (!data.initialBudget || data.initialBudget <= 0) {
    errors.push("El presupuesto inicial debe ser mayor a 0")
  }

  // Validar que los presupuestos parciales no excedan el total
  const budgetMaterials = data.budgetMaterials || 0
  const budgetLabor = data.budgetLabor || 0
  const budgetOther = data.budgetOther || 0
  const sumPartialBudgets = budgetMaterials + budgetLabor + budgetOther

  if (sumPartialBudgets > 0 && sumPartialBudgets > data.initialBudget) {
    errors.push(
      `La suma de presupuestos parciales ($${sumPartialBudgets.toLocaleString()}) excede el presupuesto inicial ($${data.initialBudget.toLocaleString()})`
    )
  }

  // Advertencia si los presupuestos parciales no suman el total
  if (sumPartialBudgets > 0 && sumPartialBudgets < data.initialBudget) {
    const difference = data.initialBudget - sumPartialBudgets
    warnings.push(
      `Los presupuestos parciales suman $${sumPartialBudgets.toLocaleString()}, faltan $${difference.toLocaleString()} para completar el presupuesto inicial`
    )
  }

  // Validar monto de contrato vs presupuesto
  if (data.contractAmount && data.contractAmount < data.initialBudget) {
    warnings.push(
      `El monto del contrato ($${data.contractAmount.toLocaleString()}) es menor al presupuesto inicial ($${data.initialBudget.toLocaleString()}). Esto podría resultar en pérdidas.`
    )
  }

  // Validar que el código del proyecto no esté vacío
  if (!data.code || data.code.trim() === "") {
    errors.push("El código del proyecto es obligatorio")
  }

  // Validar que el nombre del proyecto no esté vacío
  if (!data.name || data.name.trim() === "") {
    errors.push("El nombre del proyecto es obligatorio")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export function formatValidationMessage(result: ValidationResult): string {
  const messages: string[] = []

  if (result.errors.length > 0) {
    messages.push("Errores:")
    result.errors.forEach((error) => messages.push(`• ${error}`))
  }

  if (result.warnings.length > 0) {
    if (messages.length > 0) messages.push("")
    messages.push("Advertencias:")
    result.warnings.forEach((warning) => messages.push(`• ${warning}`))
  }

  return messages.join("\n")
}
