// Enums matching backend
export type PropertyType = 'APARTMENT' | 'HOUSE' | 'ROOM' | 'STUDIO' | 'OFFICE'
export type ListingType = 'RENT' | 'SALE' | 'SHARE'
export type VipType = 'NORMAL' | 'SILVER' | 'GOLD' | 'DIAMOND'
export type PriceUnit = 'MONTH' | 'DAY' | 'YEAR'
export type Direction =
  | 'NORTH'
  | 'SOUTH'
  | 'EAST'
  | 'WEST'
  | 'NORTHEAST'
  | 'NORTHWEST'
  | 'SOUTHEAST'
  | 'SOUTHWEST'
export type Furnishing = 'FULLY_FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED'
export type LocationType = 'WARD' | 'DISTRICT' | 'PROVINCE'
export type PriceComparison = 'BELOW_AVERAGE' | 'AVERAGE' | 'ABOVE_AVERAGE'
export type AmenityCategory =
  | 'BASIC'
  | 'CONVENIENCE'
  | 'SECURITY'
  | 'ENTERTAINMENT'
export type PriceType = 'ALL' | 'NEGOTIABLE' | 'SET_BY_OWNER' | 'PROVIDER_RATE'
export type MoveInTimeType =
  | 'ALL'
  | 'IMMEDIATE'
  | '1_2_WEEKS'
  | '1_MONTH'
  | 'NEGOTIABLE'

// Amenity interface
export interface Amenity {
  amenityId: number
  name: string
  icon: string
  description: string
  category: AmenityCategory
  isActive: boolean
}

// Location pricing interfaces
export interface WardPricing {
  locationType: 'WARD'
  locationId: number
  locationName: string
  totalListings: number
  averagePrice: number
  minPrice: number
  maxPrice: number
  medianPrice: number
  priceUnit: PriceUnit
  productType: PropertyType
  averageArea: number
  averagePricePerSqm: number
}

export interface DistrictPricing {
  locationType: 'DISTRICT'
  locationId: number
  totalListings: number
  averagePrice: number
  priceUnit: PriceUnit
}

export interface ProvincePricing {
  locationType: 'PROVINCE'
  locationId: number
  totalListings: number
  averagePrice: number
  priceUnit: PriceUnit
}

export interface SimilarListing {
  listingId: number
  title: string
  price: number
  priceUnit: PriceUnit
  area: number
  pricePerSqm: number
  bedrooms: number
  bathrooms: number
  productType: PropertyType
  vipType: VipType
  verified: boolean
}

export interface LocationPricing {
  wardPricing: WardPricing
  districtPricing: DistrictPricing
  provincePricing: ProvincePricing
  similarListingsInWard: SimilarListing[]
  priceComparison: PriceComparison
  percentageDifferenceFromAverage: number
}

// Main Listing/Property interface matching backend response
export interface Listing {
  listingId: number
  title: string
  description: string
  userId: string
  // Contact Info
  ownerContactPhoneNumber?: string
  ownerContactPhoneVerified?: boolean
  ownerZaloLink?: string
  contactAvailable?: boolean
  // Dates
  postDate: string
  expiryDate: string
  createdAt: string
  updatedAt: string
  // Status
  listingType: ListingType
  verified: boolean
  isVerify: boolean
  expired: boolean
  isDraft?: boolean
  vipType: VipType
  // Property Info
  categoryId: number
  productType: PropertyType
  price: number
  priceUnit: PriceUnit
  addressId: number
  area: number
  bedrooms?: number
  bathrooms?: number
  direction?: Direction
  furnishing?: Furnishing
  propertyType?: PropertyType
  roomCapacity?: number
  amenities?: Amenity[]
  locationPricing?: LocationPricing
  electricityPrice?: PriceType
  waterPrice?: PriceType
  internetPrice?: PriceType
  priceType?: PriceType
  moveInTime?: MoveInTimeType
}

// Legacy Property interface (keep for backward compatibility)
export interface Property {
  id: string
  title: string
  description: string
  address: string
  city: string
  property_type: string
  bedrooms: number
  bathrooms: number
  price: number
  currency: string
  images?: string[]
  area?: number
  furnishing?: string
  amenities?: string[]
  verified?: boolean
  featured?: boolean
  views?: number
  virtual_tour?: string
  distance?: number
  ward?: string
  ward_id?: string
  // Listing management fields
  code?: string
  posted_date?: string
  expiry_date?: string
  status?:
    | 'active'
    | 'expired'
    | 'expiring'
    | 'pending'
    | 'review'
    | 'payment'
    | 'rejected'
    | 'archived'
  package_type?:
    | 'vip_diamond'
    | 'vip_gold'
    | 'vip_silver'
    | 'standard'
    | 'basic'
  auto_repost?: boolean
  rank?: {
    page: number
    position: number
  }
  stats?: {
    views: number
    contacts: number
    customers: number
  }
}

export interface PropertyCard {
  id: string
  title: string
  description: string
  address: string
  city: string
  property_type: string
  bedrooms: number
  bathrooms: number
  price: number
  currency: string
  images?: string[]
  area?: number
  furnishing?: string
  amenities?: string[]
  verified?: boolean
  featured?: boolean
  views?: number
  virtual_tour?: string
  distance?: number
}

export interface PropertyListResponse {
  data: Property[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// API Response for single listing
export interface ListingResponse {
  code: string
  message: string | null
  data: Listing
}

// API Response for listing list
export interface ListingListResponse {
  code: string
  message: string | null
  data: {
    listings: Listing[]
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface PropertyFilters {
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  propertyType?: string
  city?: string
  amenities?: string[]
}

// ============= LISTING SERVICE TYPES =============

/**
 * API response type for listing list
 */
export interface ListingListApiResponse {
  listings?: Listing[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Create listing request
 */
export interface CreateListingRequest {
  title: string
  description: string
  userId: string
  expiryDate?: string
  listingType: ListingType
  verified?: boolean
  isVerify?: boolean
  expired?: boolean
  vipType?: VipType
  categoryId?: number
  productType: PropertyType
  price: number
  priceUnit: PriceUnit
  address: {
    streetNumber?: string
    streetId: number
    wardId: number
    districtId: number
    provinceId: number
    latitude?: number
    longitude?: number
  }
  area?: number
  bedrooms?: number
  bathrooms?: number
  direction?: Direction
  furnishing?: Furnishing
  propertyType?: PropertyType
  roomCapacity?: number
  amenityIds?: number[]
}

/**
 * Update listing request
 */
export interface UpdateListingRequest {
  title?: string
  description?: string
  userId?: number
  expiryDate?: string
  listingType?: ListingType
  vipType?: VipType
  categoryId?: number
  productType?: PropertyType
  price?: number
  priceUnit?: PriceUnit
  addressId?: number
  area?: number
  bedrooms?: number
  bathrooms?: number
  direction?: Direction
  furnishing?: Furnishing
  propertyType?: PropertyType
  roomCapacity?: number
  amenityIds?: number[]
}

/**
 * Create VIP listing request
 */
export interface CreateVipListingRequest extends CreateListingRequest {
  vipType: Exclude<VipType, 'NORMAL'>
  useMembershipQuota?: boolean
  durationDays?: number
}

/**
 * Quota check response
 */
export interface QuotaCheckResponse {
  vipPosts?: {
    totalAvailable: number
    totalUsed: number
    totalGranted: number
  }
  premiumPosts?: {
    totalAvailable: number
    totalUsed: number
    totalGranted: number
  }
  boosts?: {
    totalAvailable: number
    totalUsed: number
    totalGranted: number
  }
}

/**
 * Price update request
 */
export interface UpdatePriceRequest {
  newPrice: number
  effectiveAt?: string
}

/**
 * Price history item
 */
export interface PriceHistory {
  id: number
  listingId: number
  oldPrice: number
  newPrice: number
  oldPriceUnit: string
  newPriceUnit: string
  changeType: string
  changePercentage: number
  changeAmount: number
  changedBy: string
  changeReason: string
  changedAt: string
  current: boolean
}

/**
 * Price statistics
 */
export interface PriceStatistics {
  minPrice: number
  maxPrice: number
  avgPrice: number
  totalChanges: number
  priceIncreases: number
  priceDecreases: number
}

/**
 * Province statistics request
 */
export interface ProvinceStatsRequest {
  provinceIds?: number[]
  provinceCodes?: string[]
  verifiedOnly?: boolean
  addressType?: 'OLD' | 'NEW'
}

/**
 * Province statistics response item
 */
export interface ProvinceStatsItem {
  provinceId: number | null
  provinceCode: string | null
  provinceName: string
  totalListings: number
  verifiedListings: number
  vipListings: number
}

// ============= LISTING SEARCH API TYPES =============

/**
 * Listing search request - matches POST /v1/listings/search
 * All fields are optional
 */
export interface ListingSearchRequest {
  // User & Ownership Filters
  userId?: string
  isDraft?: boolean
  verified?: boolean
  isVerify?: boolean
  expired?: boolean
  excludeExpired?: boolean

  // Location Filters
  provinceId?: number
  provinceCode?: string
  districtId?: number
  wardId?: number
  newWardCode?: string
  streetId?: number
  userLatitude?: number
  userLongitude?: number
  radiusKm?: number

  // Category & Type Filters
  categoryId?: number
  listingType?: ListingType
  vipType?: VipType
  productType?: PropertyType

  // Property Specs Filters
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  bedrooms?: number
  bathrooms?: number
  minBedrooms?: number
  maxBedrooms?: number
  minBathrooms?: number
  maxBathrooms?: number
  furnishing?: Furnishing
  direction?: Direction
  propertyType?: PropertyType
  minRoomCapacity?: number
  maxRoomCapacity?: number

  // Amenities & Media Filters
  amenityIds?: number[]
  amenityMatchMode?: 'ALL' | 'ANY'
  hasMedia?: boolean
  minMediaCount?: number

  // Content Search
  keyword?: string

  // Contact Filters
  ownerPhoneVerified?: boolean

  // Time Filters
  postedWithinDays?: number
  updatedWithinDays?: number

  // Pagination & Sorting
  page?: number
  size?: number
  sortBy?:
    | 'postDate'
    | 'price'
    | 'area'
    | 'createdAt'
    | 'updatedAt'
    | 'distance'
  sortDirection?: 'ASC' | 'DESC'
}

/**
 * Listing search response - matches API response structure
 */
export interface ListingSearchResponse {
  listings: Listing[]
  totalCount: number
  currentPage: number
  pageSize: number
  totalPages: number
  recommendations?: Listing[]
  filterCriteria?: Partial<ListingSearchRequest>
}

/**
 * API Response wrapper for listing search
 */
export interface ListingSearchApiResponse {
  code: string
  message: string | null
  data: ListingSearchResponse
}
