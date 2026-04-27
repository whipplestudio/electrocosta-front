import apiClient, { handleApiError } from '@/lib/api-client';

export interface Client {
  id: string;
  name: string;
  taxId: string;
  email?: string | null;
  phone?: string | null;
  contactPerson?: string | null;
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

export interface ClientSimple {
  id: string;
  name: string;
  taxId: string;
  email?: string | null;
  phone?: string | null;
  contactPerson?: string | null;
}

export const clientsService = {
  async listAll(): Promise<Pick<Client, 'id' | 'name'>[]> {
    try {
      // Endpoint optimizado para selects - sin paginación, solo id y name
      const response = await apiClient.get<Pick<Client, 'id' | 'name'>[]>('/clients/all');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getSimpleList(): Promise<ClientSimple[]> {
    try {
      // Endpoint optimizado para selector de proyectos - incluye taxId, email, phone
      const response = await apiClient.get<ClientSimple[]>('/clients/simple/list');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

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
  contactPerson?: string;
  notes?: string;
  status?: string;
}
