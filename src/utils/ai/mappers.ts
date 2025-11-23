import type { Furnishing, PropertyType } from '@/api/types/property.type'

export const mapFurnishing = (
  value?: 'furnished' | 'semi-furnished' | 'unfurnished',
): Furnishing | undefined => {
  const mapping: Record<string, Furnishing> = {
    furnished: 'FULLY_FURNISHED',
    'semi-furnished': 'SEMI_FURNISHED',
    unfurnished: 'UNFURNISHED',
  }
  return value ? mapping[value] : undefined
}

export const mapPropertyType = (
  value?: 'room' | 'apartment' | 'house' | 'studio',
): PropertyType | undefined => {
  const mapping: Record<string, PropertyType> = {
    apartment: 'APARTMENT',
    house: 'HOUSE',
    room: 'ROOM',
    studio: 'STUDIO',
  }
  return value ? mapping[value] : undefined
}
