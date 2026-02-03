import apiClient, { handleApiError } from '@/lib/api-client';

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  clientId?: string | null;
  startDate: string;
  endDate?: string | null;
  budget: number;
  initialBudget: number;
  budgetMaterials?: number | null;
  budgetLabor?: number | null;
  budgetOther?: number | null;
  contractAmount?: number | null;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin?: number | null;
  lastFinancialUpdate?: string | null;
  financialStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
  };
}

export interface ProjectFinancialDashboard {
  projectId: string;
  projectName: string;
  projectCode: string;
  initialBudget: number;
  contractAmount: number;
  totalInvoiced: number;
  totalCollected: number;
  pendingCollection: number;
  totalExpenses: number;
  paidExpenses: number;
  pendingExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  budgetVariance: number;
  budgetUsagePercentage: number;
  financialStatus: string;
  isOverBudget: boolean;
}

export interface IncomeStatement {
  projectId: string;
  period: {
    from: string;
    to: string;
  };
  income: {
    invoiced: number;
    collected: number;
    pending: number;
    byCategory: Array<{
      categoryId: string;
      categoryName: string;
      amount: number;
    }>;
  };
  expenses: {
    total: number;
    paid: number;
    pending: number;
    byCategory: Array<{
      categoryId: string;
      categoryName: string;
      amount: number;
    }>;
  };
  results: {
    grossProfit: number;
    operatingExpenses: number;
    netProfit: number;
    profitMargin: number;
  };
}

export interface ConsolidatedIncomeStatement {
  projects: Array<{
    projectName: string;
    projectCode: string;
  } & IncomeStatement>;
  totals: {
    totalIncome: number;
    totalExpenses: number;
    totalProfit: number;
  };
  profitMargin: number;
}

export interface CreateProjectDto {
  name: string;
  code: string;
  description?: string;
  clientId?: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  initialBudget?: number;
  budgetMaterials?: number;
  budgetLabor?: number;
  budgetOther?: number;
  contractAmount?: number;
  status?: string;
}

export const projectsService = {
  async listAll(clientId?: string): Promise<Pick<Project, 'id' | 'name' | 'code'>[]> {
    try {
      // Usar el endpoint de carga masiva que tiene los proyectos reales
      const params: any = {};
      if (clientId) {
        params.clientId = clientId;
      }
      
      const response = await apiClient.get<any>('/carga/proyectos/listado', { params });
      const proyectos = response.data.data || response.data || [];
      return proyectos.map((p: any) => ({ 
        id: p.id, 
        name: p.nombreProyecto, 
        code: p.codigoProyecto 
      }));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async list(): Promise<Project[]> {
    try {
      const response = await apiClient.get<Project[]>('/projects');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getById(id: string): Promise<Project> {
    try {
      const response = await apiClient.get<Project>(`/projects/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async create(data: CreateProjectDto): Promise<Project> {
    try {
      const response = await apiClient.post<Project>('/projects', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async update(id: string, data: Partial<CreateProjectDto>): Promise<Project> {
    try {
      const response = await apiClient.patch<Project>(`/projects/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/projects/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getFinancialDashboard(id: string): Promise<ProjectFinancialDashboard> {
    try {
      const response = await apiClient.get<ProjectFinancialDashboard>(
        `/projects/${id}/financial/dashboard`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getIncomeStatement(
    id: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<IncomeStatement> {
    try {
      const params: any = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const response = await apiClient.get<IncomeStatement>(
        `/projects/${id}/financial/income-statement`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async updateFinancials(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `/projects/${id}/financial/update`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async createSnapshot(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `/projects/${id}/financial/snapshot`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getConsolidatedIncomeStatement(
    dateFrom?: string,
    dateTo?: string
  ): Promise<ConsolidatedIncomeStatement> {
    try {
      const params: any = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const response = await apiClient.get<ConsolidatedIncomeStatement>(
        '/projects/financial/consolidated',
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async downloadProjectExcel(id: string): Promise<void> {
    try {
      const response = await apiClient.get(
        `/projects/${id}/reports/financial/excel`,
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-financiero-proyecto-${id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async downloadConsolidatedExcel(dateFrom?: string, dateTo?: string): Promise<void> {
    try {
      const params: any = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const response = await apiClient.get(
        '/projects/reports/consolidated/excel',
        { params, responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'reporte-consolidado.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getProjectReportData(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`/projects/${id}/reports/financial/data`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getConsolidatedReportData(dateFrom?: string, dateTo?: string): Promise<any> {
    try {
      const params: any = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const response = await apiClient.get('/projects/reports/consolidated/data', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
