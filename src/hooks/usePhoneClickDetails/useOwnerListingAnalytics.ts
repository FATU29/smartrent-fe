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

export const useOwnerListingAnalytics = (
  listingId?: number | null,
  period: '7d' | '30d' | '90d' | '180d' | '365d' | 'all' = '30d',
) => {
  return useQuery({
    queryKey: [
      ...phoneClickDetailKeys.all,
      'owner-listing-analytics',
      listingId,
      period,
    ],
    queryFn: async (): Promise<OwnerListingAnalytics> => {
      const targetListingId = listingId as number
      const response = await PhoneClickDetailService.getOwnerListingAnalytics(
        targetListingId,
        period,
      )

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

export const useOwnerListingsAnalyticsPage = (params: {
  page?: number
  size?: number
  keyword?: string
}) => {
  const page = params.page ?? 0
  const size = params.size ?? 10
  const keyword = (params.keyword || '').trim()

  return useQuery({
    queryKey: [
      ...phoneClickDetailKeys.all,
      'owner-listing-analytics',
      'page',
      page,
      size,
      keyword || '',
    ],
    queryFn: async () => {
      const response = keyword
        ? await PhoneClickDetailService.searchOwnerListingsAnalytics({
            keyword,
            page,
            size,
          })
        : await PhoneClickDetailService.getOwnerListingsAnalyticsPage(
            page,
            size,
          )

      if (!response.data || response.code !== '999999') {
        throw new Error(mapAnalyticsError(response.message))
      }

      return response.data
    },
    retry: false,
    staleTime: 10 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
