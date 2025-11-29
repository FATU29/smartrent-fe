import { useQuery } from '@tanstack/react-query'
import { ExchangeRateService } from '@/api/services/exchange-rate.service'

/**
 * Hook to fetch VND to USD exchange rate
 * Uses React Query for caching and state management
 * Cache for 1 hour as exchange rates don't change frequently
 */
export const useExchangeRate = (options?: { enabled?: boolean }) => {
  const { enabled = true } = options || {}

  return useQuery({
    queryKey: ['exchange-rate', 'vnd-to-usd'],
    queryFn: async () => {
      const response = await ExchangeRateService.getVndToUsd()
      if (response.code !== '999999' || !response.data) {
        throw new Error(response.message || 'Failed to fetch exchange rate')
      }
      return response.data
    },
    enabled,
    staleTime: 60 * 60 * 1000, // 1 hour - exchange rates don't change frequently
    gcTime: 2 * 60 * 60 * 1000, // 2 hours cache
    retry: 2, // Retry 2 times on failure
    retryDelay: 1000, // Wait 1 second between retries
  })
}
