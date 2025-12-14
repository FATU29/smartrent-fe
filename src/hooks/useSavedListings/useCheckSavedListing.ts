import { useQuery } from '@tanstack/react-query'
import { SavedListingService } from '@/api/services'
import { SAVED_LISTING_QUERY_KEYS } from '@/api/types'
import { useAuth } from '@/hooks/useAuth'

/**
 * Hook to check if a listing is saved by the current user
 * GET /v1/saved-listings/check/{listingId}
 * Returns true if saved, false otherwise
 */
export const useCheckSavedListing = (listingId: number | null | undefined) => {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: SAVED_LISTING_QUERY_KEYS.check(listingId ?? 0),
    queryFn: async () => {
      if (!listingId) return false
      const response = await SavedListingService.check(listingId)
      return response?.data ?? false
    },
    enabled: !!listingId && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })
}
