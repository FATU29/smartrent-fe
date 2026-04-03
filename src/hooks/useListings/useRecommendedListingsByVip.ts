import { useQuery } from '@tanstack/react-query'
import { ListingService } from '@/api/services/listing.service'
import { ListingDetail, VipType } from '@/api/types'
import { useLocationContext } from '@/contexts/location'

interface UseRecommendedListingsByVipOptions {
  vipType: VipType
  page?: number
  size?: number
  enabled?: boolean
  sortBy?: string
  skipVipFilter?: boolean
}

interface UseRecommendedListingsByVipReturn {
  listings: ListingDetail[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook to fetch recommended listings for a specific VIP type based on user's geolocation
 * Used to create separate sections for DIAMOND, GOLD, and SILVER listings
 */
export const useRecommendedListingsByVip = (
  options: UseRecommendedListingsByVipOptions,
): UseRecommendedListingsByVipReturn => {
  const { coordinates } = useLocationContext()
  const {
    vipType,
    page = 1,
    size = 4,
    enabled = true,
    sortBy,
    skipVipFilter = false,
  } = options

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      'recommended-listings-by-vip',
      skipVipFilter ? 'newest' : vipType,
      coordinates?.latitude,
      coordinates?.longitude,
      page,
      size,
    ],
    queryFn: async () => {
      const response = await ListingService.search({
        ...(skipVipFilter ? {} : { vipType }),
        userLatitude: coordinates?.latitude,
        userLongitude: coordinates?.longitude,
        verified: true,
        page,
        size,
        ...(sortBy ? { sortBy: sortBy as any } : {}),
      })

      const listings = response.data?.listings || []

      return listings
    },
    enabled: enabled,
    staleTime: skipVipFilter ? 0 : 5 * 60 * 1000,
    gcTime: skipVipFilter ? 60 * 1000 : 10 * 60 * 1000,
  })

  return {
    listings: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  }
}
