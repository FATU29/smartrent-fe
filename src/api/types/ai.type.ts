export interface ListingDescriptionRequest {
  category: string
  propertyType: string
  price: number
  priceUnit: string
  addressText: {
    new: string
    legacy?: string
  }
  area: number
  bedrooms: number
  bathrooms: number
  direction: string
  furnishing: string
  amenities: string[]
  waterPrice: string
  electricityPrice: string
  internetPrice: string
  serviceFee: string
  tone: string
  title: {
    maxWords: string
    minWords: string
  }
  description: {
    maxWords: string
    minWords: string
  }
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
