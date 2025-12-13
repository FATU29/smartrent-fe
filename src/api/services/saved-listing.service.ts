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
}
