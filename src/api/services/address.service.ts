/**
 * Address service for managing addresses, provinces, districts, wards
 * Based on Smart Rent Backend Address API Specification
 * @module api/services/address
 */

import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import { instanceClientAxios } from '@/configs/axios/axiosClient'
import { PATHS } from '../paths'
import type {
  LegacyProvinceResponse,
  LegacyDistrictResponse,
  LegacyWardResponse,
  NewProvinceResponse,
  NewWardResponse,
  NewAddressSearchResponse,
  NewFullAddressResponse,
  AddressMergeHistoryResponse,
  GeocodingResponse,
  PaginatedResponse,
} from '../types/address.type'

export class AddressService {
  // ==================== LEGACY STRUCTURE (63 PROVINCES) ====================

  /**
   * Get all legacy provinces (63 provinces)
   * GET /v1/addresses/provinces
   * @returns {Promise<ApiResponse<readonly LegacyProvinceResponse[]>>}
   */
  static async getProvinces(): Promise<
    ApiResponse<readonly LegacyProvinceResponse[]>
  > {
    return apiRequest<readonly LegacyProvinceResponse[]>({
      method: 'GET',
      url: PATHS.ADDRESS.PROVINCES,
    })
  }

  /**
   * Get single province by ID
   * GET /v1/addresses/provinces/{provinceId}
   * @param {number} provinceId - The province ID
   * @returns {Promise<ApiResponse<LegacyProvinceResponse>>}
   */
  static async getProvinceById(
    provinceId: number,
  ): Promise<ApiResponse<LegacyProvinceResponse>> {
    return apiRequest<LegacyProvinceResponse>({
      method: 'GET',
      url: PATHS.ADDRESS.PROVINCE_BY_ID.replace(
        ':provinceId',
        provinceId.toString(),
      ),
    })
  }

  /**
   * Search provinces by partial name (case-insensitive)
   * GET /v1/addresses/provinces/search?q={name}
   * @param {string} query - Search query
   * @returns {Promise<ApiResponse<readonly LegacyProvinceResponse[]>>}
   */
  static async searchProvinces(
    query: string,
  ): Promise<ApiResponse<readonly LegacyProvinceResponse[]>> {
    return apiRequest<readonly LegacyProvinceResponse[]>({
      method: 'GET',
      url: PATHS.ADDRESS.PROVINCE_SEARCH,
      params: { q: query },
    })
  }

  /**
   * Get districts by province ID
   * GET /v1/addresses/provinces/{provinceId}/districts
   * @param {number} provinceId - The province ID
   * @returns {Promise<ApiResponse<readonly LegacyDistrictResponse[]>>}
   */
  static async getDistrictsByProvince(
    provinceId: number,
  ): Promise<ApiResponse<readonly LegacyDistrictResponse[]>> {
    return apiRequest<readonly LegacyDistrictResponse[]>({
      method: 'GET',
      url: PATHS.ADDRESS.DISTRICTS_BY_PROVINCE.replace(
        ':provinceId',
        provinceId.toString(),
      ),
    })
  }

  /**
   * Get paginated districts by province ID (with metadata)
   * Note: This method may not be documented in the latest API spec but is kept for backward compatibility
   * @param {number} provinceId - The province ID
   * @param {string} [keyword] - Optional search keyword
   * @param {number} [page=1] - Page number
   * @param {number} [limit=20] - Items per page
   * @returns {Promise<PaginatedResponse<readonly LegacyDistrictResponse[]>>}
   */
  static async getDistrictsByProvincePaginated(
    provinceId: number,
    keyword?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<readonly LegacyDistrictResponse[]>> {
    const params: Record<string, string | number> = { page, limit }
    if (keyword) {
      params.keyword = keyword
    }

    const axiosResponse = await instanceClientAxios({
      method: 'GET',
      url: PATHS.ADDRESS.DISTRICTS_BY_PROVINCE.replace(
        ':provinceId',
        provinceId.toString(),
      ),
      params,
    })

    const responseData = axiosResponse.data as
      | PaginatedResponse<readonly LegacyDistrictResponse[]>
      | ApiResponse<readonly LegacyDistrictResponse[]>

    // Check if response has metadata (paginated) or is standard ApiResponse
    if ('metadata' in responseData) {
      return {
        success: responseData.success ?? true,
        message: responseData.message || 'Success',
        data: responseData.data || [],
        metadata: responseData.metadata || {
          total: responseData.data?.length || 0,
          page,
          limit,
        },
      }
    }

    // Fallback to standard ApiResponse format
    return {
      success: true,
      message: 'Success',
      data: responseData.data || [],
      metadata: {
        total: responseData.data?.length || 0,
        page,
        limit,
      },
    }
  }

  /**
   * Get district by ID
   * GET /v1/addresses/districts/{districtId}
   * @param {number} districtId - The district ID
   * @returns {Promise<ApiResponse<LegacyDistrictResponse>>}
   */
  static async getDistrictById(
    districtId: number,
  ): Promise<ApiResponse<LegacyDistrictResponse>> {
    return apiRequest<LegacyDistrictResponse>({
      method: 'GET',
      url: PATHS.ADDRESS.DISTRICT_BY_ID.replace(
        ':districtId',
        districtId.toString(),
      ),
    })
  }

  /**
   * Search districts by name, optionally filter by province
   * GET /v1/addresses/districts/search?q={name}&provinceId={optional}
   * @param {string} query - Search query
   * @param {number} [provinceId] - Optional province ID filter
   * @returns {Promise<ApiResponse<readonly LegacyDistrictResponse[]>>}
   */
  static async searchDistricts(
    query: string,
    provinceId?: number,
  ): Promise<ApiResponse<readonly LegacyDistrictResponse[]>> {
    const params: Record<string, string | number> = { q: query }
    if (provinceId !== undefined) {
      params.provinceId = provinceId
    }
    return apiRequest<readonly LegacyDistrictResponse[]>({
      method: 'GET',
      url: PATHS.ADDRESS.DISTRICT_SEARCH,
      params,
    })
  }

  /**
   * Get wards by district ID
   * GET /v1/addresses/districts/{districtId}/wards
   * @param {number} districtId - The district ID
   * @returns {Promise<ApiResponse<readonly LegacyWardResponse[]>>}
   */
  static async getWardsByDistrict(
    districtId: number,
  ): Promise<ApiResponse<readonly LegacyWardResponse[]>> {
    return apiRequest<readonly LegacyWardResponse[]>({
      method: 'GET',
      url: PATHS.ADDRESS.WARDS_BY_DISTRICT.replace(
        ':districtId',
        districtId.toString(),
      ),
    })
  }

  /**
   * Get paginated wards by district ID (with metadata)
   * Note: This method may not be documented in the latest API spec but is kept for backward compatibility
   * @param {number} districtId - The district ID
   * @param {string} [keyword] - Optional search keyword
   * @param {number} [page=1] - Page number
   * @param {number} [limit=20] - Items per page
   * @returns {Promise<PaginatedResponse<readonly LegacyWardResponse[]>>}
   */
  static async getWardsByDistrictPaginated(
    districtId: number,
    keyword?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<readonly LegacyWardResponse[]>> {
    const params: Record<string, string | number> = { page, limit }
    if (keyword) {
      params.keyword = keyword
    }

    const axiosResponse = await instanceClientAxios({
      method: 'GET',
      url: PATHS.ADDRESS.WARDS_BY_DISTRICT.replace(
        ':districtId',
        districtId.toString(),
      ),
      params,
    })

    const responseData = axiosResponse.data as
      | PaginatedResponse<readonly LegacyWardResponse[]>
      | ApiResponse<readonly LegacyWardResponse[]>

    // Check if response has metadata (paginated) or is standard ApiResponse
    if ('metadata' in responseData) {
      return {
        success: responseData.success ?? true,
        message: responseData.message || 'Success',
        data: responseData.data || [],
        metadata: responseData.metadata || {
          total: responseData.data?.length || 0,
          page,
          limit,
        },
      }
    }

    // Fallback to standard ApiResponse format
    return {
      success: true,
      message: 'Success',
      data: responseData.data || [],
      metadata: {
        total: responseData.data?.length || 0,
        page,
        limit,
      },
    }
  }

  /**
   * Get ward by ID
   * GET /v1/addresses/wards/{wardId}
   * @param {number} wardId - The ward ID
   * @returns {Promise<ApiResponse<LegacyWardResponse>>}
   */
  static async getWardById(
    wardId: number,
  ): Promise<ApiResponse<LegacyWardResponse>> {
    return apiRequest<LegacyWardResponse>({
      method: 'GET',
      url: PATHS.ADDRESS.WARD_BY_ID.replace(':wardId', wardId.toString()),
    })
  }

  /**
   * Search wards by name, optionally filter by district
   * GET /v1/addresses/wards/search?q={name}&districtId={optional}
   * @param {string} query - Search query
   * @param {number} [districtId] - Optional district ID filter
   * @returns {Promise<ApiResponse<readonly LegacyWardResponse[]>>}
   */
  static async searchWards(
    query: string,
    districtId?: number,
  ): Promise<ApiResponse<readonly LegacyWardResponse[]>> {
    const params: Record<string, string | number> = { q: query }
    if (districtId !== undefined) {
      params.districtId = districtId
    }
    return apiRequest<readonly LegacyWardResponse[]>({
      method: 'GET',
      url: PATHS.ADDRESS.WARD_SEARCH,
      params,
    })
  }

  static async getNewProvinces(): Promise<NewProvinceResponse[]> {
    const axiosResponse = await instanceClientAxios({
      method: 'GET',
      url: PATHS.ADDRESS.NEW_PROVINCES,
    })

    return axiosResponse.data
  }

  /**
   * Get wards by province code in new structure (no districts layer)
   * GET /v1/addresses/new-provinces/{provinceCode}/wards?keyword={optional}&page={optional}&limit={optional}
   * @param {string} provinceCode - The province code
   * @param {string} [keyword] - Optional search keyword
   * @param {number} [page=1] - Page number
   * @param {number} [limit=20] - Items per page
   * @returns {Promise<PaginatedResponse<readonly NewWardResponse[]>>}
   */
  static async getNewProvinceWards(
    provinceCode: string,
    keyword?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<readonly NewWardResponse[]>> {
    const params: Record<string, string | number> = { page, limit }
    if (keyword) {
      params.keyword = keyword
    }

    const axiosResponse = await instanceClientAxios({
      method: 'GET',
      url: PATHS.ADDRESS.NEW_PROVINCE_WARDS.replace(
        ':provinceCode',
        provinceCode,
      ),
      params,
    })

    const responseData = axiosResponse.data as PaginatedResponse<
      readonly NewWardResponse[]
    >

    return {
      success: responseData.success ?? true,
      message: responseData.message || 'Success',
      data: responseData.data || [],
      metadata: responseData.metadata || {
        total: responseData.data?.length || 0,
        page,
        limit,
      },
    }
  }

  /**
   * Get full address details (province + ward) in new structure
   * GET /v1/addresses/new-full-address?provinceCode={code}&wardCode={optional}
   * @param {string} provinceCode - Province code (required)
   * @param {string} [wardCode] - Optional ward code
   * @returns {Promise<ApiResponse<NewFullAddressResponse>>}
   */
  static async getNewFullAddress(
    provinceCode: string,
    wardCode?: string,
  ): Promise<ApiResponse<NewFullAddressResponse>> {
    const params: Record<string, string> = { provinceCode }
    if (wardCode) {
      params.wardCode = wardCode
    }
    return apiRequest<NewFullAddressResponse>({
      method: 'GET',
      url: PATHS.ADDRESS.NEW_FULL_ADDRESS,
      params,
    })
  }

  /**
   * Full-text search across provinces and wards (autocomplete scenario)
   * GET /v1/addresses/search-new-address?keyword={kw}&page={p}&limit={n}
   * @param {string} keyword - Search keyword (required)
   * @param {number} [page=1] - Page number
   * @param {number} [limit=20] - Items per page
   * @returns {Promise<PaginatedResponse<readonly NewAddressSearchResponse[]>>}
   */
  static async searchNewAddress(
    keyword: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<readonly NewAddressSearchResponse[]>> {
    const params: Record<string, string | number> = {
      keyword,
      page,
      limit,
    }

    const axiosResponse = await instanceClientAxios({
      method: 'GET',
      url: PATHS.ADDRESS.SEARCH_NEW,
      params,
    })

    const responseData = axiosResponse.data as PaginatedResponse<
      readonly NewAddressSearchResponse[]
    >

    return {
      success: responseData.success ?? true,
      message: responseData.message || 'Success',
      data: responseData.data || [],
      metadata: responseData.metadata || {
        total: responseData.data?.length || 0,
        page,
        limit,
      },
    }
  }

  // ==================== MERGE HISTORY ====================

  /**
   * Get merge history showing how a new ward aggregates legacy wards
   * GET /v1/addresses/merge-history?provinceCode={pc}&wardCode={wc}
   * @param {string} provinceCode - Province code (required)
   * @param {string} wardCode - Ward code (required)
   * @returns {Promise<ApiResponse<AddressMergeHistoryResponse>>}
   */
  static async getMergeHistory(
    provinceCode: string,
    wardCode: string,
  ): Promise<ApiResponse<AddressMergeHistoryResponse>> {
    return apiRequest<AddressMergeHistoryResponse>({
      method: 'GET',
      url: PATHS.ADDRESS.MERGE_HISTORY,
      params: { provinceCode, wardCode },
    })
  }

  // ==================== GEOCODING ====================

  /**
   * Geocode an address to get coordinates using Google Geocoding API
   * GET /v1/addresses/geocode?address={text}
   * @param {string} address - Address to geocode (can be full address, city, partial address, or landmark)
   * @returns {Promise<ApiResponse<GeocodingResponse>>}
   */
  static async geocode(
    address: string,
  ): Promise<ApiResponse<GeocodingResponse>> {
    return apiRequest<GeocodingResponse>({
      method: 'GET',
      url: PATHS.ADDRESS.GEOCODE,
      params: { address },
    })
  }

  // ==================== HEALTH ====================

  /**
   * Health check endpoint
   * GET /v1/addresses/health
   * @returns {Promise<ApiResponse<string>>}
   */
  static async healthCheck(): Promise<ApiResponse<string>> {
    return apiRequest<string>({
      method: 'GET',
      url: PATHS.ADDRESS.HEALTH,
    })
  }
}
