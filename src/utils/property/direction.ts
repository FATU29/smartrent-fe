import { Direction } from '@/api/types/property.type'

/**
 * Translation key mapping for Direction enum
 * Maps API Direction values (uppercase) to translation keys (lowercase)
 */
export const DIRECTION_TRANSLATION_KEYS: Record<Direction, string> = {
  NORTH: 'createPost.sections.utilitiesStructure.directions.north',
  SOUTH: 'createPost.sections.utilitiesStructure.directions.south',
  EAST: 'createPost.sections.utilitiesStructure.directions.east',
  WEST: 'createPost.sections.utilitiesStructure.directions.west',
  NORTHEAST: 'createPost.sections.utilitiesStructure.directions.northeast',
  NORTHWEST: 'createPost.sections.utilitiesStructure.directions.northwest',
  SOUTHEAST: 'createPost.sections.utilitiesStructure.directions.southeast',
  SOUTHWEST: 'createPost.sections.utilitiesStructure.directions.southwest',
} as const

/**
 * Get translation key for a Direction
 * @param direction - Direction enum value
 * @returns Translation key string
 */
export const getDirectionTranslationKey = (direction: Direction): string => {
  return DIRECTION_TRANSLATION_KEYS[direction]
}
