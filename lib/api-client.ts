import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { User } from '@/types/users';
import type { ForbiddenPermissionError, ForbiddenReason } from '@/types/permissions';

// Configuración base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://electrocosta-api-328521246433.us-west4.run.app';

// Crear instancia de axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// Sucursal elegida por un usuario de alcance GLOBAL: 'ALL' o el uuid de la sucursal
export const ACTIVE_BRANCH_KEY = 'activeBranchId';
export const ALL_BRANCHES = 'ALL';

// Solo el alcance GLOBAL elige sucursal; sin elección guardada, el back usa la de origen
const getActiveBranchHeader = (): string | null => {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr) as Partial<User>;
    if (user.role?.scope !== 'GLOBAL') return null;
  } catch {
    return null;
  }

  return localStorage.getItem(ACTIVE_BRANCH_KEY);
};

// Interceptor para agregar token a las peticiones
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener token del localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const activeBranch = typeof window !== 'undefined' ? getActiveBranchHeader() : null;
    if (activeBranch && config.headers) {
      config.headers['X-Branch-Id'] = activeBranch;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- 403 de permisos -------------------------------------------------------
// El back responde a una denegación de PermissionsGuard con un cuerpo propio
// (reason / message / permissionName / module / howToFix). El interceptor lo
// valida y lo deja adjunto al error bajo esta clave, para que las pantallas
// distingan "te falta un permiso" de un 403 cualquiera sin volver a parsear.
const FORBIDDEN_PERMISSION_KEY = '__forbiddenPermission';

type ForbiddenAwareError = { [FORBIDDEN_PERMISSION_KEY]?: ForbiddenPermissionError };

const FORBIDDEN_REASONS: readonly ForbiddenReason[] = ['MISSING_PERMISSION', 'UNKNOWN_PERMISSION'];

// Devuelve null si el cuerpo no es el del guard: un 403 de otra procedencia, o
// un filtro global de excepciones reescribiendo la respuesta. En ese caso la
// pantalla cae a su manejo de error genérico en vez de romperse.
const normalizeForbiddenPermission = (data: unknown): ForbiddenPermissionError | null => {
  if (!data || typeof data !== 'object') return null;

  const body = data as Record<string, unknown>;
  if (!FORBIDDEN_REASONS.includes(body.reason as ForbiddenReason)) return null;
  if (typeof body.message !== 'string' || !body.message) return null;

  return {
    reason: body.reason as ForbiddenReason,
    message: body.message,
    permissionName: typeof body.permissionName === 'string' ? body.permissionName : null,
    module: typeof body.module === 'string' ? body.module : null,
    howToFix: typeof body.howToFix === 'string' ? body.howToFix : null,
  };
};

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si el error es 401 y no es un retry, intentar refrescar el token
    // Excluir el endpoint de login para que los errores de credenciales se propaguen normalmente
    const isAuthLogin = originalRequest.url?.includes('/auth/login');
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthLogin) {
      originalRequest._retry = true;

      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        
        // Si no hay refresh token, redirigir al login inmediatamente
        if (!refreshToken) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        // Intentar refrescar el token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
        }

        // Reintentar la petición original con el nuevo token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, limpiar tokens y redirigir al login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // El 403 de permisos se adjunta al propio error: el 401 de arriba ya
    // retornó por todos sus caminos, así que el refresco de token no se toca.
    if (error.response?.status === 403) {
      const forbidden = normalizeForbiddenPermission(error.response.data);
      if (forbidden) {
        (error as AxiosError & ForbiddenAwareError)[FORBIDDEN_PERMISSION_KEY] = forbidden;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Para las pantallas: el 403 de permisos ya normalizado, o null si el error es
// de cualquier otro tipo.
export const getForbiddenPermissionError = (error: unknown): ForbiddenPermissionError | null => {
  if (!error || typeof error !== 'object') return null;
  return (error as ForbiddenAwareError)[FORBIDDEN_PERMISSION_KEY] ?? null;
};

// Los servicios re-lanzan los errores de axios como un Error plano con el texto
// de handleApiError, y eso descartaba la marca del 403: la pantalla recibía un
// error sin rastro de que lo que faltaba era un permiso. Quien necesite
// conservarla envuelve así el Error nuevo antes de lanzarlo.
export const withForbiddenPermission = <E extends Error>(target: E, source: unknown): E => {
  const forbidden = getForbiddenPermissionError(source);
  if (forbidden) {
    (target as E & ForbiddenAwareError)[FORBIDDEN_PERMISSION_KEY] = forbidden;
  }
  return target;
};

// Literal del back para escrituras de un usuario GLOBAL con la vista "Todas"
export const SELECT_BRANCH_MESSAGE = 'Seleccione una sucursal para operar';
const SELECT_BRANCH_HINT = 'Cambie la sucursal en el selector del menú lateral: en "Todas" no se puede crear ni modificar.';

// Helper para manejar errores de API
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string | string[]; error: string; statusCode: number }>;
    
    // Priorizar el campo 'message' del backend, que puede ser string o array
    const backendMessage = axiosError.response?.data?.message;
    if (backendMessage) {
      // Si es un array, unir los mensajes con punto y coma
      if (Array.isArray(backendMessage)) {
        return backendMessage.join('; ');
      }
      if (backendMessage === SELECT_BRANCH_MESSAGE) {
        return `${SELECT_BRANCH_MESSAGE}. ${SELECT_BRANCH_HINT}`;
      }
      return backendMessage;
    }
    
    // Fallback a otros mensajes de error
    return axiosError.response?.data?.error || axiosError.message || 'Error desconocido';
  }
  return 'Error inesperado';
};
