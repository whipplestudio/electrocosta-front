import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FinancialKPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  valueColor?: "green" | "red" | "blue" | "default"
  className?: string
}

export function FinancialKPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  valueColor = "default",
  className,
}: FinancialKPICardProps) {
  const valueColorClass = {
    green: "text-green-600",
    red: "text-red-600",
    blue: "text-blue-600",
    default: "",
  }[valueColor]

  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : ""

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", valueColorClass)}>
          {trendIcon && <span className="mr-1">{trendIcon}</span>}
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}
