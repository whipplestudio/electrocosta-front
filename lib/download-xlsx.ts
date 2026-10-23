import { isAxiosError } from 'axios';
import apiClient from '@/lib/api-client';

// Generar y armar un xlsx de hasta 10,000 filas tarda más que el timeout base (30 s) del apiClient
const EXPORT_TIMEOUT_MS = 120_000;

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** El back respondió 422 EXPORT_LIMIT_EXCEEDED: hay más filas que el máximo permitido. */
export class ExportLimitError extends Error {
  total: number;
  max: number;

  constructor(total: number, max: number) {
    const fmt = new Intl.NumberFormat('es-MX');
    super(`Acota los filtros (se encontraron ${fmt.format(total)}, máximo ${fmt.format(max)})`);
    this.name = 'ExportLimitError';
    this.total = total;
    this.max = max;
  }
}

/** Fecha local YYYY-MM-DD para los nombres de archivo. */
export const todayForFilename = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

// Los params vacíos no se envían: el back valida con forbidNonWhitelisted y IsUUID/IsEnum
const cleanParams = (params: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );

// Con responseType 'blob' el cuerpo del error también llega como Blob: hay que leerlo como JSON
const parseErrorBody = async (data: unknown): Promise<Record<string, unknown> | null> => {
  try {
    const text = data instanceof Blob ? await data.text() : typeof data === 'string' ? data : null;
    if (text === null) return data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
};

const toExportError = async (error: unknown): Promise<Error> => {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error : new Error('No se pudo exportar el archivo');
  }

  if (error.code === 'ECONNABORTED') {
    return new Error('La exportación tardó demasiado. Acota los filtros e inténtalo de nuevo');
  }

  const status = error.response?.status;
  const body = await parseErrorBody(error.response?.data);

  if (status === 422 && body?.code === 'EXPORT_LIMIT_EXCEEDED') {
    return new ExportLimitError(Number(body.total), Number(body.max));
  }
  if (status === 429) {
    return new Error('Demasiadas exportaciones seguidas. Espera un minuto e inténtalo de nuevo');
  }
  if (status === 403) {
    return new Error('No tienes permiso para exportar esta información');
  }

  const message = body?.message;
  if (typeof message === 'string' && message) return new Error(message);
  if (Array.isArray(message) && message.length > 0) return new Error(message.join(', '));
  return new Error('No se pudo exportar el archivo');
};

/**
 * Descarga un xlsx generado por el back y dispara el guardado en el navegador.
 * Lanza `ExportLimitError` si se pasa el tope de filas; otros fallos salen como `Error` legible.
 */
export async function downloadXlsx(
  url: string,
  params: Record<string, unknown>,
  filename: string,
): Promise<void> {
  let data: Blob;
  try {
    const response = await apiClient.get<Blob>(url, {
      params: cleanParams(params),
      responseType: 'blob',
      timeout: EXPORT_TIMEOUT_MS,
    });
    data = response.data;
  } catch (error) {
    throw await toExportError(error);
  }

  const blob = data.type ? data : new Blob([data], { type: XLSX_MIME });
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(objectUrl);
}
