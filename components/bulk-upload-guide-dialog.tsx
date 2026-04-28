"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, Calculator, FileSpreadsheet, HelpCircle, X } from "lucide-react"

export interface BulkUploadGuideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BulkUploadGuideDialog({
  open,
  onOpenChange,
}: BulkUploadGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            Guía de Carga Masiva - Cuentas por Pagar
          </DialogTitle>
          <DialogDescription>
            Instrucciones detalladas para usar la plantilla Excel de importación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Introducción */}
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Esta guía te ayudará a importar cuentas por pagar masivamente. Solo necesitas el <strong>total</strong> de cada cuenta, el sistema calculará automáticamente el IVA y subtotal.
            </p>
          </div>

          {/* Campos de la plantilla */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-3 text-base">
              <Table className="h-5 w-5 text-blue-500" />
              Campos de la plantilla
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">proveedorNombre</span>
                <span className="text-slate-600 dark:text-slate-400">Nombre del proveedor. Si no existe, se creará automáticamente.</span>
              </div>
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">proyectoNombre</span>
                <span className="text-slate-600 dark:text-slate-400">Nombre del proyecto (opcional). Debe existir en el sistema.</span>
              </div>
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">numeroFactura</span>
                <span className="text-slate-600 dark:text-slate-400">Folio o número de factura del proveedor.</span>
              </div>
              <div className="flex gap-3 p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800">
                <span className="font-medium min-w-[160px] text-green-700 dark:text-green-300">total ★</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Campo obligatorio. Monto total incluyendo IVA.</span>
              </div>
              <div className="flex gap-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                <span className="font-medium min-w-[160px] text-blue-700 dark:text-blue-300">subtotal</span>
                <span className="text-blue-600 dark:text-blue-400">Opcional. Monto sin IVA. Si pones subtotal, también debes especificar iva o ivaMonto.</span>
              </div>
              <div className="flex gap-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                <span className="font-medium min-w-[160px] text-blue-700 dark:text-blue-300">iva</span>
                <span className="text-blue-600 dark:text-blue-400">Opcional. Porcentaje de IVA (ej: 16 para 16%). Se usa con subtotal.</span>
              </div>
              <div className="flex gap-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                <span className="font-medium min-w-[160px] text-blue-700 dark:text-blue-300">ivaMonto</span>
                <span className="text-blue-600 dark:text-blue-400">Opcional. Monto fijo de IVA (ej: 1600). Se usa con subtotal.</span>
              </div>
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">categoriaNombre</span>
                <span className="text-slate-600 dark:text-slate-400">Categoría de gasto. Debe existir en el sistema.</span>
              </div>
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">macroClasificacion</span>
                <span className="text-slate-600 dark:text-slate-400">Valores válidos: <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">MATERIALES</code> | <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">MANO_DE_OBRA</code> | <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">OTROS</code></span>
              </div>
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">fechaEmision</span>
                <span className="text-slate-600 dark:text-slate-400">Formato: <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">YYYY-MM-DD</code> (ej: 2024-01-15)</span>
              </div>
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">fechaVencimiento</span>
                <span className="text-slate-600 dark:text-slate-400">Formato: <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">YYYY-MM-DD</code></span>
              </div>
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">descripcion</span>
                <span className="text-slate-600 dark:text-slate-400">Descripción o concepto de la cuenta (opcional).</span>
              </div>
            </div>
          </div>

          {/* Pago opcional */}
          <div className="pt-4 border-t">
            <h4 className="font-semibold flex items-center gap-2 mb-3 text-base">
              <FileSpreadsheet className="h-5 w-5 text-green-500" />
              Pago opcional
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Usa estos campos solo si la cuenta ya tiene pagos registrados (totalmente o parcialmente pagada):
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">fechaPago</span>
                <span className="text-slate-600 dark:text-slate-400">Fecha del pago realizado. Si está vacío, usa la fecha de emisión.</span>
              </div>
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">montoPago</span>
                <span className="text-slate-600 dark:text-slate-400">Monto pagado. Deja vacío si aún no se ha pagado nada.</span>
              </div>
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">metodoPago</span>
                <span className="text-slate-600 dark:text-slate-400">Opciones: <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">transfer</code> | <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">check</code> | <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">cash</code> | <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">card</code> | <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">other</code> (default: transfer)</span>
              </div>
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">referenciaPago</span>
                <span className="text-slate-600 dark:text-slate-400">Folio o referencia del pago. Default: "CARGA-MASIVA"</span>
              </div>
            </div>
          </div>

          {/* Cálculo de IVA */}
          <div className="pt-4 border-t bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
            <h4 className="font-semibold flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-300">
              <Calculator className="h-5 w-5" />
              Opciones de IVA (opcionales)
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
              Tienes 3 formas de especificar el IVA. Si no pones nada, se asume que el total no incluye IVA desglosado:
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-white dark:bg-slate-800 rounded border border-blue-200 dark:border-blue-800">
                <p className="font-medium text-sm text-blue-800 dark:text-blue-200">Opción 1: Solo total (sin IVA específico)</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Deja <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">subtotal</code>, <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">iva</code> y <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">ivaMonto</code> vacíos.
                  El sistema guardará subtotal = total, iva = 0
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded border border-blue-200 dark:border-blue-800">
                <p className="font-medium text-sm text-blue-800 dark:text-blue-200">Opción 2: Subtotal + IVA %</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Pon <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">subtotal</code> y <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">iva</code> (ej: 16 para 16%).
                  El sistema calculará: ivaMonto = subtotal × iva ÷ 100
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded border border-blue-200 dark:border-blue-800">
                <p className="font-medium text-sm text-blue-800 dark:text-blue-200">Opción 3: Subtotal + IVA monto fijo</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Pon <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">subtotal</code> y <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">ivaMonto</code> (ej: 1600).
                  El sistema calculará: iva% = (ivaMonto ÷ subtotal) × 100
                </p>
              </div>
            </div>
          </div>

          {/* Ejemplos prácticos */}
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-4 text-base">📋 Ejemplos prácticos</h4>
            <div className="space-y-4">
              {/* Ejemplo 1 - Solo total */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Ejemplo 1: Solo total (sin IVA específico)</p>
                <div className="bg-white dark:bg-slate-800 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
                  total: 11600
                  subtotal: (vacío)
                  iva: (vacío)
                  ivaMonto: (vacío)
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                  Resultado: subtotal = $11,600, iva = 0
                </p>
              </div>

              {/* Ejemplo 2 - Subtotal + IVA% */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Ejemplo 2: Subtotal + IVA %</p>
                <div className="bg-white dark:bg-slate-800 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
                  total: 11600
                  subtotal: 10000
                  iva: 16
                  ivaMonto: (vacío)
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                  Resultado: ivaMonto = $1,600 (16% de $10,000)
                </p>
              </div>

              {/* Ejemplo 3 - Subtotal + IVA monto */}
              <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="font-semibold text-green-800 dark:text-green-200 mb-2">Ejemplo 3: Subtotal + IVA monto fijo</p>
                <div className="bg-white dark:bg-slate-800 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
                  total: 11600
                  subtotal: 10000
                  iva: (vacío)
                  ivaMonto: 1600
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 italic">
                  Resultado: iva = 16% ($1,600 ÷ $10,000 × 100)
                </p>
              </div>

              {/* Ejemplo 4 - Con pago parcial */}
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                <p className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Ejemplo 4: Cuenta parcialmente pagada</p>
                <div className="bg-white dark:bg-slate-800 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
                  total: 11600
                  subtotal: 10000
                  iva: 16
                  montoPago: 5000
                  fechaPago: "2024-01-20"
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400 italic">
                  Resultado: Status "pending", saldo pendiente de $6,600
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2 text-base">💡 Consejos útiles</h4>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Descarga la plantilla con el botón "Plantilla Excel" para tener el formato correcto</li>
              <li>El proveedor se creará automáticamente si no existe</li>
              <li>El proyecto y la categoría deben existir previamente en el sistema</li>
              <li>El status se determina automáticamente según el monto pagado y la fecha de vencimiento</li>
              <li>Si la fecha de vencimiento ya pasó y hay saldo pendiente, el status será "overdue"</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Cerrar guía
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
