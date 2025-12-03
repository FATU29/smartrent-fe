import { useQuery } from '@tanstack/react-query'
import { ListingService } from '@/api/services/listing.service'
import {
  mapFrontendToBackendRequest,
  mapBackendToFrontendResponse,
} from '@/utils/property/mapListingResponse'
import type { AxiosInstance } from 'axios'
import type {
  ListingFilterRequest,
  ListingSearchResponse,
  ListingDetail,
} from '@/api/types'

/**
 * Hook to search listings with automatic frontend/backend mapping
 * Uses React Query for caching, refetching, and state management
 *
 * @param filters - Frontend filter format (ListingFilterRequest)
 * @param options - Configuration options
 * @returns React Query result with mapped frontend data
 *
 * @example
 * ```typescript
 * const { data, isLoading, error, refetch } = useListingsSearch({
 *   provinceId: 1,
 *   productType: 'APARTMENT',
 *   page: 0,
 *   size: 20
 * })
 *
 * if (data) {
 *   const { listings, pagination, recommendations } = data
 * }
 * ```
 */
export const useListingsSearch = (
  filters: Partial<ListingFilterRequest>,
  options?: {
    enabled?: boolean
    instance?: AxiosInstance
    staleTime?: number
    gcTime?: number
  },
) => {
  const {
    enabled = true,
    instance,
    staleTime = 5 * 60 * 1000, // 5 minutes
    gcTime = 10 * 60 * 1000, // 10 minutes
  } = options || {}

  return useQuery({
    queryKey: ['listings', 'search', filters],
    queryFn: async (): Promise<ListingSearchResponse<ListingDetail>> => {
      // Map frontend filters to backend request
      const backendRequest = mapFrontendToBackendRequest(filters)

      // Call backend API
      const response = await ListingService.search(backendRequest, instance)

      // Check for errors
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to search listings')
      }

      // Map backend response to frontend format
      return mapBackendToFrontendResponse(response.data)
    },
    enabled,
    staleTime,
    gcTime,
  })
}
