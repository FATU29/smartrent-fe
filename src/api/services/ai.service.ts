import { PATHS } from '@/api/paths'
import type {
  ListingDescriptionRequest,
  ListingDescriptionResponse,
  HousingPredictorRequest,
  HousingPredictorResponse,
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

  static async predictHousingPrice(
    request: HousingPredictorRequest,
  ): Promise<ApiResponse<HousingPredictorResponse>> {
    const response = await apiRequest<HousingPredictorResponse>({
      method: 'POST',
      url: PATHS.AI.HOUSING_PREDICTOR,
      data: request,
    })

    return response
  }
}

export const { generateListingDescription, predictHousingPrice } = AiService
