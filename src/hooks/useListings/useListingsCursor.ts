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
  const {
    enabled = true,
    size = 20,
    staleTime = 5 * 60 * 1000,
    gcTime = 10 * 60 * 1000,
  } = options || {}

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
  })

  // Flattened convenience view of every page loaded so far.
  const listings: ListingDetail[] =
    query.data?.pages.flatMap((page) => page.items) ?? []

  return { ...query, listings }
}
