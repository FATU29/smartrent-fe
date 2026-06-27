import { useInfiniteQuery } from '@tanstack/react-query'
import { ListingService } from '@/api/services/listing.service'
import { mapFrontendToBackendRequest } from '@/utils/property/mapListingResponse'
import type { ListingFilterRequest, ListingDetail } from '@/api/types'

interface UseListingsCursorOptions {
  enabled?: boolean
  size?: number
  staleTime?: number
  gcTime?: number
}

/**
 * Cursor (keyset) paginated listings — the load-more / infinite-scroll companion
 * to {@link useListingsSearch}. Backed by POST /v1/listings/search/cursor, which
 * has the same filters/sort as the offset search but pages by an opaque cursor
 * with no COUNT(*), so deep scrolls stay fast.
 *
 * Self-contained on purpose: the shared offset List context (numbered pages +
 * total count, used across many pages) is left untouched. A page that wants
 * cursor paging consumes this hook directly and renders a "load more" button or
 * an IntersectionObserver calling `fetchNextPage`.
 */
export const useListingsCursor = (
  filters: Partial<ListingFilterRequest>,
  options?: UseListingsCursorOptions,
) => {
  // No FE caching by default: listings can be pushed ("đẩy tin"), which bumps
  // them to the top of the newest-first ordering. A stale cache would hide a
  // freshly-pushed listing until it expired, so we always refetch fresh and
  // retain nothing once the list unmounts. Callers may still opt into caching
  // by passing staleTime/gcTime explicitly.
  const { enabled = true, size = 20, staleTime = 0, gcTime = 0 } = options || {}

  const query = useInfiniteQuery({
    queryKey: ['listings', 'cursor', filters, size],
    queryFn: async ({ pageParam }) => {
      const backendRequest = mapFrontendToBackendRequest(filters)
      const response = await ListingService.searchCursor(
        backendRequest,
        pageParam,
        size,
      )
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to load listings')
      }
      return response.data
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    enabled,
    staleTime,
    gcTime,
    refetchOnMount: 'always',
  })

  // Flattened convenience view of every page loaded so far.
  const listings: ListingDetail[] =
    query.data?.pages.flatMap((page) => page.items) ?? []

  return { ...query, listings }
}
