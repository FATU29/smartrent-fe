import { useQuery } from '@tanstack/react-query'
import { ListingService } from '@/api/services/listing.service'
import type { ListingFilterOptionsResponse } from '@/api/types'

interface UseListingFilterOptionsOptions {
  enabled?: boolean
}

/**
 * Static bucket options (price / area / bedrooms) for the public listings
 * sidebar — GET /v1/listings/filter-options. The response is the same for
 * every caller (no request body, no per-filter counts), so it's fetched
 * once and kept forever: selecting a bucket in the sidebar never refetches
 * it, since the options themselves don't depend on what's currently selected.
 */
export const useListingFilterOptions = (
  options?: UseListingFilterOptionsOptions,
) => {
  const { enabled = true } = options || {}

  return useQuery({
    queryKey: ['listings', 'filter-options'],
    queryFn: async (): Promise<ListingFilterOptionsResponse> => {
      const response = await ListingService.getFilterOptions()

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to load filter options')
      }

      return response.data
    },
    enabled,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
  })
}
