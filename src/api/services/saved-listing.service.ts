/**
 * Saved Listings Service
 * Handles all saved/favorite listings operations
 * @module api/services/saved-listing
 */

import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import { PATHS } from '@/api/paths'
import {
  SavedListing,
  SaveListingRequest,
  GetMySavedListingsRequest,
  SavedListingsPageResponse,
  OwnerSavedListingsAnalyticsResponse,
  OwnerListingSavesTrendResponse,
} from '../types'

// ============= SAVED LISTING SERVICE CLASS =============

export class SavedListingService {
  /**
   * Save a listing to user's favorites
   * @param data - Request with listingId to save
   * @returns Saved listing data
   */
  static async save(
    data: SaveListingRequest,
  ): Promise<ApiResponse<SavedListing>> {
    try {
      return await apiRequest<SavedListing>({
        method: 'POST',
        url: PATHS.SAVED_LISTINGS.SAVE,
        data,
      })
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving listing:', error)
      }
      throw error
    }
  }

  /**
   * Remove a listing from user's favorites
   * @param listingId - ID of the listing to unsave
   * @returns Empty response on success
   */
  static async unsave(listingId: number): Promise<ApiResponse<null>> {
    try {
      const url = PATHS.SAVED_LISTINGS.UNSAVE.replace(
        ':listingId',
        listingId.toString(),
      )
      return await apiRequest<null>({
        method: 'DELETE',
        url,
      })
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error unsaving listing:', error)
      }
      throw error
    }
  }

  /**
   * Get all saved listings for the current user (with pagination)
   * @param params - Pagination parameters (page, size)
   * @returns Paginated list of saved listings
   */
  static async getMySaved(
    params: GetMySavedListingsRequest = {},
  ): Promise<ApiResponse<SavedListingsPageResponse>> {
    try {
      const { page = 1, size = 10 } = params
      return await apiRequest<SavedListingsPageResponse>({
        method: 'GET',
        url: PATHS.SAVED_LISTINGS.MY_SAVED,
        params: { page, size },
      })
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching saved listings:', error)
      }
      throw error
    }
  }

  /**
   * Get the total count of saved listings for the current user
   * @returns Number of saved listings
   */
  static async getCount(): Promise<ApiResponse<number>> {
    try {
      return await apiRequest<number>({
        method: 'GET',
        url: PATHS.SAVED_LISTINGS.COUNT,
      })
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching saved listings count:', error)
      }
      throw error
    }
  }

  /**
   * Check if a specific listing is saved by the current user
   * @param listingId - ID of the listing to check
   * @returns true if saved, false otherwise
   */
  static async check(listingId: number): Promise<ApiResponse<boolean>> {
    try {
      const url = PATHS.SAVED_LISTINGS.CHECK.replace(
        ':listingId',
        listingId.toString(),
      )
      return await apiRequest<boolean>({
        method: 'GET',
        url,
      })
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error checking saved listing:', error)
      }
      throw error
    }
  }

  /**
   * Get save analytics summary for all owner listings
   * @returns List of owner listings with total saves and aggregated total saves across all listings
   */
  static async getOwnerSavesAnalytics(): Promise<
    ApiResponse<OwnerSavedListingsAnalyticsResponse>
  > {
    try {
      return await apiRequest<OwnerSavedListingsAnalyticsResponse>({
        method: 'GET',
        url: PATHS.OWNER_SAVED_LISTINGS_ANALYTICS.SUMMARY,
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching owner saves analytics:', error)
      }
      throw error
    }
  }

  /**
   * Get paginated saves analytics for owner listings
   * @param page zero-based page
   * @param size page size
   */
  static async getOwnerSavesAnalyticsPage(
    page = 0,
    size = 10,
  ): Promise<
    import('@/configs/axios/types').ApiResponse<
      import('../types').OwnerSavedListingsAnalyticsPageResponse
    >
  > {
    try {
      return await apiRequest({
        method: 'GET',
        url: PATHS.OWNER_SAVED_LISTINGS_ANALYTICS.SUMMARY,
        params: { page, size },
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching owner saves analytics page:', error)
      }
      throw error
    }
  }

  /**
   * Search saves analytics by listing title (paginated)
   * @param payload { keyword, page, size }
   */
  static async searchOwnerSavesAnalytics(
    payload: import('../types').SavesAnalyticsSearchRequest,
  ): Promise<
    import('@/configs/axios/types').ApiResponse<
      import('../types').OwnerSavedListingsAnalyticsPageResponse
    >
  > {
    try {
      const body = {
        keyword: payload.keyword ?? null,
        page: payload.page ?? 0,
        size: payload.size ?? 10,
      }
      return await apiRequest({
        method: 'POST',
        url: PATHS.OWNER_SAVED_LISTINGS_ANALYTICS.SEARCH,
        data: body,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error searching owner saves analytics:', error)
      }
      throw error
    }
  }

  /**
   * Get save trend for a specific owner listing
   * @param listingId - ID of the listing
   * @returns Save trend detail for the selected listing
   */
  static async getOwnerListingSavesTrend(
    listingId: number,
    period: '7d' | '30d' | '90d' | '180d' | '365d' | 'all' = '30d',
  ): Promise<ApiResponse<OwnerListingSavesTrendResponse>> {
    try {
      const url = PATHS.OWNER_SAVED_LISTINGS_ANALYTICS.TREND.replace(
        ':listingId',
        String(listingId),
      )

      return await apiRequest<OwnerListingSavesTrendResponse>({
        method: 'GET',
        url,
        params: { period },
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching owner listing saves trend:', error)
      }
      throw error
    }
  }
}
