import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface BudgetProgressBarProps {
  budgetAmount: number
  spentAmount: number
  currency?: string
  showDetails?: boolean
  className?: string
}

export function BudgetProgressBar({
  budgetAmount,
  spentAmount,
  currency = "MXN",
  showDetails = true,
  className,
}: BudgetProgressBarProps) {
  const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0
  const remaining = budgetAmount - spentAmount
  const isOverBudget = percentage > 100
  const isAtRisk = percentage > 90 && percentage <= 100
  const isOnTrack = percentage <= 90

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
    }).format(amount)
  }

  const getStatusColor = () => {
    if (isOverBudget) return "bg-red-500"
    if (isAtRisk) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStatusIcon = () => {
    if (isOverBudget) return <AlertCircle className="h-4 w-4 text-red-600" />
    if (isAtRisk) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <CheckCircle className="h-4 w-4 text-green-600" />
  }

  const getStatusText = () => {
    if (isOverBudget) return "Sobre Presupuesto"
    if (isAtRisk) return "En Riesgo"
    return "Dentro del Presupuesto"
  }

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Uso de Presupuesto</CardTitle>
            <CardDescription>
              {percentage.toFixed(1)}% utilizado
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={cn(
              "text-sm font-medium",
              isOverBudget && "text-red-600",
              isAtRisk && "text-yellow-600",
              isOnTrack && "text-green-600"
            )}>
              {getStatusText()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress 
          value={Math.min(percentage, 100)} 
          className={`h-3 ${getStatusColor()}`}
        />
        
        {showDetails && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Presupuesto:</span>
              <span className="font-medium">{formatCurrency(budgetAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gastado:</span>
              <span className="font-medium">{formatCurrency(spentAmount)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between text-sm font-bold">
              <span>Restante:</span>
              <span className={cn(
                remaining >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(Math.abs(remaining))}
                {remaining < 0 && " excedido"}
              </span>
            </div>
          </div>
        )}

        {isOverBudget && (
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-600">
              <p className="font-medium">Presupuesto Excedido</p>
              <p className="text-xs mt-1">
                El proyecto ha superado el presupuesto en {formatCurrency(Math.abs(remaining))}
              </p>
            </div>
          </div>
        )}

        {isAtRisk && !isOverBudget && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-600">
              <p className="font-medium">Presupuesto en Riesgo</p>
              <p className="text-xs mt-1">
                Solo quedan {formatCurrency(remaining)} disponibles ({(100 - percentage).toFixed(1)}%)
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
