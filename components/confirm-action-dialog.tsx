"use client"

import { useState, type ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ActionButton, type ButtonVariant } from "@/components/ui/action-button"

interface ConfirmActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  icon?: ReactNode
  confirmLabel: string
  loadingText?: string
  confirmVariant?: ButtonVariant
  // Quien llama decide qué pasa si falla (toast, cerrar o no): el diálogo sólo
  // bloquea los botones mientras la promesa está pendiente.
  onConfirm: () => Promise<void>
}

// Confirmación simple del sistema de diseño, para las acciones que antes usaban
// `confirm(...)` del navegador. Mismo lenguaje visual que `DeleteProjectDialog`.
export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  confirmLabel,
  loadingText,
  confirmVariant = "primary",
  onConfirm,
}: ConfirmActionDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
      <DialogContent className="max-w-md w-[95vw] rounded-3xl border-0 bg-white p-0 shadow-2xl shadow-black/10 overflow-hidden gap-0">
        <DialogHeader className="bg-slate-50 px-6 pt-6 pb-4 border-b border-slate-100">
          <DialogTitle className="flex items-center gap-3 text-slate-900 text-xl font-semibold tracking-tight">
            {icon && (
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-100 text-slate-700">
                {icon}
              </div>
            )}
            {title}
          </DialogTitle>
          <DialogDescription className={`text-slate-600 text-sm leading-relaxed mt-2 ${icon ? "ml-[3.25rem]" : ""}`}>
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-3 px-6 pb-6 pt-4">
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
            variant={confirmVariant}
            size="md"
            fullWidth
            loading={loading}
            loadingText={loadingText}
            onClick={handleConfirm}
            disabled={loading}
            className="sm:w-auto sm:flex-1"
          >
            {confirmLabel}
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
