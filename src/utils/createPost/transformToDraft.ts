import type { PropertyInfo } from '@/contexts/createPost'
import type { CreateListingRequest } from '@/api/types/property.type'
import type {
  PropertyType,
  PriceUnit,
  Direction,
  Furnishing,
} from '@/api/types/property.type'

// Type mappings
const PROPERTY_TYPE_MAP: Record<string, 'APARTMENT' | 'HOUSE' | 'STUDIO'> = {
  apartment: 'APARTMENT',
  house: 'HOUSE',
  villa: 'HOUSE',
  studio: 'STUDIO',
} as const

const FURNISHING_MAP: Record<
  string,
  'FULLY_FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED'
> = {
  furnished: 'FULLY_FURNISHED',
  'semi-furnished': 'SEMI_FURNISHED',
  unfurnished: 'UNFURNISHED',
} as const

const DEFAULT_PROPERTY_TYPE: PropertyType = 'APARTMENT'
const DEFAULT_FURNISHING: Furnishing = 'UNFURNISHED'

/**
 * Transform PropertyInfo to CreateListingRequest for draft saving
 * Handles partial data - only includes fields that are available
 */
export const transformPropertyInfoToDraft = (
  propertyInfo: Partial<PropertyInfo>,
  userId: string,
): Partial<CreateListingRequest> => {
  const draft: Partial<CreateListingRequest> = {
    userId,
  }

  // Basic info
  if (propertyInfo.propertyType) {
    const mappedType =
      PROPERTY_TYPE_MAP[propertyInfo.propertyType] || DEFAULT_PROPERTY_TYPE
    draft.productType = mappedType
    draft.propertyType = mappedType
  }

  // Title and description
  if (propertyInfo.listingTitle) {
    draft.title = propertyInfo.listingTitle
  } else if (propertyInfo.propertyAddress) {
    draft.title = propertyInfo.propertyAddress
  }

  if (propertyInfo.propertyDescription) {
    draft.description = propertyInfo.propertyDescription
  } else {
    draft.description = ''
  }

  // Price
  if (propertyInfo.price) {
    draft.price = propertyInfo.price
    // Default to MONTH for rent listings (most common case)
    // If listingType is needed, it should be added to PropertyInfo interface
    draft.priceUnit = 'MONTH' as PriceUnit
  }

  // Area
  if (propertyInfo.area) {
    draft.area = propertyInfo.area
  }

  // Bedrooms and bathrooms
  if (propertyInfo.bedrooms !== undefined) {
    draft.bedrooms = propertyInfo.bedrooms
  }

  if (propertyInfo.bathrooms !== undefined) {
    draft.bathrooms = propertyInfo.bathrooms
  }

  // Furnishing
  if (propertyInfo.interiorCondition) {
    draft.furnishing =
      FURNISHING_MAP[propertyInfo.interiorCondition] || DEFAULT_FURNISHING
  }

  // Direction
  if (propertyInfo.houseDirection) {
    draft.direction = propertyInfo.houseDirection.toUpperCase() as Direction
  }

  // Address - simplified for draft (requires proper address IDs)
  // Note: For draft, we might not have all address IDs, so this is a simplified version
  if (
    propertyInfo.streetId &&
    propertyInfo.ward &&
    propertyInfo.district &&
    propertyInfo.province
  ) {
    draft.address = {
      streetId: Number(propertyInfo.streetId),
      wardId: Number(propertyInfo.ward),
      districtId: Number(propertyInfo.district),
      provinceId: Number(propertyInfo.province),
      latitude: propertyInfo.coordinates?.lat,
      longitude: propertyInfo.coordinates?.lng,
    }
  }

  // Amenities - convert amenity codes to IDs if needed
  // For draft, we'll skip amenities if we don't have the mapping
  // This can be enhanced later with proper amenity ID mapping

  return draft
}
