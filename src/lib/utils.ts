import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserInitials(firstName?: string, lastName?: string) {
  const f = (firstName || '').trim()
  const l = (lastName || '').trim()
  if (!f && !l) return 'U'
  return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase()
}
