/**
 * Date formatting utilities
 */

/**
 * Format date string to Vietnamese locale format
 * @param dateString - ISO date string or undefined
 * @returns Formatted date string in Vietnamese format (dd/mm/yyyy)
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('vi-VN')
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
  return new Date(dateString).toLocaleDateString(locale)
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
  return new Date(dateString).toLocaleString(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}
