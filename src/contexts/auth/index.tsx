import { UserApi } from '@/api/types/user.type'
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth/index.store'
import { AuthTokens } from '@/configs/axios/types'
import { useValidToken } from '@/hooks/useAuth'
import { clearLegacyAuthStorage } from '@/utils/authLocalStorage'
import { isTokenExpired } from '@/configs/axios/helpers'
import { AuthService } from '@/api/services/auth.service'
import { cookieManager } from '@/utils/cookies'
import {
  clearAuthProfileQueries,
  resolveAuthenticatedUser,
} from '@/utils/auth/session'

interface User extends UserApi {}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (user: User, tokens: AuthTokens) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AuthProvider = ({ children }: PropsWithChildren) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    clearError,
    _hasHydrated,
  } = useAuthStore()
  const queryClient = useQueryClient()

  const { validToken } = useValidToken()
  const hasHandledUnauthorized = useRef(false)
  const previousAuthState = useRef(isAuthenticated)

  // Reset the unauthorized flag when user authenticates again
  useEffect(() => {
    if (isAuthenticated) {
      hasHandledUnauthorized.current = false
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (previousAuthState.current && !isAuthenticated) {
      clearAuthProfileQueries(queryClient)
    }

    previousAuthState.current = isAuthenticated
  }, [isAuthenticated, queryClient])

  // Listen for unauthorized events from axios interceptors
  useEffect(() => {
    const handleUnauthorized = () => {
      if (hasHandledUnauthorized.current) return
      hasHandledUnauthorized.current = true

      console.warn('[Auth] Unauthorized event received, logging out...')
      logout()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:unauthorized', handleUnauthorized)
      return () => {
        window.removeEventListener('auth:unauthorized', handleUnauthorized)
      }
    }
  }, [logout])

  // Initialize auth on mount/reload — wait for zustand hydration first
  useEffect(() => {
    if (!_hasHydrated) return

    const notifySessionExpired = () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      }
    }

    const initializeAuth = async () => {
      // Cleanup legacy localStorage auth keys from previous implementations
      clearLegacyAuthStorage()

      // Read latest state from the store (avoid stale closure)
      const currentState = useAuthStore.getState()
      let tokens = currentState.getStoredTokens()

      try {
        // If localStorage says authenticated but no cookies → logout
        if (currentState.isAuthenticated && !tokens?.accessToken) {
          console.warn('[Auth] Cookies missing on load, logging out...')
          notifySessionExpired()
          return
        }

        // No stored tokens — nothing to validate, stay logged out silently.
        if (!tokens?.accessToken) {
          return
        }

        // If access token is expired, try refreshing before calling introspect
        let activeAccessToken = tokens.accessToken
        const accessExpired = isTokenExpired(activeAccessToken)
        const refreshUsable =
          !!tokens.refreshToken && !isTokenExpired(tokens.refreshToken)

        if (accessExpired) {
          if (!refreshUsable) {
            notifySessionExpired()
            return
          }
          try {
            const refreshResult = await AuthService.refreshToken(
              tokens.refreshToken as string,
            )
            if (refreshResult.success && refreshResult.data) {
              cookieManager.setAuthTokens(refreshResult.data)
              activeAccessToken = refreshResult.data.accessToken
              tokens = { ...tokens, ...refreshResult.data }
            } else {
              notifySessionExpired()
              return
            }
          } catch {
            notifySessionExpired()
            return
          }
        }

        const result = await validToken(activeAccessToken)
        if (result.success && 'data' in result && result.data?.valid) {
          const sessionUser = await resolveAuthenticatedUser(
            tokens,
            queryClient,
          )
          login(sessionUser, tokens)
        } else {
          notifySessionExpired()
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        notifySessionExpired()
      }
    }

    initializeAuth()
  }, [_hasHydrated, login, queryClient, validToken])

  const contextValue: AuthContextType = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      error,
      login,
      logout,
      updateUser,
      clearError,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      error,
      login,
      logout,
      updateUser,
      clearError,
    ],
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider
