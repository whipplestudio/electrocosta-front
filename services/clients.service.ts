import apiClient, { handleApiError } from '@/lib/api-client';

export interface Client {
  id: string;
  name: string;
  taxId: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  contactPerson?: string | null;
  creditLimit?: number | null;
  paymentTerms?: number | null;
  notes?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientListResponse {
  data: Client[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface ClientFilterParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const clientsService = {
  async list(params?: ClientFilterParams): Promise<ClientListResponse> {
    try {
      // Construir parámetros solo con valores definidos
      const queryParams: any = {
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

      const response = await apiClient.get<ClientListResponse>('/clients', {
        params: queryParams,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getById(id: string): Promise<Client> {
    try {
      const response = await apiClient.get<Client>(`/clients/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async create(data: CreateClientDto): Promise<Client> {
    try {
      const response = await apiClient.post<Client>('/clients', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async update(id: string, data: CreateClientDto): Promise<Client> {
    try {
      const response = await apiClient.patch<Client>(`/clients/${id}`, data);
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
        '/clients/bulk-upload',
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
      const response = await apiClient.get('/clients/plantilla', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export interface CreateClientDto {
  name: string;
  taxId: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  contactPerson?: string;
  creditLimit?: number;
  paymentTerms?: number;
  notes?: string;
  status?: string;
}
