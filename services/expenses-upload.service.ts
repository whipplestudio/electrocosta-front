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
  limit?: number
  totalPages: number
}

export interface EstadisticasCarga {
  totalCargas: number
  cargasExitosas: number
  cargasConErrores: number
  totalRegistrosImportados: number
  promedioRegistrosPorCarga: number
  periodo: string
  categoriasMasUsadas?: Array<{
    categoria: string
    cantidad: number
    porcentaje: number
  }>
}

export interface ValidacionRUC {
  ruc: string
  razonSocial: string
  estado: string
  condicion: string
  direccion: string
  validado: boolean
  mensaje: string
}

export interface CategoriaGasto {
  value: string
  label: string
  descripcion: string
}

export interface ReportePorCategoria {
  periodo: string
  totalGastos: number
  montoTotal: number
  categorias: Array<{
    categoria: string
    cantidad: number
    monto: number
    porcentaje: number
    promedioPorGasto: number
  }>
  generadoEn: string
}

export interface CrearGastoData {
  fechaGasto: string
  concepto: string
  categoria: string
  monto: number
  proveedorRuc: string
  proveedorNombre: string
  areaCentroCosto?: string
  formaPago?: string
  numeroComprobante?: string
  observaciones?: string
}

export interface GastoCreado {
  id: string
  numeroComprobante: string
  concepto: string
  total: number
  proveedor: {
    id: string
    nombre: string
    ruc: string
  }
  mensaje: string
}

// ============================================================================
// EXPENSES UPLOAD SERVICE
// ============================================================================

export const expensesUploadService = {
  // --------------------------------------------------------------------------
  // CARGA DE ARCHIVO EXCEL/CSV
  // --------------------------------------------------------------------------
  
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
    fechaDesde?: string
    fechaHasta?: string
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

  async validarRUC(ruc: string): Promise<ValidacionRUC> {
    const response = await apiClient.get<ValidacionRUC>(
      `/carga/gastos/validacion/proveedor/${ruc}`
    )
    return response.data
  },

  async obtenerCategorias(): Promise<{ categorias: CategoriaGasto[] }> {
    const response = await apiClient.get<{ categorias: CategoriaGasto[] }>(
      '/carga/gastos/categorias'
    )
    return response.data
  },

  async validarCategoria(categoria: string): Promise<{
    categoria: string
    esValida: boolean
    mensaje: string
    categoriasDisponibles: string[]
  }> {
    const response = await apiClient.get(
      `/carga/gastos/validacion/categoria/${categoria}`
    )
    return response.data
  },

  async obtenerReportePorCategoria(periodo?: string): Promise<ReportePorCategoria> {
    const response = await apiClient.get<ReportePorCategoria>(
      '/carga/gastos/reportes/por-categoria',
      { params: { periodo } }
    )
    return response.data
  },

  async crearGasto(data: CrearGastoData): Promise<GastoCreado> {
    const response = await apiClient.post<GastoCreado>(
      '/carga/gastos/crear',
      data
    )
    return response.data
  },

  async obtenerListadoGastos(filtros?: {
    page?: number
    limit?: number
  }): Promise<any> {
    const response = await apiClient.get(
      '/carga/gastos/listado',
      { params: filtros }
    )
    return response.data
  },
}
