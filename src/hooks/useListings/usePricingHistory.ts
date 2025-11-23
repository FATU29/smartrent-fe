import { useQuery } from '@tanstack/react-query'
import { PricingService } from '@/api/services/pricing.service'
import { mockPriceStatistics } from '@/mock'

/**
 * Hook to fetch pricing history for a listing
 * Uses React Query for caching and state management
 * @deprecated Use usePricingHistory from @/hooks/usePricing instead
 */
export const usePricingHistory = (
  listingId: string | number | undefined,
  options?: {
    enabled?: boolean
  },
) => {
  const { enabled = true } = options || {}

  return useQuery({
    queryKey: ['listings', 'pricing-history', listingId],
    queryFn: async () => {
      if (!listingId) {
        throw new Error('Listing ID is required')
      }
      const response = await PricingService.getPricingHistory(listingId)
      if (response.code !== '999999') {
        throw new Error(response.message || 'Failed to fetch pricing history')
      }
      return response.data
    },
    enabled: enabled && !!listingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch price statistics for a listing
 * Uses React Query for caching and state management
 * @deprecated Use usePriceStatistics from @/hooks/usePricing instead
 */
export const usePriceStatistics = (
  listingId: string | number | undefined,
  options?: {
    enabled?: boolean
  },
) => {
  const { enabled = true } = options || {}

  return useQuery({
    queryKey: ['listings', 'price-statistics', listingId],
    queryFn: async () => {
      if (!listingId) {
        throw new Error('Listing ID is required')
      }
      const response = await PricingService.getPriceStatistics(listingId)
      if (response.code !== '999999') {
        throw new Error(response.message || 'Failed to fetch price statistics')
      }
      return response.data || mockPriceStatistics
    },
    enabled: enabled && !!listingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
