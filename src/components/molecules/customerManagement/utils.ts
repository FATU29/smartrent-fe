import { toast } from 'sonner'

/**
 * Copy text to clipboard and show success toast
 */
export const copyToClipboard = async (
  text: string,
  type: 'phone' | 'email',
  successMessage: { phone: string; email: string },
) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(
      type === 'phone' ? successMessage.phone : successMessage.email,
    )
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

/**
 * Get user initials from first and last name
 */
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

const HAS_TIMEZONE_MARKER = /(Z|[+-]\d{2}:?\d{2})$/

/**
 * Backend serializes `clickedAt` as a naive `LocalDateTime` in UTC with no
 * timezone suffix (e.g. "2026-07-11T03:00:00"). `new Date()` would otherwise
 * parse it as the viewer's local time instead of UTC, shifting the displayed
 * value by the runtime's UTC offset. Treat any string missing a timezone
 * marker as UTC.
 */
export const parseApiDate = (dateString: string): Date =>
  new Date(HAS_TIMEZONE_MARKER.test(dateString) ? dateString : `${dateString}Z`)

/**
 * Format date string to Vietnam local time, regardless of the viewer's
 * runtime timezone
 */
export const formatDate = (dateString: string): string => {
  try {
    return parseApiDate(dateString).toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}
