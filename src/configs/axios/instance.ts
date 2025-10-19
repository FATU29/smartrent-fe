import { AxiosInstance } from 'axios'
import { ApiResponse, CustomAxiosRequestConfig } from './types'
import { instanceClientAxios } from './axiosClient'
import { logError } from './utils'

export async function apiRequest<T = any>(
  config: CustomAxiosRequestConfig,
  instance: AxiosInstance = instanceClientAxios,
): Promise<ApiResponse<T>> {
  try {
    const response = await instance(config)
    return {
      ...response.data,
      success: true,
    }
  } catch (error: any) {
    logError(error, 'API Request')
    return {
      ...error?.response?.data,
      success: false,
    }
  }
}
