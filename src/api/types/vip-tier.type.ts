export interface VipTier {
  tierId: number
  tierCode: string
  tierName: string
  tierNameEn: string
  tierLevel: number
  pricePerDay: number
  price10Days: number
  price15Days: number
  price30Days: number
  maxImages: number
  maxVideos: number
  hasBadge: boolean
  badgeName?: string
  badgeColor?: string
  autoApprove: boolean
  noAds: boolean
  priorityDisplay: boolean
  hasShadowListing: boolean
  description?: string
  features?: string[]
  isActive: boolean
  displayOrder?: number
}

export type VipTierCode = 'NORMAL' | 'SILVER' | 'GOLD' | 'DIAMOND'
