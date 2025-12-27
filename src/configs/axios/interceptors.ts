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

const refreshToken = async (): Promise<string | null> => {
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
  }
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

export function createAuthResponseInterceptor() {
  return {
    onFulfilled: (response: AxiosResponse) => response,
    onRejected: async (error: AxiosError) => {
      // Handle 401 errors - token refresh failed or unauthorized
      if (error.response?.status === 401) {
        const refreshTokenValue = getRefreshToken()

        // If refresh token is expired or missing, trigger logout
        if (!refreshTokenValue || isTokenExpired(refreshTokenValue)) {
          handleExpiredTokens(refreshTokenValue)
        } else {
          // API returned 401 even with valid refresh token
          handleRefreshFailure()
        }
      }

      return Promise.reject(error)
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
  const responseInterceptor = createAuthResponseInterceptor()
  axiosInstance.interceptors.response.use(
    responseInterceptor.onFulfilled,
    responseInterceptor.onRejected,
  )

  return axiosInstance
}
