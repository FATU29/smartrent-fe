import { useQuery } from '@tanstack/react-query'
import { ListingService } from '@/api/services/listing.service'
import { ListingDetail, VipType } from '@/api/types'
import { useLocationContext } from '@/contexts/location'

interface UseRecommendedListingsOptions {
  vipTypes?: VipType[]
  page?: number
  size?: number
  enabled?: boolean
}

interface UseRecommendedListingsReturn {
  listings: ListingDetail[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook to fetch recommended listings based on user's geolocation and VIP type preferences
 * Automatically uses user's latitude/longitude from LocationContext
 * Falls back to fetching without location if user hasn't enabled location services
 */
export const useRecommendedListings = (
  options: UseRecommendedListingsOptions = {},
): UseRecommendedListingsReturn => {
  const { coordinates, isEnabled: isLocationEnabled } = useLocationContext()
  const {
    vipTypes = ['DIAMOND', 'GOLD', 'SILVER'],
    page = 1,
    size = 12,
    enabled = true,
  } = options

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      'recommended-listings',
      coordinates?.latitude,
      coordinates?.longitude,
      vipTypes,
      page,
      size,
    ],
    queryFn: async () => {
      // Fetch listings for each VIP type separately, then combine
      const promises = vipTypes.map((vipType) =>
        ListingService.search({
          vipType,
          userLatitude: coordinates?.latitude,
          userLongitude: coordinates?.longitude,
          verified: true,
          page,
          size: Math.ceil(size / vipTypes.length), // Divide size among VIP types
        }),
      )

      const responses = await Promise.all(promises)

      const allListings = responses.flatMap(
        (response) => response.data?.listings || [],
      )

      return allListings
    },
    enabled: enabled && (isLocationEnabled ? !!coordinates : true), // Enable if location is ready or location is disabled
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  return {
    listings: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  }
}
