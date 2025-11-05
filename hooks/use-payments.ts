import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Payment, RegisterPaymentDto } from '@/types/accounts-receivable';
import { paymentsService } from '@/services/accounts-receivable.service';

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentHistory = useCallback(async (accountId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const history = await paymentsService.getHistory(accountId);
      setPayments(history);
      return history;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar historial de pagos';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerPayment = useCallback(async (accountId: string, data: RegisterPaymentDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const newPayment = await paymentsService.register(accountId, data);
      setPayments((prev) => [newPayment, ...prev]);
      toast.success('Pago registrado exitosamente');
      return newPayment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar pago';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    payments,
    isLoading,
    error,
    fetchPaymentHistory,
    registerPayment,
  };
};
