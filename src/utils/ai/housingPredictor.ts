import type { PropertyInfo } from '@/contexts/createPost'
import type {
  HousingPropertyType,
  HousingPredictorRequest,
} from '@/api/types/ai.type'
import type {
  ProvinceSimple,
  District,
  Ward,
  NewProvince,
  NewWard,
} from '@/api/types/address.type'

/**
 * Map property type from form to API property type
 */
export const mapPropertyTypeToAPI = (
  propertyType: PropertyInfo['propertyType'],
): HousingPropertyType => {
  const mapping: Record<
    NonNullable<PropertyInfo['propertyType']>,
    HousingPropertyType
  > = {
    apartment: 'Apartment',
    house: 'House',
    room: 'Apartment', // Room maps to Apartment
    office: 'Apartment', // Office maps to Apartment
    store: 'Apartment', // Store maps to Apartment
  }

  return mapping[propertyType || 'apartment'] || 'Apartment'
}

/**
 * Extract city, district, ward names from address data
 * Supports both legacy (63 provinces) and new (34 provinces) structures
 */
export const extractAddressNames = (
  propertyInfo: Partial<PropertyInfo>,
  legacyProvince?: ProvinceSimple,
  legacyDistrict?: District,
  legacyWard?: Ward,
  newProvince?: NewProvince,
  newWard?: NewWard,
): { city: string; district: string; ward: string } | null => {
  const isLegacy = propertyInfo?.addressStructureType !== 'new'

  if (isLegacy) {
    // Legacy structure: Province -> District -> Ward
    if (!legacyProvince || !legacyDistrict || !legacyWard) {
      return null
    }

    return {
      city: legacyProvince.name || '',
      district: legacyDistrict.name || '',
      ward: legacyWard.name || '',
    }
  } else {
    // New structure: Province -> Ward (no district)
    if (!newProvince || !newWard) {
      return null
    }

    // For new structure, there's no district level
    // API requires district, so we'll use province name as district
    // This is a workaround since new structure (34 provinces) doesn't have districts
    return {
      city: newProvince.name || '',
      district: newProvince.name || '', // New structure doesn't have district, use province name
      ward: newWard.name || '',
    }
  }
}

/**
 * Build housing predictor request from property info
 */
export const buildHousingPredictorRequest = (
  propertyInfo: Partial<PropertyInfo>,
  addressNames: { city: string; district: string; ward: string },
): HousingPredictorRequest | null => {
  // Validate required fields
  if (
    !propertyInfo?.area ||
    propertyInfo.area <= 0 ||
    !propertyInfo?.coordinates?.lat ||
    !propertyInfo?.coordinates?.lng ||
    !propertyInfo?.propertyType
  ) {
    return null
  }

  // Validate address names
  if (!addressNames.city || !addressNames.district || !addressNames.ward) {
    return null
  }

  return {
    city: addressNames.city,
    district: addressNames.district,
    ward: addressNames.ward,
    property_type: mapPropertyTypeToAPI(propertyInfo.propertyType),
    area: Math.round(propertyInfo.area),
    latitude: propertyInfo.coordinates.lat,
    longitude: propertyInfo.coordinates.lng,
  }
}

/**
 * Calculate average price from price range
 */
export const getAveragePrice = (min: number, max: number): number => {
  return Math.round((min + max) / 2)
}
