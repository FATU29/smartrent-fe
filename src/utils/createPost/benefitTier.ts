import { BenefitType, type UserBenefit } from '@/api/types/membership.type'
import type { VipType } from '@/api/types/property.type'

const BENEFIT_TYPE_TO_VIP_TYPE: Partial<Record<BenefitType, VipType>> = {
  [BenefitType.POST_NORMAL]: 'NORMAL',
  [BenefitType.POST_STANDARD]: 'NORMAL',
  [BenefitType.POST_SILVER]: 'SILVER',
  [BenefitType.POST_GOLD]: 'GOLD',
  [BenefitType.POST_DIAMOND]: 'DIAMOND',
}

const isVipType = (value: string): value is VipType =>
  value === 'NORMAL' ||
  value === 'SILVER' ||
  value === 'GOLD' ||
  value === 'DIAMOND'

/**
 * The VIP tier a listing created with this benefit runs under — it decides the
 * media limits, exactly as BE's MembershipServiceImpl#resolveTierCode does.
 * Prefers the tier BE resolved; falls back to the benefit type so the flow
 * still works if `vipTierCode` is absent. Undefined for non-post benefits.
 */
export const resolveBenefitVipType = (
  benefit?: UserBenefit,
): VipType | undefined => {
  if (!benefit) return undefined
  if (benefit.vipTierCode && isVipType(benefit.vipTierCode)) {
    return benefit.vipTierCode
  }
  return BENEFIT_TYPE_TO_VIP_TYPE[benefit.benefitType]
}
