"use client"

import { CancelButton } from "@/components/ui"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, FileSpreadsheet, HelpCircle, X, Info } from "lucide-react"

export interface BulkUploadGuideDialogProveedoresProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BulkUploadGuideDialogProveedores({
  open,
  onOpenChange,
}: BulkUploadGuideDialogProveedoresProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            Guía de Carga Masiva - Proveedores
          </DialogTitle>
          <DialogDescription>
            Instrucciones detalladas para usar la plantilla Excel de importación de proveedores
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Introducción */}
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Esta guía te ayudará a importar proveedores masivamente. La carga sólo da de alta proveedores nuevos: si la razón social o el RFC de una fila ya existen, esa fila se marca como fallida y el proveedor existente no se modifica.
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
                <span className="font-medium min-w-[160px] text-green-700 dark:text-green-300">Razón Social *</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Campo obligatorio. Nombre o razón social del proveedor. Debe ser única.</span>
              </div>
              <div className="flex gap-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                <span className="font-medium min-w-[160px] text-blue-700 dark:text-blue-300">RFC</span>
                <span className="text-blue-600 dark:text-blue-400">Opcional. RFC del proveedor (12 caracteres personas morales, 13 físicas). Si se captura, debe ser único.</span>
              </div>
            </div>
          </div>

          {/* Ejemplos prácticos */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-3 text-base">
              <FileSpreadsheet className="h-5 w-5 text-blue-500" />
              Ejemplos prácticos
            </h4>

            <div className="space-y-3">
              {/* Ejemplo 1 - Con RFC */}
              <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="font-semibold text-green-800 dark:text-green-200 mb-2">Ejemplo 1: Proveedor con RFC</p>
                <div className="bg-white dark:bg-slate-800 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
                  Razón Social: "Materiales del Golfo S.A. de C.V."<br/>
                  RFC: "MGO850101AB1"
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 italic">
                  Se creará un proveedor activo con su RFC
                </p>
              </div>

              {/* Ejemplo 2 - Sin RFC */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Ejemplo 2: Proveedor sin RFC</p>
                <div className="bg-white dark:bg-slate-800 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
                  Razón Social: "Ferretería San Juan"<br/>
                  RFC: (vacío)
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                  Se creará un proveedor activo sin RFC; la razón social es su único identificador
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
              <li>La razón social se compara sin distinguir mayúsculas, acentos, puntos, guiones ni espacios de más: "Materiales Medrano S.A. de C.V." y "MATERIALES MEDRANO SA DE CV" son el mismo proveedor</li>
              <li>Una fila cuya razón social o RFC ya existe en el catálogo, o que se repite dentro del mismo archivo, se marca como fallida</li>
              <li>Si el proveedor existente está inactivo, la fila también falla: reactívalo desde el filtro de inactivos</li>
              <li>La carga no actualiza proveedores existentes; para cambiar sus datos usa la opción Editar</li>
              <li>El RFC debe tener formato válido: 3 o 4 letras, 6 dígitos de fecha y 3 caracteres de homoclave (p. ej. MGO850101AB1)</li>
              <li>Los RFC genéricos del SAT (XAXX010101000 y XEXX010101000) se tratan como si la fila no trajera RFC</li>
              <li>Las filas vacías se ignoran y los proveedores se crean con estado activo</li>
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
