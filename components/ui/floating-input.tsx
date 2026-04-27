'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
  containerClassName?: string
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    startAdornment, 
    endAdornment,
    containerClassName,
    className,
    value,
    defaultValue,
    placeholder = ' ',
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(!!value || !!defaultValue)

    React.useEffect(() => {
      setHasValue(!!value)
    }, [value])

    const isActive = isFocused || hasValue

    return (
      <div className={cn('relative', containerClassName)}>
        <div
          className={cn(
            'relative flex items-center rounded-xl border-2 bg-white transition-all duration-200',
            isFocused 
              ? 'border-[#164e63] ring-2 ring-[#164e63]/10' 
              : error 
                ? 'border-red-500' 
                : 'border-[#e5e7eb] hover:border-[#d1d5db]',
          )}
        >
          {startAdornment && (
            <div className="pl-3 text-[#6b7280]">
              {startAdornment}
            </div>
          )}
          
          <input
            ref={ref}
            value={value}
            defaultValue={defaultValue}
            placeholder={isActive ? placeholder : ' '}
            className={cn(
              'w-full bg-transparent px-3 py-3 text-base text-[#374151] outline-none placeholder:text-[#6b7280]/60',
              startAdornment && 'pl-2',
              endAdornment && 'pr-2',
              className
            )}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              setHasValue(!!e.target.value)
              props.onBlur?.(e)
            }}
            onChange={(e) => {
              setHasValue(!!e.target.value)
              props.onChange?.(e)
            }}
            {...props}
          />

          {endAdornment && (
            <div className="pr-3 text-[#6b7280]">
              {endAdornment}
            </div>
          )}

          {/* Floating Label */}
          <label
            className={cn(
              'absolute left-3 pointer-events-none transition-all duration-200 origin-left z-10 bg-white px-1',
              startAdornment && 'left-10',
              isActive
                ? '-top-2.5 text-xs font-medium text-[#164e63]'
                : 'top-1/2 -translate-y-1/2 text-base text-[#6b7280]'
            )}
          >
            {label}
          </label>
        </div>

        {/* Helper text or error */}
        {(helperText || error) && (
          <p className={cn(
            'mt-1 text-sm',
            error ? 'text-red-500' : 'text-[#6b7280]'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

FloatingInput.displayName = 'FloatingInput'
