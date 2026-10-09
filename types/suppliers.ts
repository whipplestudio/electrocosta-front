// ============================================
// INTERFACES - MODELOS
// ============================================

export interface Supplier {
  id: string;
  name: string;
  taxId: string | null;
  status: string;
}

// Elemento de GET /suppliers/all, para selects y filtros
export interface SupplierOption {
  id: string;
  name: string;
  taxId: string | null;
  status: string;
}

// Respuesta de GET /suppliers/stats (sólo proveedores activos)
export interface SupplierStats {
  total: number;
  conRfc: number;
  sinRfc: number;
  conCuentasPorPagar: number;
}
