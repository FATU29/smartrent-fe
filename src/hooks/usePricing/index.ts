import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PricingService } from '@/api/services/pricing.service'
import type {
  PriceHistory,
  UpdatePriceRequest,
} from '@/api/types/property.type'
import type { AxiosInstance } from 'axios'

// ============= QUERY KEYS =============

export const pricingKeys = {
  all: ['pricing'] as const,
  listing: (listingId: string | number) =>
    [...pricingKeys.all, 'listing', listingId] as const,
  history: (listingId: string | number) =>
    [...pricingKeys.listing(listingId), 'history'] as const,
  historyByDateRange: (
    listingId: string | number,
    startDate: string,
    endDate: string,
  ) =>
    [
      ...pricingKeys.listing(listingId),
      'history',
      'date-range',
      startDate,
      endDate,
    ] as const,
  statistics: (listingId: string | number) =>
    [...pricingKeys.listing(listingId), 'statistics'] as const,
  currentPrice: (listingId: string | number) =>
    [...pricingKeys.listing(listingId), 'current'] as const,
  recentChanges: (daysBack: number) =>
    [...pricingKeys.all, 'recent-changes', daysBack] as const,
}

// ============= QUERY HOOKS =============

/**
 * Hook to fetch pricing history for a listing
 * Uses React Query for caching and state management
 */
export const usePricingHistory = (
  listingId: string | number | undefined,
  options?: {
    enabled?: boolean
    instance?: AxiosInstance
  },
) => {
  const { enabled = true, instance } = options || {}

  return useQuery({
    queryKey: listingId
      ? pricingKeys.history(listingId)
      : ['pricing', 'history'],
    queryFn: async () => {
      if (!listingId) {
        throw new Error('Listing ID is required')
      }
      const response = await PricingService.getPricingHistory(
        listingId,
        instance,
      )
      if (response.code !== '999999') {
        throw new Error(response.message || 'Failed to fetch pricing history')
      }
      return response.data || []
    },
    enabled: enabled && !!listingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch pricing history for a listing within a date range
 */
export const usePricingHistoryByDateRange = (
  listingId: string | number | undefined,
  startDate: string,
  endDate: string,
  options?: {
    enabled?: boolean
    instance?: AxiosInstance
  },
) => {
  const { enabled = true, instance } = options || {}

  return useQuery({
    queryKey: listingId
      ? pricingKeys.historyByDateRange(listingId, startDate, endDate)
      : ['pricing', 'history', 'date-range'],
    queryFn: async () => {
      if (!listingId) {
        throw new Error('Listing ID is required')
      }
      const response = await PricingService.getPricingHistoryByDateRange(
        listingId,
        startDate,
        endDate,
        instance,
      )
      if (response.code !== '999999') {
        throw new Error(
          response.message || 'Failed to fetch pricing history by date range',
        )
      }
      return response.data || []
    },
    enabled: enabled && !!listingId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch price statistics for a listing
 */
export const usePriceStatistics = (
  listingId: string | number | undefined,
  options?: {
    enabled?: boolean
    instance?: AxiosInstance
  },
) => {
  const { enabled = true, instance } = options || {}

  return useQuery({
    queryKey: listingId
      ? pricingKeys.statistics(listingId)
      : ['pricing', 'statistics'],
    queryFn: async () => {
      if (!listingId) {
        throw new Error('Listing ID is required')
      }
      const response = await PricingService.getPriceStatistics(
        listingId,
        instance,
      )
      if (response.code !== '999999') {
        throw new Error(response.message || 'Failed to fetch price statistics')
      }
      return response.data
    },
    enabled: enabled && !!listingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch current price for a listing
 */
export const useCurrentPrice = (
  listingId: string | number | undefined,
  options?: {
    enabled?: boolean
    instance?: AxiosInstance
  },
) => {
  const { enabled = true, instance } = options || {}

  return useQuery({
    queryKey: listingId
      ? pricingKeys.currentPrice(listingId)
      : ['pricing', 'current'],
    queryFn: async () => {
      if (!listingId) {
        throw new Error('Listing ID is required')
      }
      const response = await PricingService.getCurrentPrice(listingId, instance)
      if (response.code !== '999999') {
        throw new Error(response.message || 'Failed to fetch current price')
      }
      return response.data
    },
    enabled: enabled && !!listingId,
    staleTime: 2 * 60 * 1000, // 2 minutes - current price changes more frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch recent price changes across all listings
 */
export const useRecentPriceChanges = (
  daysBack: number = 7,
  options?: {
    enabled?: boolean
    instance?: AxiosInstance
  },
) => {
  const { enabled = true, instance } = options || {}

  return useQuery({
    queryKey: pricingKeys.recentChanges(daysBack),
    queryFn: async () => {
      const response = await PricingService.getRecentPriceChanges(
        daysBack,
        instance,
      )
      if (response.code !== '999999') {
        throw new Error(
          response.message || 'Failed to fetch recent price changes',
        )
      }
      return response.data || []
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// ============= MUTATION HOOKS =============

/**
 * Hook to update price for a listing
 * Automatically invalidates related queries on success
 */
export const useUpdatePrice = (
  listingId: string | number | undefined,
  options?: {
    instance?: AxiosInstance
    onSuccess?: (data: PriceHistory) => void
    onError?: (error: Error) => void
  },
) => {
  const queryClient = useQueryClient()
  const { instance, onSuccess, onError } = options || {}

  return useMutation({
    mutationFn: async (data: UpdatePriceRequest) => {
      if (!listingId) {
        throw new Error('Listing ID is required')
      }
      const response = await PricingService.updatePrice(
        listingId,
        data,
        instance,
      )
      if (response.code !== '999999') {
        throw new Error(response.message || 'Failed to update price')
      }
      return response.data
    },
    onSuccess: (data) => {
      // Invalidate all pricing-related queries for this listing
      if (listingId) {
        queryClient.invalidateQueries({
          queryKey: pricingKeys.listing(listingId),
        })
      }
      onSuccess?.(data)
    },
    onError: (error: Error) => {
      onError?.(error)
    },
  })
}
