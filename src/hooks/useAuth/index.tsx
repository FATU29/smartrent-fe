import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '@/store/auth/index.store'
import { AuthService } from '@/api/services/auth.service'
import {
  LoginRequest,
  AdminLoginRequest,
  RegisterRequest,
} from '@/api/types/auth.type'
import { cookieManager } from '@/utils/cookies'
import { VerificationAPI } from '@/api/types/verification.type'
import {
  clearAuthProfileQueries,
  resolveAuthenticatedUser,
} from '@/utils/auth/session'

export { useAuthGuard, useForceLogout } from './useAuthGuard'
export { useChangePassword } from './useChangePassword'
export { useUpdateProfile } from './useUpdateProfile'

export const useAuth = () => {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
      login: state.login,
      logout: state.logout,
      updateUser: state.updateUser,
    })),
  )
}

export const useLogin = () => {
  const { setLoading, setError, login } = useAuthStore()
  const queryClient = useQueryClient()

  const loginUser = useCallback(
    async (credentials: LoginRequest) => {
      setError(null)
      setLoading(true)

      try {
        const result = await AuthService.login(credentials)
        const { success, message, data: tokens } = result

        setLoading(false)

        if (!success) {
          setError(message)
          return result
        }

        const user = await resolveAuthenticatedUser(tokens, queryClient)
        login(user, tokens)

        // Clear AI chat session when login successfully
        try {
          sessionStorage.removeItem('smart-rent-ai-chat-session')
        } catch (error) {
          console.warn('[useLogin] Failed to clear AI chat session:', error)
        }

        return result
      } catch (error) {
        setLoading(false)
        const errorMessage =
          error instanceof Error ? error.message : 'Login failed'
        setError(errorMessage)
        return {
          success: false,
          message: errorMessage,
          code: '',
          data: null as unknown,
        }
      }
    },
    [setLoading, setError, login, queryClient],
  )

  return { loginUser }
}

export const useAdminLogin = () => {
  const { setLoading, setError, login } = useAuthStore()
  const queryClient = useQueryClient()

  const loginAdmin = useCallback(
    async (credentials: AdminLoginRequest) => {
      setError(null)
      setLoading(true)

      try {
        const result = await AuthService.adminLogin(credentials)
        const { success, message, data: tokens } = result

        setLoading(false)

        if (!success) {
          setError(message)
          return result
        }

        const user = await resolveAuthenticatedUser(tokens, queryClient)
        login(user, tokens)

        // Clear AI chat session when login successfully
        try {
          sessionStorage.removeItem('smart-rent-ai-chat-session')
        } catch (error) {
          console.warn(
            '[useAdminLogin] Failed to clear AI chat session:',
            error,
          )
        }

        return result
      } catch (error) {
        setLoading(false)
        const errorMessage =
          error instanceof Error ? error.message : 'Admin login failed'
        setError(errorMessage)
        return { success: false, message: errorMessage }
      }
    },
    [setLoading, setError, login, queryClient],
  )

  return { loginAdmin }
}

export const useRegister = () => {
  const { setLoading, setError } = useAuthStore()

  const registerUser = useCallback(
    async (data: RegisterRequest) => {
      setLoading(true)
      setError(null)

      try {
        const result = await AuthService.register(data)
        const { success, message } = result

        setLoading(false)

        if (!success) {
          setError(message)
          return result
        }

        return result
      } catch (error) {
        setLoading(false)
        const errorMessage =
          error instanceof Error ? error.message : 'Registration failed'
        setError(errorMessage)
        return {
          success: false,
          message: errorMessage,
          code: '',
          data: null as unknown,
        }
      }
    },
    [setLoading, setError],
  )

  return { registerUser }
}

export const useLogout = () => {
  const { logout } = useAuthStore()
  const queryClient = useQueryClient()

  const logoutUser = useCallback(async () => {
    const accessToken = cookieManager.getAccessToken()

    // Clear AI chat session on logout
    try {
      sessionStorage.removeItem('smart-rent-ai-chat-session')
    } catch (error) {
      console.warn('[Logout] Failed to clear AI chat session:', error)
    }

    clearAuthProfileQueries(queryClient)

    // Clear local state FIRST (optimistic) — triggers immediate UI update
    logout()

    // If no access token, nothing to notify the server about
    if (!accessToken) {
      return { success: true, message: 'Logged out' }
    }

    // Notify server in background (fire-and-forget for UX)
    try {
      const result = await AuthService.logout(accessToken)
      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Logout failed'
      console.warn('[Logout] Server logout failed:', errorMessage)
      // Already logged out locally — no need to setError or disrupt UX
      return { success: true, message: 'Logged out locally' }
    }
  }, [logout, queryClient])

  return { logoutUser }
}

export const useTokenRefresh = () => {
  const { refreshTokens, getStoredTokens, logout, setError } = useAuthStore()

  const refreshAuthTokens = useCallback(async () => {
    const currentTokens = getStoredTokens()

    if (!currentTokens?.refreshToken) {
      return { success: false, message: 'No refresh token available' }
    }

    try {
      const result = await AuthService.refreshToken(currentTokens.refreshToken)
      const { success, message, data: newTokens } = result

      if (!success) {
        setError(message)
        logout()
        return result
      }

      refreshTokens(newTokens)
      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Token refresh failed'
      setError(errorMessage)
      logout()
      return { success: false, message: errorMessage }
    }
  }, [refreshTokens, getStoredTokens, logout, setError])

  return { refreshAuthTokens }
}

export const useVerifyOtp = () => {
  const { setLoading, setError } = useAuthStore()

  const verifyOtp = useCallback(
    async (data: VerificationAPI) => {
      setLoading(true)
      setError(null)

      try {
        const result = await AuthService.verifyOtp(data)
        const { success, message } = result

        setLoading(false)

        if (!success) {
          setError(message)
          return result
        }

        return result
      } catch (error) {
        setLoading(false)
        const errorMessage =
          error instanceof Error ? error.message : 'OTP verification failed'
        setError(errorMessage)
        return { success: false, message: errorMessage }
      }
    },
    [setLoading, setError],
  )

  return { verifyOtp }
}

export const useResendOtp = () => {
  const { setLoading, setError } = useAuthStore()

  const resendOtp = useCallback(
    async (email: string) => {
      setLoading(true)
      setError(null)

      try {
        const result = await AuthService.resendOtp(email)
        const { success, message } = result

        setLoading(false)

        if (!success) {
          setError(message)
          return result
        }

        return result
      } catch (error) {
        setLoading(false)
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to resend OTP'
        setError(errorMessage)
        return { success: false, message: errorMessage }
      }
    },
    [setLoading, setError],
  )

  return { resendOtp }
}

export const useValidToken = () => {
  const { setLoading, setError } = useAuthStore()

  const validToken = useCallback(
    async (token: string) => {
      setLoading(true)
      setError(null)

      try {
        const result = await AuthService.validToken(token)
        const { success, message } = result

        setLoading(false)

        if (!success) {
          setError(message)
          return result
        }

        return result
      } catch (error) {
        setLoading(false)
        const errorMessage =
          error instanceof Error ? error.message : 'Token validation failed'
        setError(errorMessage)
        return { success: false, message: errorMessage }
      }
    },
    [setLoading, setError],
  )

  return { validToken }
}
