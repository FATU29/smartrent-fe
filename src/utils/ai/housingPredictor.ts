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

export interface ValuationAddressSource {
  /** Raw "Province - District - Ward" text captured when a legacy address was
   *  selected. Unlike the composed display string it has no street prefix. */
  legacyAddressText?: string
  newProvinceName?: string
  newWardName?: string
}

export interface ValuationAddressNames {
  city: string
  district: string
  ward: string
}

const LEGACY_SEPARATOR = ' - '

/**
 * Resolve the city/district/ward names to send to the price predictor.
 *
 * This must NOT be derived by splitting the composed display addresses:
 *
 * - `composedLegacyAddress` is `"<street>, <province> - <district> - <ward>"`,
 *   so splitting on " - " puts the street *and* the province in the first
 *   slot, and the city ends up as `"123 Nguyễn Trãi, Hà Nội"`.
 * - `composedNewAddress` is `"<street>, <ward>, <province>"` — a two-level
 *   address with no district at all — so reading the third-from-last comma
 *   segment as the district yields the street name.
 *
 * Prefer the structured names captured at selection time, and fall back to
 * parsing only the raw (street-free) legacy text or the tail of the composed
 * new address.
 */
export const resolveValuationAddress = (
  source: ValuationAddressSource,
  composedNewAddress: string,
): ValuationAddressNames | null => {
  // Legacy three-level address: province - district - ward, in that order.
  const legacyParts = (source.legacyAddressText || '')
    .split(LEGACY_SEPARATOR)
    .map((part) => part.trim())
    .filter(Boolean)

  if (legacyParts.length >= 3) {
    const [city, district, ward] = legacyParts
    return { city, district, ward }
  }

  // New two-level address: province + ward only.
  let city = source.newProvinceName?.trim() || ''
  let ward = source.newWardName?.trim() || ''

  if (!city || !ward) {
    const newParts = composedNewAddress
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)

    // Read from the end: the last segment is the province, the one before it
    // the ward. Anything earlier is street detail and must not be used.
    city = city || newParts[newParts.length - 1] || ''
    ward = ward || (newParts.length >= 2 ? newParts[newParts.length - 2] : '')
  }

  if (!city || !ward) return null

  // A two-level address genuinely has no district. The predictor API requires
  // one, so send the ward — the most specific administrative unit available —
  // rather than letting a street name through.
  return { city, district: ward, ward }
}
