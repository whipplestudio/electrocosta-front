import apiClient, { handleApiError } from '@/lib/api-client';
import {
  AccountReceivable,
  CreateAccountReceivableDto,
  UpdateAccountReceivableDto,
  RegisterPaymentDto,
  CreateFollowUpDto,
  AccountReceivableFilterDto,
  FollowUpFilterDto,
  PaginatedResponse,
  DashboardData,
  AgingReport,
  Analytics,
  Payment,
  FollowUp,
  FollowUpStats,
} from '@/types/accounts-receivable';

// ============================================
// CUENTAS POR COBRAR - CRUD
// ============================================

export const accountsReceivableService = {
  /**
   * Crear nueva cuenta por cobrar
   */
  async create(data: CreateAccountReceivableDto): Promise<AccountReceivable> {
    try {
      const response = await apiClient.post<AccountReceivable>('/accounts-receivable', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Listar cuentas por cobrar con filtros
   */
  async list(
    filters?: AccountReceivableFilterDto
  ): Promise<PaginatedResponse<AccountReceivable>> {
    try {
      const response = await apiClient.get<PaginatedResponse<AccountReceivable>>(
        '/accounts-receivable',
        { params: filters }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Obtener cuenta por cobrar por ID
   */
  async getById(id: string): Promise<AccountReceivable> {
    try {
      const response = await apiClient.get<AccountReceivable>(`/accounts-receivable/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Actualizar cuenta por cobrar
   */
  async update(id: string, data: UpdateAccountReceivableDto): Promise<AccountReceivable> {
    try {
      const response = await apiClient.patch<AccountReceivable>(
        `/accounts-receivable/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Eliminar cuenta por cobrar
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/accounts-receivable/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // REPORTES Y DASHBOARD
  // ============================================

  /**
   * Obtener cuentas vencidas
   */
  async getOverdue(daysOverdue?: number): Promise<AccountReceivable[]> {
    try {
      const response = await apiClient.get<AccountReceivable[]>('/accounts-receivable/overdue', {
        params: { daysOverdue },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Obtener próximas a vencer
   */
  async getUpcoming(days: number = 7): Promise<AccountReceivable[]> {
    try {
      const response = await apiClient.get<AccountReceivable[]>('/accounts-receivable/upcoming', {
        params: { days },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Obtener dashboard
   */
  async getDashboard(): Promise<DashboardData> {
    try {
      const response = await apiClient.get<DashboardData>('/accounts-receivable/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Obtener reporte de antigüedad de saldos
   */
  async getAgingReport(clientId?: string, cutoffDate?: string): Promise<AgingReport> {
    try {
      const response = await apiClient.get<AgingReport>('/accounts-receivable/aging-report', {
        params: { clientId, cutoffDate },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Obtener analíticas
   */
  async getAnalytics(dateFrom?: string, dateTo?: string): Promise<Analytics> {
    try {
      const response = await apiClient.get<Analytics>('/accounts-receivable/analytics', {
        params: { dateFrom, dateTo },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// ============================================
// PAGOS
// ============================================

export const paymentsService = {
  /**
   * Registrar pago
   */
  async register(accountId: string, data: RegisterPaymentDto): Promise<Payment> {
    try {
      const response = await apiClient.post<Payment>(
        `/accounts-receivable/${accountId}/payments`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Obtener historial de pagos
   */
  async getHistory(accountId: string): Promise<Payment[]> {
    try {
      const response = await apiClient.get<Payment[]>(
        `/accounts-receivable/${accountId}/payments`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// ============================================
// SEGUIMIENTO (FOLLOW-UPS)
// ============================================

export const followUpService = {
  /**
   * Crear seguimiento
   */
  async create(accountId: string, data: CreateFollowUpDto): Promise<FollowUp> {
    try {
      const response = await apiClient.post<FollowUp>(
        `/accounts-receivable/${accountId}/follow-ups`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Obtener historial de seguimientos
   */
  async getHistory(accountId: string): Promise<FollowUp[]> {
    try {
      const response = await apiClient.get<FollowUp[]>(
        `/accounts-receivable/${accountId}/follow-ups`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Listar todos los seguimientos
   */
  async list(filters?: FollowUpFilterDto): Promise<FollowUp[]> {
    try {
      const response = await apiClient.get<FollowUp[]>('/follow-ups', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Obtener próximos seguimientos
   */
  async getUpcoming(days: number = 7): Promise<FollowUp[]> {
    try {
      const response = await apiClient.get<FollowUp[]>('/follow-ups/upcoming', {
        params: { days },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Obtener estadísticas de seguimientos
   */
  async getStats(dateFrom?: string, dateTo?: string): Promise<FollowUpStats> {
    try {
      const response = await apiClient.get<FollowUpStats>('/follow-ups/stats', {
        params: { dateFrom, dateTo },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Obtener seguimiento por ID
   */
  async getById(id: string): Promise<FollowUp> {
    try {
      const response = await apiClient.get<FollowUp>(`/follow-ups/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
