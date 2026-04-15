import { apiRequest } from '@/configs/axios/instance'
import { PATHS } from '@/api/paths'
import type { ApiResponse } from '@/configs/axios/types'
import type {
  BrokerRegisterRequest,
  BrokerStatusResponse,
} from '@/api/types/broker.type'

export class BrokerService {
  static async getStatus(): Promise<ApiResponse<BrokerStatusResponse>> {
    return apiRequest<BrokerStatusResponse>({
      method: 'GET',
      url: PATHS.BROKER.STATUS,
    })
  }

  static async register(
    payload: BrokerRegisterRequest,
  ): Promise<ApiResponse<BrokerStatusResponse>> {
    return apiRequest<BrokerStatusResponse>({
      method: 'POST',
      url: PATHS.BROKER.REGISTER,
      data: payload,
    })
  }
}

export const { getStatus, register } = BrokerService
