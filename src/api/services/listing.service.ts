/**
 * Listing Service
 * Handles all listing-related operations including CRUD, pricing, and quota management
 * @module api/services/listing
 */

import {
  PropertyCard,
  Listing,
  CreateListingRequest,
  UpdateListingRequest,
  CreateVipListingRequest,
  QuotaCheckResponse,
  UpdatePriceRequest,
  PriceHistory,
  PriceStatistics,
  ProvinceStatsRequest,
  ProvinceStatsItem,
  ListingSearchRequest,
  ListingSearchApiResponse,
} from '@/api/types/property.type'
import { ListFilters, ListFetcherResponse } from '@/contexts/list/index.type'
import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import { PATHS } from '@/api/paths'
import { AxiosInstance } from 'axios'
import { listFiltersToSearchRequest } from '@/utils/queryParams'

// ============= HELPER FUNCTIONS =============

const convertListingToPropertyCard = (listing: Listing): PropertyCard => {
  return {
    id: listing.listingId.toString(),
    title: listing.title,
    description: listing.description,
    address: '',
    city: '',
    property_type: listing.productType,
    bedrooms: listing.bedrooms || 0,
    bathrooms: listing.bathrooms || 0,
    price: listing.price,
    currency: listing.priceUnit,
    area: listing.area,
    furnishing: listing.furnishing || '',
    amenities: listing.amenities?.map((a) => a.name) || [],
    verified: listing.verified,
    featured: listing.vipType !== 'NORMAL',
  }
}

export async function fetchListings(
  filters: ListFilters,
): Promise<ListFetcherResponse<PropertyCard>> {
  try {
    // Convert ListFilters to ListingSearchRequest format
    const searchRequest = listFiltersToSearchRequest(filters)

    // Call the new search API
    const response = await ListingService.search(searchRequest)

    if (!response.data || response.code !== '999999') {
      throw new Error(response.message || 'Failed to fetch listings')
    }

    const searchData = response.data
    const listings = searchData.listings || []

    const properties = listings.map(convertListingToPropertyCard)

    return {
      data: properties,
      total: searchData.totalCount || 0,
      page: (searchData.currentPage || 0) + 1, // Convert 0-based to 1-based
      totalPages: searchData.totalPages || 1,
      hasNext:
        searchData.currentPage !== undefined &&
        searchData.totalPages !== undefined
          ? searchData.currentPage + 1 < searchData.totalPages
          : false,
      hasPrevious:
        searchData.currentPage !== undefined
          ? searchData.currentPage > 0
          : false,
    }
  } catch (error) {
    console.error('Error fetching listings:', error)
    return {
      data: [],
      total: 0,
      page: filters.page || 1,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    }
  }
}

// ============= LISTING SERVICE CLASS =============

export class ListingService {
  static async getById(
    id: string | number,
  ): Promise<ApiResponse<PropertyCard | null>> {
    try {
      const url = PATHS.LISTING.BY_ID.replace(':id', id.toString())
      const response = await apiRequest<Listing>({
        method: 'GET',
        url,
      })

      if (!response.data || response.code !== '999999') {
        return { ...response, data: null }
      }

      return {
        ...response,
        data: convertListingToPropertyCard(response.data),
      }
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
    data: UpdateListingRequest,
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

  static async updatePrice(
    listingId: string | number,
    data: UpdatePriceRequest,
  ): Promise<ApiResponse<PriceHistory>> {
    const url = PATHS.LISTING.UPDATE_PRICE.replace(
      ':listingId',
      listingId.toString(),
    )
    return apiRequest<PriceHistory>({
      method: 'PUT',
      url,
      data,
    })
  }

  static async getPricingHistory(
    listingId: string | number,
  ): Promise<ApiResponse<PriceHistory[]>> {
    const url = PATHS.LISTING.PRICING_HISTORY.replace(
      ':listingId',
      listingId.toString(),
    )
    return apiRequest<PriceHistory[]>({
      method: 'GET',
      url,
    })
  }

  static async getPricingHistoryByDateRange(
    listingId: string | number,
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<PriceHistory[]>> {
    const url = PATHS.LISTING.PRICING_HISTORY_DATE_RANGE.replace(
      ':listingId',
      listingId.toString(),
    )
    return apiRequest<PriceHistory[]>({
      method: 'GET',
      url,
      params: { startDate, endDate },
    })
  }

  static async getPriceStatistics(
    listingId: string | number,
  ): Promise<ApiResponse<PriceStatistics>> {
    const url = PATHS.LISTING.PRICE_STATISTICS.replace(
      ':listingId',
      listingId.toString(),
    )
    return apiRequest<PriceStatistics>({
      method: 'GET',
      url,
    })
  }

  static async getCurrentPrice(
    listingId: string | number,
  ): Promise<ApiResponse<PriceHistory>> {
    const url = PATHS.LISTING.CURRENT_PRICE.replace(
      ':listingId',
      listingId.toString(),
    )
    return apiRequest<PriceHistory>({
      method: 'GET',
      url,
    })
  }

  static async getRecentPriceChanges(
    daysBack: number = 7,
  ): Promise<ApiResponse<number[]>> {
    return apiRequest<number[]>({
      method: 'GET',
      url: PATHS.LISTING.RECENT_PRICE_CHANGES,
      params: { daysBack },
    })
  }

  static async getByIdAdmin(
    id: string | number,
    adminId: string,
  ): Promise<ApiResponse<Listing>> {
    const url = PATHS.LISTING.ADMIN_DETAIL.replace(':id', id.toString())
    return apiRequest<Listing>({
      method: 'GET',
      url,
      headers: {
        'X-Admin-Id': adminId,
      },
    })
  }

  static async getInitial(): Promise<PropertyCard[]> {
    const response = await fetchListings({
      search: '',
      perPage: 10,
      page: 1,
    })
    return response.data
  }

  /**
   * Save listing as draft
   * Creates a new listing with minimal required fields for draft status
   */
  static async saveDraft(
    data: Partial<CreateListingRequest>,
  ): Promise<ApiResponse<{ listingId: number; status: string }>> {
    // Ensure minimum required fields for draft
    const draftData: CreateListingRequest = {
      title: data.title || 'Draft',
      description: data.description || '',
      userId: data.userId || '',
      listingType: data.listingType || 'RENT',
      productType: data.productType || 'APARTMENT',
      price: data.price || 0,
      priceUnit: data.priceUnit || 'MONTH',
      address: data.address || {
        streetId: 0,
        wardId: 0,
        districtId: 0,
        provinceId: 0,
      },
      ...data,
    }

    return apiRequest<{ listingId: number; status: string }>({
      method: 'POST',
      url: PATHS.LISTING.CREATE,
      data: draftData,
    })
  }

  /**
   * Update existing listing as draft
   */
  static async updateDraft(
    id: string | number,
    data: Partial<UpdateListingRequest>,
  ): Promise<ApiResponse<string>> {
    const url = PATHS.LISTING.UPDATE.replace(':id', id.toString())
    return apiRequest<string>({
      method: 'PUT',
      url,
      data,
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
   * @param {ListingSearchRequest} request - Search filters (all optional)
   * @param {AxiosInstance} instance - Optional axios instance for server-side calls
   * @returns {Promise<ApiResponse<ListingSearchResponse>>} Promise resolving to search results
   * @example
   * const results = await ListingService.search({
   *   provinceId: 1,
   *   listingType: 'RENT',
   *   minPrice: 5000000,
   *   maxPrice: 15000000,
   *   page: 0,
   *   size: 20
   * })
   */
  static async search(
    request: ListingSearchRequest,
    instance?: AxiosInstance,
  ): Promise<ApiResponse<ListingSearchApiResponse['data']>> {
    const response = await apiRequest<ListingSearchApiResponse['data']>(
      {
        method: 'POST',
        url: PATHS.LISTING.SEARCH,
        data: request,
      },
      instance,
    )

    return response
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
  updatePrice,
  getPricingHistory,
  getPricingHistoryByDateRange,
  getPriceStatistics,
  getCurrentPrice,
  getRecentPriceChanges,
  getByIdAdmin,
  getInitial,
  getProvinceStats,
  search,
} = ListingService
