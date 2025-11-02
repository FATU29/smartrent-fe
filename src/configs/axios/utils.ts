import {
  BEARER_ACCESS_TOKEN_COOKIE,
  BEARER_REFRESH_TOKEN_COOKIE,
} from '@/constants'
import { AuthTokens, CookieStore } from './types'
import { cookieManager } from '@/utils/cookies'

export const isServer = typeof window === 'undefined'

export function getCookieFromDocument(name: string): string | null {
  if (isServer) return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }

  return null
}

export function getCookieFromCookiesObject(
  cookies: CookieStore,
  name: string,
): string | null {
  if (!cookies) return null

  if (cookies.get) {
    const cookie = cookies.get(name)
    if (typeof cookie === 'string') return cookie
    if (cookie && typeof cookie === 'object' && 'value' in cookie) {
      const v = (cookie as { value?: string }).value
      return v || null
    }
    return null
  }

  const raw = cookies[name]
  if (typeof raw === 'string') return raw
  if (raw && typeof raw === 'object') {
    const val = (raw as { value?: unknown }).value
    if (typeof val === 'string') return val
    return null
  }
  return null
}

export function getAccessToken(cookies?: CookieStore): string | null {
  if (isServer && cookies) {
    return getCookieFromCookiesObject(cookies, BEARER_ACCESS_TOKEN_COOKIE)
  }

  if (!isServer) {
    return cookieManager.getAccessToken()
  }

  return null
}

export function getRefreshToken(cookies?: CookieStore): string | null {
  if (isServer && cookies) {
    return getCookieFromCookiesObject(cookies, BEARER_REFRESH_TOKEN_COOKIE)
  }

  if (!isServer) {
    return cookieManager.getRefreshToken()
  }

  return null
}

export function getAuthTokens(cookies?: CookieStore): AuthTokens | null {
  if (isServer && cookies) {
    const accessToken = getCookieFromCookiesObject(
      cookies,
      BEARER_ACCESS_TOKEN_COOKIE,
    )
    const refreshToken = getCookieFromCookiesObject(
      cookies,
      BEARER_REFRESH_TOKEN_COOKIE,
    )

    if (!accessToken) return null

    return {
      accessToken,
      refreshToken: refreshToken || undefined,
    }
  }

  if (!isServer) {
    return cookieManager.getAuthTokens()
  }

  return null
}

import { isAxiosError } from 'axios'

export function formatApiError(error: unknown): string {
  if (!isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : 'Đã xảy ra lỗi không xác định'
  }

  const data = error.response?.data as
    | { message?: string; errors?: string[] }
    | undefined

  if (data?.message) {
    return data.message
  }

  if (data?.errors && data.errors.length > 0) {
    return data.errors.join(', ')
  }

  return `Lỗi HTTP ${error.response?.status}: ${error.response?.statusText}`
}

export function isUnauthorizedError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401
}

export function isServerError(error: unknown): boolean {
  const status = isAxiosError(error) ? error.response?.status : undefined
  return typeof status === 'number' && status >= 500 && status < 600
}

export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AxiosServer${context ? ` - ${context}` : ''}]:`, error)
  }
}
