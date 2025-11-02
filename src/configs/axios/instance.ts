import { AxiosInstance, isAxiosError } from 'axios'
import { ApiResponse, CustomAxiosRequestConfig } from './types'
import { instanceClientAxios } from './axiosClient'
import { logError } from './utils'

export async function apiRequest<T = unknown>(
  config: CustomAxiosRequestConfig,
  instance: AxiosInstance = instanceClientAxios,
): Promise<ApiResponse<T>> {
  try {
    const response = await instance(config)
    return {
      ...response.data,
      success: true,
    }
  } catch (error: unknown) {
    logError(error, 'API Request')
    const data = isAxiosError(error)
      ? (error.response?.data as Partial<ApiResponse<T>> | undefined)
      : undefined
    return {
      ...(data ?? {}),
      success: false,
    } as ApiResponse<T>
  }
}
