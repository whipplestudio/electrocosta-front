import apiClient, { handleApiError } from '@/lib/api-client';

// ==================== INTERFACES ====================

export interface Area {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    proyectos: number;
    ventas: number;
    gastos: number;
  };
}

export interface AreaSimple {
  id: string;
  name: string;
  description?: string | null;
}

export interface AreaWithProjects extends Area {
  proyectos: Array<{
    id: string;
    codigoProyecto: string;
    nombreProyecto: string;
    estado: string;
    presupuestoTotal: number;
    fechaInicio: string;
    fechaFinEstimada?: string | null;
    cliente?: {
      id: string;
      name: string;
    } | null;
    responsable: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

export interface CreateAreaData {
  name: string;
  description?: string;
  status?: string;
}

export interface UpdateAreaData {
  name?: string;
  description?: string;
  status?: string;
}

// ==================== SERVICE ====================

export const areasService = {
  /**
   * Obtener todas las áreas
   */
  async getAll(): Promise<Area[]> {
    try {
      const response = await apiClient.get<Area[]>('/areas');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Obtener área por ID
   */
  async getById(id: string): Promise<Area> {
    try {
      const response = await apiClient.get<Area>(`/areas/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Crear nueva área
   */
  async create(data: CreateAreaData): Promise<Area> {
    try {
      const response = await apiClient.post<Area>('/areas', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Actualizar área existente
   */
  async update(id: string, data: UpdateAreaData): Promise<Area> {
    try {
      const response = await apiClient.patch<Area>(`/areas/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Eliminar área (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/areas/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Obtener lista simplificada de áreas para selectores
   * Solo retorna áreas activas con campos mínimos
   */
  async getSimpleList(): Promise<AreaSimple[]> {
    try {
      const response = await apiClient.get<AreaSimple[]>('/areas/simple/list');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Obtener área con sus proyectos
   */
  async getWithProjects(id: string): Promise<AreaWithProjects> {
    try {
      const response = await apiClient.get<AreaWithProjects>(`/areas/${id}/projects`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
