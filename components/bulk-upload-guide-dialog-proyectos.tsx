"use client"

import { CancelButton } from "@/components/ui"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, Calculator, FileSpreadsheet, HelpCircle, X, Info } from "lucide-react"

export interface BulkUploadGuideDialogProyectosProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BulkUploadGuideDialogProyectos({
  open,
  onOpenChange,
}: BulkUploadGuideDialogProyectosProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            Guía de Carga Masiva - Proyectos
          </DialogTitle>
          <DialogDescription>
            Instrucciones detalladas para usar la plantilla Excel de importación de proyectos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Introducción */}
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Esta guía te ayudará a importar proyectos masivamente. Asegúrate de que el cliente y el responsable existan en el sistema antes de cargar.
            </p>
          </div>

          {/* Campos de la plantilla */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-3 text-base">
              <Table className="h-5 w-5 text-blue-500" />
              Campos de la plantilla
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3 p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800">
                <span className="font-medium min-w-[160px] text-green-700 dark:text-green-300">nombreProyecto ★</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Campo obligatorio. Nombre del proyecto.</span>
              </div>
              <div className="flex gap-3 p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800">
                <span className="font-medium min-w-[160px] text-green-700 dark:text-green-300">clienteRfc ★</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Campo obligatorio. RFC del cliente. Debe existir en el sistema.</span>
              </div>
              <div className="flex gap-3 p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800">
                <span className="font-medium min-w-[160px] text-green-700 dark:text-green-300">fechaInicio ★</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Campo obligatorio. Fecha de inicio del proyecto (YYYY-MM-DD).</span>
              </div>
              <div className="flex gap-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                <span className="font-medium min-w-[160px] text-blue-700 dark:text-blue-300">fechaFinEstimada</span>
                <span className="text-blue-600 dark:text-blue-400">Opcional. Fecha estimada de finalización (YYYY-MM-DD).</span>
              </div>
              <div className="flex gap-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                <span className="font-medium min-w-[160px] text-blue-700 dark:text-blue-300">subtotalVenta</span>
                <span className="text-blue-600 dark:text-blue-400">Monto de venta sin IVA. Obligatorio si no se proporciona valorVenta.</span>
              </div>
              <div className="flex gap-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                <span className="font-medium min-w-[160px] text-blue-700 dark:text-blue-300">valorVenta</span>
                <span className="text-blue-600 dark:text-blue-400">Monto total de venta. Si no hay subtotalVenta, se usa este como subtotal (IVA 0%).</span>
              </div>
              <div className="flex gap-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                <span className="font-medium min-w-[160px] text-blue-700 dark:text-blue-300">iva</span>
                <span className="text-blue-600 dark:text-blue-400">Opcional. Porcentaje de IVA (ej: 16 para 16%). Si no se especifica, usa 0%.</span>
              </div>
              <div className="flex gap-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                <span className="font-medium min-w-[160px] text-blue-700 dark:text-blue-300">ivaMonto</span>
                <span className="text-blue-600 dark:text-blue-400">Opcional. Monto fijo de IVA (ej: 16000). Alternativa a iva porcentaje.</span>
              </div>
              <div className="flex gap-3 p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800">
                <span className="font-medium min-w-[160px] text-green-700 dark:text-green-300">presupuestoMateriales ★</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Campo obligatorio. Presupuesto para materiales.</span>
              </div>
              <div className="flex gap-3 p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800">
                <span className="font-medium min-w-[160px] text-green-700 dark:text-green-300">presupuestoManoObra ★</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Campo obligatorio. Presupuesto para mano de obra.</span>
              </div>
              <div className="flex gap-3 p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800">
                <span className="font-medium min-w-[160px] text-green-700 dark:text-green-300">presupuestoOtros ★</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Campo obligatorio. Presupuesto para otros gastos.</span>
              </div>
              <div className="flex gap-3 p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800">
                <span className="font-medium min-w-[160px] text-green-700 dark:text-green-300">responsableEmail ★</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Campo obligatorio. Email del responsable. Debe existir en el sistema.</span>
              </div>
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">descripcion</span>
                <span className="text-slate-600 dark:text-slate-400">Opcional. Descripción del proyecto.</span>
              </div>
            </div>
          </div>

          {/* Cálculos automáticos */}
          <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold flex items-center gap-2 mb-3 text-base text-amber-800 dark:text-amber-200">
              <Calculator className="h-5 w-5" />
              Cálculos automáticos
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
              La plantilla calcula automáticamente:
            </p>
            <ul className="text-sm text-amber-700 dark:text-amber-300 list-disc list-inside space-y-1">
              <li><strong>valorVenta</strong> = subtotalVenta + IVA (según el método especificado, IVA 0% si no se proporciona)</li>
              <li><strong>presupuestoTotal</strong> = presupuestoMateriales + presupuestoManoObra + presupuestoOtros + IVA (IVA 0% si no se proporciona)</li>
              <li>Si no hay subtotalVenta pero sí valorVenta: <strong>subtotalVenta</strong> = valorVenta (asume IVA 0%)</li>
            </ul>
          </div>

          {/* Ejemplos prácticos */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-3 text-base">
              <FileSpreadsheet className="h-5 w-5 text-blue-500" />
              Ejemplos prácticos
            </h4>
            
            <div className="space-y-3">
              {/* Ejemplo 1 - Solo subtotal sin IVA */}
              <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="font-semibold text-green-800 dark:text-green-200 mb-2">Ejemplo 1: Solo subtotal (IVA 0% por defecto)</p>
                <div className="bg-white dark:bg-slate-800 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
                  nombreProyecto: "Construcción Edificio A"<br/>
                  clienteRfc: "ABC123456XYZ"<br/>
                  fechaInicio: "2024-01-15"<br/>
                  subtotalVenta: 100000<br/>
                  presupuestoMateriales: 30000<br/>
                  presupuestoManoObra: 40000<br/>
                  presupuestoOtros: 10000<br/>
                  responsableEmail: "juan@empresa.com"
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 italic">
                  Resultado: valorVenta = $100,000 (sin IVA), presupuestoTotal = $80,000
                </p>
              </div>

              {/* Ejemplo 2 - Con IVA porcentaje */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Ejemplo 2: Subtotal + IVA 16%</p>
                <div className="bg-white dark:bg-slate-800 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
                  subtotalVenta: 100000<br/>
                  iva: 16<br/>
                  presupuestoMateriales: 25000<br/>
                  presupuestoManoObra: 30000<br/>
                  presupuestoOtros: 15000<br/>
                  iva (presupuesto): 16
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                  Resultado: valorVenta = $116,000, presupuestoTotal = $92,000
                </p>
              </div>

              {/* Ejemplo 3 - Usando valorVenta sin subtotal */}
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                <p className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Ejemplo 3: Solo valorVenta (sin subtotal ni IVA)</p>
                <div className="bg-white dark:bg-slate-800 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
                  nombreProyecto: "Proyecto Sin IVA"<br/>
                  clienteRfc: "ABC123456XYZ"<br/>
                  fechaInicio: "2024-01-15"<br/>
                  valorVenta: 100000<br/>
                  presupuestoMateriales: 30000<br/>
                  presupuestoManoObra: 40000<br/>
                  presupuestoOtros: 10000<br/>
                  responsableEmail: "juan@empresa.com"
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400 italic">
                  Resultado: subtotalVenta = $100,000, valorVenta = $100,000 (IVA 0%), presupuestoTotal = $80,000
                </p>
              </div>
            </div>
          </div>

          {/* Nota importante */}
          <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold flex items-center gap-2 mb-2 text-purple-800 dark:text-purple-200">
              <Info className="h-5 w-5" />
              Notas importantes
            </h4>
            <ul className="text-sm text-purple-700 dark:text-purple-300 list-disc list-inside space-y-1">
              <li>El cliente debe estar registrado en el sistema antes de cargar</li>
              <li>El responsable (email) debe ser un usuario activo del sistema</li>
              <li>La fecha de fin estimada es opcional - el proyecto puede no tener fecha de entrega definida</li>
              <li>El estado inicial del proyecto será "planificacion"</li>
              <li>IVA es opcional - si no se especifica, se usará 0% por defecto</li>
              <li>Puedes usar subtotalVenta o valorVenta - al menos uno debe estar presente</li>
              <li>Si usas valorVenta sin subtotalVenta, el sistema usará el valorVenta como subtotal con IVA 0%</li>
            </ul>
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
