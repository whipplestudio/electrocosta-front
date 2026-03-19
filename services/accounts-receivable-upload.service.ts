import apiClient from '@/lib/api-client'

// ============================================================================
// INTERFACES
// ============================================================================

export interface UploadFileData {
  periodo?: string
  sobrescribir?: boolean
}

export interface UploadResponse {
  uploadId: string
  nombreArchivo: string
  registrosDetectados: number
  estado: string
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
  cuentasCreadas: string[]
  cuentasActualizadas: string[]
}

// ============================================================================
// ACCOUNTS RECEIVABLE UPLOAD SERVICE
// ============================================================================

export const accountsReceivableUploadService = {
  // ========== BULK UPLOAD ENDPOINTS ==========
  
  async subirArchivo(archivo: File, opciones?: UploadFileData): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('archivo', archivo)
    
    if (opciones?.periodo) {
      formData.append('periodo', opciones.periodo)
    }
    if (opciones?.sobrescribir !== undefined) {
      formData.append('sobrescribir', String(opciones.sobrescribir))
    }

    const response = await apiClient.post<UploadResponse>(
      '/carga/cuentas-cobrar/upload',
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
      `/carga/cuentas-cobrar/validar/${uploadId}`
    )
    return response.data
  },

  async importarDatos(uploadId: string): Promise<ImportacionResultado> {
    const response = await apiClient.post<ImportacionResultado>(
      `/carga/cuentas-cobrar/importar/${uploadId}`
    )
    return response.data
  },

  async descargarPlantilla(): Promise<Blob> {
    const response = await apiClient.get('/carga/cuentas-cobrar/plantilla', {
      responseType: 'blob',
    })
    return response.data
  },

  async obtenerHistorial(filtros?: {
    page?: number
    limit?: number
    fechaDesde?: string
    fechaHasta?: string
    usuario?: string
  }): Promise<any> {
    const response = await apiClient.get('/carga/cuentas-cobrar/historial', {
      params: filtros,
    })
    return response.data
  },

  async obtenerDetalleCarga(uploadId: string): Promise<any> {
    const response = await apiClient.get(`/carga/cuentas-cobrar/${uploadId}`)
    return response.data
  },
}
