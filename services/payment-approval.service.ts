import apiClient from '@/lib/api-client'

export interface ApprovalFilters {
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  supplierId?: string
  page?: number
  limit?: number
}

export interface ApprovePaymentDto {
  notes?: string
}

export interface RejectPaymentDto {
  reason: string
  notes?: string
}

export interface PendingApproval {
  id: string
  accountPayableId: string
  scheduledDate: string
  amount: number | string  // El backend puede devolver string
  paymentMethod?: string
  status: string
  requiresApproval?: boolean
  accountPayable: {
    id: string
    invoiceNumber: string
    amount: number | string
    description: string
    supplier: {
      id: string
      name: string
    }
  }
  createdBy: {
    id: string
    firstName: string
    lastName: string
  }
  createdAt: string
}

export interface PendingApprovalsResponse {
  data: PendingApproval[]
  total: number
  page: number | string
  limit?: number
  totalPages?: number
  summary: {
    totalPending: number | string
    countPending: number
    totalApproved?: number | string
    countApproved?: number
  }
}

export const paymentApprovalService = {
  async getPendingApprovals(filters?: ApprovalFilters): Promise<PendingApprovalsResponse> {
    try {
      const response = await apiClient.get<PendingApprovalsResponse>(
        '/accounts-payable/approvals/pending',
        { params: filters }
      )
      return response.data
    } catch (error) {
      console.error('Error in getPendingApprovals service:', error)
      throw error
    }
  },

  async approvePayment(scheduleId: string, data: ApprovePaymentDto): Promise<void> {
    try {
      await apiClient.post(`/accounts-payable/schedules/${scheduleId}/approve`, data)
    } catch (error) {
      console.error('Error in approvePayment service:', error)
      throw error
    }
  },

  async rejectPayment(scheduleId: string, data: RejectPaymentDto): Promise<void> {
    try {
      await apiClient.post(`/accounts-payable/schedules/${scheduleId}/reject`, data)
    } catch (error) {
      console.error('Error in rejectPayment service:', error)
      throw error
    }
  },

  async batchApprove(scheduleIds: string[], notes?: string): Promise<void> {
    await apiClient.post('/accounts-payable/approvals/batch', {
      scheduleIds,
      action: 'approve',
      notes,
    })
  },

  async batchReject(scheduleIds: string[], reason: string, notes?: string): Promise<void> {
    await apiClient.post('/accounts-payable/approvals/batch', {
      scheduleIds,
      action: 'reject',
      reason,
      notes,
    })
  },
}
