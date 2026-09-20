'use client';

import { Lock } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import type { ForbiddenPermissionError } from '@/types/permissions';

// Separador con el que el back une los tramos de la ruta hasta la casilla
// (PATH_SEPARATOR en el catálogo de etiquetas). Solo se usa para reconocer la
// ruta dentro de howToFix y destacarla; el texto no se compone aquí.
const PATH_SEPARATOR = ' → ';

// howToFix llega redactado entero desde el back, con la forma
// "<frase>: <Menú → Menú → Casilla>". Partimos por el último ": " para poder
// destacar la ruta, que es lo que el administrador necesita leer de un vistazo
// en una captura reenviada. Si el texto no trae ruta reconocible se devuelve
// tal cual: preferimos mostrarlo plano antes que recortarlo mal.
const splitHowToFix = (howToFix: string): { lead: string; path: string | null } => {
  const cut = howToFix.lastIndexOf(': ');
  if (cut === -1) return { lead: howToFix, path: null };

  const path = howToFix.slice(cut + 2).trim();
  if (!path.includes(PATH_SEPARATOR)) return { lead: howToFix, path: null };

  return { lead: howToFix.slice(0, cut + 1), path };
};

const permissionDeniedVariants = cva(
  'flex gap-3 rounded-lg border border-dashed bg-muted/40 text-left',
  {
    variants: {
      variant: {
        // Ocupa el hueco de una pantalla o de una tabla entera.
        block: 'flex-col items-center px-6 py-10 text-center sm:gap-4',
        // Cabe debajo de un campo de formulario sin desmontar el layout.
        inline: 'items-start px-4 py-3',
      },
    },
    defaultVariants: {
      variant: 'block',
    },
  },
);

interface PermissionDeniedProps
  extends VariantProps<typeof permissionDeniedVariants> {
  error: ForbiddenPermissionError;
  className?: string;
}

/**
 * Bloque de "sin acceso" para el 403 de permisos que emite PermissionsGuard.
 *
 * Muestra el candado, el `message` del back y, debajo, el `howToFix` con la
 * ruta hasta la casilla destacada. Todos los textos vienen redactados del
 * back: aquí no se compone ninguno. El código técnico del permiso no llega al
 * front a propósito, así que nunca puede aparecer en pantalla.
 *
 * Se le pasa el objeto que devuelve `getForbiddenPermissionError()` de
 * `lib/api-client`.
 */
export function PermissionDenied({
  error,
  variant,
  className,
}: PermissionDeniedProps) {
  const isInline = variant === 'inline';
  const howToFix = error.howToFix ? splitHowToFix(error.howToFix) : null;

  return (
    <div
      role="status"
      className={cn(permissionDeniedVariants({ variant }), className)}
    >
      <Lock
        aria-hidden="true"
        className={cn(
          'shrink-0 text-muted-foreground',
          isInline ? 'mt-0.5 h-4 w-4' : 'h-10 w-10',
        )}
      />

      <div className={cn('min-w-0', isInline ? 'space-y-2' : 'space-y-3')}>
        <p
          className={cn(
            'font-medium text-foreground',
            isInline ? 'text-sm' : 'text-base',
          )}
        >
          {error.message}
        </p>

        {/* Sin howToFix (UNKNOWN_PERMISSION) no se añade nada: el propio
            message del back ya trae el genérico de "contacta a tu
            administrador", y aquí no se compone texto. */}
        {howToFix && (
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">{howToFix.lead}</p>
            {howToFix.path && (
              <p
                className={cn(
                  'inline-block rounded-md border bg-background px-3 py-1.5 font-semibold text-foreground',
                  isInline ? 'text-sm' : 'text-base',
                )}
              >
                {howToFix.path}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
