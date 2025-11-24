import { Pagination } from './pagination.type'
import { UserApi } from './user.type'

export type PropertyType = 'APARTMENT' | 'HOUSE' | 'ROOM' | 'STUDIO'
export type ListingType = 'RENT' | 'SHARE'
export type VipType = 'NORMAL' | 'SILVER' | 'GOLD' | 'DIAMOND'
export type PriceUnit = 'MONTH' | 'YEAR'
export enum PRICE_UNIT {
  'MONTH' = 'MONTH',
  'YEAR' = 'YEAR',
}
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
export enum FURNISHING {
  FULLY_FURNISHED = 'FULLY_FURNISHED',
  SEMI_FURNISHED = 'SEMI_FURNISHED',
  UNFURNISHED = 'UNFURNISHED',
}

export type LocationType = 'WARD' | 'DISTRICT' | 'PROVINCE'
export type PriceComparison = 'BELOW_AVERAGE' | 'AVERAGE' | 'ABOVE_AVERAGE'
export type AmenityCategory =
  | 'BASIC'
  | 'CONVENIENCE'
  | 'SECURITY'
  | 'ENTERTAINMENT'
export type PriceType = 'NEGOTIABLE' | 'SET_BY_OWNER' | 'PROVIDER_RATE'

export enum POST_STATUS {
  ALL = 'ALL',
  // Trạng thái cụ thể
  EXPIRED = 'EXPIRED', // Hết hạn
  NEAR_EXPIRED = 'NEAR_EXPIRED', // Sắp hết hạn
  DISPLAYING = 'DISPLAYING', // Đang hiển thị
  PENDING_APPROVAL = 'PENDING_APPROVAL', // Chờ duyệt
  APPROVED = 'APPROVED', // Đang duyệt (hoặc Đã duyệt, tùy ngữ cảnh)
  PENDING_PAYMENT = 'PENDING_PAYMENT', // Chờ thanh toán
  REJECTED = 'REJECTED', // Bị từ chối
  VERIFIED = 'VERIFIED',
}

export enum DURATIONDAYS {
  DAYS_10 = 10,
  DAYS_15 = 15,
  DAYS_30 = 30,
}

export type DurationDays =
  | DURATIONDAYS.DAYS_10
  | DURATIONDAYS.DAYS_15
  | DURATIONDAYS.DAYS_30

export type PostStatus =
  | POST_STATUS.ALL
  | POST_STATUS.EXPIRED
  | POST_STATUS.NEAR_EXPIRED
  | POST_STATUS.DISPLAYING
  | POST_STATUS.PENDING_APPROVAL
  | POST_STATUS.APPROVED
  | POST_STATUS.PENDING_PAYMENT
  | POST_STATUS.REJECTED
  | POST_STATUS.VERIFIED

export type CategoryType = {
  id: number
  name: string
  slug: string
  description: string
  type: string
  status: number
  created_at: string
  updated_at: string
}

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

export interface ListingApi {
  listingId: number
  title: string
  description: string
  assets: {
    video?: string
    images?: string[]
  }
  user: UserApi
  postDate: Date
  expiryDate: string
  listingType: ListingType
  verified?: boolean
  expired?: boolean
  vipType: VipType
  isDraft?: boolean
  category: CategoryType
  productType: PropertyType
  price: number
  priceUnit: PriceUnit
  address: {
    legacy?: string
    new: string
    latitude: number
    longitude: number
  }
  area?: number
  bedrooms?: number
  bathrooms?: number
  direction?: Direction
  furnishing?: Furnishing
  propertyType?: PropertyType
  roomCapacity?: number
  waterPrice?: PriceType
  electricityPrice?: PriceType
  internetPrice?: PriceType
  amenities?: Amenity[]
  priceType?: PriceType
  createdAt: string
  updatedAt: string
}

export interface ListingDetail extends ListingApi {
  locationPricing?: LocationPricing
}

export interface ListingOwnerDetail extends ListingApi {
  listingViews?: number
  interested?: number
  customers?: number
  status?: PostStatus
  rankOfVipType: number
}

export interface ListingResponse {
  code: string
  message: string | null
  data: ListingApi
}

// API Response for listing list
export interface ListingListResponse {
  code: string
  message: string | null
  data: {
    listings: ListingApi[]
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

/**
 * Legacy address structure for listing (OLD - 63 provinces)
 */
export interface ListingLegacyAddress {
  street?: string
  wardId: number
  districtId: number
  provinceId: number
}

/**
 * New address structure for listing (NEW - 34 provinces)
 */
export interface ListingNewAddress {
  provinceId: number
  wardId: number
  street?: string
}

/**
 * Address structure with both legacy and new formats for listing
 */
export interface ListingAddress {
  legacy?: ListingLegacyAddress
  new?: ListingNewAddress
  latitude: number
  longitude: number
}

/**
 * Assets for listing (images and video)
 */
export interface ListingAssets {
  video?: string
  images?: string[] // index 0 is thumbnail
}

/**
 * Membership benefit association
 */
export interface BenefitMembership {
  benefitId: number
  membershipId: number
}

/**
 * Create listing request - Updated schema
 */
export interface CreateListingRequest {
  title?: string
  description?: string
  listingType?: ListingType
  categoryId?: number
  productType?: PropertyType
  price?: number
  priceUnit?: PriceUnit
  address?: ListingAddress
  area?: number
  bedrooms?: number
  bathrooms?: number
  direction?: Direction
  furnishing?: Furnishing
  propertyType?: PropertyType
  roomCapacity?: number
  amenityIds?: number[]
  assets?: ListingAssets
  postDate?: string | Date // startDate
  isDraft?: boolean
  waterPrice?: PriceType
  electricityPrice?: PriceType
  internetPrice?: PriceType

  benefitsMembership?: BenefitMembership[]

  vipType?: VipType
  durationDays?: DurationDays // endDate
  useMembershipQuota?: boolean
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

export interface ListingFilterRequest {
  provinceId?: number | string // number for legacy (63), string code for new (34)
  districtId?: number
  wardId?: number | string // number for legacy, string code for new
  longitude?: number
  latitude?: number
  isLegacy?: boolean

  categoryId?: number
  listingType?: ListingType
  vipType?: VipType
  productType?: PropertyType

  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  minBedrooms?: number
  maxBedrooms?: number
  bathrooms?: number
  furnishing?: Furnishing
  direction?: Direction
  verified?: boolean

  waterPrice?: PriceType
  electricityPrice?: PriceType
  internetPrice?: PriceType

  amenityIds?: number[]

  keyword?: string

  page?: number
  size?: number

  status?: PostStatus

  userId?: string
}

export interface ListingSearchResponse<T> {
  listings: T[]
  pagination: Pagination
  filterCriteria?: Partial<ListingFilterRequest>
}

export interface ListingSearchApiResponse<T> {
  code: string
  message: string | null
  data: ListingSearchResponse<T>
}
