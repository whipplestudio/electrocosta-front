/**
 * Locale-independent number/currency formatting.
 *
 * Always pins the locale to 'en-US' (comma thousands separator, period
 * decimal separator) regardless of the user's OS/browser locale. Without
 * this, `Number.prototype.toLocaleString()` falls back to the caller's
 * default locale, which produces "$61.691.537,13" instead of
 * "$61,691,537.13" on machines configured for es-ES, de-DE, etc.
 */

export function formatNumber(
  value: number | string,
  options?: Intl.NumberFormatOptions
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('en-US', options).format(Number.isFinite(num) ? num : 0)
}

export function formatCurrency(
  value: number | string,
  options?: Intl.NumberFormatOptions
): string {
  return `$${formatNumber(value, options)}`
}
