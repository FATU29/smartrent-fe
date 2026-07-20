/**
 * Draft Listing API Types
 * Based on backend API specification - Updated 2025-12-07
 */

import {
  Amenity,
  MediaItem,
  Direction,
  Furnishing,
  PropertyType,
  VipType,
  PriceUnit,
  listingType,
  PriceType,
} from './property.type'

/**
 * Request DTO for creating/updating draft listings
 * All fields are optional to support partial data saving
 */
export interface DraftListingRequest {
  // Core Information
  title?: string
  description?: string
  listingType?: listingType
  vipType?: VipType
  categoryId?: number
  productType?: PropertyType

  // Pricing
  price?: number
  priceUnit?: PriceUnit

  // Address
  address?: {
    legacy?: {
      provinceId?: number
      districtId?: number
      wardId?: number
      street?: string
    }
    new?: {
      provinceCode?: string
      wardCode?: string
      street?: string
    }
    streetId?: number
    projectId?: number
    latitude?: number
    longitude?: number
  }

  // Property Specifications
  area?: number
  bedrooms?: number
  bathrooms?: number
  direction?: Direction
  furnishing?: Furnishing
  roomCapacity?: number

  // Utility Costs
  waterPrice?: PriceType
  electricityPrice?: PriceType
  internetPrice?: PriceType
  serviceFee?: PriceType

  // Related IDs
  amenityIds?: number[]
  mediaIds?: number[]
}

/**
 * Draft address nested object in response
 */
export interface DraftAddressResponse {
  addressId: number | null
  fullAddress: string | null
  fullNewAddress: string | null
  latitude: number
  longitude: number
  addressType: 'OLD' | 'NEW'

  // Legacy address fields
  legacyProvinceId: number | null
  legacyProvinceName: string | null
  legacyDistrictId: number | null
  legacyDistrictName: string | null
  legacyWardId: number | null
  legacyWardName: string | null
  legacyStreet: string | null

  // New address fields
  newProvinceCode: string | null
  newProvinceName: string | null
  newWardCode: string | null
  newWardName: string | null
  newStreet: string | null

  // Common fields
  streetId: number | null
  streetName: string | null
  projectId: number | null
  projectName: string | null
}

/**
 * Response DTO for draft listing operations
 * This matches the new backend response structure with nested objects
 */
export interface DraftListingResponse {
  draftId: number
  userId: string

  // Core Information
  title: string
  description: string
  listingType: listingType
  vipType: VipType | null
  categoryId: number
  productType: PropertyType

  // Pricing
  price: number
  priceUnit: PriceUnit

  // Address - Now a nested object (null while the draft has no address yet)
  address: DraftAddressResponse | null

  // Property Specifications
  area: number
  bedrooms: number
  bathrooms: number
  direction: Direction
  furnishing: Furnishing
  roomCapacity: number | null

  // Utility Costs
  waterPrice: PriceType
  electricityPrice: PriceType
  internetPrice: PriceType
  serviceFee: PriceType

  // Related data - Now full objects, not just IDs
  amenities: Amenity[]
  media: MediaItem[] | null

  // Package / payment selection (backend V117). Note there is deliberately no
  // postDate/expiryDate here — listing_drafts has no columns for those, so a
  // scheduled post date cannot survive a draft round trip.
  durationDays: number | null
  useMembershipQuota: boolean | null
  benefitIds: number[] | null

  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Publishing a draft takes and returns exactly what creating a listing does —
 * see CreateListingRequest / CreateListingResponse in property.type.ts. The
 * server merges the draft with the payload and runs the same creation flow, so
 * a separate pair of DTOs here only ever drifts out of sync with the backend.
 */
