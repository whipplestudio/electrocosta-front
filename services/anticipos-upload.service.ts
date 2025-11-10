import apiClient from '@/lib/api-client';

export const anticiposUploadService = {
  // ==================== CRUD ====================
  
  async crearAnticipoManual(data: any) {
    const response = await apiClient.post('/carga/anticipos/crear', data);
    return response.data;
  },

  async obtenerListadoAnticipos(params: any = {}) {
    const response = await apiClient.get('/carga/anticipos', { params });
    return response.data;
  },

  async obtenerAnticipoPorId(id: string) {
    const response = await apiClient.get(`/carga/anticipos/${id}`);
    return response.data;
  },

  async actualizarAnticipo(id: string, data: any) {
    const response = await apiClient.put(`/carga/anticipos/${id}`, data);
    return response.data;
  },

  // ==================== CARGA MASIVA ====================

  async subirArchivo(file: File, opciones: any = {}) {
    const formData = new FormData();
    formData.append('archivo', file);
    
    if (opciones.periodo) {
      formData.append('periodo', opciones.periodo);
    }
    if (opciones.sobrescribir !== undefined) {
      formData.append('sobrescribir', opciones.sobrescribir.toString());
    }

    const response = await apiClient.post('/carga/anticipos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async validarArchivo(uploadId: string) {
    const response = await apiClient.post(`/carga/anticipos/validar/${uploadId}`);
    return response.data;
  },

  async importarAnticipos(uploadId: string) {
    const response = await apiClient.post(`/carga/anticipos/importar/${uploadId}`);
    return response.data;
  },

  async descargarPlantilla() {
    const response = await apiClient.get('/carga/anticipos/plantilla', {
      responseType: 'blob',
    });
    return response.data;
  },

  async obtenerHistorial(params: any = {}) {
    const response = await apiClient.get('/carga/anticipos/historial', { params });
    return response.data;
  },

  async cancelarCarga(uploadId: string) {
    const response = await apiClient.delete(`/carga/anticipos/cancelar/${uploadId}`);
    return response.data;
  },

  // ==================== UTILIDADES ====================

  async obtenerMetodosPago() {
    const response = await apiClient.get('/carga/anticipos/metodos-pago');
    return response.data;
  },

  async obtenerEstados() {
    const response = await apiClient.get('/carga/anticipos/estados');
    return response.data;
  },

  async obtenerEstadisticas(params: any = {}) {
    const response = await apiClient.get('/carga/anticipos/estadisticas', { params });
    return response.data;
  },

  async obtenerSaldosDisponibles(proveedorId?: string) {
    const params = proveedorId ? { proveedorId } : {};
    const response = await apiClient.get('/carga/anticipos/saldos', { params });
    return response.data;
  },
};

export default anticiposUploadService;
