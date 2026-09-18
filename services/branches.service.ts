import apiClient, { handleApiError } from '@/lib/api-client';
import type { Branch } from '@/types/users';

export const branchesService = {
  /**
   * Catálogo de sucursales ordenado por código (incluye las inactivas)
   */
  async getBranches(): Promise<Branch[]> {
    try {
      const response = await apiClient.get<Branch[]>('/branches');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
