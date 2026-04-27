import { ZodSchema, z } from 'zod';

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'datetime'
  | 'currency'
  | 'percent'
  | 'file'
  | 'color';

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  options?: SelectOption[];
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  step?: number;
  pattern?: string;
  validationMessage?: string;
  // Para campos relacionados (ej: select dependiente)
  dependsOn?: string;
  // Para campos de autocompletar
  autocomplete?: string;
  // Para mostrar/ocultar campo condicionalmente
  visibleWhen?: (values: Record<string, any>) => boolean;
  // Clases personalizadas
  className?: string;
  // Para inputs de archivo
  accept?: string;
  multiple?: boolean;
  // Para selects con búsqueda
  searchable?: boolean;
  // Para campos de solo lectura
  readOnly?: boolean;
  // Icono opcional (nombre de icono de lucide-react)
  icon?: string;
}

export interface FormSection {
  title?: string;
  description?: string;
  fields: FormFieldConfig[];
  className?: string;
}

export interface FormConfig {
  sections?: FormSection[];
  fields?: FormFieldConfig[];
  schema?: ZodSchema<any>;
  defaultValues?: Record<string, any>;
  // Material Design 3 específico
  variant?: 'filled' | 'outlined' | 'standard';
  density?: 'compact' | 'comfortable' | 'spacious';
  columns?: 1 | 2 | 3 | 4 | 'auto';
  gap?: 'small' | 'medium' | 'large';
}

export interface DynamicFormProps {
  config: FormConfig;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  className?: string;
  // Para usar en diálogos
  footerClassName?: string;
  // Mostrar/ocultar botones
  showSubmit?: boolean;
  showCancel?: boolean;
  // Botones personalizados adicionales
  extraButtons?: React.ReactNode;
  // Título del formulario
  title?: string;
  description?: string;
  // Cuando se usa dentro de un Dialog, no envuelve en Card
  asDialog?: boolean;
  // ID para conectar botones externos al formulario
  id?: string;
}

export function createZodSchema(fields: FormFieldConfig[]): ZodSchema {
  const shape: Record<string, any> = {};

  fields.forEach((field) => {
    let validator: any = z.any();

    switch (field.type) {
      case 'email':
        validator = z.string().email(field.validationMessage || 'Email inválido');
        break;
      case 'password':
        validator = z.string();
        if (field.minLength) {
          validator = validator.min(
            field.minLength,
            `Mínimo ${field.minLength} caracteres`
          );
        }
        break;
      case 'number':
      case 'currency':
      case 'percent':
        validator = z.number().or(z.string().transform((v: string) => (v === '' ? undefined : Number(v))));
        if (field.min !== undefined) {
          validator = validator.refine((v: number) => v >= field.min!, {
            message: `Valor mínimo: ${field.min}`,
          });
        }
        if (field.max !== undefined) {
          validator = validator.refine((v: number) => v <= field.max!, {
            message: `Valor máximo: ${field.max}`,
          });
        }
        break;
      case 'select':
      case 'multiselect':
        if (field.multiple || field.type === 'multiselect') {
          validator = z.array(z.string()).default([]);
        } else {
          validator = z.string();
        }
        break;
      case 'checkbox':
      case 'switch':
        validator = z.boolean().default(false);
        break;
      case 'date':
      case 'datetime':
        validator = z.date().or(z.string()).optional();
        break;
      case 'file':
        validator = z.any();
        break;
      case 'tel':
        validator = z.string();
        if (field.pattern) {
          validator = validator.regex(
            new RegExp(field.pattern),
            field.validationMessage || 'Teléfono inválido'
          );
        }
        break;
      case 'url':
        validator = z.string().url(field.validationMessage || 'URL inválida');
        break;
      case 'textarea':
      case 'text':
      case 'color':
      default:
        validator = z.string();
        if (field.minLength) {
          validator = validator.min(
            field.minLength,
            `Mínimo ${field.minLength} caracteres`
          );
        }
        if (field.maxLength) {
          validator = validator.max(
            field.maxLength,
            `Máximo ${field.maxLength} caracteres`
          );
        }
        if (field.pattern) {
          validator = validator.regex(
            new RegExp(field.pattern),
            field.validationMessage || 'Formato inválido'
          );
        }
    }

    // Hacer opcional si no es requerido
    if (!field.required) {
      if (field.type === 'checkbox' || field.type === 'switch') {
        // Los booleanos ya tienen default
      } else if (field.type === 'number' || field.type === 'currency' || field.type === 'percent') {
        validator = validator.optional();
      } else {
        validator = validator.optional().or(z.literal(''));
      }
    } else {
      if (field.type !== 'checkbox' && field.type !== 'switch') {
        validator = validator.refine((val: any) => val !== undefined && val !== '', {
          message: `${field.label} es obligatorio`,
        });
      }
    }

    shape[field.name] = validator;
  });

  return z.object(shape);
}

export function getDefaultValues(fields: FormFieldConfig[]): Record<string, any> {
  const defaults: Record<string, any> = {};

  fields.forEach((field) => {
    switch (field.type) {
      case 'checkbox':
      case 'switch':
        defaults[field.name] = false;
        break;
      case 'multiselect':
        defaults[field.name] = [];
        break;
      case 'number':
      case 'currency':
      case 'percent':
        defaults[field.name] = undefined;
        break;
      default:
        defaults[field.name] = '';
    }
  });

  return defaults;
}
