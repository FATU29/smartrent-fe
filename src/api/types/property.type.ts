import { Pagination } from './pagination.type'
import { UserApi } from './user.type'

export type PropertyType = 'APARTMENT' | 'HOUSE' | 'ROOM' | 'STUDIO'
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
  ALL = '',
  // Trạng thái cụ thể
  EXPIRED = 1, // Hết hạn
  EXPIRED_SOON = 2, // Sắp hết hạn
  DISPLAYING = 3, // Đang hiển thị
  IN_REVIEW = 4, // Chờ duyệt
  PENDING_PAYMENT = 5, // Đang duyệt (hoặc Đã duyệt, tùy ngữ cảnh)
  REJECTED = 6, // Chờ thanh toán
  VERIFIED = 7,
}

export enum PAYMENT_PROVIDER {
  VNPAY = 'VNPAY',
  MOMO = 'MOMO',
  PAYPAL = 'PAYPAL',
}

export type PaymentProvider =
  | PAYMENT_PROVIDER.MOMO
  | PAYMENT_PROVIDER.PAYPAL
  | PAYMENT_PROVIDER.VNPAY

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
  | POST_STATUS.EXPIRED_SOON
  | POST_STATUS.DISPLAYING
  | POST_STATUS.IN_REVIEW
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

export type MediaType = 'IMAGE' | 'VIDEO'

export enum LISTING_TYPE {
  RENT = 'RENT',
  SHARE = 'SHARE',
}

export type listingType = LISTING_TYPE.RENT | LISTING_TYPE.SHARE

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

export interface MediaItem {
  mediaId: number
  listingId: number
  mediaType: MediaType
  sourceType: string
  url: string
  isPrimary: boolean
  sortOrder: number
  status: PostStatus
  createdAt: string
}

export interface ListingApi {
  listingId: number
  title: string
  description: string
  media: MediaItem[]
  user: UserApi
  postDate: Date
  expiryDate: string
  verified?: boolean
  expired?: boolean
  vipType: VipType
  isDraft?: boolean
  category: CategoryType
  productType: PropertyType
  price: number
  priceUnit: PriceUnit
  address: {
    fullAddress?: string
    fullNewAddress: string
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
  listingStatus?: PostStatus
  rankOfVipType: number
  durationDays?: number
  statistics?: {
    viewCount: number
    contactCount: number
    saveCount: number
    reportCount: number
    lastViewedAt: string | null
  }
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

export interface ListingLegacyAddress {
  street?: string
  wardId: number
  districtId: number
  provinceId: number
}

export interface ListingNewAddress {
  provinceCode: string
  wardCode: string
  street?: string
}

export interface ListingAddress {
  legacy?: ListingLegacyAddress
  newAddress?: ListingNewAddress
  latitude: number
  longitude: number
}

/**
 * Create listing request - Updated schema
 */
export interface CreateListingRequest {
  title?: string
  description?: string
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
  roomCapacity?: number
  amenityIds?: number[]
  mediaIds?: number[]
  postDate?: string | Date // startDate
  expiryDate?: string | Date // calculated expiry date
  listingType?: listingType
  isDraft?: boolean
  waterPrice?: PriceType
  electricityPrice?: PriceType
  internetPrice?: PriceType
  serviceFee?: PriceType

  benefitIds?: number[]

  vipType?: VipType
  durationDays?: DurationDays
  useMembershipQuota?: boolean
  paymentProvider?: PaymentProvider
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

/**
 * Category statistics request
 */
export interface CategoryStatsRequest {
  categoryIds: number[]
  verifiedOnly?: boolean
}

/**
 * Category statistics response item
 */
export interface CategoryStatsItem {
  categoryId: number
  categoryName: string
  categorySlug: string
  categoryIcon: string
  totalListings: number
  verifiedListings: number
  vipListings: number
}

export enum SortKey {
  DEFAULT = 'DEFAULT',
  PRICE_ASC = 'PRICE_ASC',
  PRICE_DESC = 'PRICE_DESC',
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
}

export interface ListingFilterRequest {
  provinceId?: number | string
  districtId?: number
  wardId?: number | string
  isLegacy?: boolean

  categoryId?: number
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
  isVerify?: boolean // alias for verified used by some endpoints
  expired?: boolean
  isDraft?: boolean
  sortDirection?: 'ASC' | 'DESC'

  waterPrice?: PriceType
  electricityPrice?: PriceType
  internetPrice?: PriceType

  amenityIds?: number[]

  keyword?: string

  page?: number
  size?: number

  status?: PostStatus
  userId?: string
  sortBy?: SortKey

  serviceFee?: PriceType

  userLatitude?: number
  userLongitude?: number

  latitude?: number
  longitude?: number

  listingStatus?: PostStatus
}

/**
 * Backend API request for listing search
 * Maps directly to backend ListingFilterRequest
 */
export interface ListingSearchApiRequest {
  provinceId?: number | string
  districtId?: number
  wardId?: number | string
  isLegacy?: boolean

  categoryId?: number
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
  serviceFee?: PriceType

  amenityIds?: number[]

  keyword?: string

  // Backend uses these for pagination
  page?: number
  size?: number

  status?: PostStatus
  userId?: string
  sortBy?: SortKey

  // Location coordinates
  userLatitude?: number
  userLongitude?: number

  longitude?: number
  latitude?: number
}

/**
 * Backend API response for listing search
 * Maps directly to backend ListingListResponse structure
 */
export interface ListingSearchBackendResponse {
  listings: ListingDetail[]
  totalCount: number
  currentPage: number
  pageSize: number
  totalPages: number
  recommendations?: ListingDetail[]
  filterCriteria?: Partial<ListingSearchApiRequest>
}

/**
 * My Listings backend response item (owner-centric)
 */
export interface MyListingBackendItem {
  listingId: number
  title: string
  description?: string
  user: {
    userId: string
    phoneCode?: string
    phoneNumber?: string
    firstName?: string
    lastName?: string
    email?: string
    contactPhoneNumber?: string
    contactPhoneVerified?: boolean
  }
  ownerContactPhoneNumber?: string | null
  ownerContactPhoneVerified?: boolean | null
  ownerZaloLink?: string | null
  contactAvailable?: boolean | null
  postDate?: string
  expiryDate?: string
  listingType?: listingType
  verified?: boolean
  isVerify?: boolean
  expired?: boolean
  isDraft?: boolean
  listingStatus?: PostStatus | null
  vipType?: VipType
  categoryId?: number
  productType?: string
  price?: number
  priceUnit?: PriceUnit
  postSource?: string
  transactionId?: string | null
  media?: MediaItem[]
  address?: {
    addressId?: number
    fullAddress?: string
    fullNewAddress?: string | null
    latitude?: number
    longitude?: number
    addressType?: string
    legacyProvinceId?: number
    legacyProvinceName?: string
    legacyDistrictId?: number
    legacyDistrictName?: string
    legacyWardId?: number
    legacyWardName?: string
    legacyStreet?: string | null
    newProvinceCode?: string | null
    newProvinceName?: string | null
    newWardCode?: string | null
    newWardName?: string | null
    newStreet?: string | null
    streetId?: number | null
    streetName?: string | null
    projectId?: number | null
    projectName?: string | null
  }
  area?: number
  bedrooms?: number
  bathrooms?: number
  direction?: Direction
  furnishing?: Furnishing
  roomCapacity?: number | null
  waterPrice?: PriceType
  electricityPrice?: PriceType
  internetPrice?: PriceType
  serviceFee?: PriceType
  amenities?: Amenity[] | null
  locationPricing?: LocationPricing | null
  createdAt?: string
  updatedAt?: string
  isShadow?: boolean
  parentListingId?: number | null
  durationDays?: number
  useMembershipQuota?: boolean
  paymentProvider?: PaymentProvider | null
  amountPaid?: number | null
  paymentInfo?: string | null
  statistics?: {
    viewCount?: number
    contactCount?: number
    saveCount?: number
    reportCount?: number
    lastViewedAt?: string | null
  }
  verificationNotes?: string | null
  rejectionReason?: string | null
  rankOfVipType?: number
}

/**
 * My Listings backend envelope
 */
export interface MyListingsBackendResponse {
  listings: MyListingBackendItem[]
  totalCount: number
  currentPage: number
  pageSize: number
  totalPages: number
  statistics?: Record<string, number>
}

/**
 * Frontend internal response format (keeps existing structure)
 * Used with ApiResponse wrapper: ApiResponse<ListingSearchResponse<T>>
 */
export interface ListingSearchResponse<T> {
  listings: T[]
  pagination: Pagination
  filterCriteria?: Partial<ListingFilterRequest>
  recommendations?: T[]
}
