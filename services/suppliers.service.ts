import apiClient, { handleApiError } from '@/lib/api-client';

export interface Supplier {
  id: string;
  name: string;
  rfc: string;
  email: string;
  phone: string;
  contactName: string;
  status: string;
}

export interface PaginatedSuppliersResponse {
  data: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const suppliersService = {
  async getAll(params?: { page?: number; limit?: number }): Promise<PaginatedSuppliersResponse> {
    try {
      const response = await apiClient.get<PaginatedSuppliersResponse>('/suppliers', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getById(id: string): Promise<Supplier> {
    try {
      const response = await apiClient.get<Supplier>(`/suppliers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
