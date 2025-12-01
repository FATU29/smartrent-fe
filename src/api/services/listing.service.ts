/**
 * Listing Service
 * Handles all listing-related operations including CRUD and quota management
 * Note: Pricing operations are handled by PricingService
 * @module api/services/listing
 */

import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import { PATHS } from '@/api/paths'
import { AxiosInstance } from 'axios'
import {
  CreateListingRequest,
  CreateVipListingRequest,
  ListingDetail,
  ListingSearchApiRequest,
  ListingSearchBackendResponse,
  ListingFilterRequest,
  MyListingsBackendResponse,
  ProvinceStatsItem,
  ProvinceStatsRequest,
  QuotaCheckResponse,
} from '../types'

// ============= LISTING SERVICE CLASS =============

export class ListingService {
  static async getById(
    id: string | number,
  ): Promise<ApiResponse<ListingDetail | null>> {
    try {
      const url = PATHS.LISTING.BY_ID.replace(':id', id.toString())
      const response = await apiRequest<ListingDetail>({
        method: 'GET',
        url,
      })

      if (!response.data || response.code !== '999999') {
        return { ...response, data: null }
      }

      return response
    } catch (error) {
      console.error(`Error fetching listing ${id}:`, error)
      return {
        code: '500',
        message: String(error),
        data: null,
        success: false,
      }
    }
  }

  static async create(
    data: CreateListingRequest,
  ): Promise<ApiResponse<{ listingId: number; status: string }>> {
    return apiRequest<{ listingId: number; status: string }>({
      method: 'POST',
      url: PATHS.LISTING.CREATE,
      data,
    })
  }

  static async createVip(data: CreateVipListingRequest): Promise<
    ApiResponse<{
      listingId: string
      title: string
      vipType: string
      postSource: string
      status: string
      paymentUrl?: string
    }>
  > {
    return apiRequest<{
      listingId: string
      title: string
      vipType: string
      postSource: string
      status: string
      paymentUrl?: string
    }>({
      method: 'POST',
      url: PATHS.LISTING.CREATE_VIP,
      data,
    })
  }

  static async update(
    id: string | number,
    data: CreateListingRequest,
  ): Promise<ApiResponse<string>> {
    const url = PATHS.LISTING.UPDATE.replace(':id', id.toString())
    return apiRequest<string>({
      method: 'PUT',
      url,
      data,
    })
  }

  static async delete(id: string | number): Promise<ApiResponse<null>> {
    const url = PATHS.LISTING.DELETE.replace(':id', id.toString())
    return apiRequest<null>({
      method: 'DELETE',
      url,
    })
  }

  static async checkQuota(
    vipType?: 'VIP' | 'PREMIUM',
  ): Promise<ApiResponse<QuotaCheckResponse>> {
    const params = vipType ? { vipType } : {}
    return apiRequest<QuotaCheckResponse>({
      method: 'GET',
      url: PATHS.LISTING.QUOTA_CHECK,
      params,
    })
  }

  static async getByIdAdmin(
    id: string | number,
    adminId: string,
  ): Promise<ApiResponse<ListingDetail>> {
    const url = PATHS.LISTING.ADMIN_DETAIL.replace(':id', id.toString())
    return apiRequest<ListingDetail>({
      method: 'GET',
      url,
      headers: {
        'X-Admin-Id': adminId,
      },
    })
  }

  /**
   * Get province statistics for listings
   * Public API - no authentication required
   * @param {ProvinceStatsRequest} request - Province IDs or codes and filters
   * @param {AxiosInstance} instance - Optional axios instance for server-side calls
   * @returns {Promise<ApiResponse<ProvinceStatsItem[]>>} Promise resolving to province statistics
   * @example
   * const stats = await ListingService.getProvinceStats({
   *   provinceIds: [1, 79, 48, 31, 92],
   *   verifiedOnly: false
   * })
   */
  static async getProvinceStats(
    request: ProvinceStatsRequest,
    instance?: AxiosInstance,
  ): Promise<ApiResponse<ProvinceStatsItem[]>> {
    return apiRequest<ProvinceStatsItem[]>(
      {
        method: 'POST',
        url: PATHS.LISTING.PROVINCE_STATS,
        data: request,
      },
      instance,
    )
  }

  /**
   * Search listings with comprehensive filters
   * POST /v1/listings/search
   * @param {ListingSearchApiRequest} request - Backend API request format
   * @param {AxiosInstance} instance - Optional axios instance for server-side calls
   * @returns {Promise<ApiResponse<ListingSearchBackendResponse>>} Raw backend response
   * @example
   * const backendRequest = mapFrontendToBackendRequest(filters)
   * const response = await ListingService.search(backendRequest)
   * const mappedData = mapBackendToFrontendResponse(response.data)
   */
  static async search(
    request: ListingSearchApiRequest,
    instance?: AxiosInstance,
  ): Promise<ApiResponse<ListingSearchBackendResponse>> {
    return apiRequest<ListingSearchBackendResponse>(
      {
        method: 'POST',
        url: PATHS.LISTING.SEARCH,
        data: request,
      },
      instance,
    )
  }

  /**
   * Get current user's listings (owner dashboard)
   * POST /v1/listings/my-listings
   */
  static async getMyListings(
    request: Partial<ListingFilterRequest>,
    instance?: AxiosInstance,
  ): Promise<ApiResponse<MyListingsBackendResponse>> {
    return apiRequest<MyListingsBackendResponse>(
      {
        method: 'POST',
        url: PATHS.LISTING.MY_LISTINGS,
        data: request,
      },
      instance,
    )
  }
}

// ============= EXPORTS =============

export const {
  getById,
  create,
  createVip,
  update,
  delete: deleteListing,
  checkQuota,
  getByIdAdmin,
  getProvinceStats,
  search,
  getMyListings,
} = ListingService
