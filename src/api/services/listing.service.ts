/**
 * Listing Service
 * Handles all listing-related operations including CRUD, pricing, and quota management
 * @module api/services/listing
 */

import {
  PropertyCard,
  Listing,
  ListingListApiResponse,
  CreateListingRequest,
  UpdateListingRequest,
  CreateVipListingRequest,
  QuotaCheckResponse,
  UpdatePriceRequest,
  PriceHistory,
  PriceStatistics,
} from '@/api/types/property.type'
import { ListFilters, ListFetcherResponse } from '@/contexts/list/index.type'
import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import { PATHS } from '@/api/paths'

// ============= HELPER FUNCTIONS =============

const convertListingToPropertyCard = (listing: Listing): PropertyCard => {
  return {
    id: listing.listingId.toString(),
    title: listing.title,
    description: listing.description,
    address: '',
    city: '',
    property_type: listing.productType,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    price: listing.price,
    currency: listing.priceUnit,
    area: listing.area,
    furnishing: listing.furnishing,
    amenities: listing.amenities.map((a) => a.name),
    verified: listing.verified,
    featured: listing.vipType !== 'NORMAL',
  }
}

export async function fetchListings(
  filters: ListFilters,
): Promise<ListFetcherResponse<PropertyCard>> {
  try {
    const params: Record<string, string | number> = {
      page: (filters.page || 1) - 1,
      size: filters.perPage || 20,
    }

    if (filters.search) params.search = filters.search
    if (filters.propertyType)
      params.productType = filters.propertyType.toUpperCase()
    if (filters.minPrice !== undefined) params.minPrice = filters.minPrice
    if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice
    if (filters.bedrooms !== undefined) params.bedrooms = filters.bedrooms
    if (filters.bathrooms !== undefined) params.bathrooms = filters.bathrooms
    if (filters.city) params.city = filters.city
    if (filters.amenities?.length)
      params.amenities = filters.amenities.join(',')

    const response = await apiRequest<ListingListApiResponse | Listing[]>({
      method: 'GET',
      url: PATHS.LISTING.LIST,
      params,
    })

    if (!response.data || response.code !== '999999') {
      throw new Error(response.message || 'Failed to fetch listings')
    }

    const listings = Array.isArray(response.data)
      ? response.data
      : response.data.listings || []
    const pagination = Array.isArray(response.data)
      ? undefined
      : response.data.pagination

    const properties = listings.map(convertListingToPropertyCard)

    return {
      data: properties,
      total: pagination?.total || listings.length,
      page: (pagination?.page || filters.page || 0) + 1,
      totalPages: pagination?.totalPages || 1,
      hasNext: pagination ? pagination.page + 1 < pagination.totalPages : false,
      hasPrevious: pagination ? pagination.page > 0 : false,
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
} = ListingService
