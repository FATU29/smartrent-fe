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

/**
 * Format date string to Vietnamese locale
 */
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('vi-VN', {
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
