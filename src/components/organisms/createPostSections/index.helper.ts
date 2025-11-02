// Simple option shape for SelectDropdown
export type Option = {
  value: string
  label: string
}

// Centralized constant value lists (keep in sync with state shape)
export const WARD_KEYS = [
  'bennghe',
  'dongkhoi',
  'tanbinh',
  'phamngulao',
  'cogiang',
  'nguyenthaihoc',
] as const

export const LISTING_TYPES = ['rent', 'sale'] as const

export const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'studio'] as const

export const INTERIOR_CONDITIONS = [
  'furnished',
  'semi-furnished',
  'unfurnished',
] as const

export const UTILITY_PRICE_OPTIONS = [
  'provider',
  'fixed',
  'negotiable',
] as const

export const INTERNET_OPTIONS = ['landlord', 'tenant', 'included'] as const

export const DIRECTIONS = [
  'north',
  'south',
  'east',
  'west',
  'northeast',
  'northwest',
  'southeast',
  'southwest',
] as const

export const DISTRICT_KEYS = [
  'quan1',
  'quan2',
  'quan3',
  'quan4',
  'quan5',
  'quan6',
  'quan7',
  'quan8',
  'quan9',
  'quan10',
  'quan11',
  'quan12',
  'thuduc',
] as const

export const PROVINCE_KEYS = ['hcmc', 'hn', 'dn'] as const

// Contract: pass the translator scoped to createPost.sections.aiValuation
// Example: const t = useTranslations('createPost.sections.aiValuation')
export const getWardOptions = (t: (key: string) => string): Option[] =>
  WARD_KEYS.map((k) => ({ value: k, label: t(`propertyInfo.wards.${k}`) }))

// Property Info section helpers
export const getListingTypeOptions = (t: (key: string) => string): Option[] =>
  LISTING_TYPES.map((k) => ({ value: k, label: t(`listingTypes.${k}`) }))

export const getPropertyTypeOptions = (t: (key: string) => string): Option[] =>
  PROPERTY_TYPES.map((k) => ({ value: k, label: t(`propertyTypes.${k}`) }))

export const getInteriorConditionOptions = (
  t: (key: string) => string,
): Option[] => {
  const labelKey: Record<(typeof INTERIOR_CONDITIONS)[number], string> = {
    furnished: 'furnished',
    'semi-furnished': 'semiFurnished',
    unfurnished: 'unfurnished',
  }
  return INTERIOR_CONDITIONS.map((k) => ({
    value: k,
    label: t(`interiorConditions.${labelKey[k]}`),
  }))
}

export const getUtilityPriceOptions = (t: (key: string) => string): Option[] =>
  UTILITY_PRICE_OPTIONS.map((k) => ({
    value: k,
    label: t(`utilityOptions.${k}`),
  }))

export const getInternetOptions = (t: (key: string) => string): Option[] =>
  INTERNET_OPTIONS.map((k) => ({ value: k, label: t(`utilityOptions.${k}`) }))

export const getDirectionOptions = (t: (key: string) => string): Option[] =>
  DIRECTIONS.map((k) => ({ value: k, label: t(`directions.${k}`) }))

// AI Valuation section helpers
export const getAiPropertyTypeOptions = (
  t: (key: string) => string,
): Option[] =>
  PROPERTY_TYPES.map((k) => ({
    value: k,
    label: t(`propertyInfo.types.${k}`),
  }))

export const getDistrictOptions = (t: (key: string) => string): Option[] =>
  DISTRICT_KEYS.map((k) => ({
    value: k,
    label: t(`propertyInfo.districts.${k}`),
  }))

export const getProvinceOptions = (t: (key: string) => string): Option[] =>
  PROVINCE_KEYS.map((k) => ({
    value: k,
    label: t(`propertyInfo.provinces.${k}`),
  }))

export type ChartItem = { district: string; value: number; color: string }

export const getResultsComparisonItems = (
  t: (key: string) => string,
): ChartItem[] => [
  {
    district: t('results.districts.quan2'),
    value: 2.1,
    color: 'bg-gradient-to-t from-blue-400 to-blue-500',
  },
  {
    district: t('results.districts.quan3'),
    value: 2.5,
    color: 'bg-gradient-to-t from-green-400 to-green-500',
  },
  {
    district: t('results.districts.quan1'),
    value: 3.0,
    color: 'bg-gradient-to-t from-red-400 to-red-500',
  },
  {
    district: t('results.districts.quan7'),
    value: 2.8,
    color: 'bg-gradient-to-t from-purple-400 to-purple-500',
  },
  {
    district: t('results.districts.thuduc'),
    value: 2.3,
    color: 'bg-gradient-to-t from-orange-400 to-orange-500',
  },
]

// Amenities - Use constants from @/constants/amenities
import { AMENITIES_CONFIG, type AmenityConfig } from '@/constants/amenities'

export type AmenityItem = {
  key: string
  label: string
  color: string
  icon?: AmenityConfig['icon']
  category?: AmenityConfig['category']
}

// Color map by category
const getColorByCategory = (category: AmenityConfig['category']): string => {
  const colorMap: Record<AmenityConfig['category'], string> = {
    BASIC:
      'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
    CONVENIENCE:
      'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
    SECURITY:
      'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300',
    ENTERTAINMENT:
      'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300',
    TRANSPORT:
      'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300',
  }
  return colorMap[category]
}

/**
 * Get amenity items with translations
 * @param t - Translation function scoped to createPost.sections.propertyInfo
 */
export const getAmenityItems = (t: (key: string) => string): AmenityItem[] => {
  return AMENITIES_CONFIG.map((amenity) => ({
    key: amenity.code,
    label: t(`amenities.${amenity.translationKey}`),
    color: getColorByCategory(amenity.category),
    icon: amenity.icon,
    category: amenity.category,
  }))
}

// Future: add similar helpers for districts, property types, etc.
