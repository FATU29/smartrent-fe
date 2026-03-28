import { UserApi } from '@/api/types/user.type'
import { create } from 'zustand'
import { AuthTokens } from '@/configs/axios/types'
import { cookieManager } from '@/utils/cookies'
import { clearLegacyAuthStorage } from '@/utils/authLocalStorage'

interface User extends UserApi {}

interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  _hasHydrated: boolean

  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (user: User, tokens: AuthTokens) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  clearError: () => void

  // Token management
  getStoredTokens: () => AuthTokens | null
  refreshTokens: (tokens: AuthTokens) => void
  clearTokens: () => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  _hasHydrated: true,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  login: (user, tokens) => {
    // Cleanup legacy auth values from localStorage before storing new session
    clearLegacyAuthStorage()
    // Store tokens using cookie utility
    cookieManager.setAuthTokens(tokens)

    set({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })
  },

  logout: () => {
    // Clear tokens using cookie utility
    cookieManager.clearAuthTokens()
    // Ensure no legacy auth tokens remain in localStorage
    clearLegacyAuthStorage()

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  },

  updateUser: (userData) => {
    const currentUser = get().user
    if (currentUser) {
      set({ user: { ...currentUser, ...userData } })
    }
  },

  clearError: () => set({ error: null }),

  getStoredTokens: () => {
    return cookieManager.getAuthTokens()
  },

  refreshTokens: (tokens) => {
    cookieManager.setAuthTokens(tokens)
  },

  clearTokens: () => {
    cookieManager.clearAuthTokens()
    clearLegacyAuthStorage()
  },
}))
