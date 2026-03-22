/**
 * Hooks for owner listing analytics dashboard
 * @module hooks/usePhoneClickDetails/useOwnerListingAnalytics
 */

import { useQuery } from '@tanstack/react-query'
import { PhoneClickDetailService } from '@/api/services'
import type {
  OwnerListingAnalytics,
  OwnerListingAnalyticsSummaryItem,
} from '@/api/types'
import { phoneClickDetailKeys } from './index'

const mapAnalyticsError = (message?: string | null) => {
  const normalizedMessage = (message || '').toLowerCase()
  if (normalizedMessage.includes('no static resource')) {
    return 'Owner analytics endpoints are not available on current backend environment'
  }
  return message || 'Failed to fetch owner analytics'
}

export const useOwnerListingsAnalyticsSummary = () => {
  return useQuery({
    queryKey: [
      ...phoneClickDetailKeys.all,
      'owner-listing-analytics',
      'summary',
    ],
    queryFn: async (): Promise<OwnerListingAnalyticsSummaryItem[]> => {
      const response =
        await PhoneClickDetailService.getOwnerListingsAnalyticsSummary()

      if (!response.data || response.code !== '999999') {
        throw new Error(mapAnalyticsError(response.message))
      }

      return [...(response.data.listings || [])].sort(
        (a, b) => b.totalClicks - a.totalClicks,
      )
    },
    retry: false,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export const useOwnerListingAnalytics = (listingId?: number | null) => {
  return useQuery({
    queryKey: [
      ...phoneClickDetailKeys.all,
      'owner-listing-analytics',
      listingId,
    ],
    queryFn: async (): Promise<OwnerListingAnalytics> => {
      const targetListingId = listingId as number
      const response =
        await PhoneClickDetailService.getOwnerListingAnalytics(targetListingId)

      if (!response.data || response.code !== '999999') {
        throw new Error(mapAnalyticsError(response.message))
      }

      return response.data
    },
    enabled: !!listingId,
    retry: false,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
