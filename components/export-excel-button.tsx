'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { ActionButton, type ActionButtonProps } from '@/components/ui/action-button';

interface ExportExcelButtonProps
  extends Omit<ActionButtonProps, 'onClick' | 'loading' | 'loadingText' | 'startIcon' | 'children'> {
  /** Ejecuta la descarga; si lanza, el mensaje del error se muestra en un toast. */
  onExport: () => Promise<void>;
  label?: string;
}

/**
 * Botón de exportación a Excel sobre `ActionButton`: mismo aspecto que los
 * botones de la barra de acciones de los módulos. No lleva permiso propio:
 * quien puede ver la pantalla puede descargarla.
 */
export function ExportExcelButton({
  onExport,
  label = 'Exportar Excel',
  variant = 'outline',
  ...props
}: ExportExcelButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onExport();
      toast.success('Archivo descargado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo exportar el archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ActionButton
      type="button"
      variant={variant}
      loading={loading}
      loadingText="Exportando..."
      startIcon={<Download className="h-4 w-4" />}
      onClick={handleClick}
      {...props}
    >
      {label}
    </ActionButton>
  );
}
