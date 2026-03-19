"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react"

export interface BulkUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  archivo: File | null
  uploadResponse: any
  validacionResultado: any
  importacionResultado: any
  loading: boolean
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUpload: () => void
  onValidate: () => void
  onImport: () => void
  onReset: () => void
}

export function BulkUploadDialog({
  open,
  onOpenChange,
  title,
  description,
  archivo,
  uploadResponse,
  validacionResultado,
  importacionResultado,
  loading,
  onFileChange,
  onUpload,
  onValidate,
  onImport,
  onReset,
}: BulkUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClose = () => {
    onReset()
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    // Si está cerrando el modal y hay archivo cargado o datos en proceso
    if (!newOpen && (archivo || uploadResponse || validacionResultado || importacionResultado)) {
      const confirmar = window.confirm(
        '¿Estás seguro de que quieres cerrar? Se perderá el progreso actual.'
      )
      
      if (confirmar) {
        onReset()
        onOpenChange(false)
      }
    } else {
      // Si está abriendo o no hay datos, abrir/cerrar normalmente
      onOpenChange(newOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Zona de carga de archivo */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center transition-colors hover:border-primary/50">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={onFileChange}
              className="hidden"
            />
            <div className="space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-2"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Seleccionar archivo
                </Button>
                {archivo && (
                  <p className="text-sm font-medium text-green-600 mt-2">
                    ✓ {archivo.name}
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Formatos: .xlsx, .xls, .csv
              </p>
            </div>
          </div>

          {/* Botón de subir */}
          {!uploadResponse && archivo && (
            <Button onClick={onUpload} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir y Analizar
                </>
              )}
            </Button>
          )}

          {/* Archivo subido - pendiente validación */}
          {uploadResponse && !validacionResultado && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Archivo cargado
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {uploadResponse.registrosDetectados} registros detectados
                    </p>
                  </div>
                </div>
                <Button onClick={onValidate} disabled={loading} size="sm">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Validar"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Resultados de validación */}
          {validacionResultado && !importacionResultado && (
            <div className="space-y-3">
              {/* Resumen */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-700 dark:text-green-300">Válidos</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {validacionResultado.registrosValidos}
                  </p>
                </div>
                {validacionResultado.registrosInvalidos > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-700 dark:text-red-300">Registros con errores</p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                      {validacionResultado.registrosInvalidos}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {validacionResultado.errores?.length || 0} errores totales
                    </p>
                  </div>
                )}
              </div>

              {/* Errores detallados */}
              {validacionResultado.errores && validacionResultado.errores.length > 0 && (
                <div className="border border-red-200 dark:border-red-800 rounded-lg p-3 bg-red-50 dark:bg-red-950">
                  <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Errores de Validación
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {validacionResultado.errores.map((error: any, index: number) => (
                      <div key={index} className="p-2 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded text-xs">
                        <p className="font-medium text-red-900 dark:text-red-100">
                          Fila {error.fila}: {error.campo}
                        </p>
                        <p className="text-red-700 dark:text-red-300 mt-1">{error.error}</p>
                        {error.valor && (
                          <p className="text-gray-600 dark:text-gray-400 mt-1">Valor: {error.valor}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advertencias */}
              {validacionResultado.advertencias && validacionResultado.advertencias.length > 0 && (
                <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 bg-yellow-50 dark:bg-yellow-950">
                  <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Advertencias</h4>
                  <div className="space-y-1">
                    {validacionResultado.advertencias.map((advertencia: string, index: number) => (
                      <p key={index} className="text-xs text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {advertencia}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón de importar */}
              {validacionResultado.puedeImportar && (
                <Button onClick={onImport} disabled={loading} className="w-full" size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Importar {validacionResultado.registrosValidos} registros
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Resultado de importación */}
          {importacionResultado && (
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="font-medium text-green-900 dark:text-green-100">
                  ¡Importación completada!
                </p>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                {importacionResultado.registrosImportados || importacionResultado.importados} registros importados correctamente
              </p>
              {importacionResultado.errores && importacionResultado.errores.length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                  <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Algunos registros no pudieron importarse:
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {importacionResultado.errores.map((error: string, index: number) => (
                      <p key={index} className="text-xs text-yellow-700 dark:text-yellow-300">
                        • {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              <Button onClick={handleClose} variant="outline" className="w-full mt-4">
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
