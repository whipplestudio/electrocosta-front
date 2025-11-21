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

  // Permisos efectivos del usuario autenticado (solo codes)
  async getMyPermissionCodes(): Promise<string[]> {
    try {
      const response = await apiClient.get<{
        usuario_id: string;
        rol: string;
        permisos: { codigo: string; nombre: string; modulo: string }[];
        permisos_agrupados: Record<string, string[]>;
      }>('/permisos/usuario/me/permisos');

      const permisos = response.data.permisos || [];
      return permisos.map((p) => p.codigo);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
