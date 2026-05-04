import { apiRequest } from '@/configs/axios/instance'
import { PATHS } from '@/api/paths'
import type { ApiResponse } from '@/configs/axios/types'
import type {
  TakeDownListingRequest,
  TakeDownResponse,
} from '@/api/types/takeDown.type'

export class TakeDownService {
  static async takeDownListing(
    request: TakeDownListingRequest,
  ): Promise<ApiResponse<TakeDownResponse>> {
    return apiRequest<TakeDownResponse>({
      url: PATHS.TAKE_DOWNS.TAKE_DOWN,
      method: 'POST',
      data: request,
    })
  }
}
