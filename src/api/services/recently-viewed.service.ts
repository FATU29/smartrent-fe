/**
 * Recently Viewed Service
 * Handles all recently viewed listings operations
 * @module api/services/recently-viewed
 */

import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import { PATHS } from '@/api/paths'
import type {
  RecentlyViewedSyncRequest,
  RecentlyViewedItemResponse,
} from '../types/recently-viewed.type'

// ============= RECENTLY VIEWED SERVICE CLASS =============

export class RecentlyViewedService {
  /**
   * Get recently viewed listings from server
   * Returns full listing details (not just IDs)
   * @returns List of recently viewed listings with full listing details
   */
  static async get(): Promise<ApiResponse<RecentlyViewedItemResponse[]>> {
    try {
      const response = await apiRequest<RecentlyViewedItemResponse[]>({
        method: 'GET',
        url: PATHS.RECENTLY_VIEWED.GET,
      })

      return {
        ...response,
        data: response.data || [],
      }
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching recently viewed:', error)
      }
      throw error
    }
  }

  /**
   * Sync recently viewed listings with server
   * Merges client localStorage data with server Redis storage
   * @param data - Request with listings from localStorage (only listingId and viewedAt)
   * @returns Merged and sorted list of recently viewed listings with full listing details
   */
  static async sync(
    data: RecentlyViewedSyncRequest,
  ): Promise<ApiResponse<RecentlyViewedItemResponse[]>> {
    try {
      const response = await apiRequest<RecentlyViewedItemResponse[]>({
        method: 'POST',
        url: PATHS.RECENTLY_VIEWED.SYNC,
        data,
      })

      return {
        ...response,
        data: response.data || [],
      }
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error syncing recently viewed:', error)
      }
      throw error
    }
  }
}
