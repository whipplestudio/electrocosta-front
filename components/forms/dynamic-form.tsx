'use client';

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '@/lib/utils';
import { ActionButton } from '@/components/ui/action-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DynamicFormField } from './dynamic-form-field';
import { DynamicFormProps, createZodSchema, getDefaultValues, FormFieldConfig, FormSection } from './form-types';

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gapClasses = {
  small: 'gap-3',
  medium: 'gap-5',
  large: 'gap-7',
};

export function DynamicForm({
  config,
  onSubmit,
  onCancel,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  loading = false,
  className,
  footerClassName,
  showSubmit = true,
  showCancel = true,
  extraButtons,
  title,
  description,
  asDialog = false,
  id,
}: DynamicFormProps) {
  const allFields = React.useMemo(() => {
    const fields: FormFieldConfig[] = [];
    if (config.sections) {
      config.sections.forEach((section) => {
        fields.push(...section.fields);
      });
    }
    if (config.fields) {
      fields.push(...config.fields);
    }
    return fields;
  }, [config]);

  const schema = React.useMemo(() => {
    return config.schema || createZodSchema(allFields);
  }, [config.schema, allFields]);

  const defaultValues = React.useMemo(() => {
    return config.defaultValues || getDefaultValues(allFields);
  }, [config.defaultValues, allFields]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
  });

  const { handleSubmit, formState } = form;

  const handleFormSubmit = async (data: Record<string, any>) => {
    await onSubmit(data);
  };

  const columns = config.columns || (allFields.length <= 2 ? 1 : 2);
  const gap = config.gap || 'medium';
  const density = config.density || 'comfortable';
  const variant = config.variant || 'outlined';

  const renderFields = (fields: FormFieldConfig[]) => (
    <div className={cn('grid', columnClasses[columns as keyof typeof columnClasses], gapClasses[gap])}>
      {fields.map((field) => (
        <div
          key={field.name}
          className={cn(
            // Para campos que deberían ocupar el ancho completo
            field.type === 'textarea' && columns !== 1 && 'md:col-span-2',
            field.type === 'file' && columns !== 1 && 'md:col-span-2',
            field.type === 'multiselect' && columns !== 1 && 'md:col-span-2'
          )}
        >
          <DynamicFormField
            field={field}
            variant={variant}
            density={density}
          />
        </div>
      ))}
    </div>
  );

  const renderSection = (section: { title?: string; description?: string; fields: FormFieldConfig[]; className?: string }, index: number) => (
    <div key={index} className={cn('space-y-4', section.className)}>
      {section.title && (
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
          {section.description && (
            <p className="text-sm text-muted-foreground">{section.description}</p>
          )}
        </div>
      )}
      {renderFields(section.fields)}
      {index < (config.sections?.length || 0) - 1 && (
        <Separator className="my-6" />
      )}
    </div>
  );

  const formContent = (
    <FormProvider {...form}>
      <form id={id} onSubmit={handleSubmit(handleFormSubmit)} className={cn('space-y-6', className)}>
        {/* Título principal del formulario */}
        {(title || description) && (
          <div className="space-y-2 mb-6">
            {title && <h2 className="text-2xl font-bold text-foreground">{title}</h2>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
        )}

        {/* Campos sin sección */}
        {config.fields && config.fields.length > 0 && renderFields(config.fields)}

        {/* Secciones */}
        {config.sections?.map((section, index) => renderSection(section, index))}

        {/* Footer con botones */}
        {(showSubmit || showCancel || extraButtons) && (
          <div className={cn(
            'flex flex-col sm:flex-row items-center gap-3 pt-6 border-t',
            footerClassName
          )}>
            <div className="flex-1" />
            
            {extraButtons && <div className="flex items-center gap-2 order-2 sm:order-1">{extraButtons}</div>}
            
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
              {showCancel && onCancel && (
                <ActionButton
                  type="button"
                  variant="cancel"
                  size="md"
                  loading={loading}
                  onClick={onCancel}
                  className="flex-1 sm:flex-none"
                >
                  {cancelLabel}
                </ActionButton>
              )}

              {showSubmit && (
                <ActionButton
                  type="submit"
                  variant="submit"
                  size="md"
                  loading={loading}
                  loadingText="Guardando..."
                  className="flex-1 sm:flex-none"
                >
                  {submitLabel}
                </ActionButton>
              )}
            </div>
          </div>
        )}
      </form>
    </FormProvider>
  );

  // Si tiene título y descripción y no es dialog, envolver en Card para Material Design 3
  if (!asDialog && (title || description)) {
    return (
      <Card className="shadow-md border-0">
        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
          {description && <CardDescription className="text-base">{description}</CardDescription>}
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {formContent}
        </CardContent>
      </Card>
    );
  }

  return formContent;
}

// Hook personalizado para usar el formulario fuera del componente
export function useDynamicForm(config: Parameters<typeof DynamicForm>[0]['config']) {
  const allFields = React.useMemo(() => {
    const fields: FormFieldConfig[] = [];
    if (config.sections) {
      config.sections.forEach((section) => {
        fields.push(...section.fields);
      });
    }
    if (config.fields) {
      fields.push(...config.fields);
    }
    return fields;
  }, [config]);

  const schema = React.useMemo(() => {
    return config.schema || createZodSchema(allFields);
  }, [config.schema, allFields]);

  const defaultValues = React.useMemo(() => {
    return config.defaultValues || getDefaultValues(allFields);
  }, [config.defaultValues, allFields]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
  });

  return form;
}

// Componente para usar en Dialogs específicamente
interface DynamicFormDialogProps extends DynamicFormProps {
  dialogTitle?: string;
  dialogDescription?: string;
}

export function DynamicFormDialog({
  dialogTitle,
  dialogDescription,
  ...props
}: DynamicFormDialogProps) {
  return (
    <div className="space-y-4">
      {(dialogTitle || dialogDescription) && (
        <div className="space-y-2 pb-4 border-b">
          {dialogTitle && <h3 className="text-xl font-semibold">{dialogTitle}</h3>}
          {dialogDescription && <p className="text-sm text-muted-foreground">{dialogDescription}</p>}
        </div>
      )}
      <DynamicForm {...props} showCancel={false} />
    </div>
  );
}
