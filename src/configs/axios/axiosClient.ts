import axios, { AxiosInstance } from 'axios'
import { ENV } from '@/constants'
import { AxiosInstanceConfig, CustomAxiosRequestConfig } from './types'
import { setupInterceptors } from './interceptors'
import { apiRequest } from './instance'

function createClientAxiosInstance(
  config: Partial<AxiosInstanceConfig> = {},
): AxiosInstance {
  const { baseURL = ENV.URL_API_BASE, timeout = 60000, errorHandler } = config

  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    maxBodyLength: 200 * 1024 * 1024, // 200MB
    maxContentLength: 200 * 1024 * 1024, // 200MB
  })

  setupInterceptors(instance, undefined)

  if (errorHandler) {
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        errorHandler(error)
        return
      },
    )
  }

  return instance
}

export const instanceClientAxios = createClientAxiosInstance()

export const api = {
  get: <T = unknown>(url: string, config?: CustomAxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'GET', url }),

  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: CustomAxiosRequestConfig,
  ) => apiRequest<T>({ ...config, method: 'POST', url, data }),

  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: CustomAxiosRequestConfig,
  ) => apiRequest<T>({ ...config, method: 'PUT', url, data }),

  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: CustomAxiosRequestConfig,
  ) => apiRequest<T>({ ...config, method: 'PATCH', url, data }),

  delete: <T = unknown>(url: string, config?: CustomAxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'DELETE', url }),
}
