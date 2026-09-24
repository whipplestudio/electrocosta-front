"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ActionButton } from "@/components/ui/action-button"
import { FloatingInput } from "@/components/ui/floating-input"
import {
  AlertTriangle,
  Banknote,
  FolderKanban,
  Keyboard,
  Loader2,
  MessageSquare,
  Receipt,
  RotateCcw,
  ShieldAlert,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"
import { formatCurrency as fmtCurrency } from "@/lib/format"
import { accountsPayableService } from "@/services/accounts-payable.service"
import { accountsReceivableService } from "@/services/accounts-receivable.service"
import type { AccountPayableDeletionImpact } from "@/types/accounts-payable"
import type { AccountReceivableDeletionImpact } from "@/types/accounts-receivable"

// ── Types ──────────────────────────────────────────────────────────────────
export type TipoCuenta = "pagar" | "cobrar"

type ImpactoEliminacion = AccountPayableDeletionImpact | AccountReceivableDeletionImpact

interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipo: TipoCuenta
  cuentaId: string
  /** Número de factura/folio que el usuario debe teclear para confirmar. */
  folio: string
  onDeleted: () => void
}

// ── Helpers ─────────────────────────────────────────────────────────────────
// CxC se llama directamente al servicio, no al hook `useAccountsReceivable`, que
// traga el error: el `message` del back tiene que llegar a este diálogo.
const servicios: Record<
  TipoCuenta,
  {
    obtenerImpactoEliminacion: (id: string) => Promise<ImpactoEliminacion>
    eliminarPermanente: (id: string) => Promise<unknown>
  }
> = {
  pagar: accountsPayableService,
  cobrar: accountsReceivableService,
}

const textos: Record<TipoCuenta, { entidad: string; avisoContable: string }> = {
  pagar: {
    entidad: "Proveedor",
    avisoContable:
      "Este dinero ya salió de caja. Al borrar los pagos, el flujo de efectivo dejará de reflejar esa salida.",
  },
  cobrar: {
    entidad: "Cliente",
    avisoContable:
      "Este dinero ya entró a caja. Al borrar los pagos, el flujo de efectivo dejará de reflejar ese ingreso.",
  },
}

const plural = (n: number, singular: string, pluralForm: string) =>
  `${n} ${n === 1 ? singular : pluralForm}`

// ── Component ───────────────────────────────────────────────────────────────
export function DeleteAccountDialog({
  open,
  onOpenChange,
  tipo,
  cuentaId,
  folio,
  onDeleted,
}: DeleteAccountDialogProps) {
  const [folioConfirmacion, setFolioConfirmacion] = useState("")
  const [impacto, setImpacto] = useState<ImpactoEliminacion | null>(null)
  const [loadingImpacto, setLoadingImpacto] = useState(false)
  const [errorImpacto, setErrorImpacto] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  // Cada carga del impacto (la inicial y cada "Reintentar") toma un número y sólo
  // la última puede pintar: una respuesta vieja —de otra cuenta o de un diálogo
  // ya cerrado— nunca pisa el impacto vigente.
  const peticionImpacto = useRef(0)

  const cargarImpacto = useCallback(
    async () => {
      const peticion = ++peticionImpacto.current
      const isCancelled = () => peticion !== peticionImpacto.current
      setImpacto(null)
      setErrorImpacto("")
      setLoadingImpacto(true)
      try {
        const data = await servicios[tipo].obtenerImpactoEliminacion(cuentaId)
        if (!isCancelled()) setImpacto(data)
      } catch (err) {
        if (!isCancelled()) {
          setErrorImpacto(
            err instanceof Error && err.message
              ? err.message
              : "No se pudo calcular el impacto del borrado"
          )
        }
      } finally {
        if (!isCancelled()) setLoadingImpacto(false)
      }
    },
    [tipo, cuentaId]
  )

  useEffect(() => {
    if (!open || !cuentaId) {
      peticionImpacto.current++
      setFolioConfirmacion("")
      setImpacto(null)
      setLoadingImpacto(false)
      setErrorImpacto("")
      setError("")
      return
    }
    cargarImpacto()
  }, [open, cuentaId, cargarImpacto])

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    toast.error("No se permite pegar texto. Escribe el folio manualmente.")
  }

  const folioMatch = folioConfirmacion.trim() === folio.trim()
  // Nunca se borra a ciegas: sin impacto cargado no hay botón, aunque el folio coincida.
  const puedeEliminar = folioMatch && impacto !== null && !loadingImpacto

  const handleEliminar = async () => {
    if (!puedeEliminar) return
    try {
      setLoading(true)
      setError("")
      await servicios[tipo].eliminarPermanente(cuentaId)
      toast.success(`Cuenta ${folio} eliminada permanentemente`)
      onOpenChange(false)
      onDeleted()
    } catch (err) {
      const msg =
        err instanceof Error && err.message ? err.message : "Error al eliminar la cuenta"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const blockers: string[] = []
  if (!impacto) {
    blockers.push(
      errorImpacto
        ? "Reintenta el cálculo del impacto del borrado"
        : "Espera a que cargue el impacto del borrado"
    )
  }
  if (!folioMatch) blockers.push("Escribe el folio exacto de la cuenta")

  const anticipos = impacto && "anticiposAplicados" in impacto ? impacto.anticiposAplicados : []
  const gasto = impacto && "gasto" in impacto ? impacto.gasto : null
  const seguimientos = impacto && "seguimientos" in impacto ? impacto.seguimientos : 0

  return (
    <Dialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
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
            Esta acción no se puede deshacer. La cuenta&nbsp;<strong className="text-red-800">{folio}</strong>&nbsp;y todo lo que se lista abajo se eliminarán de forma permanente de la base de datos.
          </DialogDescription>
        </DialogHeader>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-6 max-h-[60vh] overflow-y-auto">
          {loadingImpacto && (
            <div className="flex items-center justify-center py-6 text-sm text-slate-500 bg-slate-50/50 rounded-2xl">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Calculando qué se va a borrar…
            </div>
          )}

          {errorImpacto && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  No se pudo calcular el impacto del borrado: {errorImpacto}. Sin ese dato no se
                  puede eliminar la cuenta.
                </span>
              </div>
              <ActionButton
                variant="cancel"
                size="sm"
                startIcon={<RotateCcw className="h-4 w-4" />}
                onClick={() => cargarImpacto()}
              >
                Reintentar
              </ActionButton>
            </div>
          )}

          {impacto && (
            <section className="space-y-3">
              {/* Resumen de la cuenta */}
              <div className="rounded-2xl bg-slate-50/80 border border-slate-200/60 p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">{textos[tipo].entidad}</span>
                  <span className="font-medium text-slate-800 truncate">{impacto.entidad}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Monto</span>
                  <span className="font-medium text-slate-800">{fmtCurrency(impacto.amount)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Pagado</span>
                  <span className="font-medium text-slate-800">{fmtCurrency(impacto.paidAmount)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Saldo</span>
                  <span className="font-medium text-slate-800">{fmtCurrency(impacto.balance)}</span>
                </div>
                {impacto.proyecto && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <FolderKanban className="h-3.5 w-3.5" />
                      Proyecto
                    </span>
                    <span className="font-medium text-slate-800 truncate">{impacto.proyecto.nombre}</span>
                  </div>
                )}
              </div>

              {/* Qué se borra con la cuenta */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 space-y-3">
                <p className="text-sm font-semibold text-amber-900">Se eliminará junto con la cuenta</p>
                <ul className="space-y-2 text-sm text-amber-900/90">
                  <li className="flex items-start gap-2">
                    <Banknote className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
                    {impacto.pagos.cantidad > 0 ? (
                      <span>
                        {plural(impacto.pagos.cantidad, "pago", "pagos")} por{" "}
                        <strong>{fmtCurrency(impacto.pagos.monto)}</strong>
                      </span>
                    ) : (
                      <span>Sin pagos registrados</span>
                    )}
                  </li>
                  {anticipos.map((anticipo) => (
                    <li key={anticipo.id} className="flex items-start gap-2">
                      <Wallet className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
                      <span>
                        El anticipo <strong>{anticipo.folio}</strong> recuperará{" "}
                        <strong>{fmtCurrency(anticipo.monto)}</strong> (saldo resultante{" "}
                        {fmtCurrency(anticipo.saldoResultante)})
                      </span>
                    </li>
                  ))}
                  {gasto && (
                    <li className="flex items-start gap-2">
                      <Receipt className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
                      <span>
                        El gasto ligado <em>{gasto.descripcion}</em> por{" "}
                        <strong>{fmtCurrency(gasto.monto)}</strong> se borrará
                        {impacto.proyecto ? ` (proyecto ${impacto.proyecto.nombre})` : ""}
                      </span>
                    </li>
                  )}
                  {seguimientos > 0 && (
                    <li className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
                      <span>{plural(seguimientos, "seguimiento de cobranza", "seguimientos de cobranza")}</span>
                    </li>
                  )}
                </ul>

                {/* Aviso contable: informa, no bloquea */}
                {impacto.pagos.cantidad > 0 && (
                  <div className="flex items-start gap-2 rounded-xl bg-white/70 border border-amber-200/60 p-3 text-xs text-amber-900 leading-relaxed">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
                    {textos[tipo].avisoContable}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Confirmation input — reutilizable FloatingInput */}
          <section className="space-y-2">
            <FloatingInput
              label="Confirmar folio de la cuenta"
              value={folioConfirmacion}
              onChange={(e) => setFolioConfirmacion(e.target.value)}
              onPaste={handlePaste}
              placeholder={folio}
              helperText={
                folioMatch
                  ? "Folio confirmado correctamente"
                  : `Debes escribir exactamente: "${folio}"`
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
          {!puedeEliminar && blockers.length > 0 && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pendiente para eliminar
              </p>
              {blockers.map((b) => (
                <div key={b} className="flex items-center gap-2 text-sm text-slate-600">
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
            disabled={!puedeEliminar || loading}
            className="sm:w-auto sm:flex-[2]"
          >
            Eliminar permanentemente
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
