import apiClient, { handleApiError, withForbiddenPermission } from '@/lib/api-client';
import type { Supplier, SupplierOption, SupplierStats } from '@/types/suppliers';

export interface SupplierListResponse {
  data: Supplier[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface SupplierFilterParams {
  search?: string;
  // 'active' | 'inactive'; sin valor el back devuelve sólo activos
  status?: string;
  page?: number;
  limit?: number;
}

export interface SupplierListAllParams {
  // Incluye ese proveedor aunque esté inactivo (al editar un registro que lo usa)
  includeId?: string;
  // Devuelve también los inactivos (para filtros)
  includeInactive?: boolean;
}

export interface CreateSupplierDto {
  name: string;
  taxId?: string | null;
}

export type UpdateSupplierDto = Partial<CreateSupplierDto>;

export const suppliersService = {
  async listAll(params?: SupplierListAllParams): Promise<SupplierOption[]> {
    try {
      // Endpoint para selects - sin paginación, ordenado por nombre
      const queryParams: Record<string, string | boolean> = {};

      if (params?.includeId) {
        queryParams.includeId = params.includeId;
      }

      if (params?.includeInactive) {
        queryParams.includeInactive = true;
      }

      const response = await apiClient.get<SupplierOption[]>('/suppliers/all', {
        params: queryParams,
      });
      return response.data;
    } catch (error) {
      throw withForbiddenPermission(new Error(handleApiError(error)), error);
    }
  },

  async list(params?: SupplierFilterParams): Promise<SupplierListResponse> {
    try {
      // Construir parámetros solo con valores definidos
      const queryParams: Record<string, string | number> = {
        page: params?.page || 1,
        limit: params?.limit || 20,
      };

      // Solo agregar search si tiene valor
      if (params?.search && params.search.trim() !== '') {
        queryParams.search = params.search;
      }

      // Solo agregar status si tiene valor
      if (params?.status) {
        queryParams.status = params.status;
      }

      const response = await apiClient.get<SupplierListResponse>('/suppliers', {
        params: queryParams,
      });
      return response.data;
    } catch (error) {
      throw withForbiddenPermission(new Error(handleApiError(error)), error);
    }
  },

  async getStats(): Promise<SupplierStats> {
    try {
      const response = await apiClient.get<SupplierStats>('/suppliers/stats');
      return response.data;
    } catch (error) {
      throw withForbiddenPermission(new Error(handleApiError(error)), error);
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

  async create(data: CreateSupplierDto): Promise<Supplier> {
    try {
      const response = await apiClient.post<Supplier>('/suppliers', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async update(id: string, data: UpdateSupplierDto): Promise<Supplier> {
    try {
      const response = await apiClient.patch<Supplier>(`/suppliers/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await apiClient.delete(`/suppliers/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async reactivate(id: string): Promise<Supplier> {
    try {
      const response = await apiClient.patch<Supplier>(`/suppliers/${id}/reactivar`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async bulkUpload(file: File): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<{ success: number; failed: number; errors: string[] }>(
        '/suppliers/bulk-upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async descargarPlantilla(): Promise<Blob> {
    try {
      const response = await apiClient.get('/suppliers/plantilla', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
