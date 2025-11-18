import apiClient, { handleApiError } from '@/lib/api-client';
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserFilterDto,
  PaginatedUsersResponse,
  ChangePasswordDto,
} from '@/types/users';

export const usersService = {
  // ============================================================================
  // CRUD DE USUARIOS
  // ============================================================================

  async getAll(filters?: UserFilterDto): Promise<PaginatedUsersResponse> {
    try {
      const response = await apiClient.get<PaginatedUsersResponse>('/users', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async create(data: CreateUserDto): Promise<User> {
    try {
      const response = await apiClient.post<User>('/users', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async update(id: string, data: UpdateUserDto): Promise<User> {
    try {
      const response = await apiClient.patch<User>(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async delete(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async restore(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.patch<{ message: string }>(`/users/${id}/restore`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================================================
  // GESTIÓN DE CONTRASEÑAS
  // ============================================================================

  async changePassword(data: ChangePasswordDto): Promise<{ message: string }> {
    try {
      const response = await apiClient.patch<{ message: string }>('/users/password/change', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
