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
 * Each carousel calls POST /v1/listings/search with only the params that vary —
 * vipType is pinned, everything else is fixed (verified=true, page=1, a small
 * size, optional NEWEST sort). No user coordinates are sent: the tier carousels
 * aren't ranked by distance, and omitting them keeps the request identical
 * across all users so the backend's listing-search cache is actually shared
 * (a per-user coordinate would mint a fresh cache key for the same result).
 */
export const useRecommendedListingsByVip = (
  options: UseRecommendedListingsByVipOptions,
): UseRecommendedListingsByVipReturn => {
  const { vipType, page = 1, size = 4, enabled = true, sortBy } = options

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['recommended-listings-by-vip', vipType, sortBy, page, size],
    queryFn: async () => {
      const response = await ListingService.search({
        vipType,
        verified: true,
        page,
        size,
        ...(sortBy ? { sortBy: sortBy as any } : {}),
      })

      const listings = response.data?.listings || []

      return listings
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
