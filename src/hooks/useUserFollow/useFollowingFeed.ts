import { useQuery } from '@tanstack/react-query'
import { ListingService } from '@/api/services'
import { useAuth } from '@/hooks/useAuth'
import { mapBackendToFrontendResponse } from '@/utils/property/mapListingResponse'

/**
 * Paginated feed of listings posted by users the current viewer follows.
 * Newest first, public listings only. Auth-required on the server.
 *
 * Pass {@code userId} to narrow to a single followed user — useful for the
 * "show only this person's posts" filter on the /following page. The server
 * silently returns an empty page if the viewer is not actually following the
 * given userId, so this can't be used to read arbitrary users' feeds.
 *
 * Pass {@code enabled: false} to hold the query until the caller knows which
 * user to scope to. The /following page defaults the feed to its first followed
 * person, but that id is only known after the people list resolves — firing the
 * request before then would query the whole follow set and immediately discard
 * the result, an extra (and more expensive, IN-list) round-trip on every visit.
 */
export const useFollowingFeed = (
  page = 1,
  size = 12,
  userId?: string,
  options?: { enabled?: boolean },
) => {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: [
      'user-follow',
      'feed',
      page,
      size,
      userId ?? 'all',
      isAuthenticated,
    ],
    queryFn: async () => {
      const response = await ListingService.getMyFollowingFeed(
        page,
        size,
        userId,
      )
      if (!response?.success || !response?.data) {
        // Surface server-side message so the UI can render a clear error state.
        throw new Error(response?.message || 'Failed to load following feed')
      }
      return mapBackendToFrontendResponse(response.data)
    },
    enabled: isAuthenticated && (options?.enabled ?? true),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
