import { UserApi } from '@/api/types/user.type'
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import { useAuthStore } from '@/store/auth/index.store'
import { AuthTokens } from '@/configs/axios/types'
import { useValidToken } from '@/hooks/useAuth'
import { decodeToken } from '@/utils/decode-jwt'

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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const tokens = getStoredTokens()
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
