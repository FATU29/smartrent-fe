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
