import apiClient, { handleApiError } from '@/lib/api-client';
import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  Permission,
  RoleWithPermissions,
} from '@/types/users';

export const rolesService = {
  // ============================================================================
  // CRUD DE ROLES
  // ============================================================================

  async getAll(): Promise<Role[]> {
    try {
      const response = await apiClient.get<Role[]>('/users/roles');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getById(id: string): Promise<RoleWithPermissions> {
    try {
      const response = await apiClient.get<RoleWithPermissions>(`/users/roles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async create(data: CreateRoleDto): Promise<Role> {
    try {
      const response = await apiClient.post<Role>('/users/roles', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async update(id: string, data: UpdateRoleDto): Promise<Role> {
    try {
      const response = await apiClient.patch<Role>(`/users/roles/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async delete(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/users/roles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================================================
  // PERMISOS
  // ============================================================================

  async getPermissions(roleId: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(`/users/roles/${roleId}/permissions`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<any> {
    try {
      const response = await apiClient.post<any>(`/users/roles/${roleId}/permissions`, {
        permissionIds,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
