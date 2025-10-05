// Vietnamese listing types (VIP packages and regular)
// These represent different levels of listing visibility and features

export interface ListingType {
  code: string
  name: string
  normalized: string
  tier: 'vip' | 'regular'
  priority: number // Higher number = higher priority
}

// Simple ASCII normalize
const stripDiacritics = (input: string): string =>
  input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()

export const VIETNAM_LISTING_TYPES: ListingType[] = [
  {
    code: 'vip_diamond',
    name: 'VIP Kim Cương',
    normalized: stripDiacritics('VIP Kim Cương'),
    tier: 'vip',
    priority: 4,
  },
  {
    code: 'vip_gold',
    name: 'VIP Vàng',
    normalized: stripDiacritics('VIP Vàng'),
    tier: 'vip',
    priority: 3,
  },
  {
    code: 'vip_silver',
    name: 'VIP Bạc',
    normalized: stripDiacritics('VIP Bạc'),
    tier: 'vip',
    priority: 2,
  },
  {
    code: 'regular',
    name: 'Tin thường',
    normalized: stripDiacritics('Tin thường'),
    tier: 'regular',
    priority: 1,
  },
]

// Utility functions
export const findListingTypeByCode = (code?: string) =>
  VIETNAM_LISTING_TYPES.find((lt) => lt.code === code)

export const getVIPListingTypes = () =>
  VIETNAM_LISTING_TYPES.filter((lt) => lt.tier === 'vip')

export const getRegularListingTypes = () =>
  VIETNAM_LISTING_TYPES.filter((lt) => lt.tier === 'regular')

export const searchListingTypes = (keyword: string) => {
  const k = stripDiacritics(keyword.trim())
  if (!k) return VIETNAM_LISTING_TYPES
  return VIETNAM_LISTING_TYPES.filter(
    (lt) => lt.normalized.includes(k) || lt.code === keyword,
  )
}

export const sortListingTypesByPriority = (types: ListingType[]) =>
  types.toSorted((a, b) => b.priority - a.priority)

export type ListingTypeCode = (typeof VIETNAM_LISTING_TYPES)[number]['code']
