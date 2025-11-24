/**
 * Address service for managing addresses, provinces, districts, wards, and streets
 * @module api/services/address
 */

import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import { PATHS } from '../paths'
import type {
  Address,
  CreateAddressRequest,
  Province,
  ProvinceSimple,
  District,
  DistrictExtended,
  Ward,
  WardExtended,
  Street,
  StreetExtended,
  Project,
  NewProvince,
  NewWard,
  SearchNewAddressResponse,
  NewFullAddressResponse,
  AddressConversionResponse,
  MergeHistoryData,
  HealthCheckResponse,
} from '../types/address.type'

export class AddressService {
  /**
   * Create a new address
   * @param {CreateAddressRequest} addressData - The address data to create
   * @returns {Promise<ApiResponse<Address>>} Promise resolving to created address data
   * @example
   * const address = await AddressService.createAddress({
   *   streetNumber: '123',
   *   streetId: 1,
   *   wardId: 1,
   *   districtId: 1,
   *   provinceId: 1,
   *   latitude: 10.762622,
   *   longitude: 106.660172
   * })
   */
  static async createAddress(
    addressData: CreateAddressRequest,
  ): Promise<ApiResponse<Address>> {
    return apiRequest<Address>({
      method: 'POST',
      url: PATHS.ADDRESS.CREATE,
      data: addressData,
    })
  }

  /**
   * Get address by ID
   * @param {number} addressId - The address ID
   * @returns {Promise<ApiResponse<Address>>} Promise resolving to address data
   * @example
   * const address = await AddressService.getAddressById(1)
   */
  static async getAddressById(
    addressId: number,
  ): Promise<ApiResponse<Address>> {
    return apiRequest<Address>({
      method: 'GET',
      url: PATHS.ADDRESS.BY_ID.replace(':addressId', addressId.toString()),
    })
  }

  /**
   * Search addresses by query string
   * @param {string} query - The search query
   * @returns {Promise<ApiResponse<readonly Address[]>>} Promise resolving to list of addresses
   * @example
   * const addresses = await AddressService.searchAddresses('Nguyen Hue')
   */
  static async searchAddresses(
    query: string,
  ): Promise<ApiResponse<readonly Address[]>> {
    return apiRequest<readonly Address[]>({
      method: 'GET',
      url: PATHS.ADDRESS.SEARCH,
      params: { q: query },
    })
  }

  /**
   * Get address suggestions by query string
   * @param {string} query - The search query
   * @returns {Promise<ApiResponse<readonly Address[]>>} Promise resolving to list of address suggestions
   * @example
   * const suggestions = await AddressService.suggestAddresses('Nguyen')
   */
  static async suggestAddresses(
    query: string,
  ): Promise<ApiResponse<readonly Address[]>> {
    return apiRequest<readonly Address[]>({
      method: 'GET',
      url: PATHS.ADDRESS.SUGGEST,
      params: { q: query },
    })
  }

  /**
   * Get nearby addresses within specified radius
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @param {number} [radius=5] - Search radius in kilometers (default: 5km)
   * @returns {Promise<ApiResponse<readonly Address[]>>} Promise resolving to list of nearby addresses
   * @example
   * const nearbyAddresses = await AddressService.getNearbyAddresses(10.762622, 106.660172, 10)
   */
  static async getNearbyAddresses(
    latitude: number,
    longitude: number,
    radius: number = 5,
  ): Promise<ApiResponse<readonly Address[]>> {
    return apiRequest<readonly Address[]>({
      method: 'GET',
      url: PATHS.ADDRESS.NEARBY,
      params: { latitude, longitude, radius },
    })
  }

  /**
   * Get all provinces
   * @returns {Promise<ApiResponse<readonly ProvinceSimple[]>>} Promise resolving to list of provinces
   * @example
   * const provinces = await AddressService.getProvinces()
   */
  static async getProvinces(): Promise<ApiResponse<readonly ProvinceSimple[]>> {
    return apiRequest<readonly ProvinceSimple[]>({
      method: 'GET',
      url: PATHS.ADDRESS.PROVINCES,
    })
  }

  /**
   * Get province by ID
   * @param {number} provinceId - The province ID
   * @returns {Promise<ApiResponse<Province>>} Promise resolving to province data
   * @example
   * const province = await AddressService.getProvinceById(1)
   */
  static async getProvinceById(
    provinceId: number,
  ): Promise<ApiResponse<Province>> {
    return apiRequest<Province>({
      method: 'GET',
      url: PATHS.ADDRESS.PROVINCE_BY_ID.replace(
        ':provinceId',
        provinceId.toString(),
      ),
    })
  }

  /**
   * Search provinces by query string
   * @param {string} query - The search query
   * @returns {Promise<ApiResponse<readonly Province[]>>} Promise resolving to list of provinces
   * @example
   * const provinces = await AddressService.searchProvinces('Ha Noi')
   */
  static async searchProvinces(
    query: string,
  ): Promise<ApiResponse<readonly Province[]>> {
    return apiRequest<readonly Province[]>({
      method: 'GET',
      url: PATHS.ADDRESS.PROVINCE_SEARCH,
      params: { q: query },
    })
  }

  /**
   * Get districts by province ID
   * @param {number} provinceId - The province ID
   * @returns {Promise<ApiResponse<readonly District[]>>} Promise resolving to list of districts
   * @example
   * const districts = await AddressService.getDistrictsByProvince(1)
   */
  static async getDistrictsByProvince(
    provinceId: number,
  ): Promise<ApiResponse<readonly District[]>> {
    return apiRequest<readonly District[]>({
      method: 'GET',
      url: PATHS.ADDRESS.DISTRICTS_BY_PROVINCE.replace(
        ':provinceId',
        provinceId.toString(),
      ),
    })
  }

  /**
   * Get district by ID
   * @param {number} districtId - The district ID
   * @returns {Promise<ApiResponse<District>>} Promise resolving to district data
   * @example
   * const district = await AddressService.getDistrictById(1)
   */
  static async getDistrictById(
    districtId: number,
  ): Promise<ApiResponse<District>> {
    return apiRequest<District>({
      method: 'GET',
      url: PATHS.ADDRESS.DISTRICT_BY_ID.replace(
        ':districtId',
        districtId.toString(),
      ),
    })
  }

  /**
   * Get wards by district ID
   * @param {number} districtId - The district ID
   * @returns {Promise<ApiResponse<readonly Ward[]>>} Promise resolving to list of wards
   * @example
   * const wards = await AddressService.getWardsByDistrict(1)
   */
  static async getWardsByDistrict(
    districtId: number,
  ): Promise<ApiResponse<readonly Ward[]>> {
    return apiRequest<readonly Ward[]>({
      method: 'GET',
      url: PATHS.ADDRESS.WARDS_BY_DISTRICT.replace(
        ':districtId',
        districtId.toString(),
      ),
    })
  }

  /**
   * Get ward by ID
   * @param {number} wardId - The ward ID
   * @returns {Promise<ApiResponse<Ward>>} Promise resolving to ward data
   * @example
   * const ward = await AddressService.getWardById(1)
   */
  static async getWardById(wardId: number): Promise<ApiResponse<Ward>> {
    return apiRequest<Ward>({
      method: 'GET',
      url: PATHS.ADDRESS.WARD_BY_ID.replace(':wardId', wardId.toString()),
    })
  }

  /**
   * Get streets by ward ID
   * @param {number} wardId - The ward ID
   * @returns {Promise<ApiResponse<readonly Street[]>>} Promise resolving to list of streets
   * @example
   * const streets = await AddressService.getStreetsByWard(1)
   */
  static async getStreetsByWard(
    wardId: number,
  ): Promise<ApiResponse<readonly Street[]>> {
    return apiRequest<readonly Street[]>({
      method: 'GET',
      url: PATHS.ADDRESS.STREETS_BY_WARD.replace(':wardId', wardId.toString()),
    })
  }

  /**
   * Get street by ID
   * @param {number} streetId - The street ID
   * @returns {Promise<ApiResponse<Street>>} Promise resolving to street data
   * @example
   * const street = await AddressService.getStreetById(1)
   */
  static async getStreetById(streetId: number): Promise<ApiResponse<Street>> {
    return apiRequest<Street>({
      method: 'GET',
      url: PATHS.ADDRESS.STREET_BY_ID.replace(':streetId', streetId.toString()),
    })
  }

  /**
   * Search wards by name
   * @param {string} query - Search term
   * @param {number} [districtId] - Optional district ID to filter by
   * @returns {Promise<ApiResponse<readonly WardExtended[]>>} Promise resolving to list of wards
   * @example
   * const wards = await AddressService.searchWards('Phúc Xá', 1)
   */
  static async searchWards(
    query: string,
    districtId?: number,
  ): Promise<ApiResponse<readonly WardExtended[]>> {
    const params: Record<string, string | number> = { q: query }
    if (districtId !== undefined) {
      params.districtId = districtId
    }
    return apiRequest<readonly WardExtended[]>({
      method: 'GET',
      url: PATHS.ADDRESS.WARD_SEARCH,
      params,
    })
  }

  /**
   * Search streets by name
   * @param {string} query - Search term
   * @param {number} [provinceId] - Optional province ID to filter by
   * @param {number} [districtId] - Optional district ID to filter by
   * @returns {Promise<ApiResponse<readonly StreetExtended[]>>} Promise resolving to list of streets
   * @example
   * const streets = await AddressService.searchStreets('Nguyễn Trãi', 1, 1)
   */
  static async searchStreets(
    query: string,
    provinceId?: number,
    districtId?: number,
  ): Promise<ApiResponse<readonly StreetExtended[]>> {
    const params: Record<string, string | number> = { q: query }
    if (provinceId !== undefined) {
      params.provinceId = provinceId
    }
    if (districtId !== undefined) {
      params.districtId = districtId
    }
    return apiRequest<readonly StreetExtended[]>({
      method: 'GET',
      url: PATHS.ADDRESS.STREET_SEARCH,
      params,
    })
  }

  /**
   * Search addresses in new structure
   * @param {string} keyword - Search keyword
   * @param {number} [page=1] - Page number
   * @param {number} [limit=20] - Items per page (max 100)
   * @returns {Promise<ApiResponse<SearchNewAddressResponse>>} Promise resolving to search results
   * @example
   * const results = await AddressService.searchNewAddress('Hà Nội', 1, 20)
   */
  static async searchNewAddress(
    keyword: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<ApiResponse<SearchNewAddressResponse>> {
    return apiRequest<SearchNewAddressResponse>({
      method: 'GET',
      url: PATHS.ADDRESS.SEARCH_NEW,
      params: { keyword, page, limit },
    })
  }

  /**
   * Get streets by province ID
   * @param {number} provinceId - The province ID
   * @returns {Promise<ApiResponse<readonly StreetExtended[]>>} Promise resolving to list of streets
   * @example
   * const streets = await AddressService.getStreetsByProvince(1)
   */
  static async getStreetsByProvince(
    provinceId: number,
  ): Promise<ApiResponse<readonly StreetExtended[]>> {
    return apiRequest<readonly StreetExtended[]>({
      method: 'GET',
      url: PATHS.ADDRESS.STREETS_BY_PROVINCE.replace(
        ':provinceId',
        provinceId.toString(),
      ),
    })
  }

  /**
   * Get projects by province ID
   * @param {number} provinceId - The province ID
   * @returns {Promise<ApiResponse<readonly Project[]>>} Promise resolving to list of projects
   * @example
   * const projects = await AddressService.getProjectsByProvince(79)
   */
  static async getProjectsByProvince(
    provinceId: number,
  ): Promise<ApiResponse<readonly Project[]>> {
    return apiRequest<readonly Project[]>({
      method: 'GET',
      url: PATHS.ADDRESS.PROJECTS_BY_PROVINCE.replace(
        ':provinceId',
        provinceId.toString(),
      ),
    })
  }

  /**
   * Search districts by name
   * @param {string} query - Search term
   * @param {number} [provinceId] - Optional province ID to filter by
   * @returns {Promise<ApiResponse<readonly DistrictExtended[]>>} Promise resolving to list of districts
   * @example
   * const districts = await AddressService.searchDistricts('Ba Đình', 1)
   */
  static async searchDistricts(
    query: string,
    provinceId?: number,
  ): Promise<ApiResponse<readonly DistrictExtended[]>> {
    const params: Record<string, string | number> = { q: query }
    if (provinceId !== undefined) {
      params.provinceId = provinceId
    }
    return apiRequest<readonly DistrictExtended[]>({
      method: 'GET',
      url: PATHS.ADDRESS.DISTRICT_SEARCH,
      params,
    })
  }

  /**
   * Get streets by district ID
   * @param {number} districtId - The district ID
   * @returns {Promise<ApiResponse<readonly StreetExtended[]>>} Promise resolving to list of streets
   * @example
   * const streets = await AddressService.getStreetsByDistrict(1)
   */
  static async getStreetsByDistrict(
    districtId: number,
  ): Promise<ApiResponse<readonly StreetExtended[]>> {
    return apiRequest<readonly StreetExtended[]>({
      method: 'GET',
      url: PATHS.ADDRESS.STREETS_BY_DISTRICT.replace(
        ':districtId',
        districtId.toString(),
      ),
    })
  }

  /**
   * Get projects by district ID
   * @param {number} districtId - The district ID
   * @returns {Promise<ApiResponse<readonly Project[]>>} Promise resolving to list of projects
   * @example
   * const projects = await AddressService.getProjectsByDistrict(769)
   */
  static async getProjectsByDistrict(
    districtId: number,
  ): Promise<ApiResponse<readonly Project[]>> {
    return apiRequest<readonly Project[]>({
      method: 'GET',
      url: PATHS.ADDRESS.PROJECTS_BY_DISTRICT.replace(
        ':districtId',
        districtId.toString(),
      ),
    })
  }

  /**
   * Get project by ID
   * @param {number} projectId - The project ID
   * @returns {Promise<ApiResponse<Project>>} Promise resolving to project data
   * @example
   * const project = await AddressService.getProjectById(1)
   */
  static async getProjectById(
    projectId: number,
  ): Promise<ApiResponse<Project>> {
    return apiRequest<Project>({
      method: 'GET',
      url: PATHS.ADDRESS.PROJECT_BY_ID.replace(
        ':projectId',
        projectId.toString(),
      ),
    })
  }

  /**
   * Search projects by name
   * @param {string} query - Search term
   * @param {number} [provinceId] - Optional province ID to filter by
   * @param {number} [districtId] - Optional district ID to filter by
   * @returns {Promise<ApiResponse<readonly Project[]>>} Promise resolving to list of projects
   * @example
   * const projects = await AddressService.searchProjects('Vinhomes', 79, 769)
   */
  static async searchProjects(
    query: string,
    provinceId?: number,
    districtId?: number,
  ): Promise<ApiResponse<readonly Project[]>> {
    const params: Record<string, string | number> = { q: query }
    if (provinceId !== undefined) {
      params.provinceId = provinceId
    }
    if (districtId !== undefined) {
      params.districtId = districtId
    }
    return apiRequest<readonly Project[]>({
      method: 'GET',
      url: PATHS.ADDRESS.PROJECT_SEARCH,
      params,
    })
  }

  /**
   * Get all provinces in new structure (34 provinces)
   * @param {string} [keyword] - Optional search keyword
   * @param {number} [page=1] - Page number
   * @param {number} [limit=20] - Items per page (max 100)
   * @returns {Promise<ApiResponse<readonly NewProvince[]>>} Promise resolving to list of provinces
   * @example
   * const provinces = await AddressService.getNewProvinces('Hà Nội', 1, 20)
   */
  static async getNewProvinces(
    keyword?: string,
    page: number = 1,
    limit: number = 34,
  ): Promise<ApiResponse<readonly NewProvince[]>> {
    const params: Record<string, string | number> = { page, limit }
    if (keyword) {
      params.keyword = keyword
    }
    return apiRequest<readonly NewProvince[]>({
      method: 'GET',
      url: PATHS.ADDRESS.NEW_PROVINCES,
      params,
    })
  }

  /**
   * Get wards by province code in new structure
   * @param {string} provinceCode - The province code
   * @param {string} [keyword] - Optional search keyword
   * @param {number} [page=1] - Page number
   * @param {number} [limit=20] - Items per page (max 100)
   * @returns {Promise<ApiResponse<readonly NewWard[]>>} Promise resolving to list of wards
   * @example
   * const wards = await AddressService.getNewProvinceWards('01', 'Ba Đình', 1, 20)
   */
  static async getNewProvinceWards(
    provinceCode: string,
    keyword?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<ApiResponse<readonly NewWard[]>> {
    const params: Record<string, string | number> = { page, limit }
    if (keyword) {
      params.keyword = keyword
    }
    return apiRequest<readonly NewWard[]>({
      method: 'GET',
      url: PATHS.ADDRESS.NEW_PROVINCE_WARDS.replace(
        ':provinceCode',
        provinceCode,
      ),
      params,
    })
  }

  /**
   * Get full address information in new structure
   * @param {string} provinceCode - Province code (required)
   * @param {string} [wardCode] - Optional ward code
   * @returns {Promise<ApiResponse<NewFullAddressResponse>>} Promise resolving to full address data
   * @example
   * const address = await AddressService.getNewFullAddress('01', '00004')
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
   * Convert address from new structure to legacy structure
   * @param {string} provinceCode - New province code
   * @param {string} wardCode - New ward code
   * @returns {Promise<ApiResponse<AddressConversionResponse>>} Promise resolving to conversion result
   * @example
   * const conversion = await AddressService.convertNewToLegacy('01', '00001')
   */
  static async convertNewToLegacy(
    provinceCode: string,
    wardCode: string,
  ): Promise<ApiResponse<AddressConversionResponse>> {
    return apiRequest<AddressConversionResponse>({
      method: 'GET',
      url: PATHS.ADDRESS.CONVERT_NEW_TO_LEGACY,
      params: { provinceCode, wardCode },
    })
  }

  /**
   * Convert address from legacy structure to new structure
   * @param {number} provinceId - Legacy province ID
   * @param {number} districtId - Legacy district ID
   * @param {number} wardId - Legacy ward ID
   * @returns {Promise<ApiResponse<AddressConversionResponse>>} Promise resolving to conversion result
   * @example
   * const conversion = await AddressService.convertLegacyToNew(1, 1, 1)
   */
  static async convertLegacyToNew(
    provinceId: number,
    districtId: number,
    wardId: number,
  ): Promise<ApiResponse<AddressConversionResponse>> {
    return apiRequest<AddressConversionResponse>({
      method: 'GET',
      url: PATHS.ADDRESS.CONVERT_LEGACY_TO_NEW,
      params: { provinceId, districtId, wardId },
    })
  }

  /**
   * Get merge history for a new address showing all legacy addresses merged into it
   * @param {string} provinceCode - New province code
   * @param {string} wardCode - New ward code
   * @returns {Promise<ApiResponse<MergeHistoryData>>} Promise resolving to merge history data
   * @example
   * const history = await AddressService.getMergeHistory('01', '00001')
   */
  static async getMergeHistory(
    provinceCode: string,
    wardCode: string,
  ): Promise<ApiResponse<MergeHistoryData>> {
    return apiRequest<MergeHistoryData>({
      method: 'GET',
      url: PATHS.ADDRESS.MERGE_HISTORY,
      params: { provinceCode, wardCode },
    })
  }

  /**
   * Health check for Address API
   * @returns {Promise<ApiResponse<HealthCheckResponse>>} Promise resolving to health check result
   * @example
   * const health = await AddressService.healthCheck()
   */
  static async healthCheck(): Promise<ApiResponse<HealthCheckResponse>> {
    return apiRequest<HealthCheckResponse>({
      method: 'GET',
      url: PATHS.ADDRESS.HEALTH,
    })
  }
}
