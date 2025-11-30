import { InternalAxiosRequestConfig, AxiosInstance } from 'axios'
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
    console.error('Token refresh failed:', error)
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

export function setupInterceptors(
  axiosInstance: AxiosInstance,
  cookies?: Record<string, unknown>,
) {
  axiosInstance.interceptors.request.use(createAuthRequestInterceptor(cookies))

  return axiosInstance
}
