import { PropertyType } from '@/api/types/property.type'

/**
 * Translation key mapping for PropertyType enum
 * Maps API PropertyType values to translation keys
 */
export const PRODUCT_TYPE_TRANSLATION_KEYS: Record<PropertyType, string> = {
  APARTMENT: 'createPost.sections.propertyDetails.propertyTypes.apartment',
  HOUSE: 'createPost.sections.propertyDetails.propertyTypes.house',
  ROOM: 'createPost.sections.propertyDetails.propertyTypes.room',
  STUDIO: 'createPost.sections.propertyDetails.propertyTypes.studio',
} as const

/**
 * Get translation key for a PropertyType
 * @param productType - PropertyType enum value
 * @returns Translation key string
 */
export const getProductTypeTranslationKey = (
  productType: PropertyType,
): string => {
  return (
    PRODUCT_TYPE_TRANSLATION_KEYS[productType] ||
    PRODUCT_TYPE_TRANSLATION_KEYS.APARTMENT
  )
}
