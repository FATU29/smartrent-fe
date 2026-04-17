import { PATHS } from '@/api/paths'
import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import type { RecommendationResponse } from '../types/recommendation.type'

export class RecommendationService {
  static async getSimilar(
    listingId: number,
    topN = 10,
  ): Promise<ApiResponse<RecommendationResponse>> {
    const url = PATHS.RECOMMENDATION.SIMILAR.replace(
      ':listingId',
      listingId.toString(),
    )

    const response = await apiRequest<RecommendationResponse>({
      method: 'GET',
      url,
      params: { topN },
    })

    return {
      ...response,
      data: response.data || {
        listings: [],
        mode: 'similar_fallback',
        totalReturned: 0,
        coldStart: false,
      },
    }
  }

  static async getPersonalized(
    topN = 5,
  ): Promise<ApiResponse<RecommendationResponse>> {
    const response = await apiRequest<RecommendationResponse>({
      method: 'GET',
      url: PATHS.RECOMMENDATION.PERSONALIZED,
      params: { topN },
    })

    return {
      ...response,
      data: response.data || {
        listings: [],
        mode: 'cold_start',
        totalReturned: 0,
        coldStart: true,
      },
    }
  }
}
