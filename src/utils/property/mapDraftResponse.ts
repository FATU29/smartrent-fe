import { getAmenityByCode } from '@/constants/amenities'

/**
 * Backend draft response item type
 */
export interface DraftBackendItem {
  draftId: number
  userId: string
  title: string
  description: string
  listingType: 'RENT' | 'SALE'
  vipType: 'VIP' | 'PREMIUM' | null
  categoryId: number
  productType: string
  price: number
  priceUnit: string
  addressType: 'OLD' | 'NEW'
  provinceId?: number
  districtId?: number
  wardId?: number
  provinceCode?: string | null
  wardCode?: string | null
  street?: string | null
  streetId?: number | null
  projectId?: number | null
  latitude: number
  longitude: number
  area: number
  bedrooms: number
  bathrooms: number
  direction: string
  furnishing: string
  roomCapacity?: number | null
  waterPrice?: string
  electricityPrice?: string
  internetPrice?: string
  serviceFee?: string
  amenityIds: number[]
  mediaIds?: number[] | null
  createdAt: string
  updatedAt: string
}

/**
 * Frontend draft detail type (UI-friendly)
 */
export interface DraftDetail {
  id: number
  title: string
  description: string
  listingType: 'RENT' | 'SALE'
  vipType: 'VIP' | 'PREMIUM' | 'NORMAL'
  category: {
    id: number
  }
  productType: string
  price: number
  priceUnit: string
  address: {
    type: 'OLD' | 'NEW'
    provinceId?: number
    districtId?: number
    wardId?: number
    provinceCode?: string
    wardCode?: string
    street?: string
    streetId?: number
    projectId?: number
    latitude: number
    longitude: number
  }
  area: number
  bedrooms: number
  bathrooms: number
  direction: string
  furnishing: string
  roomCapacity?: number
  utilities: {
    waterPrice?: string
    electricityPrice?: string
    internetPrice?: string
    serviceFee?: string
  }
  amenities: Array<{
    id: number
    code: string
    name: string
    category: string
  }>
  media: {
    ids?: number[]
  }
  createdAt: string
  updatedAt: string
}

/**
 * Map backend draft item to frontend format
 */
export function mapDraftBackendToFrontend(
  backend: DraftBackendItem,
): DraftDetail {
  // Map amenity IDs to amenity details
  const amenities = backend.amenityIds
    .map((id) => {
      const amenity = getAmenityByCode(String(id)) // Try to get by code
      if (amenity) {
        return {
          id: amenity.id,
          code: amenity.code,
          name: amenity.translationKey,
          category: amenity.category,
        }
      }
      // Fallback if not found
      return {
        id,
        code: `amenity-${id}`,
        name: `Amenity ${id}`,
        category: 'BASIC',
      }
    })
    .filter(Boolean)

  return {
    id: backend.draftId,
    title: backend.title,
    description: backend.description,
    listingType: backend.listingType,
    vipType: backend.vipType ?? 'NORMAL',
    category: {
      id: backend.categoryId,
    },
    productType: backend.productType,
    price: backend.price,
    priceUnit: backend.priceUnit,
    address: {
      type: backend.addressType,
      provinceId: backend.provinceId,
      districtId: backend.districtId,
      wardId: backend.wardId,
      provinceCode: backend.provinceCode ?? undefined,
      wardCode: backend.wardCode ?? undefined,
      street: backend.street ?? undefined,
      streetId: backend.streetId ?? undefined,
      projectId: backend.projectId ?? undefined,
      latitude: backend.latitude,
      longitude: backend.longitude,
    },
    area: backend.area,
    bedrooms: backend.bedrooms,
    bathrooms: backend.bathrooms,
    direction: backend.direction,
    furnishing: backend.furnishing,
    roomCapacity: backend.roomCapacity ?? undefined,
    utilities: {
      waterPrice: backend.waterPrice,
      electricityPrice: backend.electricityPrice,
      internetPrice: backend.internetPrice,
      serviceFee: backend.serviceFee,
    },
    amenities,
    media: {
      ids: backend.mediaIds ?? undefined,
    },
    createdAt: backend.createdAt,
    updatedAt: backend.updatedAt,
  }
}

/**
 * Map array of backend drafts to frontend format
 */
export function mapDraftsArrayBackendToFrontend(
  backend: DraftBackendItem[],
): DraftDetail[] {
  return backend.map(mapDraftBackendToFrontend)
}
