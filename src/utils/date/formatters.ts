/**
 * Date formatting utilities
 */

const HAS_TIMEZONE_MARKER = /(Z|[+-]\d{2}:?\d{2})$/

/**
 * Backend timestamps (e.g. `created_at`) are UTC instants but some endpoints
 * still serialize them as a naive `LocalDateTime` string with no `Z`/offset
 * suffix (e.g. `2026-07-04T10:30:00`). `new Date()` parses a naive string as
 * browser-local time instead of UTC, which shifts the displayed value by the
 * viewer's UTC offset. Treat any string missing a timezone marker as UTC.
 */
const toDate = (dateString: string): Date => {
  const normalized = HAS_TIMEZONE_MARKER.test(dateString)
    ? dateString
    : `${dateString}Z`
  return new Date(normalized)
}

/**
 * Format date string to Vietnamese locale format
 * @param dateString - ISO date string or undefined
 * @returns Formatted date string in Vietnamese format (dd/mm/yyyy)
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return ''
  return toDate(dateString).toLocaleDateString('vi-VN')
}

/**
 * Format date string to a specific locale
 * @param dateString - ISO date string or undefined
 * @param locale - Locale string (default: 'vi-VN')
 * @returns Formatted date string
 */
export const formatDateWithLocale = (
  dateString?: string,
  locale: string = 'vi-VN',
): string => {
  if (!dateString) return ''
  return toDate(dateString).toLocaleDateString(locale)
}

/**
 * Format an ISO date-time string to a localized short date + time.
 * @param dateString - ISO date string or undefined
 * @param locale - Locale string (default: 'vi-VN')
 * @returns Formatted date-time string, or '' when no input
 */
export const formatDateTimeWithLocale = (
  dateString?: string,
  locale: string = 'vi-VN',
): string => {
  if (!dateString) return ''
  return toDate(dateString).toLocaleString(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}
