import { VipType } from '@/api/types/property.type'

// Per-tier colors with white text — shared across every listing card
// (PropertyCard, SimplePropertyCard, MapPropertyCard, CardListingAIMini) so
// the VIP badge reads consistently wherever a listing card appears. DIAMOND
// (the top tier) uses the brand primary color directly; SILVER/GOLD are
// picked at a similar lightness so none of the three reads muddier or
// louder than the others.
export const VIP_BADGE_CLASSNAMES: Partial<Record<VipType, string>> = {
  SILVER: 'bg-slate-500 text-white',
  GOLD: 'bg-amber-500 text-white',
  DIAMOND: 'bg-primary text-primary-foreground',
}

export const getVipBadgeClassName = (vipType?: string | null): string =>
  vipType ? VIP_BADGE_CLASSNAMES[vipType as VipType] || '' : ''

export const isVipTierShown = (vipType?: string | null): boolean =>
  !!vipType && vipType !== 'NORMAL'

export const VIP_BORDER_CLASSNAMES: Partial<Record<VipType, string>> = {
  SILVER: 'ring-1 ring-slate-400/50',
  GOLD: 'ring-1 ring-amber-400/50',
  DIAMOND: 'ring-1 ring-primary/40',
}

export const getVipBorderClassName = (vipType?: string | null): string =>
  vipType ? VIP_BORDER_CLASSNAMES[vipType as VipType] || '' : ''
