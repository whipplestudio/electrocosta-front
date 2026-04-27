'use client'

import * as React from 'react'
import { ChevronDown, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface FloatingSelectProps {
  label: string
  value: string | string[]
  onChange: (value: string | string[]) => void
  options: SelectOption[]
  multiple?: boolean
  placeholder?: string
  error?: string
  helperText?: string
  disabled?: boolean
  containerClassName?: string
  clearable?: boolean
  searchable?: boolean
  searchPlaceholder?: string
}

export function FloatingSelect({
  label,
  value,
  onChange,
  options,
  multiple = false,
  placeholder = 'Seleccionar...',
  error,
  helperText,
  disabled = false,
  containerClassName,
  clearable = true,
  searchable = false,
  searchPlaceholder = 'Buscar...',
}: FloatingSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const containerRef = React.useRef<HTMLDivElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Filter options when searchable
  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchTerm) return options
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchable, searchTerm])

  const hasValue = multiple 
    ? Array.isArray(value) && value.length > 0
    : !!value && value !== ''

  const isActive = isOpen || isFocused || hasValue

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 0)
    }
    if (!isOpen) {
      setSearchTerm('')
    }
  }, [isOpen, searchable])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue]
      onChange(newValues)
    } else {
      onChange(optionValue)
      setIsOpen(false)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(multiple ? [] : '')
  }

  const selectedLabels: string[] = React.useMemo(() => {
    if (multiple) {
      const values = Array.isArray(value) ? value : []
      return values.map(v => options.find(o => o.value === v)?.label || v)
    }
    const label = options.find(o => o.value === value)?.label
    return label ? [label] : []
  }, [value, options, multiple])

  return (
    <div className={cn('relative', containerClassName)} ref={containerRef}>
      {/* Trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'relative flex items-center min-h-[48px] rounded-xl border-2 bg-white px-3 py-2 cursor-pointer transition-all duration-200',
          isOpen || isFocused
            ? 'border-[#164e63] ring-2 ring-[#164e63]/10'
            : error
              ? 'border-red-500'
              : 'border-[#e5e7eb] hover:border-[#d1d5db]',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50'
        )}
      >
        {/* Selected value / placeholder - only show placeholder when label is up (isActive) */}
        <div className="flex-1 flex flex-wrap gap-1 min-w-0">
          {multiple ? (
            selectedLabels.map((labelText, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f0fdf4] text-[#374151] text-sm rounded-md"
              >
                {labelText}
              </span>
            ))
          ) : hasValue ? (
            <span className="text-[#374151] text-base">{selectedLabels[0]}</span>
          ) : isActive ? (
            <span className="text-[#6b7280]/60 text-base">{placeholder}</span>
          ) : (
            <span className="text-transparent text-base">&nbsp;</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-2">
          {clearable && hasValue && !disabled && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-gray-100 text-[#6b7280] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown 
            className={cn(
              'w-5 h-5 text-[#6b7280] transition-transform duration-200',
              isOpen && 'rotate-180'
            )} 
          />
        </div>

        {/* Floating Label */}
        <label
          className={cn(
            'absolute left-3 pointer-events-none transition-all duration-200 origin-left bg-white px-1',
            isActive
              ? '-top-2.5 text-xs font-medium text-[#164e63]'
              : 'top-1/2 -translate-y-1/2 text-base text-[#6b7280]'
          )}
        >
          {label}
        </label>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-[#e5e7eb] shadow-lg max-h-[300px] overflow-auto">
          {/* Search input */}
          {searchable && (
            <div className="sticky top-0 bg-white border-b border-[#e5e7eb] p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#164e63] focus:ring-1 focus:ring-[#164e63]"
                />
              </div>
            </div>
          )}
          {filteredOptions.map((option) => {
            const isSelected = multiple
              ? Array.isArray(value) && value.includes(option.value)
              : value === option.value

            return (
              <div
                key={option.value}
                onClick={() => !option.disabled && handleSelect(option.value)}
                className={cn(
                  'px-3 py-2.5 cursor-pointer transition-colors flex items-center gap-2',
                  isSelected && 'bg-[#f0fdf4] text-[#164e63]',
                  !isSelected && 'hover:bg-gray-50 text-[#374151]',
                  option.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {multiple && (
                  <div className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                    isSelected 
                      ? 'bg-[#164e63] border-[#164e63]' 
                      : 'border-[#d1d5db]'
                  )}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )}
                <span className="text-sm">{option.label}</span>
              </div>
            )
          })}
          {filteredOptions.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-[#6b7280]">
              No se encontraron resultados
            </div>
          )}
        </div>
      )}

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
