import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  FollowUp,
  CreateFollowUpDto,
  FollowUpFilterDto,
  FollowUpStats,
} from '@/types/accounts-receivable';
import { followUpService } from '@/services/accounts-receivable.service';

export const useFollowUps = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [currentFollowUp, setCurrentFollowUp] = useState<FollowUp | null>(null);
  const [stats, setStats] = useState<FollowUpStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFollowUpHistory = useCallback(async (accountId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const history = await followUpService.getHistory(accountId);
      setFollowUps(history);
      return history;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar historial de seguimientos';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createFollowUp = useCallback(async (accountId: string, data: CreateFollowUpDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const newFollowUp = await followUpService.create(accountId, data);
      setFollowUps((prev) => [newFollowUp, ...prev]);
      toast.success('Seguimiento creado exitosamente');
      return newFollowUp;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear seguimiento';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllFollowUps = useCallback(async (filters?: FollowUpFilterDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const allFollowUps = await followUpService.list(filters);
      setFollowUps(allFollowUps);
      return allFollowUps;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar seguimientos';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUpcomingFollowUps = useCallback(async (days: number = 7) => {
    setIsLoading(true);
    setError(null);
    try {
      const upcoming = await followUpService.getUpcoming(days);
      return upcoming;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar próximos seguimientos';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFollowUpStats = useCallback(async (dateFrom?: string, dateTo?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const statistics = await followUpService.getStats(dateFrom, dateTo);
      setStats(statistics);
      return statistics;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFollowUpById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const followUp = await followUpService.getById(id);
      setCurrentFollowUp(followUp);
      return followUp;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar seguimiento';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    followUps,
    currentFollowUp,
    stats,
    isLoading,
    error,
    fetchFollowUpHistory,
    createFollowUp,
    fetchAllFollowUps,
    fetchUpcomingFollowUps,
    fetchFollowUpStats,
    fetchFollowUpById,
  };
};
