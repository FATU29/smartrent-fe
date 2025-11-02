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

/**
 * Project information
 */
export interface Project {
  readonly id: number
  readonly name: string
  readonly nameEn: string
  readonly provinceId: number
  readonly provinceName: string
  readonly districtId: number
  readonly districtName: string
  readonly latitude: number
  readonly longitude: number
}

/**
 * Ward with extended information for API responses
 */
export interface WardExtended extends Ward {
  readonly nameEn: string
  readonly prefix: string
}

/**
 * Street with extended information for API responses
 */
export interface StreetExtended extends Street {
  readonly nameEn: string
  readonly prefix: string
}

/**
 * District with extended information for API responses
 */
export interface DistrictExtended extends District {
  readonly nameEn: string
  readonly prefix: string
  readonly level: string
  readonly fullAddressText: string
}

/**
 * Province in new structure (34 provinces)
 */
export interface NewProvince {
  readonly province_id: number
  readonly code: string
  readonly name: string
  readonly type: string
}

/**
 * Ward in new structure
 */
export interface NewWard {
  readonly ward_id: number
  readonly code: string
  readonly name: string
  readonly type: string
  readonly province_code: string
}

/**
 * Search new address item
 */
export interface SearchNewAddressItem {
  readonly code: string
  readonly name: string
  readonly type: string
  readonly province_code: string
  readonly province_name: string
  readonly full_address: string
}

/**
 * Search new address response metadata
 */
export interface SearchNewAddressMetadata {
  readonly total: number
  readonly page: number
  readonly limit: number
}

/**
 * Search new address response
 */
export interface SearchNewAddressResponse {
  readonly success: boolean
  readonly message: string
  readonly data: readonly SearchNewAddressItem[]
  readonly metadata: SearchNewAddressMetadata
}

/**
 * New structure full address province
 */
export interface NewFullAddressProvince {
  readonly province_id: number
  readonly code: string
  readonly name: string
  readonly type: string
}

/**
 * New structure full address ward
 */
export interface NewFullAddressWard {
  readonly ward_id: number
  readonly code: string
  readonly name: string
  readonly type: string
  readonly province_code: string
}

/**
 * New structure full address data
 */
export interface NewFullAddressData {
  readonly province: NewFullAddressProvince
  readonly ward?: NewFullAddressWard
}

/**
 * New structure full address response
 */
export interface NewFullAddressResponse {
  readonly data: NewFullAddressData
  readonly message: string
}

/**
 * Legacy address structure
 */
export interface LegacyAddress {
  readonly province: {
    readonly id: number
    readonly name: string
    readonly code: string
    readonly nameEn?: string
  }
  readonly district?: {
    readonly id: number
    readonly name: string
    readonly nameEn?: string
    readonly prefix?: string
    readonly provinceId?: number
    readonly provinceName?: string
  }
  readonly ward?: {
    readonly id: number
    readonly name: string
    readonly nameEn?: string
    readonly prefix?: string
    readonly provinceId?: number
    readonly provinceName?: string
    readonly districtId?: number
    readonly districtName?: string
  }
  readonly street?: {
    readonly id: number
    readonly name: string
    readonly nameEn?: string
    readonly prefix?: string
    readonly provinceId?: number
    readonly provinceName?: string
    readonly districtId?: number
    readonly districtName?: string
  }
}

/**
 * New address structure
 */
export interface NewAddress {
  readonly province: {
    readonly code: string
    readonly name: string
    readonly name_en?: string
    readonly full_name?: string
    readonly full_name_en?: string
    readonly code_name?: string
    readonly administrative_unit_type?: string
  }
  readonly ward?: {
    readonly code: string
    readonly name: string
    readonly name_en?: string
    readonly full_name?: string
    readonly full_name_en?: string
    readonly code_name?: string
    readonly province_code?: string
    readonly province_name?: string
    readonly administrative_unit_type?: string
  }
}

/**
 * Address conversion response data
 */
export interface AddressConversionData {
  readonly legacyAddress: LegacyAddress
  readonly newAddress: NewAddress
  readonly conversionNote: string
}

/**
 * Address conversion response
 */
export interface AddressConversionResponse {
  readonly data: AddressConversionData
  readonly message: string
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  readonly code: string
  readonly message: string
  readonly data: string
}
