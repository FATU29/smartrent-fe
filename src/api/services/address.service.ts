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
  Ward,
  Street,
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
}
