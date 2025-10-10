import { InternalAxiosRequestConfig } from 'axios'
import { ENV } from '@/constants'

// Helper functions for token management to reduce cognitive complexity

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch {
    return true
  }
}

const clearAuthTokens = () => {
  if (typeof document !== 'undefined') {
    const { cookieManager } = require('@/utils/cookies')
    cookieManager.clearAuthTokens()
  }
}

export const handleExpiredTokens = (refreshTokenValue?: string | null) => {
  if (!refreshTokenValue || isTokenExpired(refreshTokenValue)) {
    console.log('Refresh token expired or not found, logging out...')
    clearAuthTokens()

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    return true // Should exit early
  }
  return false // Continue processing
}

export const handleRefreshFailure = () => {
  clearAuthTokens()

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  }
}

export const applyAuthToken = (
  config: InternalAxiosRequestConfig,
  accessToken: string,
) => {
  config.headers = config.headers || {}
  config.headers.Authorization = `Bearer ${accessToken}`
}

export const applyDefaultConfig = (config: InternalAxiosRequestConfig) => {
  if (!config.baseURL && !config.url?.startsWith('http')) {
    config.baseURL = ENV.URL_API_BASE
  }

  if (!config.timeout) {
    config.timeout = 30000
  }
}

export { isTokenExpired }
