"use client"

import { CancelButton } from "@/components/ui"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, Calculator, FileSpreadsheet, HelpCircle, X } from "lucide-react"

export interface BulkUploadGuideDialogCobrarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BulkUploadGuideDialogCobrar({
  open,
  onOpenChange,
}: BulkUploadGuideDialogCobrarProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            Guía de Carga Masiva - Cuentas por Cobrar
          </DialogTitle>
          <DialogDescription>
            Instrucciones detalladas para usar la plantilla Excel de importación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Introducción */}
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Esta guía te ayudará a importar cuentas por cobrar masivamente. Solo necesitas el <strong>total</strong> de cada cuenta, el sistema calculará automáticamente el IVA y subtotal.
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
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">clienteRfc</span>
                <span className="text-slate-600 dark:text-slate-400">RFC del cliente. Si no existe, se creará automáticamente.</span>
              </div>
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">proyectoNombre</span>
                <span className="text-slate-600 dark:text-slate-400">Nombre del proyecto (opcional). Debe existir en el sistema.</span>
              </div>
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">numeroFactura</span>
                <span className="text-slate-600 dark:text-slate-400">Folio o número de factura.</span>
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
                <span className="text-slate-600 dark:text-slate-400">Categoría de ingreso. Debe existir en el sistema.</span>
              </div>
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">fechaEmision</span>
                <span className="text-slate-600 dark:text-slate-400">Fecha de emisión (YYYY-MM-DD).</span>
              </div>
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">fechaVencimiento</span>
                <span className="text-slate-600 dark:text-slate-400">Fecha de vencimiento (YYYY-MM-DD).</span>
              </div>
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">descripcion</span>
                <span className="text-slate-600 dark:text-slate-400">Descripción o concepto de la cuenta por cobrar.</span>
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

          {/* Cobros históricos (opcionales) */}
          <div className="pt-4 border-t bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-300">
              <FileSpreadsheet className="h-5 w-5" />
              Cobros opcionales (para cuentas ya cobradas o parcialmente cobradas)
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3 p-2 bg-white dark:bg-slate-800 rounded">
                <span className="font-medium min-w-[160px] text-amber-700 dark:text-amber-300">fechaCobro</span>
                <span className="text-slate-600 dark:text-slate-400">Fecha del cobro (YYYY-MM-DD). Opcional.</span>
              </div>
              <div className="flex gap-3 p-2 bg-white dark:bg-slate-800 rounded">
                <span className="font-medium min-w-[160px] text-amber-700 dark:text-amber-300">montoCobro</span>
                <span className="text-slate-600 dark:text-slate-400">Monto del cobro. Opcional.</span>
              </div>
              <div className="flex gap-3 p-2 bg-white dark:bg-slate-800 rounded">
                <span className="font-medium min-w-[160px] text-amber-700 dark:text-amber-300">metodoCobro</span>
                <span className="text-slate-600 dark:text-slate-400">Método: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">transfer</code> | <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">check</code> | <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">cash</code> | <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">card</code> | <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">other</code></span>
              </div>
              <div className="flex gap-3 p-2 bg-white dark:bg-slate-800 rounded">
                <span className="font-medium min-w-[160px] text-amber-700 dark:text-amber-300">referenciaCobro</span>
                <span className="text-slate-600 dark:text-slate-400">Número de referencia, folio o identificador del cobro.</span>
              </div>
            </div>
          </div>

          {/* Ejemplos prácticos */}
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-4 text-base">Ejemplos prácticos</h4>
            <div className="space-y-4">
              {/* Ejemplo 1 - Solo total */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Ejemplo 1: Solo total (sin IVA específico)</p>
                <div className="bg-white dark:bg-slate-800 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
                  total: 11600<br/>
                  subtotal: (vacío)<br/>
                  iva: (vacío)<br/>
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
                  total: 11600<br/>
                  subtotal: 10000<br/>
                  iva: 16<br/>
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
                  total: 11600<br/>
                  subtotal: 10000<br/>
                  iva: (vacío)<br/>
                  ivaMonto: 1600
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 italic">
                  Resultado: iva = 16% ($1,600 ÷ $10,000 × 100)
                </p>
              </div>

              {/* Ejemplo 4 - Con cobro parcial */}
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                <p className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Ejemplo 4: Cuenta parcialmente cobrada</p>
                <div className="bg-white dark:bg-slate-800 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
                  total: 11600<br/>
                  subtotal: 10000<br/>
                  iva: 16<br/>
                  montoCobro: 5000<br/>
                  fechaCobro: "2024-01-20"
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400 italic">
                  Resultado: Status "partial", saldo pendiente de $6,600
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <CancelButton 
              onClick={() => onOpenChange(false)} 
              fullWidth
              startIcon={<X className="h-4 w-4" />}
            >
              Cerrar guía
            </CancelButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
