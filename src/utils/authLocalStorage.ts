const LEGACY_AUTH_KEYS = [
  'accessToken',
  'refreshToken',
  'token',
  'access_token',
  'refresh_token',
  'authToken',
  'auth-storage',
] as const

export const clearLegacyAuthStorage = () => {
  if (typeof window === 'undefined') {
    return
  }

  LEGACY_AUTH_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore storage access failures (private mode / quota / browser restrictions)
    }
  })
}
