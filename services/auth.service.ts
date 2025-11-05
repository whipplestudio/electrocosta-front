import apiClient, { handleApiError } from '@/lib/api-client';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: {
      id: string;
      name: string;
      description: string;
    };
  };
}

export const authService = {
  async login(credentials: LoginDto): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      
      // Guardar tokens en localStorage
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Limpiar tokens del localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  getCurrentUser() {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    
    // Decodificar el JWT (básico, sin validación)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },
};
