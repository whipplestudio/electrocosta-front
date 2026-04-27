'use client'

import { FloatingInput } from '@/components/ui/floating-input'
import { Label } from '@/components/ui/label'

export type IvaType = 'percentage' | 'amount'

export interface FinancialAmountSectionProps {
  title?: string
  iva: string
  ivaType: IvaType
  subtotal: string
  total: string
  onIvaChange: (value: string) => void
  onIvaTypeChange: (type: IvaType) => void
  onSubtotalChange: (value: string) => void
  subtotalLabel?: string
  totalLabel?: string
  subtotalPlaceholder?: string
  ivaPlaceholder?: string
  subtotalHelperText?: string
  ivaHelperText?: string
  totalHelperText?: string
  subtotalError?: string
  readOnlyTotal?: boolean
  showRadioSelector?: boolean
  className?: string
}

export function FinancialAmountSection({
  title = '💰 Monto e Impuestos',
  iva,
  ivaType,
  subtotal,
  total,
  onIvaChange,
  onIvaTypeChange,
  onSubtotalChange,
  subtotalLabel = 'Subtotal (sin IVA) *',
  totalLabel = 'Total (con IVA)',
  subtotalPlaceholder = 'Ej: 100,000',
  ivaPlaceholder,
  subtotalHelperText = 'Monto sin IVA',
  ivaHelperText,
  totalHelperText = 'Subtotal + IVA (calculado)',
  subtotalError,
  readOnlyTotal = true,
  showRadioSelector = true,
  className
}: FinancialAmountSectionProps) {
  const defaultIvaPlaceholder = ivaType === 'percentage' ? 'Ej: 16' : 'Ej: 16,000'
  const defaultIvaHelperText = ivaType === 'percentage' 
    ? 'Porcentaje de IVA' 
    : 'Monto fijo de IVA'

  return (
    <div className={`space-y-3 ${className || ''}`}>
      <h3 className="text-sm font-semibold text-[#164e63]">{title}</h3>
      
      {showRadioSelector && (
        <div className="flex items-center gap-4 p-3 bg-[#f9fafb] rounded-xl border border-[#e5e7eb]">
          <Label className="text-sm font-medium text-[#374151]">Tipo de IVA:</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="ivaType"
                value="percentage"
                checked={ivaType === 'percentage'}
                onChange={(e) => onIvaTypeChange(e.target.value as IvaType)}
                className="w-4 h-4 accent-[#164e63] cursor-pointer"
              />
              <span className="text-sm text-[#374151] group-hover:text-[#164e63]">
                Porcentaje (%)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="ivaType"
                value="amount"
                checked={ivaType === 'amount'}
                onChange={(e) => onIvaTypeChange(e.target.value as IvaType)}
                className="w-4 h-4 accent-[#164e63] cursor-pointer"
              />
              <span className="text-sm text-[#374151] group-hover:text-[#164e63]">
                Monto Fijo ($)
              </span>
            </label>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        <div className="flex flex-col">
          <FloatingInput
            label={subtotalLabel}
            placeholder={subtotalPlaceholder}
            value={subtotal}
            onChange={(e) => onSubtotalChange(e.target.value)}
            error={subtotalError}
            helperText={!subtotalError ? subtotalHelperText : undefined}
          />
        </div>
        <div className="flex flex-col">
          <FloatingInput
            label={ivaType === 'percentage' ? 'IVA (%) *' : 'IVA ($) *'}
            placeholder={ivaPlaceholder || defaultIvaPlaceholder}
            value={iva}
            onChange={(e) => onIvaChange(e.target.value)}
            helperText={ivaHelperText || defaultIvaHelperText}
          />
        </div>
        <div className="flex flex-col">
          <FloatingInput
            label={totalLabel}
            placeholder="Calculado automáticamente"
            value={total}
            readOnly={readOnlyTotal}
            helperText={totalHelperText}
            className="bg-[#f9fafb]"
          />
        </div>
      </div>
    </div>
  )
}
