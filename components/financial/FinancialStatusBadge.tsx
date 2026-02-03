import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type FinancialStatus = "on_budget" | "over_budget" | "under_budget" | "at_risk"

interface FinancialStatusBadgeProps {
  status: FinancialStatus | string
  className?: string
}

export function FinancialStatusBadge({ status, className }: FinancialStatusBadgeProps) {
  const statusConfig = {
    on_budget: {
      label: "Dentro del Presupuesto",
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    over_budget: {
      label: "Sobre Presupuesto",
      className: "bg-red-100 text-red-800 hover:bg-red-100",
    },
    under_budget: {
      label: "Bajo Presupuesto",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    at_risk: {
      label: "En Riesgo",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
  }

  const config = statusConfig[status as FinancialStatus] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  }

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
