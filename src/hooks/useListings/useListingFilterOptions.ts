import { useQuery } from '@tanstack/react-query'
import { ListingService } from '@/api/services/listing.service'
import { useDebounce } from '@/hooks/useDebounce'
import { mapFrontendToBackendRequest } from '@/utils/property/mapListingResponse'
import type {
  ListingFilterOptionsResponse,
  ListingFilterRequest,
} from '@/api/types'

interface UseListingFilterOptionsOptions {
  enabled?: boolean
  staleTime?: number
  gcTime?: number
  /** Debounce delay (ms) before a filter change triggers a refetch. */
  debounceMs?: number
}

// page/size/sortBy/sortDirection never change bucket counts — dropped from the
// query key so paging/sorting doesn't trigger a refetch of the sidebar.
const PAGING_AND_SORT_KEYS: Array<keyof ListingFilterRequest> = [
  'page',
  'size',
  'sortBy',
  'sortDirection',
]

const omitPagingAndSort = (
  filters: Partial<ListingFilterRequest>,
): Partial<ListingFilterRequest> => {
  const rest: Partial<ListingFilterRequest> = { ...filters }
  PAGING_AND_SORT_KEYS.forEach((key) => {
    delete rest[key]
  })
  return rest
}

/**
 * Dynamic bucket options (price / area / bedrooms) for the public listings
 * sidebar — POST /v1/listings/filter-options. Each bucket carries a live
 * count of listings matching every OTHER active filter, so the sidebar can
 * grey out empty buckets instead of letting the user click into a dead end.
 *
 * Refetches whenever any non-paging filter changes — including price/area/
 * bedrooms themselves, since a bucket's count depends on the OTHER two
 * dimensions' current selection (e.g. selecting an area range changes the
 * price buckets' counts).
 *
 * The filter context is debounced (default 300ms): each backend call runs
 * up to ~14 COUNT(*) queries, and the sidebar's checkboxes let a user toggle
 * several buckets in quick succession — without debouncing, every click
 * would fire its own request instead of settling on the final selection.
 */
export const useListingFilterOptions = (
  filters: Partial<ListingFilterRequest>,
  options?: UseListingFilterOptionsOptions,
) => {
  const {
    enabled = true,
    staleTime = 60 * 1000,
    gcTime = 5 * 60 * 1000,
    debounceMs = 300,
  } = options || {}
  const contextFilters = useDebounce(omitPagingAndSort(filters), debounceMs)

  return useQuery({
    queryKey: ['listings', 'filter-options', contextFilters],
    queryFn: async (): Promise<ListingFilterOptionsResponse> => {
      const backendRequest = mapFrontendToBackendRequest(contextFilters)
      const response = await ListingService.getFilterOptions(backendRequest)

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to load filter options')
      }

      return response.data
    },
    enabled,
    staleTime,
    gcTime,
  })
}
