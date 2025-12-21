import { apiRequest } from '@/configs/axios/instance'
import { PATHS } from '@/api/paths'
import type { ApiResponse } from '@/configs/axios/types'
import type {
  GetActivePushDetailsResponse,
  GetPushDetailByCodeResponse,
  GetAllPushDetailsResponse,
  PushDetailCode,
  PushDetail,
  PushListingRequest,
  PushListingResponse,
} from '@/api/types/push.type'

export class PushService {
  /**
   * Get all active push details and packages
   * @returns Promise with active push details wrapped in ApiResponse
   * @example
   * ```ts
   * const response = await PushService.getActivePushDetails()
   * console.log(response.data.data) // Array of active push details
   * ```
   */
  static async getActivePushDetails(): Promise<
    ApiResponse<GetActivePushDetailsResponse>
  > {
    return apiRequest<GetActivePushDetailsResponse>({
      url: PATHS.PUSH.ACTIVE_DETAILS,
      method: 'GET',
    })
  }

  /**
   * Get push detail by detail code
   * @param detailCode - Push detail code (SINGLE_PUSH, PUSH_PACKAGE_3, etc.)
   * @returns Promise with push detail wrapped in ApiResponse
   * @example
   * ```ts
   * const response = await PushService.getPushDetailByCode('SINGLE_PUSH')
   * console.log(response.data.data) // Single push detail
   * ```
   */
  static async getPushDetailByCode(
    detailCode: PushDetailCode | string,
  ): Promise<ApiResponse<GetPushDetailByCodeResponse>> {
    const url = PATHS.PUSH.DETAIL_BY_CODE.replace(':detailCode', detailCode)
    return apiRequest<GetPushDetailByCodeResponse>({
      url,
      method: 'GET',
    })
  }

  /**
   * Get all push details including inactive ones
   * @returns Promise with all push details wrapped in ApiResponse
   * @example
   * ```ts
   * const response = await PushService.getAllPushDetails()
   * console.log(response.data) // Array of all push details (including inactive)
   * ```
   */
  static async getAllPushDetails(): Promise<
    ApiResponse<GetAllPushDetailsResponse>
  > {
    return apiRequest<GetAllPushDetailsResponse>({
      url: PATHS.PUSH.ALL_DETAILS,
      method: 'GET',
    })
  }

  /**
   * Transform API push detail to UI format
   * @param pushDetail - Push detail from API
   * @param locale - Current locale ('vi' | 'en')
   * @returns Transformed push detail for UI
   */
  static transformPushDetail(
    pushDetail: PushDetail,
    locale: string = 'vi',
  ): PushDetail & { displayName: string } {
    return {
      ...pushDetail,
      displayName:
        locale === 'en' ? pushDetail.detailNameEn : pushDetail.detailName,
    }
  }

  /**
   * Push a listing to the top (with payment or membership quota)
   * @param request - Push listing request containing listingId, useMembershipQuota, and paymentProvider
   * @returns Promise with payment URL if payment required, or confirmation if quota used
   * @example
   * ```ts
   * // Direct payment
   * const response = await PushService.pushListing({
   *   listingId: 123,
   *   useMembershipQuota: false,
   *   paymentProvider: 'VNPAY'
   * })
   * if (response.data.paymentUrl) {
   *   window.location.href = response.data.paymentUrl
   * }
   *
   * // Use membership quota
   * const response = await PushService.pushListing({
   *   listingId: 123,
   *   useMembershipQuota: true
   * })
   * console.log(response.data.message) // "Push successful"
   * ```
   */
  static async pushListing(
    request: PushListingRequest,
  ): Promise<ApiResponse<PushListingResponse>> {
    return apiRequest<PushListingResponse>({
      url: PATHS.PUSHES.PUSH,
      method: 'POST',
      data: request,
    })
  }
}
