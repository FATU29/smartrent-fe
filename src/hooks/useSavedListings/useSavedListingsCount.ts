import { useQuery } from '@tanstack/react-query'
import { SavedListingService } from '@/api/services'
import { SAVED_LISTING_QUERY_KEYS } from '@/api/types'

/**
 * Hook to get the count of saved listings
 * GET /v1/saved-listings/count
 */
export const useSavedListingsCount = (enabled: boolean = true) => {
  return useQuery({
    queryKey: SAVED_LISTING_QUERY_KEYS.count(),
    queryFn: () => SavedListingService.getCount(),
    enabled,
    staleTime: 60000, // Cache for 1 minute
  })
}
