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
    getStoredTokens,
  } = useAuthStore()

  const { validToken } = useValidToken()
  const t = useTranslations('auth')
  const hasHandledUnauthorized = useRef(false)

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

      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:unauthorized', handleUnauthorized)
      return () => {
        window.removeEventListener('auth:unauthorized', handleUnauthorized)
        hasHandledUnauthorized.current = false
      }
    }
  }, [logout, t])

  // Initialize auth on mount/reload - check cookies sync with store
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const tokens = getStoredTokens()

        // If localStorage says authenticated but no cookies → logout
        if (isAuthenticated && !tokens?.accessToken) {
          console.warn('[Auth] Cookies missing on load, logging out...')
          logout()
          return
        }

        // If we have tokens, validate them
        if (tokens?.accessToken) {
          const result = await validToken(tokens.accessToken)
          if (result.success && 'data' in result && result.data?.valid) {
            const { user } = decodeToken(tokens.accessToken)
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
  }, [])

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
