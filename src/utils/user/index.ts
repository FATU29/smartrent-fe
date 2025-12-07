/**
 * Get user avatar URL with default fallback
 * @param avatarUrl - User's avatar URL (optional)
 * @returns Avatar URL or default avatar path
 */
export const getUserAvatar = (avatarUrl?: string | null): string => {
  if (!avatarUrl || avatarUrl.trim() === '') {
    return '/svg/default-avatar.svg'
  }
  return avatarUrl
}

/**
 * Get user full name
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Full name
 */
export const getUserFullName = (
  firstName: string,
  lastName: string,
): string => {
  return `${firstName} ${lastName}`.trim()
}

/**
 * Get user initials from name
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Initials (e.g., "JD" for "John Doe")
 */
export const getUserInitials = (
  firstName: string,
  lastName: string,
): string => {
  const firstInitial = firstName?.charAt(0)?.toUpperCase() || ''
  const lastInitial = lastName?.charAt(0)?.toUpperCase() || ''
  return `${firstInitial}${lastInitial}`
}
