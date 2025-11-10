import apiClient from '@/lib/api-client'

// ============================================================================
// INTERFACES
// ============================================================================

export interface CrearProyectoData {
  codigoProyecto: string
  nombreProyecto: string
  clienteNombre: string
  clienteRuc?: string
  fechaInicio: string
  fechaFinEstimada: string
  presupuestoTotal: number
  presupuestoMateriales: number
  presupuestoManoObra: number
  presupuestoOtros: number
  responsableEmail: string
  areaId: string
  estado: string
  prioridad: string
  descripcion?: string
  observaciones?: string
}

export interface ProyectoCreado {
  id: string
  codigoProyecto: string
  nombreProyecto: string
  mensaje: string
}

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
  proyectosCreados: string[]
  proyectosActualizados: string[]
}

export interface EstadoProyecto {
  value: string
  label: string
  descripcion: string
}

export interface PrioridadProyecto {
  value: string
  label: string
  descripcion: string
  color: string
}

// ============================================================================
// PROJECT UPLOAD SERVICE
// ============================================================================

export const projectsUploadService = {
  // ========== CRUD ENDPOINTS ==========
  
  async crearProyecto(data: CrearProyectoData): Promise<ProyectoCreado> {
    const response = await apiClient.post<ProyectoCreado>(
      '/carga/proyectos/crear',
      data
    )
    return response.data
  },

  async obtenerListadoProyectos(filtros?: {
    page?: number
    limit?: number
  }): Promise<any> {
    const response = await apiClient.get(
      '/carga/proyectos/listado',
      { params: filtros }
    )
    return response.data
  },

  async obtenerProyectoPorId(id: string): Promise<any> {
    const response = await apiClient.get(`/carga/proyectos/${id}`)
    return response.data
  },

  async actualizarProyecto(id: string, data: CrearProyectoData): Promise<{
    id: string
    codigoProyecto: string
    mensaje: string
  }> {
    const response = await apiClient.put(
      `/carga/proyectos/${id}`,
      data
    )
    return response.data
  },

  // ========== CARGA MASIVA ==========

  async uploadFile(file: File, options: UploadFileData = {}): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('archivo', file)
    if (options.periodo) formData.append('periodo', options.periodo)
    if (options.sobrescribir !== undefined) {
      formData.append('sobrescribir', String(options.sobrescribir))
    }

    const response = await apiClient.post<UploadResponse>(
      '/carga/proyectos/upload',
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
      `/carga/proyectos/validar/${uploadId}`
    )
    return response.data
  },

  async importarDatos(uploadId: string): Promise<ImportacionResultado> {
    const response = await apiClient.post<ImportacionResultado>(
      `/carga/proyectos/importar/${uploadId}`
    )
    return response.data
  },

  async descargarPlantilla(): Promise<Blob> {
    const response = await apiClient.get(
      '/carga/proyectos/plantilla',
      {
        responseType: 'blob',
      }
    )
    return response.data
  },

  async cancelarCarga(uploadId: string): Promise<{ mensaje: string; uploadId: string; fechaCancelacion: string }> {
    const response = await apiClient.post(
      `/carga/proyectos/cancelar/${uploadId}`
    )
    return response.data
  },

  // ========== CATÁLOGOS Y VALIDACIONES ==========

  async obtenerEstados(): Promise<{ estados: EstadoProyecto[] }> {
    const response = await apiClient.get<{ estados: EstadoProyecto[] }>(
      '/carga/proyectos/estados'
    )
    return response.data
  },

  async obtenerPrioridades(): Promise<{ prioridades: PrioridadProyecto[] }> {
    const response = await apiClient.get<{ prioridades: PrioridadProyecto[] }>(
      '/carga/proyectos/prioridades'
    )
    return response.data
  },

  async validarUsuarioResponsable(email: string): Promise<{
    email: string
    encontrado: boolean
    usuario?: any
    mensaje: string
  }> {
    const response = await apiClient.get(
      `/carga/proyectos/validacion/usuario/${email}`
    )
    return response.data
  },

  async validarPresupuesto(params: {
    total: number
    materiales: number
    manoObra: number
    otros: number
  }): Promise<{
    esValido: boolean
    mensaje: string
    desglose: any
  }> {
    const response = await apiClient.get(
      '/carga/proyectos/validacion/presupuesto',
      { params }
    )
    return response.data
  },

  // ========== HISTORIAL Y REPORTES ==========

  async obtenerHistorial(filtros?: {
    page?: number
    limit?: number
    fechaDesde?: string
    fechaHasta?: string
    usuario?: string
  }): Promise<any> {
    const response = await apiClient.get(
      '/carga/proyectos/historial',
      { params: filtros }
    )
    return response.data
  },

  async obtenerEstadisticas(periodo?: string): Promise<any> {
    const response = await apiClient.get(
      '/carga/proyectos/estadisticas',
      { params: { periodo } }
    )
    return response.data
  },

  async obtenerReportePorEstado(periodo?: string): Promise<any> {
    const response = await apiClient.get(
      '/carga/proyectos/reportes/por-estado',
      { params: { periodo } }
    )
    return response.data
  },

  async obtenerReportePorPrioridad(periodo?: string): Promise<any> {
    const response = await apiClient.get(
      '/carga/proyectos/reportes/por-prioridad',
      { params: { periodo } }
    )
    return response.data
  },
}
