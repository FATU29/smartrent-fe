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
  postDate: string
  expiryDate: string
  listingType: ListingType
  verified: boolean
  isVerify: boolean
  expired: boolean
  vipType: VipType
  categoryId: number
  productType: PropertyType
  price: number
  priceUnit: PriceUnit
  addressId: number
  area: number
  bedrooms: number
  bathrooms: number
  direction: Direction
  furnishing: Furnishing
  propertyType: PropertyType
  roomCapacity: number
  amenities: Amenity[]
  locationPricing: LocationPricing
  createdAt: string
  updatedAt: string
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
