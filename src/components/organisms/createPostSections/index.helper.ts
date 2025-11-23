export type Option = {
  value: string
  label: string
}

import {
  PROPERTY_TYPES as PROPERTY_TYPES_CONST,
  getPropertyTypeName,
} from '@/constants/common/propertyTypes'

import {
  AMENITIES_CONFIG,
  type AmenityConfig,
  type AmenityCategory as AmenityCategoryConfig,
} from '@/constants/amenities'
import { FURNISHING } from '@/api/types'
import type { LucideIcon } from 'lucide-react'

export const PRICE_TYPE_OPTIONS = [
  'PROVIDER_RATE',
  'SET_BY_OWNER',
  'NEGOTIABLE',
] as const

export const DIRECTIONS = [
  'NORTH',
  'SOUTH',
  'EAST',
  'WEST',
  'NORTHEAST',
  'NORTHWEST',
  'SOUTHEAST',
  'SOUTHWEST',
] as const

export const PRICE_TYPE = ['MONTH', 'YEAR']

export const getInteriorConditionOptions = (
  t: (key: string) => string,
): Option[] => {
  return [
    FURNISHING.FULLY_FURNISHED,
    FURNISHING.SEMI_FURNISHED,
    FURNISHING.UNFURNISHED,
  ].map((k) => ({
    value: k,
    label: t(`furnishing.${k}`),
  }))
}

export type ChartItem = { district: string; value: number; color: string }

export interface AmenityItem {
  id: number
  key: string
  label: string
  color: string
  icon: LucideIcon
  category: AmenityCategoryConfig
}

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

export const getUtilityPriceOptions = (
  t: (key: string) => string,
): Option[] => {
  const labelMap: Record<(typeof PRICE_TYPE_OPTIONS)[number], string> = {
    PROVIDER_RATE: 'provider',
    SET_BY_OWNER: 'fixed',
    NEGOTIABLE: 'negotiable',
  }
  return PRICE_TYPE_OPTIONS.map((k) => ({
    value: k,
    label: t(`utilityOptions.${labelMap[k]}`),
  }))
}

export const getInternetOptions = (t: (key: string) => string): Option[] => {
  // Internet price uses same PriceType enum
  const labelMap: Record<(typeof PRICE_TYPE_OPTIONS)[number], string> = {
    PROVIDER_RATE: 'provider',
    SET_BY_OWNER: 'fixed',
    NEGOTIABLE: 'negotiable',
  }
  return PRICE_TYPE_OPTIONS.map((k) => ({
    value: k,
    label: t(`utilityOptions.${labelMap[k]}`),
  }))
}

export const getDirectionOptions = (t: (key: string) => string): Option[] =>
  DIRECTIONS.map((k) => ({
    value: k,
    label: t(`directions.${k.toLowerCase()}`),
  }))

// AI Valuation section helpers
export const getAiPropertyTypeOptions = (
  t: (key: string) => string,
  tCommon: (key: string) => string,
): Option[] =>
  PROPERTY_TYPES_CONST.map((type) => ({
    value: type.value.toLowerCase(),
    label: getPropertyTypeName(type.id, tCommon),
  }))

/**
 * Get amenity items with translations for UI display
 * @param t - Translation function scoped to createPost.sections.propertyInfo
 * @returns Array of UI amenity items with translations and styling
 */
export const getAmenityItems = (t: (key: string) => string): AmenityItem[] => {
  return AMENITIES_CONFIG.map((amenity) => ({
    id: amenity.id,
    key: amenity.code,
    label: t(`amenities.${amenity.translationKey}`),
    color: getColorByCategory(amenity.category),
    icon: amenity.icon,
    category: amenity.category,
  }))
}

export const getPriceUnitOptions = (t: (key: string) => string): Option[] => {
  return PRICE_TYPE.map((p) => ({
    value: p,
    label: t(`priceUnits.${p}`),
  }))
}

export const getPropertyTypeOptions = (t: (key: string) => string): Option[] =>
  PROPERTY_TYPES_CONST.map((type) => ({
    value: type.value.toLowerCase(),
    label: getPropertyTypeName(type.id, t),
  }))
