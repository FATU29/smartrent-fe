import { apiRequest } from '@/configs/axios/instance'
import { PATHS } from '@/api/paths'
import type { ApiResponse } from '@/configs/axios/types'
import type { QuotaStatusResponse } from '@/api/types/push.type'

export class QuotaService {
  /**
   * Check push quota availability
   * @returns Promise with push quota status
   * @example
   * ```ts
   * const response = await QuotaService.checkPushQuota()
   * console.log(response.data.totalAvailable) // Number of available pushes
   * ```
   */
  static async checkPushQuota(): Promise<ApiResponse<QuotaStatusResponse>> {
    return apiRequest<QuotaStatusResponse>({
      url: PATHS.QUOTA.CHECK_PUSH,
      method: 'GET',
    })
  }

  /**
   * Check specific quota by benefit type
   * @param benefitType - Benefit type (POST_SILVER, POST_GOLD, POST_DIAMOND, PUSH)
   * @returns Promise with quota status
   * @example
   * ```ts
   * const response = await QuotaService.checkQuota('PUSH')
   * console.log(response.data.totalAvailable)
   * ```
   */
  static async checkQuota(
    benefitType: string,
  ): Promise<ApiResponse<QuotaStatusResponse>> {
    const url = PATHS.QUOTA.CHECK_SPECIFIC.replace(':benefitType', benefitType)
    return apiRequest<QuotaStatusResponse>({
      url,
      method: 'GET',
    })
  }

  /**
   * Check all quotas for the user
   * @returns Promise with all quota statuses
   * @example
   * ```ts
   * const response = await QuotaService.checkAllQuotas()
   * console.log(response.data) // { silverPosts: {...}, goldPosts: {...}, diamondPosts: {...}, pushes: {...} }
   * ```
   */
  static async checkAllQuotas(): Promise<
    ApiResponse<Record<string, QuotaStatusResponse>>
  > {
    return apiRequest<Record<string, QuotaStatusResponse>>({
      url: PATHS.QUOTA.CHECK_ALL,
      method: 'GET',
    })
  }
}
