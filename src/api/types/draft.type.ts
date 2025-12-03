/**
 * Draft Listing API Types
 * Based on backend API specification
 */

/**
 * Request DTO for creating/updating draft listings
 * All fields are optional to support partial data saving
 */
export interface DraftListingRequest {
  // Core Information
  title?: string
  description?: string
  listingType?: 'RENT' | 'SALE' | 'SHARE'
  vipType?: 'NORMAL' | 'SILVER' | 'GOLD' | 'DIAMOND'
  categoryId?: number
  productType?: 'ROOM' | 'APARTMENT' | 'HOUSE' | 'OFFICE' | 'STUDIO'

  // Pricing
  price?: number
  priceUnit?: 'MONTH' | 'DAY' | 'YEAR'

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
  direction?: string
  furnishing?: 'FULLY_FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED'
  roomCapacity?: number

  // Utility Costs
  waterPrice?: string
  electricityPrice?: string
  internetPrice?: string
  serviceFee?: string

  // Related IDs
  amenityIds?: number[]
  mediaIds?: number[]
}

/**
 * Response DTO for draft listing operations
 */
export interface DraftListingResponse {
  draftId: number
  userId: string

  // Core Information
  title?: string
  description?: string
  listingType?: 'RENT' | 'SALE' | 'SHARE'
  vipType?: 'NORMAL' | 'SILVER' | 'GOLD' | 'DIAMOND'
  categoryId?: number
  productType?: 'ROOM' | 'APARTMENT' | 'HOUSE' | 'OFFICE' | 'STUDIO'

  // Pricing
  price?: number
  priceUnit?: 'MONTH' | 'DAY' | 'YEAR'

  // Address Information
  addressType?: 'OLD' | 'NEW'

  // Legacy address fields
  provinceId?: number
  districtId?: number
  wardId?: number

  // New address fields
  provinceCode?: string
  wardCode?: string

  // Common address fields
  street?: string
  streetId?: number
  projectId?: number
  latitude?: number
  longitude?: number

  // Property Specifications
  area?: number
  bedrooms?: number
  bathrooms?: number
  direction?: string
  furnishing?: string
  roomCapacity?: number

  // Utility Costs
  waterPrice?: string
  electricityPrice?: string
  internetPrice?: string
  serviceFee?: string

  // Related IDs
  amenityIds?: number[]
  mediaIds?: number[]

  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Request DTO for publishing a draft
 */
export interface PublishDraftRequest extends Partial<DraftListingRequest> {
  // Option 1: Use membership quota
  useMembershipQuota?: boolean
  benefitIds?: number[]

  // Option 2: Direct payment
  vipType?: 'SILVER' | 'GOLD' | 'DIAMOND'
  durationDays?: number
  paymentProvider?: 'VNPAY' | 'MOMO' | 'PAYPAL'
}

/**
 * Response DTO for publishing a draft
 */
export interface PublishDraftResponse {
  // Success case (used quota or free listing)
  listingId?: number
  title?: string
  vipType?: string
  status?: 'ACTIVE' | 'PENDING'
  createdAt?: string
  expiryDate?: string

  // Payment required case
  transactionId?: string
  paymentUrl?: string
  amount?: number
  message?: string
}
