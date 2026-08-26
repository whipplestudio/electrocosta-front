// ============================================
// ENUMS
// ============================================

export type AccountPayableStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
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
  nombreProyecto?: string; // Para compatibilidad con backend
}

export interface Payment {
  id: string;
  amount: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  paymentScheduleId?: string;
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
  macroClasificacion?: 'MATERIALES' | 'MANO_DE_OBRA' | 'OTROS';
  invoiceNumber: string;
  iva: number;
  subtotal: number;
  amount: string;
  paidAmount: string;
  balance: string;
  currency: string;
  issueDate: string;
  dueDate: string | null;
  description?: string;
  notes?: string;
  status: AccountPayableStatus;
  payments: Payment[];
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
  iva?: number;
  ivaType?: 'percentage' | 'amount';
  subtotal: number;
  amount?: number;
  currency?: string;
  issueDate: string;
  dueDate?: string;
  description?: string;
  notes?: string;
  macroClasificacion?: 'MATERIALES' | 'MANO_DE_OBRA' | 'OTROS';
}

export interface UpdateAccountPayableDto {
  supplierName?: string;
  invoiceNumber?: string;
  iva?: number;
  ivaType?: 'percentage' | 'amount';
  subtotal?: number;
  amount?: number;
  projectId?: string;
  categoryId?: string;
  macroClasificacion?: 'MATERIALES' | 'MANO_DE_OBRA' | 'OTROS';
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
  paymentScheduleId?: string;
}

export interface UpdatePaymentDto {
  amount?: number;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  reference?: string;
  notes?: string;
  paymentScheduleId?: string;
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
  categoryId?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  minBalance?: number;
  maxBalance?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  hasBalance?: boolean;
}

// ============================================
// RESPONSES - PAGINATION
// ============================================

/**
 * Totales del conjunto filtrado completo (no de la página visible), calculados
 * por el backend sobre el mismo `where` que la consulta paginada.
 * Los tres buckets de saldo (pendiente, programado, vencido) son mutuamente
 * excluyentes: su suma es el saldo total adeudado del conjunto filtrado.
 */
export interface AccountsPayableSummary {
  totalPending: number;
  countPending: number;
  totalScheduled: number;
  countScheduled: number;
  totalOverdue: number;
  countOverdue: number;
  totalPaid: number;
  /** Conteo (no importe) de cuentas que vencen en los próximos 7 días. */
  upcomingThisWeek: number;
}

export interface PaginatedAccountsPayableResponse {
  data: AccountPayable[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  /** Opcional para tolerar un backend aún sin desplegar con el summary. */
  summary?: AccountsPayableSummary;
}

// ============================================
// RESPONSES - DASHBOARD Y REPORTES
// ============================================

export interface DashboardData {
  keyMetrics: {
    totalPayable: number;
    totalOverdue: number;
    totalPaid: number;
    criticalOverdue: number;
    upcomingThisWeek: number;
    avgOverdueDays: number;
    pendingApproval: number;
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
