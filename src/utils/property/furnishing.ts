import { Furnishing } from '@/api/types/property.type'

/**
 * Translation key mapping for Furnishing enum
 * Maps API Furnishing values to translation keys
 */
export const FURNISHING_TRANSLATION_KEYS: Record<Furnishing, string> = {
  FULLY_FURNISHED:
    'createPost.sections.propertyInfo.interiorConditions.furnished',
  SEMI_FURNISHED:
    'createPost.sections.propertyInfo.interiorConditions.semiFurnished',
  UNFURNISHED:
    'createPost.sections.propertyInfo.interiorConditions.unfurnished',
} as const

/**
 * Get translation key for a Furnishing
 * @param furnishing - Furnishing enum value
 * @returns Translation key string
 */
export const getFurnishingTranslationKey = (furnishing: Furnishing): string => {
  return FURNISHING_TRANSLATION_KEYS[furnishing]
}
