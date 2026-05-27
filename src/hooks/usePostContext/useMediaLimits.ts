import { useMemo } from 'react'
import { useVipTiers } from '@/hooks/useVipTiers'
import type { VipType } from '@/api/types/property.type'
import type { VipTier } from '@/api/types/vip-tier.type'

export const MIN_IMAGES = 4
export const MAX_VIDEOS = 1
const FALLBACK_MAX_IMAGES = 24

export interface MediaLimits {
  minImages: number
  maxImages: number
  maxVideos: number
  tier?: VipTier
  isLoading: boolean
}

export const useMediaLimits = (vipType?: VipType | string): MediaLimits => {
  const { data: vipTiers = [], isLoading } = useVipTiers()

  return useMemo(() => {
    const matched = vipType
      ? vipTiers.find((t) => t.tierCode === vipType)
      : undefined
    // Fall back to the lowest tier so the Media step can show a meaningful
    // limit even before the user reaches the package step.
    const tier = matched ?? vipTiers[0]

    return {
      minImages: MIN_IMAGES,
      maxImages: tier?.maxImages ?? FALLBACK_MAX_IMAGES,
      maxVideos: MAX_VIDEOS,
      tier,
      isLoading,
    }
  }, [vipTiers, vipType, isLoading])
}
