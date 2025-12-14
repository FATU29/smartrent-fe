export interface ListingDescriptionRequest {
  category?: string
  propertyType?: string
  price?: number
  priceUnit?: string
  addressText?: {
    newAddress?: string
    legacy?: string
  }
  area?: number
  bedrooms?: number
  bathrooms?: number
  roomCapacity?: number
  direction?: string
  furnishing?: string
  amenities?: string[]
  waterPrice?: string
  electricityPrice?: string
  internetPrice?: string
  serviceFee?: string
  tone: string
  titleMaxWords?: number
  titleMinWords?: number
  descriptionMaxWords?: number
  descriptionMinWords?: number
}

/**
 * Backend AI listing description response - matches Java DTO exactly
 */
export interface ListingDescriptionResponse {
  title: string
  description: string
}

// Housing Price Predictor Types
export type HousingPropertyType = 'APARTMENT' | 'HOUSE' | 'ROOM' | 'STUDIO'

export interface HousingPredictorRequest {
  city: string
  district: string
  ward: string
  property_type: HousingPropertyType
  area: number
  latitude: number
  longitude: number
}

export interface PriceRange {
  min: number
  max: number
}

export interface HousingPredictorResponse {
  price_range: PriceRange
  location: string
  property_type: string
  currency: string
}

// AI Chat Types
export type MessageRole = 'user' | 'assistant'

export interface ChatMessage {
  role: MessageRole
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
}

export interface ChatMessageResponse {
  role: MessageRole
  content: string
}

export interface ChatMetadata {
  model: string
  tools_used: string[]
}

export interface ListingRanking {
  listingId: number
  score: number
  reason: string
}

export interface ChatListing {
  listingId: number
  title: string
  description: string
  user: {
    userId: string
    phoneCode: string
    phoneNumber: string
    email: string
    firstName: string
    lastName: string
    contactPhoneVerified: boolean
  }
  ownerContactPhoneNumber: string | null
  ownerContactPhoneVerified: boolean
  ownerZaloLink: string | null
  contactAvailable: boolean
  postDate: string
  expiryDate: string
  listingType: string
  verified: boolean
  isVerify: boolean
  expired: boolean
  isDraft: boolean
  listingStatus: string
  vipType: string
  categoryId: number
  productType: string
  price: number
  priceUnit: string
  address: {
    addressId: number
    fullAddress: string
    fullNewAddress: string | null
    latitude: number
    longitude: number
    addressType: string
    legacyProvinceId: number | null
    legacyProvinceName: string | null
    legacyDistrictId: number | null
    legacyDistrictName: string | null
    legacyWardId: number | null
    legacyWardName: string | null
    legacyStreet: string | null
    newProvinceCode: string | null
    newProvinceName: string | null
    newWardCode: string | null
    newWardName: string | null
    newStreet: string | null
  }
  area: number
  bedrooms: number
  bathrooms: number
  direction: string
  furnishing: string
  roomCapacity: number
  waterPrice: number | null
  electricityPrice: number | null
  internetPrice: number | null
  serviceFee: number | null
  amenities: string[] | null
  media: Array<{
    mediaId: number
    listingId: number
    userId: string
    mediaType: string
    sourceType: string
    status: string
    url: string
    thumbnailUrl: string | null
    title: string | null
    description: string | null
    altText: string | null
    isPrimary: boolean
    sortOrder: number
    fileSize: number
    mimeType: string
    originalFilename: string
    durationSeconds: number | null
    uploadConfirmed: boolean
    createdAt: string
    updatedAt: string
  }>
  locationPricing: unknown | null
  createdAt: string
  updatedAt: string
}

export interface ChatListingsData {
  listings: ChatListing[]
  totalCount: number
  currentPage: number
  pageSize: number
  totalPages: number
  selectedFromTotal: number
  aiRankings: ListingRanking[]
}

export interface ChatResponseData {
  message: ChatMessageResponse
  metadata: ChatMetadata
  listings?: ChatListingsData
}
