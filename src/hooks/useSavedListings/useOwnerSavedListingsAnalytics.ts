import { useQuery } from '@tanstack/react-query'
import { SavedListingService } from '@/api/services'
import {
  SAVED_LISTING_QUERY_KEYS,
  type ListingSaveSummary,
  type OwnerListingSavesTrendResponse,
} from '@/api/types'

const mapOwnerSavesAnalyticsError = (message?: string | null) => {
  const normalizedMessage = (message || '').toLowerCase()

  if (normalizedMessage.includes('no static resource')) {
    return 'Owner saved-listings analytics endpoints are not available on current backend environment'
  }

  return message || 'Failed to fetch saved listings analytics'
}

export const useOwnerSavedListingsAnalyticsSummary = () => {
  return useQuery({
    queryKey: SAVED_LISTING_QUERY_KEYS.ownerAnalyticsSummary(),
    queryFn: async () => {
      const response = await SavedListingService.getOwnerSavesAnalytics()

      if (!response.data || response.code !== '999999') {
        throw new Error(mapOwnerSavesAnalyticsError(response.message))
      }

      return {
        listings: [...(response.data.listings || [])].sort(
          (a, b) => b.totalSaves - a.totalSaves,
        ) as ListingSaveSummary[],
        totalSavesAcrossAll: response.data.totalSavesAcrossAll || 0,
      }
    },
    retry: false,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export const useOwnerListingSavesTrend = (listingId?: number | null) => {
  return useQuery({
    queryKey: SAVED_LISTING_QUERY_KEYS.ownerSavesTrend(listingId),
    queryFn: async (): Promise<OwnerListingSavesTrendResponse> => {
      const response = await SavedListingService.getOwnerListingSavesTrend(
        listingId as number,
      )

      if (!response.data || response.code !== '999999') {
        throw new Error(mapOwnerSavesAnalyticsError(response.message))
      }

      return response.data
    },
    enabled: !!listingId,
    retry: false,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
