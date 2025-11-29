import { useQuery } from '@tanstack/react-query'
import { ListingService } from '@/api/services/listing.service'
import type { AxiosInstance } from 'axios'
import { ListingFilterRequest } from '@/api/types'

/**
 * Hook to search listings using the new search API
 * Uses React Query for caching and state management
 */
export const useListingsSearch = (
  request: ListingFilterRequest,
  options?: {
    enabled?: boolean
    instance?: AxiosInstance
  },
) => {
  const { enabled = true, instance } = options || {}

  return useQuery({
    queryKey: ['listings', 'search', request],
    queryFn: async () => {
      const response = await ListingService.search(request, instance)
      if (response.code !== '999999') {
        throw new Error(response.message || 'Failed to search listings')
      }
      return response.data
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })
}
