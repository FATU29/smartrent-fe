import type { PropertyType, Furnishing, PriceUnit } from './property.type'

export interface ListingDescriptionRequest {
  title?: string
  addressText?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  price?: number
  priceUnit?: PriceUnit
  furnishing?: Furnishing
  propertyType?: PropertyType
  tone?: string
  maxWords?: number
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
