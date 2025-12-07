import { useQuery } from '@tanstack/react-query'
import { SavedListingService } from '@/api/services'
import { SAVED_LISTING_QUERY_KEYS } from '@/api/types'

/**
 * Hook to fetch user's saved listings with pagination
 * GET /v1/saved-listings/my-saved
 */
export const useGetMySavedListings = (
  page: number = 1,
  size: number = 10,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: SAVED_LISTING_QUERY_KEYS.list(page, size),
    queryFn: () => SavedListingService.getMySaved({ page, size }),
    enabled,
    staleTime: 60000, // Cache for 1 minute
  })
}
