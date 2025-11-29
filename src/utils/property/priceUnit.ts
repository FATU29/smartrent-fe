import { PriceUnit } from '@/api/types/property.type'

/**
 * Translation key mapping for PriceUnit enum
 * Maps API PriceUnit values to translation keys
 */
export const PRICE_UNIT_TRANSLATION_KEYS: Record<PriceUnit, string> = {
  MONTH: 'apartmentDetail.property.pricePerMonth',
  YEAR: 'apartmentDetail.property.pricePerYear',
} as const

/**
 * Get translation key for a PriceUnit
 * @param priceUnit - PriceUnit enum value
 * @returns Translation key string
 */
export const getPriceUnitTranslationKey = (priceUnit: PriceUnit): string => {
  return PRICE_UNIT_TRANSLATION_KEYS[priceUnit]
}
