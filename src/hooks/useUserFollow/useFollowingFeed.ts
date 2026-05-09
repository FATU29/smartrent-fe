import { useQuery } from '@tanstack/react-query'
import { ListingService } from '@/api/services'
import { useAuth } from '@/hooks/useAuth'
import { mapBackendToFrontendResponse } from '@/utils/property/mapListingResponse'

/**
 * Paginated feed of listings posted by users the current viewer follows.
 * Newest first, public listings only. Auth-required on the server.
 */
export const useFollowingFeed = (page = 1, size = 12) => {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['user-follow', 'feed', page, size, isAuthenticated],
    queryFn: async () => {
      const response = await ListingService.getMyFollowingFeed(page, size)
      if (!response?.success || !response?.data) {
        // Surface server-side message so the UI can render a clear error state.
        throw new Error(response?.message || 'Failed to load following feed')
      }
      return mapBackendToFrontendResponse(response.data)
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
