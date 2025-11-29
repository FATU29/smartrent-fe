/**
 * Exchange Rate Service
 * Handles fetching exchange rates from API
 * @module api/services/exchange-rate
 */

import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import { PATHS } from '@/api/paths'
import type {
  ExchangeRate,
  ExchangeRateResponse,
} from '@/api/types/exchange-rate.type'

export class ExchangeRateService {
  /**
   * Get latest exchange rates
   * @returns {Promise<ApiResponse<ExchangeRateResponse>>} Promise resolving to exchange rates
   */
  static async getLatest(): Promise<ApiResponse<ExchangeRateResponse>> {
    return apiRequest<ExchangeRateResponse>({
      method: 'GET',
      url: PATHS.EXCHANGE_RATE.LATEST,
    })
  }

  /**
   * Get VND to USD exchange rate
   * @returns {Promise<ApiResponse<ExchangeRate>>} Promise resolving to VND/USD rate
   */
  static async getVndToUsd(): Promise<ApiResponse<ExchangeRate>> {
    try {
      const response = await apiRequest<ExchangeRate>({
        method: 'GET',
        url: PATHS.EXCHANGE_RATE.VND_TO_USD,
      })

      // If API returns success, use it
      if (response.code === '999999' && response.data) {
        return response
      }

      // Fallback: try to get from latest rates
      const latestResponse = await this.getLatest()
      if (latestResponse.code === '999999' && latestResponse.data?.rates?.VND) {
        // If base is USD, VND rate is already VND per USD
        // If base is VND, we need to calculate inverse
        const base = latestResponse.data.base || 'USD'
        let vndPerUsd: number

        if (base === 'USD') {
          vndPerUsd = latestResponse.data.rates.VND
        } else if (base === 'VND') {
          // Inverse: 1 / (USD per VND) = VND per USD
          vndPerUsd = 1 / (latestResponse.data.rates.USD || 0.000042)
        } else {
          // Default fallback
          vndPerUsd = 24000
        }

        return {
          code: '999999',
          message: 'Success',
          success: true,
          data: {
            vndPerUsd,
            lastUpdated: latestResponse.data.timestamp || Date.now(),
          },
        }
      }

      // Final fallback
      return {
        code: '999999',
        message: 'Using fallback rate',
        success: true,
        data: {
          vndPerUsd: 24000,
          lastUpdated: Date.now(),
        },
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error)
      // Return fallback on error
      return {
        code: '999999',
        message: 'Using fallback rate',
        success: true,
        data: {
          vndPerUsd: 24000,
          lastUpdated: Date.now(),
        },
      }
    }
  }
}

export const { getLatest, getVndToUsd } = ExchangeRateService
