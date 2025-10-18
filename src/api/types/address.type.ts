/**
 * Address-related type definitions for the API
 * @module api/types/address
 */

/**
 * Address detail information
 */
export interface Address {
  readonly addressId: number
  readonly streetNumber: string
  readonly streetId: number
  readonly streetName: string
  readonly wardId: number
  readonly wardName: string
  readonly districtId: number
  readonly districtName: string
  readonly provinceId: number
  readonly provinceName: string
  readonly fullAddress: string
  readonly latitude: number
  readonly longitude: number
  readonly verified: boolean
}

/**
 * Request body for creating a new address
 */
export interface CreateAddressRequest {
  readonly streetNumber: string
  readonly streetId: number
  readonly wardId: number
  readonly districtId: number
  readonly provinceId: number
  readonly latitude: number
  readonly longitude: number
}

/**
 * Province information
 */
export interface Province {
  readonly provinceId: number
  readonly name: string
  readonly code: string
  readonly type: string
  readonly displayName: string
  readonly parentProvinceId: number
  readonly originalName: string
  readonly active: boolean
  readonly merged: boolean
  readonly parentProvince: boolean
}

/**
 * Simplified province information for list views
 */
export interface ProvinceSimple {
  readonly provinceId: number
  readonly name: string
}

/**
 * District information
 */
export interface District {
  readonly districtId: number
  readonly name: string
  readonly code: string
  readonly type: string
  readonly provinceId: number
  readonly provinceName: string
  readonly active: boolean
}

/**
 * Ward information
 */
export interface Ward {
  readonly wardId: number
  readonly name: string
  readonly code: string
  readonly type: string
  readonly districtId: number
  readonly districtName: string
  readonly provinceId: number
  readonly provinceName: string
  readonly active: boolean
}

/**
 * Street information
 */
export interface Street {
  readonly streetId: number
  readonly name: string
  readonly wardId: number
  readonly wardName: string
  readonly districtId: number
  readonly districtName: string
  readonly provinceId: number
  readonly provinceName: string
  readonly active: boolean
}

/**
 * API response wrapper for address creation
 */
export interface CreateAddressResponse {
  readonly code: string
  readonly message: string
  readonly data: Address
}

/**
 * API response wrapper for single address retrieval
 */
export interface GetAddressResponse {
  readonly code: string
  readonly message: string
  readonly data: Address
}

/**
 * API response wrapper for province list
 */
export interface GetProvincesResponse {
  readonly code: string
  readonly message: string
  readonly data: readonly ProvinceSimple[]
}

/**
 * API response wrapper for single province retrieval
 */
export interface GetProvinceResponse {
  readonly code: string
  readonly message: string
  readonly data: Province
}

/**
 * API response wrapper for district list
 */
export interface GetDistrictsResponse {
  readonly code: string
  readonly message: string
  readonly data: readonly District[]
}

/**
 * API response wrapper for single district retrieval
 */
export interface GetDistrictResponse {
  readonly code: string
  readonly message: string
  readonly data: District
}

/**
 * API response wrapper for ward list
 */
export interface GetWardsResponse {
  readonly code: string
  readonly message: string
  readonly data: readonly Ward[]
}

/**
 * API response wrapper for single ward retrieval
 */
export interface GetWardResponse {
  readonly code: string
  readonly message: string
  readonly data: Ward
}

/**
 * API response wrapper for street list
 */
export interface GetStreetsResponse {
  readonly code: string
  readonly message: string
  readonly data: readonly Street[]
}

/**
 * API response wrapper for single street retrieval
 */
export interface GetStreetResponse {
  readonly code: string
  readonly message: string
  readonly data: Street
}

/**
 * API response wrapper for address search
 */
export interface SearchAddressesResponse {
  readonly code: string
  readonly message: string
  readonly data: readonly Address[]
}

/**
 * API response wrapper for address suggestions
 */
export interface SuggestAddressesResponse {
  readonly code: string
  readonly message: string
  readonly data: readonly Address[]
}

/**
 * API response wrapper for nearby addresses
 */
export interface GetNearbyAddressesResponse {
  readonly code: string
  readonly message: string
  readonly data: readonly Address[]
}

/**
 * API response wrapper for province search
 */
export interface SearchProvincesResponse {
  readonly code: string
  readonly message: string
  readonly data: readonly Province[]
}
