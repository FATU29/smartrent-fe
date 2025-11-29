import type {
  Furnishing,
  Direction,
  PriceType,
  PriceUnit,
  PropertyType,
} from './property.type'

export interface ListingDescriptionRequest {
  category?: string
  propertyType?: PropertyType
  price?: number
  priceUnit?: PriceUnit
  addressText?: {
    new?: string
    legacy?: string
  }
  area?: number
  bedrooms?: number
  bathrooms?: number
  direction?: Direction
  furnishing?: Furnishing
  amenities?: string[]
  waterPrice?: PriceType
  electricityPrice?: PriceType
  internetPrice?: PriceType
  serviceFee?: PriceType
  tone?: 'friendly' | 'professionally'
  maxWords?: string
  minWords?: string
}

export interface ListingDescriptionResponse {
  generatedDescription: string
  generatedTitle?: string
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
