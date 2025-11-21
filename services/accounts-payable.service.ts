import apiClient, { handleApiError } from '@/lib/api-client';
import type {
  AccountPayable,
  PaginatedAccountsPayableResponse,
  CreateAccountPayableDto,
  UpdateAccountPayableDto,
  ApproveAccountPayableDto,
  RejectAccountPayableDto,
  RegisterPaymentDto,
  CreatePaymentScheduleDto,
  AccountPayableFiltersDto,
  DashboardData,
  PaymentSummary,
} from '@/types/accounts-payable';

export const accountsPayableService = {
  // CRUD básico
  async getAll(filters?: AccountPayableFiltersDto): Promise<PaginatedAccountsPayableResponse> {
    try {
      const response = await apiClient.get<PaginatedAccountsPayableResponse>('/accounts-payable', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getById(id: string): Promise<AccountPayable> {
    try {
      const response = await apiClient.get<AccountPayable>(`/accounts-payable/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async create(data: CreateAccountPayableDto): Promise<AccountPayable> {
    try {
      const response = await apiClient.post<AccountPayable>('/accounts-payable', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async update(id: string, data: UpdateAccountPayableDto): Promise<AccountPayable> {
    try {
      const response = await apiClient.patch<AccountPayable>(`/accounts-payable/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/accounts-payable/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Aprobación
  async approve(id: string, data?: ApproveAccountPayableDto): Promise<AccountPayable> {
    try {
      const response = await apiClient.post<AccountPayable>(`/accounts-payable/${id}/approve`, data || {});
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async reject(id: string, data: RejectAccountPayableDto): Promise<AccountPayable> {
    try {
      const response = await apiClient.post<AccountPayable>(`/accounts-payable/${id}/reject`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Pagos
  async registerPayment(id: string, data: RegisterPaymentDto): Promise<AccountPayable> {
    try {
      const response = await apiClient.post<AccountPayable>(`/accounts-payable/${id}/payments`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getPayments(id: string): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>(`/accounts-payable/${id}/payments`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Programación de pagos
  async createPaymentSchedule(id: string, data: CreatePaymentScheduleDto): Promise<AccountPayable> {
    try {
      const response = await apiClient.post<AccountPayable>(`/accounts-payable/${id}/schedules`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getPaymentSchedules(id: string): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>(`/accounts-payable/${id}/schedules`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Dashboard y reportes
  async getDashboard(): Promise<DashboardData> {
    try {
      const response = await apiClient.get<DashboardData>('/accounts-payable/reports/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getPaymentSummary(id: string): Promise<PaymentSummary> {
    try {
      const response = await apiClient.get<PaymentSummary>(`/accounts-payable/${id}/payment-summary`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Reportes de vencimiento
  async getUpcomingDue(days: number = 7): Promise<AccountPayable[]> {
    try {
      const response = await apiClient.get<AccountPayable[]>('/accounts-payable/reports/upcoming-due', {
        params: { days },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getOverdue(): Promise<AccountPayable[]> {
    try {
      const response = await apiClient.get<AccountPayable[]>('/accounts-payable/reports/overdue');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getPaymentsToday(): Promise<{ count: number; totalAmount: number; payments: any[] }> {
    try {
      const response = await apiClient.get('/accounts-payable/payments/today');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
