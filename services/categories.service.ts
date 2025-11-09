import apiClient, { handleApiError } from '@/lib/api-client';

export interface Category {
  id: string;
  name: string;
  description?: string;
  type: string;
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

  async getAll(params?: { page?: number; limit?: number }): Promise<PaginatedCategoriesResponse> {
    try {
      const response = await apiClient.get<PaginatedCategoriesResponse>('/categories', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
