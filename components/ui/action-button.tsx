'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'danger' 
  | 'ghost' 
  | 'outline'
  | 'create'
  | 'save'
  | 'cancel'
  | 'delete'
  | 'edit'
  | 'filter'
  | 'search'
  | 'clear'
  | 'submit'
  | 'back'
  | 'next'
  | 'upload'
  | 'download'
  | 'refresh'
  | 'close'
  | 'confirm'

export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  loadingText?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  // Generic variants
  primary: 'bg-[#164e63] text-white hover:bg-[#0e3a4a] shadow-md hover:shadow-lg',
  secondary: 'bg-[#84cc16] text-[#374151] hover:bg-[#65a30d] shadow-sm',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md',
  ghost: 'bg-transparent text-[#374151] hover:bg-[#f0fdf4] hover:text-[#164e63]',
  outline: 'bg-white border-2 border-[#e5e7eb] text-[#374151] hover:border-[#164e63] hover:text-[#164e63]',
  
  // Action-specific variants
  create: 'bg-[#164e63] text-white hover:bg-[#0e3a4a] shadow-md hover:shadow-lg',
  save: 'bg-[#164e63] text-white hover:bg-[#0e3a4a] shadow-md hover:shadow-lg',
  submit: 'bg-[#164e63] text-white hover:bg-[#0e3a4a] shadow-md hover:shadow-lg',
  cancel: 'bg-white border-2 border-[#e5e7eb] text-[#6b7280] hover:border-[#d1d5db] hover:text-[#374151]',
  delete: 'bg-red-600 text-white hover:bg-red-700 shadow-md',
  edit: 'bg-[#f59e0b] text-white hover:bg-[#d97706] shadow-md',
  filter: 'bg-white border-2 border-[#e5e7eb] text-[#374151] hover:border-[#164e63] hover:text-[#164e63]',
  search: 'bg-[#164e63] text-white hover:bg-[#0e3a4a] shadow-md',
  clear: 'bg-transparent text-[#6b7280] hover:bg-[#f0fdf4] hover:text-[#374151]',
  back: 'bg-white border-2 border-[#e5e7eb] text-[#374151] hover:border-[#164e63] hover:text-[#164e63]',
  next: 'bg-[#164e63] text-white hover:bg-[#0e3a4a] shadow-md',
  upload: 'bg-[#164e63] text-white hover:bg-[#0e3a4a] shadow-md',
  download: 'bg-[#164e63] text-white hover:bg-[#0e3a4a] shadow-md',
  refresh: 'bg-white border-2 border-[#e5e7eb] text-[#374151] hover:border-[#164e63] hover:text-[#164e63]',
  close: 'bg-transparent text-[#6b7280] hover:bg-[#f0fdf4] hover:text-[#374151]',
  confirm: 'bg-green-600 text-white hover:bg-green-700 shadow-md',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm h-9',
  md: 'px-4 py-2.5 text-base h-11',
  lg: 'px-6 py-3 text-base h-12',
}

const iconSizeStyles: Record<ButtonSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-5 h-5',
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ 
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    startIcon,
    endIcon,
    fullWidth = false,
    disabled,
    children,
    className,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles - same rounded as inputs (rounded-xl)
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-[#164e63]/20 focus:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
          // Prevent horizontal expansion during loading
          'min-w-0',
          
          // Variant styles
          variantStyles[variant],
          
          // Size styles
          sizeStyles[size],
          
          // Full width
          fullWidth && 'w-full',
          
          className
        )}
        style={{ 
          // Prevent layout shift during loading by using consistent sizing
          contain: 'layout',
        }}
        {...props}
      >
        {loading && (
          <Loader2 className={cn('animate-spin', iconSizeStyles[size])} />
        )}
        {!loading && startIcon && (
          <span className={iconSizeStyles[size]}>{startIcon}</span>
        )}
        
        <span>
          {loading && loadingText ? loadingText : children}
        </span>
        
        {!loading && endIcon && (
          <span className={iconSizeStyles[size]}>{endIcon}</span>
        )}
      </button>
    )
  }
)

ActionButton.displayName = 'ActionButton'

// Convenience exports for specific button types
export function CreateButton(props: Omit<ActionButtonProps, 'variant'>) {
  return <ActionButton variant="create" startIcon={<PlusIcon />} {...props}>Crear</ActionButton>
}

export function SaveButton(props: Omit<ActionButtonProps, 'variant'>) {
  return <ActionButton variant="save" startIcon={<SaveIcon />} {...props}>Guardar</ActionButton>
}

export function CancelButton(props: Omit<ActionButtonProps, 'variant'>) {
  return <ActionButton variant="cancel" {...props}>Cancelar</ActionButton>
}

export function DeleteButton(props: Omit<ActionButtonProps, 'variant'>) {
  return <ActionButton variant="delete" startIcon={<TrashIcon />} {...props}>Eliminar</ActionButton>
}

export function EditButton(props: Omit<ActionButtonProps, 'variant'>) {
  return <ActionButton variant="edit" startIcon={<EditIcon />} {...props}>Editar</ActionButton>
}

export function SubmitButton({ children = 'Enviar', ...props }: Omit<ActionButtonProps, 'variant'>) {
  return <ActionButton variant="submit" {...props}>{children}</ActionButton>
}

// Icon components
function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 9.186 0Z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  )
}
