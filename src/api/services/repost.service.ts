import { apiRequest } from '@/configs/axios/instance'
import { PATHS } from '@/api/paths'
import type { ApiResponse } from '@/configs/axios/types'
import type {
  RepostListingRequest,
  RepostListingResponse,
} from '@/api/types/repost.type'

export class RepostService {
  /**
   * Repost an expired listing — either consume membership post-quota for
   * the listing's vipType (POST_SILVER / POST_GOLD / POST_DIAMOND) or pay
   * the per-day listing fee via VNPay.
   */
  static async repostListing(
    request: RepostListingRequest,
  ): Promise<ApiResponse<RepostListingResponse>> {
    return apiRequest<RepostListingResponse>({
      url: PATHS.REPOSTS.REPOST,
      method: 'POST',
      data: request,
    })
  }
}
