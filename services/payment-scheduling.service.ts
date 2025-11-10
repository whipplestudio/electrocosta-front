import apiClient from '@/lib/api-client';

export interface SchedulePaymentDto {
  scheduledDate: string;
  scheduledAmount: number;
  paymentMethod: 'transfer' | 'check' | 'cash' | 'card';
  bankAccount?: string;
  checkNumber?: string;
  reference?: string;
  notes?: string;
  requiresApproval?: boolean;
}

export interface PaymentSchedule {
  id: string;
  accountPayableId: string;
  scheduledDate: string;
  amount: number | string; // Backend puede devolver string
  paymentMethod?: string;
  bankAccount?: string;
  checkNumber?: string;
  reference?: string;
  notes?: string;
  status: 'scheduled' | 'approved' | 'completed' | 'cancelled';
  requiresApproval?: boolean;
  approvedById?: string;
  approvedAt?: string;
  completedById?: string;
  completedAt?: string;
  cancelledById?: string;
  cancelledAt?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  accountPayable?: {
    id: string;
    invoiceNumber: string;
    amount: number | string;
    supplier: {
      id: string;
      name: string;
    };
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface PaymentSchedulesResponse {
  data: PaymentSchedule[];
  total: number;
  page: number;
  limit: number;
  summary?: {
    totalScheduled: number;
    totalApproved: number;
    totalCompleted: number;
    totalCancelled: number;
    countScheduled: number;
    countApproved: number;
    countCompleted: number;
    countCancelled: number;
  };
}

export const paymentSchedulingService = {
  async schedulePayment(accountPayableId: string, data: SchedulePaymentDto): Promise<PaymentSchedule> {
    const response = await apiClient.post<PaymentSchedule>(
      `/payment-schedules/account/${accountPayableId}`,
      data
    );
    return response.data;
  },

  async getScheduledPayments(filters?: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    supplierId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaymentSchedulesResponse> {
    const response = await apiClient.get<PaymentSchedulesResponse>(
      '/payment-schedules',
      { params: filters }
    );
    return response.data;
  },

  async getAccountSchedules(accountPayableId: string): Promise<PaymentSchedule[]> {
    const response = await apiClient.get<PaymentSchedule[]>(
      `/payment-schedules/account/${accountPayableId}`
    );
    return response.data;
  },

  async updateSchedule(
    scheduleId: string,
    data: Partial<SchedulePaymentDto>
  ): Promise<PaymentSchedule> {
    const response = await apiClient.patch<PaymentSchedule>(
      `/payment-schedules/${scheduleId}`,
      data
    );
    return response.data;
  },

  async cancelSchedule(scheduleId: string): Promise<void> {
    await apiClient.delete(`/payment-schedules/${scheduleId}`);
  },

  async getSchedulesSummary(filters?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    summary: any;
    totalSchedules: number;
    upcomingPayments: number;
  }> {
    const response = await apiClient.get('/payment-schedules/summary', { params: filters });
    return response.data;
  },
};
