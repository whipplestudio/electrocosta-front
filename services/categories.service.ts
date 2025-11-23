import apiClient, { handleApiError } from '@/lib/api-client';

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  description?: string;
  type: CategoryType;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  type: CategoryType;
  color?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  type?: CategoryType;
  color?: string;
}

export interface PaginatedCategoriesResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const categoriesService = {
  async list(): Promise<Category[]> {
    try {
      const response = await apiClient.get<{ data: Category[] }>('/categories');
      return response.data.data; // El backend devuelve {data: [], total, page, etc}
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getAll(params?: { page?: number; limit?: number; type?: CategoryType }): Promise<PaginatedCategoriesResponse> {
    try {
      const response = await apiClient.get<PaginatedCategoriesResponse>('/categories', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getById(id: string): Promise<Category> {
    try {
      const response = await apiClient.get<Category>(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async create(data: CreateCategoryDto): Promise<Category> {
    try {
      const response = await apiClient.post<Category>('/categories', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    try {
      const response = await apiClient.patch<Category>(`/categories/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/categories/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getUsageStats(id: string): Promise<{ accountsReceivable: number; accountsPayable: number }> {
    try {
      const response = await apiClient.get<{ accountsReceivable: number; accountsPayable: number }>(`/categories/${id}/usage`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
