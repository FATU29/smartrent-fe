import { PATHS } from '@/api/paths'
import type {
  ListingDescriptionRequest,
  ListingDescriptionResponse,
} from '@/api/types/ai.type'
import type { ApiResponse } from '@/configs/axios/types'
import { apiRequest } from '@/configs/axios/instance'

export class AiService {
  static async generateListingDescription(
    request: ListingDescriptionRequest,
  ): Promise<ApiResponse<ListingDescriptionResponse>> {
    const response = await apiRequest<ListingDescriptionResponse>({
      method: 'POST',
      url: PATHS.AI.LISTING_DESCRIPTION,
      data: request,
    })

    return response
  }
}

export const { generateListingDescription } = AiService
