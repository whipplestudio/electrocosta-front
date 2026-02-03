import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface CategoryData {
  categoryId: string
  categoryName: string
  amount: number
}

interface CategoryBreakdownChartProps {
  title: string
  description?: string
  categories: CategoryData[]
  totalAmount: number
  valueColor?: "green" | "red" | "blue"
  currency?: string
}

export function CategoryBreakdownChart({
  title,
  description,
  categories,
  totalAmount,
  valueColor = "blue",
  currency = "MXN",
}: CategoryBreakdownChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
    }).format(amount)
  }

  const getColorClass = (color: string) => {
    const colors = {
      green: "bg-green-500",
      red: "bg-red-500",
      blue: "bg-blue-500",
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const sortedCategories = [...categories].sort((a, b) => b.amount - a.amount)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {sortedCategories.length > 0 ? (
          <div className="space-y-4">
            {sortedCategories.map((category) => {
              const percentage = totalAmount > 0 ? (category.amount / totalAmount) * 100 : 0
              
              return (
                <div key={category.categoryId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category.categoryName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                      <span className={`font-bold ${
                        valueColor === "green" ? "text-green-600" :
                        valueColor === "red" ? "text-red-600" :
                        "text-blue-600"
                      }`}>
                        {formatCurrency(category.amount)}
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${getColorClass(valueColor)}`}
                  />
                </div>
              )
            })}
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between font-bold">
                <span>Total</span>
                <span className={
                  valueColor === "green" ? "text-green-600" :
                  valueColor === "red" ? "text-red-600" :
                  "text-blue-600"
                }>
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No hay datos disponibles
          </p>
        )}
      </CardContent>
    </Card>
  )
}
