'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export type KpiVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

export interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  variant?: KpiVariant
  className?: string
  loading?: boolean
  trend?: {
    value: number
    isPositive: boolean
  }
}

const variantStyles: Record<KpiVariant, { container: string; icon: string; title: string; value: string; subtitle: string }> = {
  default: {
    container: 'bg-muted/50 border-0 shadow-sm',
    icon: 'bg-background text-muted-foreground',
    title: 'text-muted-foreground',
    value: 'text-foreground',
    subtitle: 'text-muted-foreground',
  },
  primary: {
    container: 'bg-[#164e63]/10 border-0 shadow-sm',
    icon: 'bg-[#164e63]/20 text-[#164e63]',
    title: 'text-[#164e63]',
    value: 'text-[#164e63]',
    subtitle: 'text-[#164e63]/80',
  },
  success: {
    container: 'bg-green-500/10 border-0 shadow-sm',
    icon: 'bg-green-500/20 text-green-600',
    title: 'text-green-700',
    value: 'text-green-700',
    subtitle: 'text-green-600/80',
  },
  warning: {
    container: 'bg-amber-500/10 border-0 shadow-sm',
    icon: 'bg-amber-500/20 text-amber-600',
    title: 'text-amber-700',
    value: 'text-amber-700',
    subtitle: 'text-amber-600/80',
  },
  danger: {
    container: 'bg-red-500/10 border-0 shadow-sm',
    icon: 'bg-red-500/20 text-red-600',
    title: 'text-red-700',
    value: 'text-red-700',
    subtitle: 'text-red-600/80',
  },
  info: {
    container: 'bg-blue-500/10 border-0 shadow-sm',
    icon: 'bg-blue-500/20 text-blue-600',
    title: 'text-blue-700',
    value: 'text-blue-700',
    subtitle: 'text-blue-600/80',
  },
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  className,
  loading = false,
  trend,
}: KpiCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card className={cn(styles.container, 'overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 md:pb-2 px-3 md:px-6 pt-3 md:pt-6">
        <CardTitle className={cn('text-xs md:text-sm font-medium truncate pr-2', styles.title)}>
          {title}
        </CardTitle>
        <div className={cn('h-7 w-7 md:h-8 md:w-8 rounded-full flex items-center justify-center flex-shrink-0', styles.icon)}>
          <span className="h-3.5 w-3.5 md:h-4 md:w-4 flex items-center justify-center">
            {icon}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
        {loading ? (
          <div className="space-y-2">
            <div className="h-6 md:h-8 w-16 md:w-20 bg-gray-200/50 rounded animate-pulse" />
            <div className="h-2.5 md:h-3 w-24 md:w-32 bg-gray-200/50 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
              <div className={cn('text-xl md:text-2xl lg:text-3xl font-bold truncate', styles.value)}>
                {value}
              </div>
              {trend && (
                <span className={cn(
                  'text-[10px] md:text-xs font-medium px-1.5 py-0.5 rounded-full flex-shrink-0',
                  trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                )}>
                  {trend.isPositive ? '+' : '-'}{trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className={cn('text-[10px] md:text-xs mt-1 leading-tight line-clamp-2', styles.subtitle)}>
                {subtitle}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Pre-configured KPI cards for common use cases
export function TotalKpiCard({ 
  title = 'Total', 
  value, 
  subtitle, 
  icon,
  ...props 
}: Partial<KpiCardProps> & { value: string | number; icon?: React.ReactNode }) {
  return (
    <KpiCard
      title={title}
      value={value}
      subtitle={subtitle}
      icon={icon}
      variant="default"
      {...props}
    />
  )
}

export function IncomeKpiCard({ 
  title = 'Ingresos', 
  value, 
  subtitle = 'Categorías de ingreso', 
  icon,
  ...props 
}: Partial<KpiCardProps> & { value: string | number; icon?: React.ReactNode }) {
  return (
    <KpiCard
      title={title}
      value={value}
      subtitle={subtitle}
      icon={icon}
      variant="info"
      {...props}
    />
  )
}

export function ExpenseKpiCard({ 
  title = 'Egresos', 
  value, 
  subtitle = 'Categorías de egreso', 
  icon,
  ...props 
}: Partial<KpiCardProps> & { value: string | number; icon?: React.ReactNode }) {
  return (
    <KpiCard
      title={title}
      value={value}
      subtitle={subtitle}
      icon={icon}
      variant="danger"
      {...props}
    />
  )
}

export function SuccessKpiCard({ 
  title, 
  value, 
  subtitle, 
  ...props 
}: KpiCardProps) {
  return (
    <KpiCard
      title={title}
      value={value}
      subtitle={subtitle}
      variant="success"
      {...props}
    />
  )
}

export function WarningKpiCard({ 
  title, 
  value, 
  subtitle, 
  ...props 
}: KpiCardProps) {
  return (
    <KpiCard
      title={title}
      value={value}
      subtitle={subtitle}
      variant="warning"
      {...props}
    />
  )
}
