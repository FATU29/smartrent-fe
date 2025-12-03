/**
 * Address API Types
 * Based on Smart Rent Backend Address API Specification
 * Last updated: 2025-11-29
 */

// ==================== RESPONSE WRAPPERS ====================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  readonly data: T
  readonly message?: string | null
  readonly code?: string | number
}

/**
 * Paginated API response wrapper
 */
export interface PaginatedResponse<T> {
  readonly success: boolean
  readonly message: string | null
  readonly data: T
  readonly metadata: {
    readonly total: number
    readonly page: number
    readonly limit: number
  }
}

export interface LegacyProvinceResponse {
  id: number
  name: string
  shortName: string
  code: string
  key: string
}

export interface LegacyDistrictResponse {
  readonly id: number
  readonly name: string
  readonly code: string
  readonly type: string
  readonly level: string
  readonly provinceId: number
  readonly provinceName: string
  readonly isActive: boolean
  readonly fullAddressText: string
}

export interface LegacyWardResponse {
  readonly id: number
  readonly name: string
  readonly code: string
  readonly type: string
  readonly level: string
  readonly districtId: number
  readonly districtName: string
  readonly provinceId: number
  readonly provinceName: string
  readonly isActive: boolean
  readonly fullAddressText: string
}

// ==================== NEW STRUCTURE (34 PROVINCES) ====================

/**
 * New province response (2-tier: Province -> Ward, no districts)
 */
export interface NewProvinceResponse {
  readonly id: string
  readonly name: string
  readonly key: string
  readonly latitude?: number | null
  readonly longitude?: number | null
  readonly alias?: string | null
  readonly short_name?: string | null
}

/**
 * New ward response
 */
export interface NewWardResponse {
  readonly ward_id: number
  readonly code: string
  readonly name: string
  readonly type: string
  readonly province_code: string
}

/**
 * New address search response (for autocomplete)
 */
export interface NewAddressSearchResponse {
  readonly code: string
  readonly name: string
  readonly type: string
  readonly province_code: string
  readonly province_name: string
  readonly full_address: string
}

/**
 * New full address response
 */
export interface NewFullAddressResponse {
  readonly province: {
    readonly code: string
    readonly name: string
    readonly key?: string
    readonly latitude?: number | null
    readonly longitude?: number | null
    readonly alias?: string | null
    readonly short_name?: string | null
  }
  readonly ward?: {
    readonly code: string
    readonly name: string
    readonly type?: string
    readonly province_code?: string
    readonly province_name?: string
  }
}

// ==================== MERGE HISTORY ====================

/**
 * Merge history - New address info
 */
export interface MergeHistoryNewAddress {
  readonly province: {
    readonly code: string
    readonly name: string
    readonly key?: string
    readonly latitude?: number | null
    readonly longitude?: number | null
    readonly alias?: string | null
    readonly short_name?: string | null
  }
  readonly ward: {
    readonly code: string
    readonly name: string
    readonly type?: string
    readonly key?: string
    readonly latitude?: number | null
    readonly longitude?: number | null
    readonly alias?: string | null
    readonly short_name?: string | null
    readonly province_code?: string
    readonly province_name?: string
  }
}

/**
 * Merge history - Legacy address info
 */
export interface MergeHistoryLegacyAddress {
  readonly province: {
    readonly id: number
    readonly name: string
    readonly shortName?: string
    readonly code?: string
    readonly key?: string
  }
  readonly district: {
    readonly id: number
    readonly name: string
    readonly shortName?: string
    readonly code?: string
    readonly type?: string
    readonly provinceCode?: string
    readonly provinceName?: string
  }
  readonly ward: {
    readonly id: number
    readonly name: string
    readonly shortName?: string
    readonly code?: string
    readonly type?: string
    readonly provinceCode?: string
    readonly provinceName?: string
    readonly districtCode?: string
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
 * Merge history - Legacy source item
 */
export interface MergeHistoryLegacySource {
  readonly legacy_address: MergeHistoryLegacyAddress
  readonly is_merged_province: boolean
  readonly is_merged_ward: boolean
  readonly is_divided_ward: boolean
  readonly is_default: boolean
  readonly merge_description: string
}

/**
 * Address merge history response
 */
export interface AddressMergeHistoryResponse {
  readonly new_address: MergeHistoryNewAddress
  readonly legacy_sources: readonly MergeHistoryLegacySource[]
  readonly total_merged_count: number
  readonly merge_note: string
}

// ==================== GEOCODING ====================

/**
 * Location type for geocoding accuracy
 */
export type LocationType =
  | 'ROOFTOP'
  | 'RANGE_INTERPOLATED'
  | 'GEOMETRIC_CENTER'
  | 'APPROXIMATE'

/**
 * Geocoding response
 */
export interface GeocodingResponse {
  readonly latitude: number
  readonly longitude: number
  readonly formattedAddress: string
  readonly originalAddress: string
  readonly locationType: LocationType
  readonly placeId: string
}

// (Deprecated legacy aliases and paginated compatibility types removed)
