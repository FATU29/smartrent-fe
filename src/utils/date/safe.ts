import { formatDate } from './formatters'

/**
 * Convert a Date or date-like string to ISO string safely.
 * Returns null if input is falsy or invalid.
 */
export const toISO = (d?: string | Date | null): string | null => {
  if (!d) return null
  try {
    const date = d instanceof Date ? d : new Date(d)
    return isNaN(date.getTime()) ? null : date.toISOString()
  } catch {
    return null
  }
}

/**
 * Format an ISO string via formatDate safely.
 * Returns null if input is falsy or formatting fails.
 */
export const formatISO = (iso?: string | null): string | null => {
  if (!iso) return null
  try {
    return formatDate(iso)
  } catch {
    return null
  }
}
