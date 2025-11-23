export type PropertyType = 'APARTMENT' | 'HOUSE' | 'ROOM' | 'STUDIO'

export interface PropertyTypeItem {
  id: number
  name: string // Deprecated: use translation via getPropertyTypeName() instead
  slug: string // Keep as-is, no translation needed
  description: string
  value: PropertyType // Frontend values
  apiValue: PropertyType
}

export const PROPERTY_TYPES: PropertyTypeItem[] = [
  {
    id: 1,
    name: 'Cho thuê phòng trọ',
    slug: 'cho-thue-phong-tro',
    description: 'Phòng trọ giá rẻ, phòng trọ sinh viên',
    value: 'ROOM',
    apiValue: 'ROOM',
  },
  {
    id: 2,
    name: 'Cho thuê căn hộ',
    slug: 'cho-thue-can-ho',
    description: 'Căn hộ chung cư, căn hộ dịch vụ',
    value: 'APARTMENT',
    apiValue: 'APARTMENT',
  },
  {
    id: 3,
    name: 'Cho thuê nhà nguyên căn',
    slug: 'cho-thue-nha-nguyen-can',
    description: 'Nhà nguyên căn, villa, biệt thự',
    value: 'HOUSE',
    apiValue: 'HOUSE',
  },
  {
    id: 4,
    name: 'Cho thuê studio',
    slug: 'cho-thue-studio',
    description: 'Studio, văn phòng, mặt bằng kinh doanh',
    value: 'STUDIO',
    apiValue: 'STUDIO',
  },
] as const

/**
 * Get property type by slug
 */
export const getPropertyTypeBySlug = (
  slug: string,
): PropertyTypeItem | undefined => {
  return PROPERTY_TYPES.find((type) => type.slug === slug)
}

/**
 * Get property type by value
 */
export const getPropertyTypeByValue = (
  value: string,
): PropertyTypeItem | undefined => {
  return PROPERTY_TYPES.find(
    (type) => type.value.toLowerCase() === value.toLowerCase(),
  )
}

/**
 * Get property type by API value
 */
export const getPropertyTypeByApiValue = (
  apiValue: string,
): PropertyTypeItem | undefined => {
  return PROPERTY_TYPES.find(
    (type) => type.apiValue.toLowerCase() === apiValue.toLowerCase(),
  )
}

/**
 * Convert frontend value to API value
 */
export const toApiPropertyType = (
  value: string,
): 'ROOM' | 'APARTMENT' | 'HOUSE' | 'STUDIO' => {
  const type = getPropertyTypeByValue(value)
  return type?.apiValue || 'APARTMENT'
}

/**
 * Convert API value to frontend value
 * Note: API never returns 'ALL', so this will never return 'ALL'
 */
export const fromApiPropertyType = (
  apiValue: string,
): 'ROOM' | 'APARTMENT' | 'HOUSE' | 'STUDIO' => {
  const type = getPropertyTypeByApiValue(apiValue)

  const value = type?.value
  return value || 'APARTMENT'
}

/**
 * Get translated property type name by id
 * Translation key: common.propertyTypes.{id}
 * @param id - Property type id (0-5)
 * @param t - Translation function from useTranslations('common')
 * @returns Translated name
 */
export const getPropertyTypeName = (
  id: number,
  t: (key: string) => string,
): string => {
  return t(`propertyTypes.${id}`) || ''
}
