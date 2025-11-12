import apiClient, { handleApiError } from '@/lib/api-client';

export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
  module: string;
  resource: string;
  action: string;
  createdAt: string;
}

export interface PermissionsGroupedByModule {
  [module: string]: Permission[];
}

export const permissionsService = {
  async getAll(): Promise<Permission[]> {
    try {
      const response = await apiClient.get<{ data: Permission[] }>('/permisos');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getGroupedByModule(): Promise<PermissionsGroupedByModule> {
    try {
      const response = await apiClient.get<{ data: PermissionsGroupedByModule }>('/permisos', {
        params: { agrupar_por: 'modulo' },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
