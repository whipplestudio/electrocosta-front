"use client"

import { CancelButton } from "@/components/ui"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, FileSpreadsheet, HelpCircle, X, Info } from "lucide-react"

export interface BulkUploadGuideDialogClientesProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BulkUploadGuideDialogClientes({
  open,
  onOpenChange,
}: BulkUploadGuideDialogClientesProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            Guía de Carga Masiva - Clientes
          </DialogTitle>
          <DialogDescription>
            Instrucciones detalladas para usar la plantilla Excel de importación de clientes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Introducción */}
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Esta guía te ayudará a importar clientes masivamente. El RFC es el identificador único - si un cliente con el mismo RFC ya existe, se omitirá la importación de ese registro.
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
                <span className="font-medium min-w-[160px] text-green-700 dark:text-green-300">nombre ★</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Campo obligatorio. Nombre o razón social del cliente.</span>
              </div>
              <div className="flex gap-3 p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800">
                <span className="font-medium min-w-[160px] text-green-700 dark:text-green-300">rfc ★</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Campo obligatorio. RFC del cliente (12-13 caracteres). Debe ser único.</span>
              </div>
              <div className="flex gap-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                <span className="font-medium min-w-[160px] text-blue-700 dark:text-blue-300">email</span>
                <span className="text-blue-600 dark:text-blue-400">Opcional. Correo electrónico de contacto.</span>
              </div>
              <div className="flex gap-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                <span className="font-medium min-w-[160px] text-blue-700 dark:text-blue-300">telefono</span>
                <span className="text-blue-600 dark:text-blue-400">Opcional. Número telefónico de contacto.</span>
              </div>
              <div className="flex gap-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                <span className="font-medium min-w-[160px] text-blue-700 dark:text-blue-300">contacto</span>
                <span className="text-blue-600 dark:text-blue-400">Opcional. Nombre de la persona de contacto.</span>
              </div>
              <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                <span className="font-medium min-w-[160px] text-slate-700 dark:text-slate-300">notas</span>
                <span className="text-slate-600 dark:text-slate-400">Opcional. Notas o comentarios adicionales.</span>
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
              {/* Ejemplo 1 - Básico */}
              <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="font-semibold text-green-800 dark:text-green-200 mb-2">Ejemplo 1: Cliente con datos básicos</p>
                <div className="bg-white dark:bg-slate-800 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
                  nombre: "Constructora del Sureste S.A. de C.V."<br/>
                  rfc: "CSU123456ABC"<br/>
                  email: "contacto@constructorasur.com"<br/>
                  telefono: "9991234567"
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 italic">
                  Se creará un cliente activo con los datos proporcionados
                </p>
              </div>

              {/* Ejemplo 2 - Completo */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Ejemplo 2: Cliente con todos los datos</p>
                <div className="bg-white dark:bg-slate-800 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
                  nombre: "Grupo Industrial del Centro"<br/>
                  rfc: "GIC987654XYZ"<br/>
                  email: "ventas@grupoindustrial.com"<br/>
                  telefono: "5551234567"<br/>
                  contacto: "Ing. Juan Pérez"<br/>
                  notas: "Cliente preferencial, pago a 30 días"
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                  Cliente completo con toda la información de contacto
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
              <li>El RFC es único - no se pueden duplicar clientes con el mismo RFC</li>
              <li>Si un cliente con el RFC proporcionado ya existe, ese registro se omitirá</li>
              <li>El RFC debe tener entre 12 y 13 caracteres (personas morales: 12, físicas: 13)</li>
              <li>Los clientes se crean con status "active" por defecto</li>
              <li>El nombre del cliente debe tener al menos 2 caracteres</li>
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
