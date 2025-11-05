import apiClient, { handleApiError } from '@/lib/api-client';

export interface Client {
  id: string;
  name: string;
  taxId: string;
  email?: string;
  phone?: string;
  status: string;
}

export const clientsService = {
  async list(): Promise<Client[]> {
    try {
      const response = await apiClient.get<{ data: Client[] }>('/clients');
      return response.data.data; // El backend devuelve {data: [], total, page, etc}
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
