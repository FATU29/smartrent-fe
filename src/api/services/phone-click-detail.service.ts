/**
 * Phone Click Detail Service
 * Handles all phone click detail tracking operations
 * @module api/services/phone-click-detail
 */

import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import { PATHS } from '@/api/paths'
import type {
  PhoneClickDetail,
  TrackPhoneClickRequest,
  PhoneClickStats,
  SearchPhoneClicksRequest,
} from '@/api/types/phone-click-detail.type'
import type { AxiosInstance } from 'axios'

export class PhoneClickDetailService {
  /**
   * Track phone number click
   * Records when a user clicks on a phone number in a listing detail page
   * @param data - Request body containing listingId
   * @returns Promise with phone click detail wrapped in ApiResponse
   * @example
   * ```ts
   * const response = await PhoneClickDetailService.trackClick({ listingId: 123 })
   * console.log(response.data) // PhoneClickDetail object
   * ```
   */
  static async trackClick(
    data: TrackPhoneClickRequest,
  ): Promise<ApiResponse<PhoneClickDetail>> {
    return apiRequest<PhoneClickDetail>({
      method: 'POST',
      url: PATHS.PHONE_CLICK_DETAIL.TRACK,
      data,
    })
  }

  /**
   * Get users who clicked on listing's phone number
   * Retrieves all users who clicked on a specific listing's phone number with pagination
   * @param listingId - ID of the listing
   * @param page - Page number (1-indexed)
   * @param size - Number of items per page
   * @param instance - Optional axios instance for server-side rendering
   * @returns Promise with paginated phone click details
   * @example
   * ```ts
   * const response = await PhoneClickDetailService.getByListing(123, 1, 10)
   * console.log(response.data.data) // Array of PhoneClickDetail objects
   * console.log(response.data.totalElements) // Total count
   * ```
   */
  static async getByListing(
    listingId: string | number,
    page: number = 1,
    size: number = 10,
    instance?: AxiosInstance,
  ): Promise<
    ApiResponse<{
      page: number
      size: number
      totalElements: number
      totalPages: number
      data: PhoneClickDetail[]
    }>
  > {
    const url = PATHS.PHONE_CLICK_DETAIL.BY_LISTING.replace(
      ':listingId',
      listingId.toString(),
    )
    return apiRequest<{
      page: number
      size: number
      totalElements: number
      totalPages: number
      data: PhoneClickDetail[]
    }>(
      {
        method: 'GET',
        url,
        params: {
          page,
          size,
        },
      },
      instance,
    )
  }

  /**
   * Get my phone click history
   * Retrieves all listings the authenticated user has clicked phone numbers on
   * @returns Promise with array of phone click details wrapped in ApiResponse
   * @example
   * ```ts
   * const response = await PhoneClickDetailService.getMyClicks()
   * console.log(response.data) // Array of PhoneClickDetail objects
   * ```
   */
  static async getMyClicks(): Promise<ApiResponse<PhoneClickDetail[]>> {
    return apiRequest<PhoneClickDetail[]>({
      method: 'GET',
      url: PATHS.PHONE_CLICK_DETAIL.MY_CLICKS,
    })
  }

  /**
   * Get phone click statistics for a listing
   * Retrieves statistics about phone clicks for a specific listing
   * @param listingId - ID of the listing
   * @returns Promise with phone click statistics wrapped in ApiResponse
   * @example
   * ```ts
   * const response = await PhoneClickDetailService.getListingStats(123)
   * console.log(response.data.totalClicks) // Total number of clicks
   * console.log(response.data.uniqueUsers) // Number of unique users
   * ```
   */
  static async getListingStats(
    listingId: string | number,
  ): Promise<ApiResponse<PhoneClickStats>> {
    const url = PATHS.PHONE_CLICK_DETAIL.LISTING_STATS.replace(
      ':listingId',
      listingId.toString(),
    )
    return apiRequest<PhoneClickStats>({
      method: 'GET',
      url,
    })
  }

  /**
   * Get phone clicks for my listings
   * Retrieves all phone clicks for all listings owned by the authenticated user
   * Supports pagination
   * @param page - Page number (1-indexed)
   * @param size - Number of items per page
   * @param instance - Optional axios instance for server-side rendering
   * @returns Promise with paginated phone click details
   * @example
   * ```ts
   * const response = await PhoneClickDetailService.getMyListingsClicks(1, 100)
   * console.log(response.data.data) // Array of PhoneClickDetail objects
   * console.log(response.data.totalElements) // Total count
   * ```
   */
  static async getMyListingsClicks(
    page: number = 1,
    size: number = 100,
    instance?: AxiosInstance,
  ): Promise<
    ApiResponse<{
      page: number
      size: number
      totalElements: number
      totalPages: number
      data: PhoneClickDetail[]
    }>
  > {
    return apiRequest<{
      page: number
      size: number
      totalElements: number
      totalPages: number
      data: PhoneClickDetail[]
    }>(
      {
        method: 'GET',
        url: PATHS.PHONE_CLICK_DETAIL.MY_LISTINGS,
        params: {
          page,
          size,
        },
      },
      instance,
    )
  }

  /**
   * Search phone clicks for my listings by title
   * Searches for users who clicked on phone numbers in listings owned by the authenticated user
   * Filtered by listing title keyword with pagination support
   * @param params - Search parameters including title, page, and size
   * @param instance - Optional axios instance for server-side rendering
   * @returns Promise with paginated phone click details
   * @example
   * ```ts
   * const response = await PhoneClickDetailService.searchMyListingsClicks({
   *   title: 'apartment',
   *   page: 1,
   *   size: 10
   * })
   * console.log(response.data.data) // Filtered array of PhoneClickDetail objects
   * ```
   */
  static async searchMyListingsClicks(
    params: SearchPhoneClicksRequest,
    instance?: AxiosInstance,
  ): Promise<
    ApiResponse<{
      page: number
      size: number
      totalElements: number
      totalPages: number
      data: PhoneClickDetail[]
    }>
  > {
    return apiRequest<{
      page: number
      size: number
      totalElements: number
      totalPages: number
      data: PhoneClickDetail[]
    }>(
      {
        method: 'GET',
        url: PATHS.PHONE_CLICK_DETAIL.SEARCH_MY_LISTINGS,
        params: {
          title: params.title,
          page: params.page || 1,
          size: params.size || 100,
        },
      },
      instance,
    )
  }
}

// ============= EXPORTS =============

export const {
  trackClick,
  getByListing,
  getMyClicks,
  getListingStats,
  getMyListingsClicks,
  searchMyListingsClicks,
} = PhoneClickDetailService
