import apiClient from '@/lib/api-client';

const customReportsService = {
  // Obtener todos los reportes personalizados
  async getReportes(esPublico?: boolean) {
    const params = new URLSearchParams();
    if (esPublico !== undefined) {
      params.append('esPublico', String(esPublico));
    }
    const response = await apiClient.get(`/reports/custom?${params.toString()}`);
    return response.data;
  },

  // Obtener un reporte por ID
  async getReportePorId(id: string) {
    const response = await apiClient.get(`/reports/custom/${id}`);
    return response.data;
  },

  // Crear nuevo reporte
  async crearReporte(data: {
    nombre: string;
    descripcion?: string;
    tipoBase: string;
    configuracion: any;
    esPublico?: boolean;
  }) {
    const response = await apiClient.post('/reports/custom', data);
    return response.data;
  },

  // Actualizar reporte
  async actualizarReporte(id: string, data: any) {
    const response = await apiClient.put(`/reports/custom/${id}`, data);
    return response.data;
  },

  // Eliminar reporte
  async eliminarReporte(id: string) {
    const response = await apiClient.delete(`/reports/custom/${id}`);
    return response.data;
  },

  // Ejecutar reporte
  async ejecutarReporte(id: string) {
    const response = await apiClient.post(`/reports/custom/${id}/execute`);
    return response.data;
  },

  // Obtener plantillas
  async getPlantillas() {
    const response = await apiClient.get('/reports/custom/templates');
    return response.data;
  },

  // Crear desde plantilla
  async crearDesdeTemplate(templateId: string) {
    const response = await apiClient.post(`/reports/custom/template/${templateId}`);
    return response.data;
  },
};

export default customReportsService;
