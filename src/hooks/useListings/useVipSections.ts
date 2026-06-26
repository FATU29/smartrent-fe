import { useQuery } from '@tanstack/react-query'
import { ListingService } from '@/api/services/listing.service'
import { ListingDetail, ListingSectionRequestItem, VipType } from '@/api/types'

type VipSectionsMap = Partial<Record<VipType, ListingDetail[]>>

interface UseVipSectionsOptions {
  enabled?: boolean
  /** Shared page size for every section (a section may still override its own). */
  size?: number
}

interface UseVipSectionsReturn {
  sectionsMap: VipSectionsMap
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Fetches all homepage VIP-tier carousels in ONE request via
 * POST /v1/listings/search/sections, instead of one search call per tier.
 *
 * Returns a map keyed by vipType. The promoted-listing ordering is identical to
 * the per-tier calls — the backend runs each section through the same
 * searchListings pipeline. No geolocation is sent (tiers aren't ranked by
 * distance), so results are shared across all users and cache well.
 */
export const useVipSections = (
  sections: ListingSectionRequestItem[],
  options: UseVipSectionsOptions = {},
): UseVipSectionsReturn => {
  const { enabled = true, size = 10 } = options

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      'vip-sections',
      size,
      sections
        .map((s) => `${s.vipType}:${s.sortBy ?? ''}:${s.size ?? ''}`)
        .join('|'),
    ],
    queryFn: async () => {
      const response = await ListingService.searchSections({
        verified: true,
        page: 1,
        size,
        sections,
      })

      const map: VipSectionsMap = {}
      for (const section of response.data?.sections ?? []) {
        map[section.vipType] = section.result?.listings ?? []
      }
      return map
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return {
    sectionsMap: data ?? {},
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  }
}
