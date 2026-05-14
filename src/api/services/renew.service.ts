import { apiRequest } from '@/configs/axios/instance'
import { PATHS } from '@/api/paths'
import type { ApiResponse } from '@/configs/axios/types'
import type {
  RenewListingRequest,
  RenewListingResponse,
} from '@/api/types/renew.type'

export class RenewService {
  /**
   * Renew (gia hạn) an active listing by +30 days, cumulatively. Always
   * quota-only — consumes one credit of the listing's current VIP tier
   * benefit. NORMAL listings cannot be renewed.
   */
  static async renewListing(
    request: RenewListingRequest,
  ): Promise<ApiResponse<RenewListingResponse>> {
    return apiRequest<RenewListingResponse>({
      url: PATHS.REPOSTS.RENEW,
      method: 'POST',
      data: request,
    })
  }
}
