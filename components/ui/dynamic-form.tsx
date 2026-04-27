'use client'

import * as React from 'react'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FloatingInput } from './floating-input'
import { FloatingSelect, SelectOption } from './floating-select'
import { FloatingDatePicker, DateSelection } from './floating-date-picker'
import { ActionButton } from './action-button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

// Field types for the form configuration
export type FormFieldType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'password'
  | 'select' 
  | 'date' 
  | 'textarea' 
  | 'custom'

// Base field configuration
interface BaseFieldConfig {
  name: string
  label: string
  required?: boolean
  placeholder?: string
  helperText?: string
  error?: string
  disabled?: boolean
  colSpan?: 1 | 2 | 3 | 4 | 'full'
}

// Specific field configurations
interface TextFieldConfig extends BaseFieldConfig {
  type: 'text' | 'number' | 'email' | 'password'
}

interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select'
  options: SelectOption[]
  searchable?: boolean
  searchPlaceholder?: string
  clearable?: boolean
}

interface DateFieldConfig extends BaseFieldConfig {
  type: 'date'
  mode?: 'single' | 'range'
  minDate?: Date
  maxDate?: Date
}

interface TextareaFieldConfig extends BaseFieldConfig {
  type: 'textarea'
  rows?: number
}

interface CustomFieldConfig extends BaseFieldConfig {
  type: 'custom'
  render: (props: { 
    value: any
    onChange: (value: any) => void
    error?: string
  }) => React.ReactNode
}

// Union type for all field configurations
export type FieldConfig = 
  | TextFieldConfig 
  | SelectFieldConfig 
  | DateFieldConfig 
  | TextareaFieldConfig 
  | CustomFieldConfig

// Section configuration for grouping fields
export interface FormSection {
  title?: string
  description?: string
  columns?: 1 | 2 | 3 | 4
  fields: FieldConfig[]
}

// Props for the DynamicForm component
export interface DynamicFormProps<T extends Record<string, any>> {
  // Dialog control
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  
  // Form metadata
  title: string
  description?: string
  mode?: 'create' | 'edit' | 'crear' | 'editar'
  
  // Field configuration
  sections?: FormSection[]
  fields?: FieldConfig[]
  
  // Data binding
  data: T
  onChange: (data: T) => void
  
  // Submission
  onSubmit: () => void | Promise<void>
  onCancel?: () => void
  
  // State
  loading?: boolean
  errors?: Record<string, string>
  
  // Layout
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  maxHeight?: string
  
  // Button labels
  submitLabel?: string
  submitLabelEditing?: string
  cancelLabel?: string
  loadingLabel?: string
  loadingLabelEditing?: string
}

const maxWidthClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  'full': 'sm:max-w-[90vw]',
}

const colSpanClasses = {
  1: 'col-span-1',
  2: 'col-span-1 md:col-span-2',
  3: 'col-span-1 md:col-span-3',
  4: 'col-span-1 md:col-span-4',
  full: 'col-span-full',
}

function FormField<T extends Record<string, any>>({
  field,
  data,
  onChange,
}: {
  field: FieldConfig
  data: T
  onChange: (data: T) => void
}) {
  const value = data[field.name]
  const fieldError = field.error

  const handleChange = (newValue: any) => {
    onChange({ ...data, [field.name]: newValue })
  }

  const commonProps = {
    label: field.required ? `${field.label} *` : field.label,
    error: fieldError,
    helperText: field.helperText,
    disabled: field.disabled,
  }

  switch (field.type) {
    case 'text':
    case 'number':
    case 'email':
    case 'password':
      return (
        <FloatingInput
          {...commonProps}
          type={field.type}
          placeholder={field.placeholder}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
        />
      )

    case 'select':
      return (
        <FloatingSelect
          {...commonProps}
          placeholder={field.placeholder || 'Seleccionar...'}
          value={value || ''}
          onChange={(newValue) => handleChange(newValue as string)}
          options={field.options}
          searchable={field.searchable}
          searchPlaceholder={field.searchPlaceholder}
          clearable={field.clearable}
        />
      )

    case 'date':
      return (
        <FloatingDatePicker
          {...commonProps}
          placeholder={field.placeholder}
          mode={field.mode}
          value={value}
          onChange={(date) => handleChange(date)}
          minDate={field.minDate}
          maxDate={field.maxDate}
        />
      )

    case 'textarea':
      // Textarea uses native textarea with floating label style
      return (
        <div className={cn('relative', field.colSpan && colSpanClasses[field.colSpan])}>
          <div
            className={cn(
              'relative rounded-xl border-2 bg-white transition-all duration-200',
              'border-[#e5e7eb] hover:border-[#d1d5db] focus-within:border-[#164e63] focus-within:ring-2 focus-within:ring-[#164e63]/10'
            )}
          >
            <textarea
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled}
              rows={field.rows || 4}
              className={cn(
                'w-full bg-transparent px-3 py-3 text-base text-[#374151] outline-none resize-none',
                'placeholder:text-[#6b7280]/60'
              )}
            />
          </div>
          <label
            className={cn(
              'absolute left-3 -top-2.5 px-1 text-xs font-medium text-[#6b7280] bg-white',
              'transition-all duration-200 pointer-events-none'
            )}
          >
            {commonProps.label}
          </label>
          {fieldError && (
            <p className="mt-1 text-sm text-red-500">{fieldError}</p>
          )}
          {field.helperText && !fieldError && (
            <p className="mt-1 text-sm text-[#6b7280]">{field.helperText}</p>
          )}
        </div>
      )

    case 'custom':
      return (
        <div className={field.colSpan ? colSpanClasses[field.colSpan] : undefined}>
          {field.render({
            value,
            onChange: handleChange,
            error: fieldError,
          })}
        </div>
      )

    default:
      return null
  }
}

export function DynamicForm<T extends Record<string, any>>({
  isOpen,
  onOpenChange,
  title,
  description,
  mode = 'create',
  sections,
  fields,
  data,
  onChange,
  onSubmit,
  onCancel,
  loading = false,
  errors = {},
  maxWidth = 'lg',
  maxHeight = '90vh',
  submitLabel = 'Crear',
  submitLabelEditing = 'Guardar Cambios',
  cancelLabel = 'Cancelar',
  loadingLabel = 'Creando...',
  loadingLabelEditing = 'Guardando...',
}: DynamicFormProps<T>) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    await onSubmit()
  }

  // Enhance fields with errors from the errors prop
  const enhanceFieldsWithErrors = (fieldList: FieldConfig[]): FieldConfig[] => {
    return fieldList.map((field) => ({
      ...field,
      error: errors[field.name] || field.error,
    }))
  }

  // Enhance sections with errors
  const enhanceSectionsWithErrors = (sectionList: FormSection[]): FormSection[] => {
    return sectionList.map((section) => ({
      ...section,
      fields: enhanceFieldsWithErrors(section.fields),
    }))
  }

  const enhancedSections = sections ? enhanceSectionsWithErrors(sections) : undefined
  const enhancedFields = fields ? enhanceFieldsWithErrors(fields) : undefined

  const isEditing = mode === 'edit' || mode === 'editar'

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          maxWidthClasses[maxWidth],
          'max-h-[90vh] overflow-y-auto p-6'
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? `Editar ${title}` : title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground">
              {isEditing 
                ? `Modifica los datos de ${description}` 
                : description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Render sections if provided */}
          {enhancedSections?.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-4">
              {section.title && (
                <div>
                  <h3 className="text-sm font-semibold text-[#164e63]">
                    {section.title}
                  </h3>
                  {section.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {section.description}
                    </p>
                  )}
                </div>
              )}
              <div 
                className={cn(
                  'grid gap-4',
                  section.columns === 2 && 'grid-cols-1 md:grid-cols-2',
                  section.columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
                  section.columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
                  !section.columns && 'grid-cols-1 md:grid-cols-2'
                )}
              >
                {section.fields.map((field) => (
                  <div 
                    key={field.name}
                    className={field.colSpan ? colSpanClasses[field.colSpan] : undefined}
                  >
                    <FormField
                      field={field}
                      data={data}
                      onChange={onChange}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Render flat fields if no sections provided */}
          {enhancedFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enhancedFields.map((field) => (
                <div 
                  key={field.name}
                  className={field.colSpan ? colSpanClasses[field.colSpan] : undefined}
                >
                  <FormField
                    field={field}
                    data={data}
                    onChange={onChange}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <ActionButton
            variant="cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelLabel}
          </ActionButton>
          <ActionButton
            variant="save"
            onClick={handleSubmit}
            disabled={loading}
            loading={loading}
            loadingText={isEditing ? loadingLabelEditing : loadingLabel}
          >
            {isEditing ? submitLabelEditing : submitLabel}
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook for form state management
export function useDynamicForm<T extends Record<string, any>>(
  initialData: T,
  onSubmit: (data: T) => void | Promise<void>
) {
  const [data, setData] = React.useState<T>(initialData)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isOpen, setIsOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [mode, setMode] = React.useState<'create' | 'edit' | 'crear' | 'editar'>('create')

  const openCreate = () => {
    setData(initialData)
    setErrors({})
    setMode('create')
    setIsOpen(true)
  }

  const openEdit = (existingData: T) => {
    setData(existingData)
    setErrors({})
    setMode('edit')
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    setErrors({})
  }

  const handleChange = (newData: T) => {
    setData(newData)
    // Clear error for modified field
    const modifiedField = Object.keys(newData).find(
      key => newData[key] !== data[key]
    )
    if (modifiedField && errors[modifiedField]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[modifiedField]
        return newErrors
      })
    }
  }

  const validate = (validators?: Record<string, (value: any) => string | undefined>): boolean => {
    if (!validators) return true
    
    const newErrors: Record<string, string> = {}
    let isValid = true

    for (const [fieldName, validator] of Object.entries(validators)) {
      const error = validator(data[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const submit = async (validators?: Record<string, (value: any) => string | undefined>) => {
    if (validators && !validate(validators)) {
      return false
    }

    setLoading(true)
    try {
      await onSubmit(data)
      close()
      return true
    } catch (error) {
      console.error('Form submission error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    data,
    errors,
    isOpen,
    loading,
    mode,
    setData,
    setErrors,
    handleChange,
    openCreate,
    openEdit,
    close,
    validate,
    submit,
  }
}
