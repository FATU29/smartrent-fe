import { BENEFIT_TYPE_TO_VIP_TYPE } from '@/utils/createPost/benefitTier'
import type { MembershipBenefit } from '@/api/types/membership.type'
import type { VipType } from '@/api/types/property.type'
import type { VipTier } from '@/api/types/vip-tier.type'

const VIP_TYPE_RANK: Record<VipType, number> = {
  NORMAL: 0,
  SILVER: 1,
  GOLD: 2,
  DIAMOND: 3,
}

/** Highest VIP tier among a package's post benefits — used to look up the
 *  real photo limit for that tier instead of hardcoding a number in copy. */
export const getHighestVipType = (
  benefits: readonly MembershipBenefit[],
): VipType | undefined =>
  benefits.reduce<VipType | undefined>((highest, benefit) => {
    const vipType = BENEFIT_TYPE_TO_VIP_TYPE[benefit.benefitType]
    if (!vipType) return highest
    if (!highest || VIP_TYPE_RANK[vipType] > VIP_TYPE_RANK[highest]) {
      return vipType
    }
    return highest
  }, undefined)

export const getMaxImagesForVipType = (
  vipTiers: readonly VipTier[],
  vipType: VipType | undefined,
): number | undefined =>
  vipType
    ? vipTiers.find((tier) => tier.tierCode === vipType)?.maxImages
    : undefined
