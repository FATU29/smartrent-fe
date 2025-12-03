import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth/index.store'
import { cookieManager } from '@/utils/cookies'

/**
 * Hook to check auth state on mount
 * Automatically logout if cookies are missing
 * Note: Only checks on component mount/page load, not continuously
 */
export const useAuthGuard = () => {
  const { isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      const tokens = cookieManager.getAuthTokens()

      if (!tokens?.accessToken) {
        console.warn(
          '[AuthGuard] Missing auth cookies on mount, forcing logout',
        )
        logout()
      }
    }
  }, []) // Empty deps - only check on mount

  return { isAuthenticated }
}

/**
 * Hook to force logout (clears both cookies and store)
 */
export const useForceLogout = () => {
  const { logout } = useAuthStore()

  const forceLogout = () => {
    console.info('[Auth] Force logout triggered')
    logout()
  }

  return { forceLogout }
}
