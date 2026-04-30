'use client';

import * as React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { CalendarIcon, Eye, EyeOff, Upload, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { FloatingInput } from '@/components/ui/floating-input';
import { FloatingSelect } from '@/components/ui/floating-select';
import { FloatingDatePicker } from '@/components/ui/floating-date-picker';
import { FormFieldConfig, FieldType } from './form-types';

interface DynamicFormFieldProps {
  field: FormFieldConfig;
  variant?: 'filled' | 'outlined' | 'standard';
  density?: 'compact' | 'comfortable' | 'spacious';
}

const densityClasses = {
  compact: 'space-y-1',
  comfortable: 'space-y-2',
  spacious: 'space-y-3',
};

const inputDensityClasses = {
  compact: 'h-9 px-3 text-sm',
  comfortable: 'h-11 px-4 text-base',
  spacious: 'h-14 px-5 text-base',
};

export function DynamicFormField({
  field,
  variant = 'outlined',
  density = 'comfortable',
}: DynamicFormFieldProps) {
  const { control, watch, setValue } = useFormContext();
  const [showPassword, setShowPassword] = React.useState(false);
  const watchedValue = watch(field.name);

  // Verificar visibilidad condicional
  if (field.visibleWhen) {
    const allValues = watch();
    if (!field.visibleWhen(allValues)) {
      return null;
    }
  }

  const renderInput = (type: FieldType, onChange: (value: any) => void, value: any) => {
    const baseClasses = cn(
      'w-full transition-all duration-200 placeholder:text-muted-foreground/40 placeholder:italic',
      inputDensityClasses[density],
      variant === 'filled' && 'bg-muted/50 border-0 border-b-2 rounded-t-md rounded-b-none focus:bg-muted',
      variant === 'outlined' && 'border-2 rounded-xl focus:ring-2 focus:ring-primary/20',
      variant === 'standard' && 'border-0 border-b-2 rounded-none px-0',
      field.className
    );

    switch (type) {
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            disabled={field.disabled}
            readOnly={field.readOnly}
            className={cn(baseClasses, 'min-h-[100px] resize-y')}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case 'password':
        return (
          <FloatingInput
            label={field.label + (field.required ? ' *' : '')}
            type={showPassword ? 'text' : 'password'}
            placeholder={field.placeholder}
            disabled={field.disabled}
            readOnly={field.readOnly}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            }
          />
        );

      case 'select':
        return (
          <FloatingSelect
            label={field.label + (field.required ? ' *' : '')}
            value={value || ''}
            onChange={onChange}
            options={field.options || []}
            placeholder={field.placeholder || `Selecciona ${field.label.toLowerCase()}`}
            disabled={field.disabled}
          />
        );

      case 'multiselect':
        return (
          <div className={cn('space-y-2', baseClasses, 'h-auto py-2')}>
            <div className="flex flex-wrap gap-2 mb-2">
              {Array.isArray(value) && value.length > 0 ? (
                value.map((v) => {
                  const option = field.options?.find((o) => o.value === v);
                  return (
                    <span
                      key={v}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full"
                    >
                      {option?.label || v}
                      <button
                        type="button"
                        onClick={() => {
                          const newValue = value.filter((item: string) => item !== v);
                          onChange(newValue);
                        }}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })
              ) : (
                <span className="text-muted-foreground text-sm">
                  {field.placeholder || `Selecciona opciones...`}
                </span>
              )}
            </div>
            <div className="border-t pt-2 max-h-[200px] overflow-y-auto">
              {field.options?.map((option) => {
                const isSelected = Array.isArray(value) && value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      const current = Array.isArray(value) ? value : [];
                      const newValue = isSelected
                        ? current.filter((v: string) => v !== option.value)
                        : [...current, option.value];
                      onChange(newValue);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                      isSelected && 'bg-primary/10 text-primary'
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                      isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                    )}>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                    </div>
                    <div>
                      <span className="font-medium">{option.label}</span>
                      {option.description && (
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
            <Checkbox
              id={field.name}
              checked={value || false}
              onCheckedChange={onChange}
              disabled={field.disabled}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor={field.name} className="font-medium cursor-pointer">
                {field.label}
              </Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">{field.description}</p>
              )}
            </div>
          </div>
        );

      case 'switch':
        return (
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex-1">
              <Label htmlFor={field.name} className="font-medium">
                {field.label}
              </Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">{field.description}</p>
              )}
            </div>
            <Switch
              id={field.name}
              checked={value || false}
              onCheckedChange={onChange}
              disabled={field.disabled}
            />
          </div>
        );

      case 'date':
        return (
          <FloatingDatePicker
            label={field.label + (field.required ? ' *' : '')}
            value={value ? new Date(value) : undefined}
            onChange={(date) => {
              if (date instanceof Date) {
                onChange(date.toISOString());
              } else if (date && 'from' in date && date.from) {
                onChange(date.from.toISOString());
              } else {
                onChange(undefined);
              }
            }}
            mode="single"
            placeholder={field.placeholder || 'Seleccionar fecha'}
            disabled={field.disabled}
          />
        );

      case 'datetime':
        return (
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={field.disabled}
                  className={cn(
                    baseClasses,
                    'justify-start text-left font-normal flex-1',
                    !value && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? (
                    format(new Date(value), 'PPP', { locale: es })
                  ) : (
                    field.placeholder || 'Fecha'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) => {
                    const current = value ? new Date(value) : new Date();
                    date?.setHours(current.getHours(), current.getMinutes());
                    onChange(date?.toISOString());
                  }}
                  disabled={field.disabled}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <input
              type="time"
              disabled={field.disabled}
              className={cn(baseClasses, 'w-[120px]')}
              value={value ? format(new Date(value), 'HH:mm') : ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const [hours, minutes] = e.target.value.split(':').map(Number);
                const date = value ? new Date(value) : new Date();
                date.setHours(hours, minutes);
                onChange(date.toISOString());
              }}
            />
          </div>
        );

      case 'currency': {
        // Formatear número con separadores de miles (mientras se escribe)
        const formatNumber = (val: string): string => {
          const num = val.replace(/,/g, '');
          if (!num) return '';

          const parts = num.split('.');
          const wholePart = parts[0];
          const decimalPart = parts[1] || '';

          // Agregar separadores de miles a la parte entera
          const withSeparators = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

          return decimalPart ? `${withSeparators}.${decimalPart}` : withSeparators;
        };

        // Manejar cambio - formatear mientras se escribe
        const handleChange = (inputValue: string) => {
          // Remover todo excepto números y punto decimal
          const cleanValue = inputValue.replace(/[^\d.]/g, '');

          // Asegurar solo un punto decimal
          const parts = cleanValue.split('.');
          let sanitized = parts[0];
          if (parts.length > 1) {
            sanitized += '.' + parts.slice(1).join('').slice(0, 2);
          }

          if (sanitized === '' || sanitized === '.') {
            onChange(undefined);
            return;
          }

          // Actualizar el valor numérico en el formulario (sin formato)
          const numValue = parseFloat(sanitized);
          if (!isNaN(numValue)) {
            onChange(numValue);
          }
        };

        // El valor mostrado está formateado con separadores
        const displayValue = formatNumber(value ? String(value) : '');

        return (
          <FloatingInput
            label={field.label + (field.required ? ' *' : '')}
            type="text"
            inputMode="decimal"
            placeholder={field.placeholder || '0.00'}
            disabled={field.disabled}
            readOnly={field.readOnly}
            value={displayValue}
            onChange={(e) => handleChange(e.target.value)}
            startAdornment={<span className="font-medium">$</span>}
          />
        );
      }

      case 'percent':
        return (
          <FloatingInput
            label={field.label + (field.required ? ' *' : '')}
            type="number"
            step={field.step || 0.01}
            min={field.min || 0}
            max={field.max || 100}
            placeholder={field.placeholder || '0'}
            disabled={field.disabled}
            readOnly={field.readOnly}
            value={value || ''}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            endAdornment={<span className="font-medium">%</span>}
          />
        );

      case 'color':
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={value || '#3B82F6'}
              onChange={(e) => onChange(e.target.value)}
              disabled={field.disabled}
              className="h-11 w-20 rounded-lg cursor-pointer border-2"
            />
            <FloatingInput
              label={"Código" + (field.required ? ' *' : '')}
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={field.disabled}
              placeholder="#3B82F6"
            />
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept={field.accept}
                multiple={field.multiple}
                disabled={field.disabled}
                className="hidden"
                id={`file-${field.name}`}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const files = e.target.files;
                  if (files) {
                    onChange(field.multiple ? Array.from(files) : files[0]);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={field.disabled}
                onClick={() => document.getElementById(`file-${field.name}`)?.click()}
                className={baseClasses}
              >
                <Upload className="mr-2 h-4 w-4" />
                {field.placeholder || 'Seleccionar archivo'}
              </Button>
            </div>
            {value && (
              <div className="text-sm text-muted-foreground">
                {field.multiple && Array.isArray(value) ? (
                  <ul className="list-disc list-inside">
                    {value.map((file: File, i: number) => (
                      <li key={i}>{file.name}</li>
                    ))}
                  </ul>
                ) : (
                  <span>{(value as File).name}</span>
                )}
              </div>
            )}
          </div>
        );

      case 'number':
        return (
          <FloatingInput
            label={field.label + (field.required ? ' *' : '')}
            type="number"
            step={field.step || 1}
            min={field.min}
            max={field.max}
            placeholder={field.placeholder}
            disabled={field.disabled}
            readOnly={field.readOnly}
            value={value || ''}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          />
        );

      case 'email':
      case 'tel':
      case 'url':
      case 'text':
      default:
        return (
          <FloatingInput
            label={field.label + (field.required ? ' *' : '')}
            type={type}
            placeholder={field.placeholder}
            disabled={field.disabled}
            readOnly={field.readOnly}
            autoComplete={field.autocomplete}
            pattern={field.pattern}
            minLength={field.minLength}
            maxLength={field.maxLength}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  // Field types that have built-in floating labels (FloatingInput/FloatingSelect)
  const hasFloatingLabel = [
    'text', 'email', 'tel', 'url', 'number', 'password', 
    'currency', 'percent', 'color', 'select'
  ].includes(field.type)

  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: formField, fieldState: { error } }) => (
        <div className={cn(densityClasses[density], field.className)}>


          {/* Only show description for fields without floating labels */}
          {field.description && !hasFloatingLabel && field.type !== 'checkbox' && field.type !== 'switch' && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}

          {renderInput(field.type, formField.onChange, formField.value)}

          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
              {error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
