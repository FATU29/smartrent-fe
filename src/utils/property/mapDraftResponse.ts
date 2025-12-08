import type {
  DraftListingResponse,
  DraftAddressResponse,
} from '@/api/types/draft.type'
import type { Amenity, MediaItem } from '@/api/types/property.type'

/**
 * Frontend draft detail type (UI-friendly)
 * This is the simplified version used in the UI components
 */
export interface DraftDetail {
  id: number
  title: string
  description: string
  listingType: 'RENT' | 'SHARE'
  vipType: 'NORMAL' | 'SILVER' | 'GOLD' | 'DIAMOND'
  category: {
    id: number
  }
  productType: string
  price: number
  priceUnit: string
  address: {
    type: 'OLD' | 'NEW'
    // Full address strings for display
    fullAddress: string | null
    fullNewAddress: string | null
    // Legacy fields
    provinceId?: number | null
    provinceName?: string | null
    districtId?: number | null
    districtName?: string | null
    wardId?: number | null
    wardName?: string | null
    // New fields
    provinceCode?: string | null
    wardCode?: string | null
    // Common
    street?: string | null
    streetId?: number | null
    streetName?: string | null
    projectId?: number | null
    projectName?: string | null
    latitude: number
    longitude: number
  }
  area: number
  bedrooms: number
  bathrooms: number
  direction: string
  furnishing: string
  roomCapacity?: number | null
  utilities: {
    waterPrice: string
    electricityPrice: string
    internetPrice: string
    serviceFee: string
  }
  amenities: Amenity[]
  media: MediaItem[]
  createdAt: string
  updatedAt: string
}

/**
 * Map backend draft address to frontend format
 */
function mapDraftAddress(address: DraftAddressResponse) {
  return {
    type: address.addressType,
    fullAddress: address.fullAddress,
    fullNewAddress: address.fullNewAddress,
    // Legacy fields
    provinceId: address.legacyProvinceId,
    provinceName: address.legacyProvinceName,
    districtId: address.legacyDistrictId,
    districtName: address.legacyDistrictName,
    wardId: address.legacyWardId,
    wardName: address.legacyWardName,
    // New fields
    provinceCode: address.newProvinceCode,
    wardCode: address.newWardCode,
    // Common fields
    street: address.legacyStreet || address.newStreet,
    streetId: address.streetId,
    streetName: address.streetName,
    projectId: address.projectId,
    projectName: address.projectName,
    latitude: address.latitude,
    longitude: address.longitude,
  }
}

/**
 * Map backend draft response to frontend format
 */
export function mapDraftBackendToFrontend(
  backend: DraftListingResponse,
): DraftDetail {
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
    address: mapDraftAddress(backend.address),
    area: backend.area,
    bedrooms: backend.bedrooms,
    bathrooms: backend.bathrooms,
    direction: backend.direction,
    furnishing: backend.furnishing,
    roomCapacity: backend.roomCapacity,
    utilities: {
      waterPrice: backend.waterPrice,
      electricityPrice: backend.electricityPrice,
      internetPrice: backend.internetPrice,
      serviceFee: backend.serviceFee,
    },
    amenities: backend.amenities || [],
    media: backend.media || [],
    createdAt: backend.createdAt,
    updatedAt: backend.updatedAt,
  }
}

/**
 * Map array of backend drafts to frontend format
 */
export function mapDraftsArrayBackendToFrontend(
  backend: DraftListingResponse[],
): DraftDetail[] {
  return backend.map(mapDraftBackendToFrontend)
}
