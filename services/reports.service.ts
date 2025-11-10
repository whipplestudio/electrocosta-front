import apiClient from '@/lib/api-client'

export interface DueDateReportFilters {
  type?: 'proximas' | 'vencidas' | 'todas'
  daysInAdvance?: number
  supplierId?: string
  categoryId?: string
  costCenterId?: string
  format?: 'json' | 'excel' | 'pdf'
}

export interface AgingReportFilters {
  cutoffDate?: string
  supplierId?: string
  format?: 'json' | 'excel' | 'pdf'
}

export interface CashFlowReportFilters {
  dateFrom: string
  dateTo: string
  groupBy?: 'dia' | 'semana' | 'mes'
  format?: 'json' | 'excel' | 'pdf'
}

export interface CategoryReportFilters {
  dateFrom?: string
  dateTo?: string
  status?: string
  format?: 'json' | 'excel' | 'pdf'
}

export interface TopSuppliersReportFilters {
  limit?: number
  period?: 'mes' | 'trimestre' | 'año'
  format?: 'json' | 'excel' | 'pdf'
}

export interface AccountPayableItem {
  id: string
  supplier: {
    id: string
    name: string
    email?: string
  }
  invoiceNumber: string
  amount: number | string
  balance: number | string
  dueDate: string
  issueDate: string
  daysOverdue?: number
  daysUntilDue?: number
  category?: {
    id: string
    name: string
  }
  status: string
  scheduled?: boolean
}

export interface DueDateReportResponse {
  overdue: AccountPayableItem[]
  upcoming: AccountPayableItem[]
  summary: {
    totalOverdue: number
    overdueAmount: number | string
    totalUpcoming: number
    upcomingAmount: number | string
    avgOverdueDays: number
  }
  filters: DueDateReportFilters
  generatedAt: string
}

export interface AgingRange {
  range: string
  min: number
  max: number | null
  count: number
  amount: number | string
  percentage: number
  accounts: AccountPayableItem[]
}

export interface AgingReportResponse {
  ranges: AgingRange[]
  total: number | string
  totalAccounts: number
  cutoffDate: string
  generatedAt: string
}

export interface CategoryBreakdown {
  category: string
  categoryId: string
  count: number
  totalAmount: number | string
  percentage: number
  accounts: AccountPayableItem[]
}

export interface CategoryReportResponse {
  categories: CategoryBreakdown[]
  total: number | string
  totalAccounts: number
  period: {
    from?: string
    to?: string
  }
  generatedAt: string
}

export interface DashboardData {
  keyMetrics: {
    totalPayable: number | string
    totalOverdue: number | string
    criticalOverdue: number
    upcomingThisWeek: number
    avgOverdueDays: number
  }
  agingDistribution: Array<{
    label: string
    value: number | string
    percentage: number
    count: number
  }>
  categoryBreakdown: Array<{
    category: string
    amount: number | string
    percentage: number
    count: number
  }>
  upcomingPayments: Array<{
    supplier: string
    amount: number | string
    dueDate: string
    daysUntilDue: number
    scheduled: boolean
  }>
  overdueAccounts: Array<{
    supplier: string
    amount: number | string
    dueDate: string
    daysOverdue: number
  }>
  generatedAt: string
}

export const reportsService = {
  async getDueDateReport(filters?: DueDateReportFilters): Promise<DueDateReportResponse> {
    const response = await apiClient.get<DueDateReportResponse>(
      '/accounts-payable/reports/due-dates',
      { params: filters }
    )
    return response.data
  },

  async getAgingReport(filters?: AgingReportFilters): Promise<AgingReportResponse> {
    const response = await apiClient.get<AgingReportResponse>(
      '/accounts-payable/reports/aging',
      { params: filters }
    )
    return response.data
  },

  async getCashFlowReport(filters: CashFlowReportFilters): Promise<any> {
    const response = await apiClient.get(
      '/accounts-payable/reports/cash-flow',
      { params: filters }
    )
    return response.data
  },

  async getCategoryReport(filters?: CategoryReportFilters): Promise<CategoryReportResponse> {
    const response = await apiClient.get<CategoryReportResponse>(
      '/accounts-payable/reports/by-category',
      { params: filters }
    )
    return response.data
  },

  async getTopSuppliersReport(filters?: TopSuppliersReportFilters): Promise<any> {
    const response = await apiClient.get(
      '/accounts-payable/reports/top-suppliers',
      { params: filters }
    )
    return response.data
  },

  async getDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get<DashboardData>(
      '/accounts-payable/reports/dashboard'
    )
    return response.data
  },

  async getReportsSummary(): Promise<any> {
    const response = await apiClient.get(
      '/accounts-payable/reports/summary'
    )
    return response.data
  }
}
