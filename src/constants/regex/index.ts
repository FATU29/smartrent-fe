// Validation regex patterns

// Email validation patterns
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const EMAIL_PREFIX_REGEX = /^[^\s@]+@/

// Phone validation patterns
export const VIETNAM_PHONE_REGEX = /(84|0[3|5|7|8|9])+([0-9]{8})\b/
export const PHONE_PREFIX_REGEX = /^[+]?[0-9]/

// Password validation patterns
export const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/

// Common patterns
export const PHONE_NUMBER_PREFIXES = ['84', '03', '05', '07', '08', '09']

// Validation functions
export const isValidEmail = (email: string): boolean => EMAIL_REGEX.test(email)

export const isValidVietnamesePhone = (phone: string): boolean =>
  VIETNAM_PHONE_REGEX.test(phone)

export const isValidEmailOrPhone = (value: string): boolean =>
  EMAIL_REGEX.test(value) || VIETNAM_PHONE_REGEX.test(value)

export const isStrongPassword = (password: string): boolean =>
  PASSWORD_STRENGTH_REGEX.test(password) && password.length >= 8

export const getInputType = (value: string): 'email' | 'phone' | 'unknown' => {
  if (EMAIL_PREFIX_REGEX.test(value)) return 'email'
  if (PHONE_PREFIX_REGEX.test(value)) return 'phone'
  return 'unknown'
}
