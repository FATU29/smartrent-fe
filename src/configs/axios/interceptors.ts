import {
  InternalAxiosRequestConfig,
  AxiosInstance,
  AxiosResponse,
  AxiosError,
} from 'axios'
import { CustomAxiosRequestConfig } from './types'
import { getAccessToken, getRefreshToken } from './utils'
import { AuthService } from '@/api/services/auth.service'
import { cookieManager } from '@/utils/cookies'
import {
  handleExpiredTokens,
  handleRefreshFailure,
  applyAuthToken,
  applyDefaultConfig,
  isTokenExpired,
} from './helpers'

// Deduplication: prevent multiple concurrent refresh calls from racing
let refreshPromise: Promise<string | null> | null = null

const refreshToken = async (): Promise<string | null> => {
  // If a refresh is already in progress, wait for it instead of firing another
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const refreshTokenValue = getRefreshToken()
      if (!refreshTokenValue) return null

      const result = await AuthService.refreshToken(refreshTokenValue)
      const { data, success } = result

      if (!success) return null

      if (typeof document !== 'undefined') {
        cookieManager.setAuthTokens(data)
      }

      return data.accessToken
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Token refresh failed:', error)
      }
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

const handleTokenRefresh = async (
  refreshTokenValue: string | null,
): Promise<string | null> => {
  if (handleExpiredTokens(refreshTokenValue)) {
    return null
  }

  const newToken = await refreshToken()
  if (!newToken) {
    handleRefreshFailure()
    return null
  }

  return newToken
}

export function createAuthRequestInterceptor(
  cookies?: Record<string, unknown>,
) {
  return async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    const customConfig = config as CustomAxiosRequestConfig
    if (customConfig.skipAuth) {
      return config
    }

    let accessToken = getAccessToken(cookies)

    if (accessToken && isTokenExpired(accessToken)) {
      const refreshTokenValue = getRefreshToken()
      const newToken = await handleTokenRefresh(refreshTokenValue)

      if (newToken) {
        accessToken = newToken
        // Token was just refreshed preemptively — if the server still answers
        // 401, the response interceptor must not refresh again.
        customConfig._retry = true
      } else {
        return config
      }
    }

    if (accessToken) {
      applyAuthToken(config, accessToken)
    }

    applyDefaultConfig(config)

    return config
  }
}

export function createAuthResponseInterceptor(axiosInstance?: AxiosInstance) {
  return {
    onFulfilled: (response: AxiosResponse) => response,
    onRejected: async (error: AxiosError) => {
      const requestConfig = error.config as CustomAxiosRequestConfig | undefined
      const isSkipAuthRequest = Boolean(requestConfig?.skipAuth)

      // Skip auth-expired handling for endpoints that explicitly bypass auth.
      // Example: OAuth callback / token introspection can return 401 without meaning
      // the current browser session must be force-logged-out.
      if (isSkipAuthRequest) {
        return Promise.reject(error)
      }

      if (error.response?.status !== 401 || !requestConfig) {
        return Promise.reject(error)
      }

      // Already retried with a fresh access token — server still rejects, so
      // this is a genuine auth failure, not something a refresh can fix.
      if (requestConfig._retry) {
        handleRefreshFailure()
        return Promise.reject(error)
      }

      const refreshTokenValue = getRefreshToken()

      // Refresh is impossible — refresh token gone or expired → real session end
      if (!refreshTokenValue || isTokenExpired(refreshTokenValue)) {
        handleExpiredTokens(refreshTokenValue)
        return Promise.reject(error)
      }

      // Try to refresh. Only surface "session expired" if the refresh itself fails.
      const newToken = await refreshToken()
      if (!newToken) {
        handleRefreshFailure()
        return Promise.reject(error)
      }

      // Refresh succeeded — silently retry the original request with the new token.
      requestConfig._retry = true
      if (!axiosInstance) {
        return Promise.reject(error)
      }
      return axiosInstance(requestConfig)
    },
  }
}

export function setupInterceptors(
  axiosInstance: AxiosInstance,
  cookies?: Record<string, unknown>,
) {
  // Request interceptor
  axiosInstance.interceptors.request.use(createAuthRequestInterceptor(cookies))

  // Response interceptor for handling 401 errors
  const responseInterceptor = createAuthResponseInterceptor(axiosInstance)
  axiosInstance.interceptors.response.use(
    responseInterceptor.onFulfilled,
    responseInterceptor.onRejected,
  )

  return axiosInstance
}
