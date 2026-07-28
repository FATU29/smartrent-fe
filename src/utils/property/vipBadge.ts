import { VipType } from '@/api/types/property.type'

// Solid, dark per-tier colors with white text — shared across every listing
// card (PropertyCard, SimplePropertyCard, MapPropertyCard, CardListingAIMini)
// so the VIP badge reads consistently wherever a listing card appears.
export const VIP_BADGE_CLASSNAMES: Partial<Record<VipType, string>> = {
  SILVER: 'bg-gray-600 text-white',
  GOLD: 'bg-amber-700 text-white',
  DIAMOND: 'bg-blue-700 text-white',
}

export const getVipBadgeClassName = (vipType?: string | null): string =>
  vipType ? VIP_BADGE_CLASSNAMES[vipType as VipType] || '' : ''

export const isVipTierShown = (vipType?: string | null): boolean =>
  !!vipType && vipType !== 'NORMAL'

export const VIP_BORDER_CLASSNAMES: Partial<Record<VipType, string>> = {
  SILVER: 'ring-1 ring-gray-300/50',
  GOLD: 'ring-1 ring-yellow-400/50',
  DIAMOND: 'ring-1 ring-blue-400/50',
}

export const getVipBorderClassName = (vipType?: string | null): string =>
  vipType ? VIP_BORDER_CLASSNAMES[vipType as VipType] || '' : ''
