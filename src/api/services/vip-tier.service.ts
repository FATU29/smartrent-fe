import { apiRequest } from '@/configs/axios/instance'
import { PATHS } from '@/api/paths'
import type { ApiResponse } from '@/configs/axios/types'
import type { VipTier, VipTierCode } from '@/api/types/vip-tier.type'

export class VipTierService {
  /**
   * Get all active VIP tiers
   */
  static async getActive(): Promise<ApiResponse<VipTier[]>> {
    return apiRequest<VipTier[]>({
      url: PATHS.VIP_TIER.ACTIVE,
      method: 'GET',
    })
  }

  /**
   * Get VIP tier by code
   */
  static async getByCode(
    tierCode: VipTierCode | string,
  ): Promise<ApiResponse<VipTier>> {
    const url = PATHS.VIP_TIER.BY_CODE.replace(':tierCode', tierCode)
    return apiRequest<VipTier>({
      url,
      method: 'GET',
    })
  }

  /**
   * Get all VIP tiers (including inactive)
   */
  static async getAll(): Promise<ApiResponse<VipTier[]>> {
    return apiRequest<VipTier[]>({
      url: PATHS.VIP_TIER.ALL,
      method: 'GET',
    })
  }
}
