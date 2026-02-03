import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

interface FinancialTooltipProps {
  content: string
  children?: React.ReactNode
}

export function FinancialTooltip({ content, children }: FinancialTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help inline-block ml-1" />
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Tooltips predefinidos para conceptos financieros comunes
export const FinancialTooltips = {
  initialBudget: "Presupuesto inicial asignado al proyecto antes de comenzar",
  contractAmount: "Monto total acordado con el cliente en el contrato",
  budgetMaterials: "Presupuesto destinado a la compra de materiales",
  budgetLabor: "Presupuesto destinado a mano de obra",
  budgetOther: "Presupuesto para otros gastos (equipos, servicios, etc.)",
  totalIncome: "Total de ingresos facturados al cliente",
  totalExpenses: "Total de egresos del proyecto",
  netProfit: "Utilidad neta: Ingresos - Egresos",
  profitMargin: "Porcentaje de utilidad sobre los ingresos totales",
  budgetVariance: "Diferencia entre el presupuesto y los gastos reales",
  budgetUsage: "Porcentaje del presupuesto que se ha utilizado",
  grossProfit: "Utilidad bruta: Ingresos cobrados - Egresos pagados",
  financialStatus: "Estado del proyecto en relación al presupuesto",
}
