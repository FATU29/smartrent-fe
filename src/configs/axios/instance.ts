import { AxiosInstance, isAxiosError } from 'axios'
import { ApiResponse, CustomAxiosRequestConfig } from './types'
import { instanceClientAxios } from './axiosClient'
import { logError } from './utils'
import { ENV } from '@/constants'

export async function apiRequest<T = unknown>(
  config: CustomAxiosRequestConfig,
  instance: AxiosInstance = instanceClientAxios,
): Promise<ApiResponse<T>> {
  try {
    const isServer = typeof window === 'undefined'
    if (isServer) {
      console.log('[API Request]:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: instance.defaults.baseURL,
        fullURL: `${instance.defaults.baseURL}${config.url}`,
        hasData: !!config.data,
        hasParams: !!config.params,
      })
    }

    const response = await instance(config)

    if (isServer) {
      console.log('[API Response]:', {
        url: config.url,
        status: response.status,
        code: response.data?.code,
        success: true,
      })
    }

    return {
      ...response.data,
      success: true,
    }
  } catch (error: unknown) {
    if (!ENV.IS_PRODUCTION) {
      logError(error, 'API Request')
    }
    const data = isAxiosError(error)
      ? (error.response?.data as Partial<ApiResponse<T>> | undefined)
      : undefined
    return {
      ...(data ?? {}),
      success: false,
    } as ApiResponse<T>
  }
}
