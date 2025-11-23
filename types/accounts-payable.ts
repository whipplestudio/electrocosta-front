// ============================================
// ENUMS
// ============================================

export type AccountPayableStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'scheduled';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type PaymentMethod = 'cash' | 'check' | 'transfer' | 'card' | 'other';

// ============================================
// MAIN ENTITIES
// ============================================

export interface Supplier {
  id: string;
  name: string;
  rfc: string;
  email: string;
  phone?: string;
  contactName?: string;
  status: string;
}

export interface Category {
  id: string;
  name: string;
  type: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
}

export interface Payment {
  id: string;
  amount: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface PaymentSchedule {
  id: string;
  amount: string;
  scheduledDate: string;
  isPaid: boolean;
  paidDate?: string;
  notes?: string;
}

export interface AccountPayable {
  id: string;
  supplierId?: string | null;
  supplierName?: string | null;
  supplier?: Supplier | null;
  projectId?: string;
  project?: Project;
  categoryId?: string;
  category?: Category;
  invoiceNumber: string;
  amount: string;
  paidAmount: string;
  balance: string;
  currency: string;
  issueDate: string;
  dueDate: string;
  description?: string;
  notes?: string;
  status: AccountPayableStatus;
  approvalStatus: ApprovalStatus;
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  rejectionReason?: string;
  payments: Payment[];
  paymentSchedules: PaymentSchedule[];
  documents: any[];
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DTOs - REQUEST
// ============================================

export interface CreateAccountPayableDto {
  supplierId?: string;
  supplierName?: string;
  projectId?: string;
  categoryId?: string;
  invoiceNumber: string;
  amount: number;
  currency?: string;
  issueDate: string;
  dueDate: string;
  description?: string;
  notes?: string;
}

export interface UpdateAccountPayableDto {
  invoiceNumber?: string;
  amount?: number;
  projectId?: string;
  categoryId?: string;
  currency?: string;
  issueDate?: string;
  dueDate?: string;
  description?: string;
  notes?: string;
}

export interface ApproveAccountPayableDto {
  notes?: string;
}

export interface RejectAccountPayableDto {
  reason: string;
  notes?: string;
}

export interface RegisterPaymentDto {
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  gastoId?: string;
  generarGasto?: boolean;
  categoriaGasto?: string;
}

export interface CreatePaymentScheduleDto {
  amount: number;
  scheduledDate: string;
  notes?: string;
}

// ============================================
// FILTROS
// ============================================

export interface AccountPayableFiltersDto {
  supplierId?: string;
  status?: AccountPayableStatus;
  approvalStatus?: ApprovalStatus;
  categoryId?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

// ============================================
// RESPONSES - PAGINATION
// ============================================

export interface PaginatedAccountsPayableResponse {
  data: AccountPayable[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// RESPONSES - DASHBOARD Y REPORTES
// ============================================

export interface DashboardData {
  keyMetrics: {
    totalPayable: number;
    totalOverdue: number;
    criticalOverdue: number;
    upcomingThisWeek: number;
    avgOverdueDays: number;
  };
  agingDistribution: Array<{
    label: string;
    value: number;
    percentage: number;
    count: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    count: number;
  }>;
  upcomingPayments: Array<AccountPayable>;
  overdueAccounts: Array<AccountPayable>;
  generatedAt: string;
}

export interface PaymentSummary {
  totalScheduled: number;
  totalPaid: number;
  totalPending: number;
  schedulesCount: number;
  paidCount: number;
  pendingCount: number;
}
