/**
 * Pricing Service
 * Handles all pricing-related operations for listings
 * @module api/services/pricing
 */

import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import { PATHS } from '@/api/paths'
import type {
  PriceHistory,
  PriceStatistics,
  UpdatePriceRequest,
} from '@/api/types/property.type'
import type { AxiosInstance } from 'axios'

export class PricingService {
  /**
   * Update price for a listing
   * @param {string | number} listingId - The listing ID
   * @param {UpdatePriceRequest} data - The price update data
   * @returns {Promise<ApiResponse<PriceHistory>>} Promise resolving to updated price history
   * @example
   * const response = await PricingService.updatePrice(123, {
   *   newPrice: 10000000,
   *   priceUnit: 'MONTH',
   *   reason: 'Market adjustment'
   * })
   */
  static async updatePrice(
    listingId: string | number,
    data: UpdatePriceRequest,
    instance?: AxiosInstance,
  ): Promise<ApiResponse<PriceHistory>> {
    const url = PATHS.LISTING.UPDATE_PRICE.replace(
      ':listingId',
      listingId.toString(),
    )
    return apiRequest<PriceHistory>(
      {
        method: 'PUT',
        url,
        data,
      },
      instance,
    )
  }

  /**
   * Get pricing history for a listing
   * @param {string | number} listingId - The listing ID
   * @param {AxiosInstance} instance - Optional axios instance
   * @returns {Promise<ApiResponse<PriceHistory[]>>} Promise resolving to price history array
   * @example
   * const response = await PricingService.getPricingHistory(123)
   */
  static async getPricingHistory(
    listingId: string | number,
    instance?: AxiosInstance,
  ): Promise<ApiResponse<PriceHistory[]>> {
    const url = PATHS.LISTING.PRICING_HISTORY.replace(
      ':listingId',
      listingId.toString(),
    )
    return apiRequest<PriceHistory[]>(
      {
        method: 'GET',
        url,
      },
      instance,
    )
  }

  /**
   * Get pricing history for a listing within a date range
   * @param {string | number} listingId - The listing ID
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @param {AxiosInstance} instance - Optional axios instance
   * @returns {Promise<ApiResponse<PriceHistory[]>>} Promise resolving to price history array
   * @example
   * const response = await PricingService.getPricingHistoryByDateRange(
   *   123,
   *   '2024-01-01',
   *   '2024-12-31'
   * )
   */
  static async getPricingHistoryByDateRange(
    listingId: string | number,
    startDate: string,
    endDate: string,
    instance?: AxiosInstance,
  ): Promise<ApiResponse<PriceHistory[]>> {
    const url = PATHS.LISTING.PRICING_HISTORY_DATE_RANGE.replace(
      ':listingId',
      listingId.toString(),
    )
    return apiRequest<PriceHistory[]>(
      {
        method: 'GET',
        url,
        params: { startDate, endDate },
      },
      instance,
    )
  }

  /**
   * Get price statistics for a listing
   * @param {string | number} listingId - The listing ID
   * @param {AxiosInstance} instance - Optional axios instance
   * @returns {Promise<ApiResponse<PriceStatistics>>} Promise resolving to price statistics
   * @example
   * const response = await PricingService.getPriceStatistics(123)
   */
  static async getPriceStatistics(
    listingId: string | number,
    instance?: AxiosInstance,
  ): Promise<ApiResponse<PriceStatistics>> {
    const url = PATHS.LISTING.PRICE_STATISTICS.replace(
      ':listingId',
      listingId.toString(),
    )
    return apiRequest<PriceStatistics>(
      {
        method: 'GET',
        url,
      },
      instance,
    )
  }

  /**
   * Get current price for a listing
   * @param {string | number} listingId - The listing ID
   * @param {AxiosInstance} instance - Optional axios instance
   * @returns {Promise<ApiResponse<PriceHistory>>} Promise resolving to current price
   * @example
   * const response = await PricingService.getCurrentPrice(123)
   */
  static async getCurrentPrice(
    listingId: string | number,
    instance?: AxiosInstance,
  ): Promise<ApiResponse<PriceHistory>> {
    const url = PATHS.LISTING.CURRENT_PRICE.replace(
      ':listingId',
      listingId.toString(),
    )
    return apiRequest<PriceHistory>(
      {
        method: 'GET',
        url,
      },
      instance,
    )
  }

  /**
   * Get recent price changes across all listings
   * @param {number} daysBack - Number of days to look back (default: 7)
   * @param {AxiosInstance} instance - Optional axios instance
   * @returns {Promise<ApiResponse<number[]>>} Promise resolving to array of listing IDs with recent changes
   * @example
   * const response = await PricingService.getRecentPriceChanges(30)
   */
  static async getRecentPriceChanges(
    daysBack: number = 7,
    instance?: AxiosInstance,
  ): Promise<ApiResponse<number[]>> {
    return apiRequest<number[]>(
      {
        method: 'GET',
        url: PATHS.LISTING.RECENT_PRICE_CHANGES,
        params: { daysBack },
      },
      instance,
    )
  }
}

// ============= EXPORTS =============

export const {
  updatePrice,
  getPricingHistory,
  getPricingHistoryByDateRange,
  getPriceStatistics,
  getCurrentPrice,
  getRecentPriceChanges,
} = PricingService
