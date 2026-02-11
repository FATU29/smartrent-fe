/**
 * Hook for dashboard phone click statistics
 * Aggregates phone click data from all user's listings
 * @module hooks/usePhoneClickDetails/useDashboardPhoneClickStats
 */

import { useQuery } from '@tanstack/react-query'
import { PhoneClickDetailService } from '@/api/services'
import type { PhoneClickDetail } from '@/api/types/phone-click-detail.type'
import { phoneClickDetailKeys } from './index'

export interface DashboardPhoneClickStats {
  totalClicks: number
  uniqueUsers: number
  clicksByDate: Array<{
    date: string
    clicks: number
    users: number
  }>
  clicksByListing: Array<{
    listingId: number
    listingTitle: string
    clicks: number
  }>
}

/**
 * Hook to get aggregated phone click statistics for dashboard
 * Fetches all phone clicks for user's listings and aggregates them
 */
export const useDashboardPhoneClickStats = () => {
  return useQuery({
    queryKey: [...phoneClickDetailKeys.all, 'dashboard', 'stats'],
    queryFn: async (): Promise<DashboardPhoneClickStats> => {
      // Fetch all phone clicks for user's listings (large page size to get all)
      const response = await PhoneClickDetailService.getMyListingsClicks(
        1,
        1000,
      )

      if (!response.data || response.code !== '999999') {
        throw new Error(
          response.message || 'Failed to fetch phone click statistics',
        )
      }

      const clicks = response.data.data || []

      // Aggregate statistics
      const uniqueUserIds = new Set<string>()
      const clicksByDateMap = new Map<
        string,
        { clicks: number; users: Set<string> }
      >()
      const clicksByListingMap = new Map<
        number,
        { title: string; clicks: number }
      >()

      clicks.forEach((click: PhoneClickDetail) => {
        // Count unique users
        uniqueUserIds.add(click.userId)

        // Group by date
        const date = new Date(click.clickedAt).toISOString().split('T')[0]
        if (!clicksByDateMap.has(date)) {
          clicksByDateMap.set(date, { clicks: 0, users: new Set() })
        }
        const dateData = clicksByDateMap.get(date)!
        dateData.clicks++
        dateData.users.add(click.userId)

        // Group by listing
        if (click.listingId) {
          if (!clicksByListingMap.has(click.listingId)) {
            clicksByListingMap.set(click.listingId, {
              title: click.listingTitle || `Listing #${click.listingId}`,
              clicks: 0,
            })
          }
          clicksByListingMap.get(click.listingId)!.clicks++
        }
      })

      // Convert maps to arrays and sort
      const clicksByDate = Array.from(clicksByDateMap.entries())
        .map(([date, data]) => ({
          date,
          clicks: data.clicks,
          users: data.users.size,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      const clicksByListing = Array.from(clicksByListingMap.entries())
        .map(([listingId, data]) => ({
          listingId,
          listingTitle: data.title,
          clicks: data.clicks,
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10) // Top 10 listings

      return {
        totalClicks: clicks.length,
        uniqueUsers: uniqueUserIds.size,
        clicksByDate,
        clicksByListing,
      }
    },
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}
