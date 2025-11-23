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
  supplierId?: string | null
  supplierName?: string
  supplier?: {
    id: string
    name: string
    email?: string
  } | null
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
  },

  // ==================== REPORTES DETALLADOS ====================

  async getFinancialAnalysis(params?: {
    periodo?: string
    fechaInicio?: string
    fechaFin?: string
  }): Promise<any> {
    const response = await apiClient.get('/reports/detailed/financial-analysis', { params })
    return response.data
  },

  async getFinancialChart(params?: {
    periodo?: string
    fechaInicio?: string
    fechaFin?: string
  }): Promise<any> {
    const response = await apiClient.get('/reports/detailed/financial-chart', { params })
    return response.data
  },

  async getCashFlowDetailed(params?: {
    periodo?: string
    fechaInicio?: string
    fechaFin?: string
  }): Promise<any> {
    const response = await apiClient.get('/reports/detailed/cash-flow', { params })
    return response.data
  },

  async getAnalysisByCategory(params?: {
    periodo?: string
    fechaInicio?: string
    fechaFin?: string
  }): Promise<any> {
    const response = await apiClient.get('/reports/detailed/by-category', { params })
    return response.data
  },

  async getHistoricalReports(params?: {
    skip?: number
    take?: number
    categoria?: string
  }): Promise<any> {
    const response = await apiClient.get('/reports/detailed/historical', { params })
    return response.data
  },

  // ==================== REPORTES DESCARGABLES ====================

  async getTiposReporte(): Promise<any> {
    const response = await apiClient.get('/reports/downloadable/types')
    return response.data
  },

  async generarReporte(data: {
    tipos: string[]
    formato: string
    periodo: string
    incluirGraficos: boolean
  }): Promise<any> {
    const response = await apiClient.post('/reports/downloadable/generate', data)
    return response.data
  },

  async getProgresoReporte(reportId: string): Promise<any> {
    const response = await apiClient.get(`/reports/downloadable/progress/${reportId}`)
    return response.data
  },

  async getReportesProgramados(): Promise<any> {
    const response = await apiClient.get('/reports/downloadable/scheduled')
    return response.data
  },

  async crearReporteProgramado(data: {
    nombre: string
    tipos: string[]
    frecuencia: string
    formato: string
  }): Promise<any> {
    const response = await apiClient.post('/reports/downloadable/scheduled', data)
    return response.data
  },

  async actualizarReporteProgramado(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/reports/downloadable/scheduled/${id}`, data)
    return response.data
  },

  async eliminarReporteProgramado(id: string): Promise<any> {
    const response = await apiClient.delete(`/reports/downloadable/scheduled/${id}`)
    return response.data
  },

  async toggleReporteProgramado(id: string): Promise<any> {
    const response = await apiClient.post(`/reports/downloadable/scheduled/${id}/toggle`)
    return response.data
  },

  async getReportesGenerados(params?: {
    skip?: number
    take?: number
    tipo?: string
    formato?: string
  }): Promise<any> {
    const response = await apiClient.get('/reports/downloadable/generated', { params })
    return response.data
  },

  async registrarDescarga(reportId: string): Promise<any> {
    const response = await apiClient.post(`/reports/downloadable/generated/${reportId}/download`)
    return response.data
  },

  async eliminarReporteGenerado(reportId: string): Promise<any> {
    const response = await apiClient.delete(`/reports/downloadable/generated/${reportId}`)
    return response.data
  }
}
