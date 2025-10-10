/**
 * Client-side cookie utilities
 * Provides a clean API for managing cookies in the browser
 */

export interface CookieOptions {
  expires?: Date | number // Date object or days from now
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  httpOnly?: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

class CookieManager {
  private readonly isClient = typeof window !== 'undefined'

  /**
   * Set a cookie with options
   */
  set(name: string, value: string, options: CookieOptions = {}): void {
    if (!this.isClient) return

    const {
      expires,
      path = '/',
      domain,
      secure = true,
      sameSite = 'strict',
      httpOnly = false,
    } = options

    let cookieString = `${name}=${value}`

    // Handle expires
    if (expires) {
      if (typeof expires === 'number') {
        // Days from now
        const date = new Date()
        date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000)
        cookieString += `; expires=${date.toUTCString()}`
      } else {
        // Date object
        cookieString += `; expires=${expires.toUTCString()}`
      }
    }

    // Add other options
    cookieString += `; path=${path}`

    if (domain) {
      cookieString += `; domain=${domain}`
    }

    if (secure) {
      cookieString += `; secure`
    }

    cookieString += `; samesite=${sameSite}`

    if (httpOnly) {
      cookieString += `; httponly`
    }

    document.cookie = cookieString
  }

  /**
   * Get a cookie value by name
   */
  get(name: string): string | null {
    if (!this.isClient) return null

    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)

    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }

    return null
  }

  /**
   * Remove a cookie by name
   */
  remove(
    name: string,
    options: Pick<CookieOptions, 'path' | 'domain'> = {},
  ): void {
    if (!this.isClient) return

    const { path = '/', domain } = options

    let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`

    if (domain) {
      cookieString += `; domain=${domain}`
    }

    document.cookie = cookieString
  }

  /**
   * Check if a cookie exists
   */
  has(name: string): boolean {
    return this.get(name) !== null
  }

  /**
   * Get all cookies as an object
   */
  getAll(): Record<string, string> {
    if (!this.isClient) return {}

    const cookies: Record<string, string> = {}

    if (document.cookie) {
      document.cookie.split(';').forEach((cookie) => {
        const [name, value] = cookie.trim().split('=')
        if (name && value) {
          cookies[name] = decodeURIComponent(value)
        }
      })
    }

    return cookies
  }

  /**
   * Clear all cookies (use with caution)
   */
  clearAll(): void {
    if (!this.isClient) return

    const cookies = this.getAll()
    Object.keys(cookies).forEach((name) => {
      this.remove(name)
    })
  }

  // Auth-specific methods
  /**
   * Set authentication tokens
   */
  setAuthTokens(tokens: AuthTokens): void {
    this.set('access_token', tokens.accessToken, {
      expires: 7, // 7 days
      secure: true,
      sameSite: 'strict',
    })

    if (tokens.refreshToken) {
      this.set('refresh_token', tokens.refreshToken, {
        expires: 30, // 30 days
        secure: true,
        sameSite: 'strict',
      })
    }
  }

  /**
   * Get authentication tokens
   */
  getAuthTokens(): AuthTokens | null {
    const accessToken = this.get('access_token')

    if (!accessToken) return null

    const refreshToken = this.get('refresh_token')

    return {
      accessToken,
      refreshToken: refreshToken || undefined,
    }
  }

  /**
   * Clear authentication tokens
   */
  clearAuthTokens(): void {
    this.remove('access_token')
    this.remove('refresh_token')
  }

  /**
   * Check if user is authenticated (has access token)
   */
  isAuthenticated(): boolean {
    return this.has('access_token')
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.get('access_token')
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.get('refresh_token')
  }
}

// Export singleton instance
export const cookieManager = new CookieManager()

// Export class for testing
export { CookieManager }

// Convenience exports
export const setCookie = (
  name: string,
  value: string,
  options?: CookieOptions,
) => cookieManager.set(name, value, options)

export const getCookie = (name: string) => cookieManager.get(name)

export const removeCookie = (
  name: string,
  options?: Pick<CookieOptions, 'path' | 'domain'>,
) => cookieManager.remove(name, options)

export const hasCookie = (name: string) => cookieManager.has(name)

export const getAllCookies = () => cookieManager.getAll()

// Auth convenience exports
export const setAuthTokens = (tokens: AuthTokens) =>
  cookieManager.setAuthTokens(tokens)

export const getAuthTokens = () => cookieManager.getAuthTokens()

export const clearAuthTokens = () => cookieManager.clearAuthTokens()

export const isAuthenticated = () => cookieManager.isAuthenticated()

export const getAccessToken = () => cookieManager.getAccessToken()

export const getRefreshToken = () => cookieManager.getRefreshToken()
