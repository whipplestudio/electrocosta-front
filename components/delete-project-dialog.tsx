"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ActionButton } from "@/components/ui/action-button"
import { FloatingInput } from "@/components/ui/floating-input"
import {
  AlertTriangle,
  FileText,
  DollarSign,
  Loader2,
  ShieldAlert,
  Keyboard,
} from "lucide-react"
import { toast } from "sonner"
import { projectsUploadService } from "@/services/projects-upload.service"

// ── Types ──────────────────────────────────────────────────────────────────
interface CuentaVinculada {
  id: string
  tipo: string
  numeroFactura: string
  monto: number
  saldo: number
  estado: string
  entidad: string
}

interface DeleteProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proyectoId: string
  proyectoNombre: string
  onDeleted: () => void
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmtCurrency = (n: number) =>
  n.toLocaleString("es-MX", { style: "currency", currency: "MXN" })

// ── Component ───────────────────────────────────────────────────────────────
export function DeleteProjectDialog({
  open,
  onOpenChange,
  proyectoId,
  proyectoNombre,
  onDeleted,
}: DeleteProjectDialogProps) {
  const [nombreConfirmacion, setNombreConfirmacion] = useState("")
  const [cuentas, setCuentas] = useState<CuentaVinculada[]>([])
  const [cuentasSeleccionadas, setCuentasSeleccionadas] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [loadingCuentas, setLoadingCuentas] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open && proyectoId) {
      cargarCuentas()
    } else {
      resetDialog()
    }
  }, [open, proyectoId])

  const resetDialog = () => {
    setNombreConfirmacion("")
    setCuentas([])
    setCuentasSeleccionadas(new Set())
    setError("")
  }

  const cargarCuentas = async () => {
    try {
      setLoadingCuentas(true)
      const data = await projectsUploadService.obtenerCuentasVinculadas(proyectoId)
      setCuentas([...data.cuentasCobrar, ...data.cuentasPagar])
    } catch (err: any) {
      toast.error(err.message || "No se pudieron cargar las cuentas vinculadas")
    } finally {
      setLoadingCuentas(false)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    toast.error("No se permite pegar texto. Escribe el nombre manualmente.")
  }

  const toggleCuenta = (id: string) => {
    setCuentasSeleccionadas((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const seleccionarTodas = () => {
    const allSelected = cuentasSeleccionadas.size === cuentas.length
    setCuentasSeleccionadas(allSelected ? new Set() : new Set(cuentas.map((c) => c.id)))
  }

  const puedeEliminar = () => {
    if (nombreConfirmacion.trim() !== proyectoNombre.trim()) return false
    if (cuentas.length > 0 && cuentasSeleccionadas.size !== cuentas.length) return false
    return true
  }

  const handleEliminar = async () => {
    if (!puedeEliminar()) return
    try {
      setLoading(true)
      await projectsUploadService.eliminarProyectoPermanente(proyectoId)
      toast.success("Proyecto eliminado permanentemente")
      onOpenChange(false)
      onDeleted()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Error al eliminar el proyecto"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const nombreMatch = nombreConfirmacion.trim() === proyectoNombre.trim()
  const allAccountsChecked = cuentas.length === 0 || cuentasSeleccionadas.size === cuentas.length
  const blockers: string[] = []
  if (!nombreMatch) blockers.push("Escribe el nombre exacto del proyecto")
  if (!allAccountsChecked) blockers.push("Selecciona todas las cuentas vinculadas")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* MD3: Surface container high — elevated with soft shadow & rounded-3xl */}
      <DialogContent className="max-w-xl w-[95vw] rounded-3xl border-0 bg-white p-0 shadow-2xl shadow-black/10 overflow-hidden gap-0">
        {/* ── Header: MD3 Error container surface ── */}
        <DialogHeader className="bg-red-50/80 px-6 pt-6 pb-4 border-b border-red-100">
          <DialogTitle className="flex items-center gap-3 text-red-800 text-xl font-semibold tracking-tight">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-red-100 text-red-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            Eliminar permanentemente
          </DialogTitle>
          <DialogDescription className="text-red-700/80 text-sm leading-relaxed mt-2 ml-[3.25rem]">
            Esta acción no se puede deshacer. El proyecto&nbsp;<strong className="text-red-800">{proyectoNombre}</strong>&nbsp;y todos sus datos vinculados serán eliminados de forma permanente de la base de datos.
          </DialogDescription>
        </DialogHeader>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-6">
          {/* Cuentas vinculadas */}
          {cuentas.length > 0 && (
            <section className="space-y-3">
              {/* MD3: Secondary container for warning */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      Cuentas vinculadas detectadas
                    </p>
                    <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
                      Se eliminarán {cuentas.length} cuenta{cuentas.length > 1 ? "s" : ""} por cobrar o por pagar. Selecciona todas para confirmar que estás consciente.
                    </p>
                  </div>
                </div>

                {/* Toggle all */}
                <div className="flex items-center gap-2.5 pl-11">
                  <Checkbox
                    id="seleccionar-todas"
                    checked={allAccountsChecked}
                    onCheckedChange={seleccionarTodas}
                    className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                  />
                  <label
                    htmlFor="seleccionar-todas"
                    className="text-sm font-medium text-amber-900 cursor-pointer select-none"
                  >
                    {allAccountsChecked ? "Desmarcar todas" : "Seleccionar todas"}
                  </label>
                </div>
              </div>

              {/* Account list: MD3 surface container lowest */}
              <div className="max-h-52 overflow-y-auto space-y-2 rounded-2xl bg-slate-50/80 border border-slate-200/60 p-3">
                {cuentas.map((cuenta) => {
                  const checked = cuentasSeleccionadas.has(cuenta.id)
                  const isReceivable = cuenta.tipo === "cuenta_por_cobrar"
                  return (
                    <div
                      key={cuenta.id}
                      className={`flex items-start gap-3 rounded-xl p-3 transition-colors duration-150 cursor-pointer border ${
                        checked
                          ? "bg-white border-amber-200/60 shadow-sm"
                          : "bg-white/60 border-transparent hover:bg-white hover:border-slate-200"
                      }`}
                      onClick={() => toggleCuenta(cuenta.id)}
                    >
                      <Checkbox
                        id={cuenta.id}
                        checked={checked}
                        onCheckedChange={() => toggleCuenta(cuenta.id)}
                        className="mt-0.5 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm text-slate-800 flex items-center gap-1.5 truncate">
                            <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {cuenta.numeroFactura}
                          </span>
                          <span
                            className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                              isReceivable
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-orange-50 text-orange-700 border-orange-200"
                            }`}
                          >
                            {isReceivable ? "Por cobrar" : "Por pagar"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                          <span className="truncate max-w-[120px]">{cuenta.entidad}</span>
                          <span className="flex items-center gap-0.5 shrink-0">
                            <DollarSign className="h-3 w-3 text-slate-400" />
                            {fmtCurrency(cuenta.monto)}
                          </span>
                          <span className="shrink-0">Saldo {fmtCurrency(cuenta.saldo)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {loadingCuentas && (
            <div className="flex items-center justify-center py-6 text-sm text-slate-500 bg-slate-50/50 rounded-2xl">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Cargando cuentas vinculadas…
            </div>
          )}

          {/* Confirmation input — reutilizable FloatingInput */}
          <section className="space-y-2">
            <FloatingInput
              label="Confirmar nombre del proyecto"
              value={nombreConfirmacion}
              onChange={(e) => setNombreConfirmacion(e.target.value)}
              onPaste={handlePaste}
              placeholder={proyectoNombre}
              helperText={
                nombreMatch
                  ? "Nombre confirmado correctamente"
                  : `Debes escribir exactamente: "${proyectoNombre}"`
              }
              startAdornment={<Keyboard className="h-4 w-4 text-slate-400" />}
              containerClassName="w-full"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </section>

          {/* Validation blockers — MD3 tonal surface */}
          {!puedeEliminar() && blockers.length > 0 && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pendiente para eliminar
              </p>
              {blockers.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  {b}
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        {/* ── Footer: MD3 elevated actions ── */}
        <DialogFooter className="flex-col sm:flex-row gap-3 px-6 pb-6 pt-2">
          <ActionButton
            variant="cancel"
            size="md"
            fullWidth
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="sm:w-auto sm:flex-1"
          >
            Cancelar
          </ActionButton>
          <ActionButton
            variant="danger"
            size="md"
            fullWidth
            loading={loading}
            loadingText="Eliminando…"
            startIcon={<ShieldAlert className="h-5 w-5" />}
            onClick={handleEliminar}
            disabled={!puedeEliminar() || loading}
            className="sm:w-auto sm:flex-[2]"
          >
            Eliminar permanentemente
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
