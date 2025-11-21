// ============================================
// ENUMS
// ============================================

export enum AccountReceivableStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  TRANSFER = 'transfer',
  CASH = 'cash',
  CHECK = 'check',
  CARD = 'card',
  OTHER = 'other',
}

export enum FollowUpType {
  CALL = 'call',
  EMAIL = 'email',
  VISIT = 'visit',
  WHATSAPP = 'whatsapp',
  OTHER = 'other',
}

export enum FollowUpResult {
  CONTACTED = 'contacted',
  NOT_CONTACTED = 'not_contacted',
  PAYMENT_PROMISE = 'payment_promise',
  DISPUTE = 'dispute',
  NO_ANSWER = 'no_answer',
}

// ============================================
// INTERFACES - MODELOS
// ============================================

export interface Client {
  id: string;
  name: string;
  taxId: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  creditLimit: number;
  paymentTerms: number;
  status: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  clientId?: string;
  status: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  type: string;
  color?: string;
}

export interface AccountReceivable {
  id: string;
  clientId: string;
  projectId?: string;
  categoryId?: string;
  invoiceNumber: string;
  amount: number;
  paidAmount: number;
  balance: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  description?: string;
  notes?: string;
  status: AccountReceivableStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  // Relations
  client?: Client;
  project?: Project;
  category?: Category;
  payments?: Payment[];
  followUps?: FollowUp[];
}

export interface Payment {
  id: string;
  accountReceivableId?: string;
  accountPayableId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface FollowUp {
  id: string;
  accountReceivableId: string;
  type: FollowUpType;
  description: string;
  result: FollowUpResult;
  nextFollowUpDate?: string;
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DTOs - REQUEST
// ============================================

export interface CreateAccountReceivableDto {
  clientId: string;
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

export interface UpdateAccountReceivableDto {
  invoiceNumber?: string;
  amount?: number;
  projectId?: string;
  categoryId?: string;
  currency?: string;
  issueDate?: string;
  dueDate?: string;
  description?: string;
  notes?: string;
  status?: AccountReceivableStatus;
}

export interface RegisterPaymentDto {
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface CreateFollowUpDto {
  type: FollowUpType;
  description: string;
  result: FollowUpResult;
  nextFollowUpDate?: string;
  notes?: string;
}

// ============================================
// FILTROS
// ============================================

export interface AccountReceivableFilterDto {
  clientId?: string;
  status?: AccountReceivableStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface FollowUpFilterDto {
  accountReceivableId?: string;
  type?: FollowUpType;
  result?: FollowUpResult;
  dateFrom?: string;
  dateTo?: string;
}

// ============================================
// RESPONSES - DASHBOARD Y REPORTES
// ============================================

export interface DashboardData {
  totalPending: number;
  totalOverdue: number;
  totalCollected: number;
  pendingCount: number;
  overdueCount: number;
  averageCollectionDays: number;
  byStatus: {
    pending: number;
    partial: number;
    paid: number;
    overdue: number;
    cancelled: number;
  };
}

export interface AgingReportSummary {
  current: number;
  days1_30: number;
  days31_60: number;
  days61_90: number;
  over90: number;
  total: number;
}

export interface AgingReportByClient {
  clientId: string;
  clientName: string;
  current: number;
  days1_30: number;
  days31_60: number;
  days61_90: number;
  over90: number;
  total: number;
}

export interface AgingReport {
  cutoffDate: string;
  summary: AgingReportSummary;
  byClient: AgingReportByClient[];
}

export interface Analytics {
  period: {
    from: string;
    to: string;
  };
  totalInvoiced: number;
  totalCollected: number;
  collectionRate: number;
  averageDaysToCollect: number;
  topClients: {
    clientId: string;
    clientName: string;
    totalAmount: number;
    paidAmount: number;
  }[];
}

export interface FollowUpStats {
  totalFollowUps: number;
  byType: Record<FollowUpType, number>;
  byResult: Record<FollowUpResult, number>;
  successRate: number;
}

// ============================================
// RESPUESTA PAGINADA
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
