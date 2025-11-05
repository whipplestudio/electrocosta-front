import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  AccountReceivable,
  CreateAccountReceivableDto,
  UpdateAccountReceivableDto,
  AccountReceivableFilterDto,
  PaginatedResponse,
  DashboardData,
  AgingReport,
  Analytics,
} from '@/types/accounts-receivable';
import { accountsReceivableService } from '@/services/accounts-receivable.service';

export const useAccountsReceivable = () => {
  const [accounts, setAccounts] = useState<AccountReceivable[]>([]);
  const [currentAccount, setCurrentAccount] = useState<AccountReceivable | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [agingReport, setAgingReport] = useState<AgingReport | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  const fetchAccounts = useCallback(async (filters?: AccountReceivableFilterDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: PaginatedResponse<AccountReceivable> = await accountsReceivableService.list(
        filters
      );
      setAccounts(response.data);
      setPagination(response.meta);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar cuentas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAccountById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const account = await accountsReceivableService.getById(id);
      setCurrentAccount(account);
      return account;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar cuenta';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAccount = useCallback(async (data: CreateAccountReceivableDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const newAccount = await accountsReceivableService.create(data);
      setAccounts((prev) => [newAccount, ...prev]);
      toast.success('Cuenta por cobrar creada exitosamente');
      return newAccount;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear cuenta';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAccount = useCallback(
    async (id: string, data: UpdateAccountReceivableDto) => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedAccount = await accountsReceivableService.update(id, data);
        setAccounts((prev) =>
          prev.map((account) => (account.id === id ? updatedAccount : account))
        );
        if (currentAccount?.id === id) {
          setCurrentAccount(updatedAccount);
        }
        toast.success('Cuenta actualizada exitosamente');
        return updatedAccount;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al actualizar cuenta';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [currentAccount]
  );

  const deleteAccount = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await accountsReceivableService.delete(id);
      setAccounts((prev) => prev.filter((account) => account.id !== id));
      if (currentAccount?.id === id) {
        setCurrentAccount(null);
      }
      toast.success('Cuenta eliminada exitosamente');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar cuenta';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentAccount]);

  // ============================================
  // REPORTS
  // ============================================

  const fetchOverdue = useCallback(async (daysOverdue?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const overdueAccounts = await accountsReceivableService.getOverdue(daysOverdue);
      return overdueAccounts;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar cuentas vencidas';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUpcoming = useCallback(async (days: number = 7) => {
    setIsLoading(true);
    setError(null);
    try {
      const upcomingAccounts = await accountsReceivableService.getUpcoming(days);
      return upcomingAccounts;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar próximas a vencer';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dashboardData = await accountsReceivableService.getDashboard();
      setDashboard(dashboardData);
      return dashboardData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar dashboard';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAgingReport = useCallback(async (clientId?: string, cutoffDate?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const report = await accountsReceivableService.getAgingReport(clientId, cutoffDate);
      setAgingReport(report);
      return report;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar reporte de antigüedad';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async (dateFrom?: string, dateTo?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const analyticsData = await accountsReceivableService.getAnalytics(dateFrom, dateTo);
      setAnalytics(analyticsData);
      return analyticsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar analíticas';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    accounts,
    currentAccount,
    dashboard,
    agingReport,
    analytics,
    isLoading,
    error,
    pagination,

    // CRUD
    fetchAccounts,
    fetchAccountById,
    createAccount,
    updateAccount,
    deleteAccount,

    // Reports
    fetchOverdue,
    fetchUpcoming,
    fetchDashboard,
    fetchAgingReport,
    fetchAnalytics,

    // Helpers
    setCurrentAccount,
  };
};
