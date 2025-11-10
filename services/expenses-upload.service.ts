import apiClient from '@/lib/api-client'

export interface UploadFileData {
  periodo?: string
  sobrescribir?: boolean
}

export interface UploadResponse {
  uploadId: string
  nombreArchivo: string
  registrosDetectados: number
  estado: 'subido' | 'validando' | 'validado' | 'error_validacion' | 'importando' | 'importado' | 'error_importacion'
}

export interface ErrorValidacion {
  fila: number
  campo: string
  valor: any
  error: string
}

export interface ValidacionResultado {
  uploadId: string
  registrosValidos: number
  registrosInvalidos: number
  errores: ErrorValidacion[]
  advertencias: string[]
  puedeImportar: boolean
}

export interface ImportacionResultado {
  registrosImportados: number
  registrosOmitidos: number
  entidadesCreadas: string[]
  errores: string[]
  gastosCreados: string[]
  cuentasPorPagarGeneradas: string[]
}

export interface HistorialCarga {
  id: string
  nombreArchivo: string
  tipo: string
  estado: string
  registrosDetectados: number
  registrosValidos?: number
  registrosInvalidos?: number
  registrosImportados: number
  usuarioId: string
  usuario?: {
    firstName: string
    lastName: string
  }
  createdAt: string
  updatedAt: string
}

export interface HistorialResponse {
  data: HistorialCarga[]
  total: number
  page: number
  limit: number
}

export interface EstadisticasCarga {
  totalCargas: number
  cargasExitosas: number
  cargasConErrores: number
  totalRegistrosImportados: number
  promedioRegistrosPorCarga: number
  periodo: string
}

export const expensesUploadService = {
  async uploadFile(file: File, data: UploadFileData): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('archivo', file)
    
    if (data.periodo) {
      formData.append('periodo', data.periodo)
    }
    
    if (data.sobrescribir !== undefined) {
      formData.append('sobrescribir', String(data.sobrescribir))
    }

    const response = await apiClient.post<UploadResponse>(
      '/carga/gastos/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    
    return response.data
  },

  async validarDatos(uploadId: string): Promise<ValidacionResultado> {
    const response = await apiClient.post<ValidacionResultado>(
      `/carga/gastos/validar/${uploadId}`
    )
    return response.data
  },

  async importarDatos(uploadId: string): Promise<ImportacionResultado> {
    const response = await apiClient.post<ImportacionResultado>(
      `/carga/gastos/importar/${uploadId}`
    )
    return response.data
  },

  async descargarPlantilla(): Promise<Blob> {
    const response = await apiClient.get('/carga/gastos/plantilla', {
      responseType: 'blob',
    })
    return response.data
  },

  async obtenerHistorial(filtros?: {
    page?: number
    limit?: number
    fecha_desde?: string
    fecha_hasta?: string
    usuario?: string
  }): Promise<HistorialResponse> {
    const response = await apiClient.get<HistorialResponse>(
      '/carga/gastos/historial',
      { params: filtros }
    )
    return response.data
  },

  async obtenerEstadisticas(periodo?: string): Promise<EstadisticasCarga> {
    const response = await apiClient.get<EstadisticasCarga>(
      '/carga/gastos/estadisticas',
      { params: { periodo } }
    )
    return response.data
  },

  async cancelarCarga(uploadId: string): Promise<{ mensaje: string; uploadId: string; fechaCancelacion: string }> {
    const response = await apiClient.post(
      `/carga/gastos/cancelar/${uploadId}`
    )
    return response.data
  },
}
