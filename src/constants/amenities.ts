import {
  Wind,
  Waves,
  Shirt,
  Bed,
  Sofa,
  Wifi,
  ArrowUpDown,
  Car,
  Square,
  SquareStack,
  DoorOpen,
  Camera,
  Shield,
  Lock,
  Fingerprint,
  Tv,
  Dumbbell,
  Bus,
  Train,
  Plane,
  Building2,
  GraduationCap,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react'

// Note: Using Waves for washing-machine and swimming-pool, need separate icons later
const SwimmingPool = Waves

export type AmenityCategory =
  | 'BASIC'
  | 'CONVENIENCE'
  | 'SECURITY'
  | 'ENTERTAINMENT'
  | 'TRANSPORT'

export interface AmenityConfig {
  id: number
  code: string
  translationKey: string // Translation key path: createPost.sections.propertyInfo.amenities.{translationKey}
  category: AmenityCategory
  icon: LucideIcon
}

/**
 * Amenities index for quick lookup by code
 */
export const AMENITIES_INDEX: Record<string, AmenityConfig> = {} as Record<
  string,
  AmenityConfig
>

/**
 * Amenities configuration with icons mapping
 * Based on database records
 */
export const AMENITIES_CONFIG: readonly AmenityConfig[] = [
  // BASIC
  {
    id: 1,
    code: 'ac',
    translationKey: 'ac',
    category: 'BASIC',
    icon: Wind,
  },
  {
    id: 2,
    code: 'fridge',
    translationKey: 'fridge',
    category: 'BASIC',
    icon: SquareStack, // Alternative icon for refrigerator
  },
  {
    id: 3,
    code: 'washing-machine',
    translationKey: 'washingMachine',
    category: 'BASIC',
    icon: Waves,
  },
  {
    id: 4,
    code: 'wardrobe',
    translationKey: 'wardrobe',
    category: 'BASIC',
    icon: Shirt,
  },
  {
    id: 5,
    code: 'bed',
    translationKey: 'bed',
    category: 'BASIC',
    icon: Bed,
  },
  {
    id: 6,
    code: 'table-chair',
    translationKey: 'tableChair',
    category: 'BASIC',
    icon: Sofa,
  },
  // CONVENIENCE
  {
    id: 7,
    code: 'wifi',
    translationKey: 'wifi',
    category: 'CONVENIENCE',
    icon: Wifi,
  },
  {
    id: 8,
    code: 'elevator',
    translationKey: 'elevator',
    category: 'CONVENIENCE',
    icon: ArrowUpDown,
  },
  {
    id: 9,
    code: 'parking',
    translationKey: 'parking',
    category: 'CONVENIENCE',
    icon: Car,
  },
  {
    id: 10,
    code: 'balcony',
    translationKey: 'balcony',
    category: 'CONVENIENCE',
    icon: Square,
  },
  {
    id: 11,
    code: 'window',
    translationKey: 'window',
    category: 'CONVENIENCE',
    icon: SquareStack,
  },
  {
    id: 12,
    code: 'bathroom',
    translationKey: 'bathroom',
    category: 'CONVENIENCE',
    icon: DoorOpen,
  },
  // SECURITY
  {
    id: 13,
    code: 'security-camera',
    translationKey: 'securityCamera',
    category: 'SECURITY',
    icon: Camera,
  },
  {
    id: 14,
    code: 'security-guard',
    translationKey: 'securityGuard',
    category: 'SECURITY',
    icon: Shield,
  },
  {
    id: 15,
    code: 'magnetic-door',
    translationKey: 'magneticDoor',
    category: 'SECURITY',
    icon: Lock,
  },
  {
    id: 16,
    code: 'fingerprint',
    translationKey: 'fingerprint',
    category: 'SECURITY',
    icon: Fingerprint,
  },
  // ENTERTAINMENT
  {
    id: 17,
    code: 'tv',
    translationKey: 'tv',
    category: 'ENTERTAINMENT',
    icon: Tv,
  },
  {
    id: 18,
    code: 'swimming-pool',
    translationKey: 'swimmingPool',
    category: 'ENTERTAINMENT',
    icon: SwimmingPool,
  },
  {
    id: 19,
    code: 'gym',
    translationKey: 'gym',
    category: 'ENTERTAINMENT',
    icon: Dumbbell,
  },
  {
    id: 20,
    code: 'tennis',
    translationKey: 'tennis',
    category: 'ENTERTAINMENT',
    icon: Dumbbell, // Alternative icon for tennis
  },
  // TRANSPORT
  {
    id: 21,
    code: 'bus-stop',
    translationKey: 'busStop',
    category: 'TRANSPORT',
    icon: Bus,
  },
  {
    id: 22,
    code: 'train-station',
    translationKey: 'trainStation',
    category: 'TRANSPORT',
    icon: Train,
  },
  {
    id: 23,
    code: 'airport',
    translationKey: 'airport',
    category: 'TRANSPORT',
    icon: Plane,
  },
  {
    id: 24,
    code: 'hospital',
    translationKey: 'hospital',
    category: 'TRANSPORT',
    icon: Building2,
  },
  {
    id: 25,
    code: 'school',
    translationKey: 'school',
    category: 'TRANSPORT',
    icon: GraduationCap,
  },
  {
    id: 26,
    code: 'market',
    translationKey: 'market',
    category: 'TRANSPORT',
    icon: ShoppingCart,
  },
] as const

// Populate the AMENITIES_INDEX for O(1) lookup
AMENITIES_CONFIG.forEach((amenity) => {
  AMENITIES_INDEX[amenity.code] = amenity
})

/**
 * Get amenity config by code
 */
export const getAmenityByCode = (code: string): AmenityConfig | undefined => {
  return AMENITIES_INDEX[code]
}

/**
 * Get amenities by category
 */
export const getAmenitiesByCategory = (
  category: AmenityCategory,
): AmenityConfig[] => {
  return AMENITIES_CONFIG.filter((amenity) => amenity.category === category)
}

/**
 * Get all amenity codes
 */
export const getAllAmenityCodes = (): string[] => {
  return AMENITIES_CONFIG.map((amenity) => amenity.code)
}

/**
 * Get translated name for amenity
 * @param code - Amenity code
 * @param t - Translation function scoped to createPost.sections.propertyInfo.address
 * @returns Translated name or code if translation not found
 */
export const getAmenityTranslatedName = (
  code: string,
  t: (key: string) => string,
): string => {
  const amenity = getAmenityByCode(code)
  if (!amenity) return code

  try {
    return t(`amenities.${amenity.translationKey}`)
  } catch {
    return code
  }
}

/**
 * Get amenity config with translated name
 * @param code - Amenity code
 * @param t - Translation function scoped to createPost.sections.propertyInfo.address
 * @returns Amenity config with translated name or undefined if not found
 */
export const getAmenityWithTranslation = (
  code: string,
  t: (key: string) => string,
): (AmenityConfig & { translatedName: string }) | undefined => {
  const amenity = getAmenityByCode(code)
  if (!amenity) return undefined

  return {
    ...amenity,
    translatedName: getAmenityTranslatedName(code, t),
  }
}
