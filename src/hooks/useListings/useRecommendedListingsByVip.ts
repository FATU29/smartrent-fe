import { useQuery } from '@tanstack/react-query'
import { ListingService } from '@/api/services/listing.service'
import { ListingDetail, VipType } from '@/api/types'

interface UseRecommendedListingsByVipOptions {
  vipType: VipType
  page?: number
  size?: number
  enabled?: boolean
  sortBy?: string
}

interface UseRecommendedListingsByVipReturn {
  listings: ListingDetail[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook to fetch listings for a single VIP tier (one homepage carousel).
 *
 * Calls the dedicated GET /v1/listings/homepage-tier endpoint, which returns the
 * top N of one tier with NO paging and NO total count — much faster than the
 * paginated POST /search (whose COUNT(*) over the huge NORMAL tier was the cause
 * of the slow "Tin mới" section). vipType is pinned; no coordinates are sent
 * (tiers aren't ranked by distance), so the backend response caches across all
 * users. Ordering (newest-first within tier) preserves push: a pushed listing
 * bumps updatedAt and rises to the top, same as the old search path.
 */
export const useRecommendedListingsByVip = (
  options: UseRecommendedListingsByVipOptions,
): UseRecommendedListingsByVipReturn => {
  const { vipType, page = 1, size = 4, enabled = true, sortBy } = options

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['recommended-listings-by-vip', vipType, sortBy, page, size],
    queryFn: async () => {
      const response = await ListingService.getHomepageTier(vipType, size)
      return response.data || []
    },
    enabled: enabled,
    // Even the NEWEST (sorted) carousel gets a non-zero staleTime so re-mounting
    // doesn't refetch every render; 2 min is fresh enough for "newest".
    staleTime: sortBy ? 2 * 60 * 1000 : 5 * 60 * 1000,
    gcTime: sortBy ? 5 * 60 * 1000 : 10 * 60 * 1000,
  })

  return {
    listings: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  }
}
