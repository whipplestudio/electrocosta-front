import { format } from 'date-fns'

/**
 * Parses a `Date` or a `YYYY-MM-DD` string (with or without a trailing time
 * suffix) as a LOCAL date, avoiding the UTC-midnight interpretation that
 * `new Date('YYYY-MM-DD')` applies natively — which shifts the date back a
 * day in timezones behind UTC (e.g. Mexico, UTC-6).
 */
export function parseLocalDate(dateStr: string | Date): Date {
  if (dateStr instanceof Date) return dateStr

  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Formats a `Date` to `YYYY-MM-DD` in local time. Use this instead of
 * `date.toISOString().split('T')[0]`, which converts to UTC first and can
 * shift the date back a day in timezones behind UTC.
 */
export function formatLocalDateISO(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}
