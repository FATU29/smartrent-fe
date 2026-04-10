import { UserApi } from '@/api/types/user.type'
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useAuthStore } from '@/store/auth/index.store'
import { AuthTokens } from '@/configs/axios/types'
import { useValidToken } from '@/hooks/useAuth'
import { decodeToken } from '@/utils/decode-jwt'
import { clearLegacyAuthStorage } from '@/utils/authLocalStorage'
import { isTokenExpired } from '@/configs/axios/helpers'
import { AuthService } from '@/api/services/auth.service'
import { cookieManager } from '@/utils/cookies'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

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

  const { validToken } = useValidToken()
  const t = useTranslations('auth')
  const hasHandledUnauthorized = useRef(false)

  // Reset the unauthorized flag when user authenticates again
  useEffect(() => {
    if (isAuthenticated) {
      hasHandledUnauthorized.current = false
    }
  }, [isAuthenticated])

  // Listen for unauthorized events from axios interceptors
  useEffect(() => {
    const handleUnauthorized = () => {
      if (hasHandledUnauthorized.current) return
      hasHandledUnauthorized.current = true

      console.warn('[Auth] Unauthorized event received, logging out...')
      logout()

      toast.error(t('sessionExpired.title'), {
        description: t('sessionExpired.description'),
      })
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:unauthorized', handleUnauthorized)
      return () => {
        window.removeEventListener('auth:unauthorized', handleUnauthorized)
      }
    }
  }, [logout, t])

  // Initialize auth on mount/reload — wait for zustand hydration first
  useEffect(() => {
    if (!_hasHydrated) return

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
          logout()
          return
        }

        // If we have tokens, validate them
        if (tokens?.accessToken) {
          // If access token is expired, try refreshing before calling introspect
          let activeAccessToken = tokens.accessToken
          if (
            isTokenExpired(activeAccessToken) &&
            tokens.refreshToken &&
            !isTokenExpired(tokens.refreshToken)
          ) {
            try {
              const refreshResult = await AuthService.refreshToken(
                tokens.refreshToken,
              )
              if (refreshResult.success && refreshResult.data) {
                cookieManager.setAuthTokens(refreshResult.data)
                activeAccessToken = refreshResult.data.accessToken
                tokens = { ...tokens, ...refreshResult.data }
              } else {
                logout()
                return
              }
            } catch {
              logout()
              return
            }
          }

          const result = await validToken(activeAccessToken)
          if (result.success && 'data' in result && result.data?.valid) {
            const { user } = decodeToken(activeAccessToken)
            login(user, tokens)
          } else {
            logout()
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        logout()
      }
    }

    initializeAuth()
  }, [_hasHydrated, login, logout, validToken])

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
