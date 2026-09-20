// ============================================================================
// TYPES - PERMISSIONS MODULE
// ============================================================================

// Por qué el back denegó el acceso. 'UNKNOWN_PERMISSION' es un defecto nuestro:
// el endpoint exige un código que no existe en el catálogo de permisos.
export type ForbiddenReason = 'MISSING_PERMISSION' | 'UNKNOWN_PERMISSION';

// Cuerpo del 403 que emite PermissionsGuard. Todos los textos vienen
// redactados en español desde el back; el front no compone mensajes a partir
// de estos campos. El código técnico del permiso no viaja aquí a propósito:
// solo queda en el log del servidor.
export interface ForbiddenPermissionError {
  reason: ForbiddenReason;
  // Listo para mostrar. Ej: "No tienes acceso a Ver Proyectos"
  message: string;
  // Permission.name de la base. null si reason es 'UNKNOWN_PERMISSION'
  permissionName: string | null;
  // Permission.module de la base. null si reason es 'UNKNOWN_PERMISSION'
  module: string | null;
  // Ruta hasta la casilla en la pantalla de permisos, igual para todos los
  // roles. null si reason es 'UNKNOWN_PERMISSION'
  howToFix: string | null;
}
