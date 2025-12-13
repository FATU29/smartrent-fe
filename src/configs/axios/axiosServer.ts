import axios, { AxiosInstance } from 'axios'
import { ENV } from '@/constants'
import { AxiosInstanceConfig, CookieStore } from './types'
import { setupInterceptors } from './interceptors'

/**
 * Parse cookie string from request headers into CookieStore format
 */
export function parseCookieString(cookieString?: string): CookieStore {
  if (!cookieString) return {}

  const cookies: Record<string, string> = {}
  cookieString.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.split('=')
    if (name && rest.length > 0) {
      cookies[name.trim()] = rest.join('=').trim()
    }
  })

  return cookies
}

function createServerAxiosInstance(
  cookies?: CookieStore | string,
): AxiosInstance {
  const cookieStore =
    typeof cookies === 'string' ? parseCookieString(cookies) : cookies
  const config: Partial<AxiosInstanceConfig> = {
    baseURL: ENV.URL_API_BASE,
    timeout: 60000,
    withCredentials: false,
  }

  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    withCredentials: config.withCredentials,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  setupInterceptors(instance, cookieStore)

  return instance
}

export { createServerAxiosInstance }

export const instanceServerAxios = createServerAxiosInstance()
