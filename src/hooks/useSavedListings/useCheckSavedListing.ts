import { useQuery } from '@tanstack/react-query'
import { SavedListingService } from '@/api/services'
import { SAVED_LISTING_QUERY_KEYS } from '@/api/types'

/**
 * Hook to check if a listing is saved by the current user
 * GET /v1/saved-listings/check/:listingId
 */
export const useCheckSavedListing = (
  listingId: number | null | undefined,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: listingId
      ? SAVED_LISTING_QUERY_KEYS.check(listingId)
      : ['saved-listings', 'check', 'null'],
    queryFn: async () => {
      if (!listingId) return { data: false }
      const response = await SavedListingService.checkIsSaved(listingId)
      return response
    },
    enabled: enabled && !!listingId,
    staleTime: 30000, // Cache for 30 seconds
  })
}
