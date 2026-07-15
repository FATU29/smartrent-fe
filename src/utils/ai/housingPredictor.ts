import type {
  HousingPredictorRequest,
  HousingPropertyType,
} from '@/api/types/ai.type'

import { CreateListingRequest } from '@/api/types'

// AI valuation covers every listing property type. Exposed so the UI can tell
// "this property type isn't supported by AI valuation" apart from "required
// data is missing" instead of showing one misleading message for both.
export const isTypeSupportedForAiValuation = (productType?: string): boolean =>
  normalizePropertyType(productType) !== null

// Normalize product type to API enum
const normalizePropertyType = (
  productType?: string,
): HousingPropertyType | null => {
  if (!productType) return null
  const pt = productType.trim().toUpperCase()
  const allowed: HousingPropertyType[] = [
    'APARTMENT',
    'HOUSE',
    'ROOM',
    'STUDIO',
    'OFFICE',
    'STORE',
  ]
  if (allowed.includes(pt as HousingPropertyType)) {
    return pt as HousingPropertyType
  }
  // Basic synonyms mapping (fallbacks)
  const synonyms: Record<string, HousingPropertyType> = {
    CONDO: 'APARTMENT',
    FLAT: 'APARTMENT',
  }
  return synonyms[pt] ?? null
}

// Supports new address structure (Province/City → Ward) and legacy (Province/City → District → Ward)
export const buildHousingPredictorRequest = (
  propertyInfo: Partial<CreateListingRequest>,
  addressNames: { city?: string; district?: string; ward?: string },
): HousingPredictorRequest | null => {
  // Validate required numeric fields
  if (
    !propertyInfo?.area ||
    propertyInfo.area <= 0 ||
    typeof propertyInfo?.address?.latitude !== 'number' ||
    typeof propertyInfo?.address?.longitude !== 'number'
  ) {
    return null
  }

  // Normalize property type
  const propertyType = normalizePropertyType(
    typeof propertyInfo.productType === 'string'
      ? propertyInfo.productType
      : (propertyInfo.productType as unknown as string),
  )
  if (!propertyType) return null

  // Trim and validate names (district required by predictor API)
  const city = addressNames.city?.trim() || ''
  const ward = addressNames.ward?.trim() || ''
  const district = addressNames.district?.trim() || ''
  if (!city || !ward || !district) return null

  return {
    city,
    district,
    ward,
    property_type: propertyType,
    area: Math.round(propertyInfo.area),
    latitude: propertyInfo.address!.latitude,
    longitude: propertyInfo.address!.longitude,
  }
}

export const getAveragePrice = (min: number, max: number): number => {
  return Math.round((min + max) / 2)
}
