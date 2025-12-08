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
