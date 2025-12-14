import type {
  CreateListingRequest,
  ListingDetail,
  MediaItem,
} from '@/api/types/property.type'
import { LISTING_TYPE } from '@/api/types/property.type'
import type { DraftListingResponse } from '@/api/types/draft.type'
import type { FulltextAddress } from '@/hooks/usePostContext/useAddressComposition'

// Extended address type that matches the API response
interface ExtendedAddress {
  addressId?: number
  fullAddress?: string
  fullNewAddress?: string | null
  latitude?: number
  longitude?: number
  addressType?: string
  legacyProvinceId?: number
  legacyProvinceName?: string
  legacyDistrictId?: number
  legacyDistrictName?: string
  legacyWardId?: number
  legacyWardName?: string
  legacyStreet?: string | null
  newProvinceCode?: string | null
  newProvinceName?: string | null
  newWardCode?: string | null
  newWardName?: string | null
  newStreet?: string | null
  streetId?: number | null
  streetName?: string | null
  projectId?: number | null
  projectName?: string | null
}

// Extended listing type that includes direct categoryId field from API response
interface ExtendedListingDetail extends ListingDetail {
  categoryId?: number
}

// Extended media type that matches the full API response
interface ExtendedMediaItem {
  mediaId: number
  listingId: number
  userId: string
  mediaType: 'IMAGE' | 'VIDEO'
  sourceType: string
  status: string
  url: string
  thumbnailUrl?: string | null
  title?: string | null
  description?: string | null
  altText?: string | null
  isPrimary: boolean
  sortOrder: number
  fileSize: number
  mimeType?: string
  originalFilename?: string
  durationSeconds?: number | null
  uploadConfirmed?: boolean
  createdAt: string
  updatedAt?: string
}

export interface MappedFormData {
  propertyInfo: Partial<CreateListingRequest>
  fulltextAddress: FulltextAddress
  media: Partial<MediaItem>[]
}

/**
 * Maps a ListingDetail (from update post) to form data structure
 * Used by UpdatePostContext to populate the form with existing listing data
 */
export function mapListingToFormData(listing: ListingDetail): MappedFormData {
  const amenityIds = listing.amenities?.map((a) => a.amenityId) || []
  const mediaIds = listing.media?.map((m) => m.mediaId) || []

  const mappedPropertyInfo: Partial<CreateListingRequest> = {
    title: listing.title || '',
    description: listing.description || '',
    listingType: 'RENT' as CreateListingRequest['listingType'],
    categoryId: (listing as ExtendedListingDetail).categoryId,
    productType: listing.productType,
    price: listing.price,
    priceUnit: listing.priceUnit,
    area: listing.area,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    direction: listing.direction,
    furnishing: listing.furnishing,
    roomCapacity: listing.roomCapacity ?? undefined,
    waterPrice: listing.waterPrice,
    electricityPrice: listing.electricityPrice,
    internetPrice: listing.internetPrice,
    serviceFee:
      'serviceFee' in listing
        ? (listing.serviceFee as CreateListingRequest['serviceFee'] | undefined)
        : undefined,
    amenityIds: amenityIds,
    mediaIds: mediaIds,
    vipType: listing.vipType as CreateListingRequest['vipType'],
    postDate: listing.postDate ? new Date(listing.postDate) : undefined,
    expiryDate: listing.expiryDate ? new Date(listing.expiryDate) : undefined,
    durationDays:
      listing.expiryDate && listing.postDate
        ? (Math.round(
            (new Date(listing.expiryDate).getTime() -
              new Date(listing.postDate).getTime()) /
              (1000 * 60 * 60 * 24),
          ) as CreateListingRequest['durationDays'])
        : undefined,
  }

  // Prepare fulltext address
  const fulltextAddressUpdate: FulltextAddress = {
    newProvinceCode: '',
    newWardCode: '',
    legacyAddressId: '',
    legacyAddressText: '',
    propertyAddressEdited: false,
  }

  // Map address - ListingDetail has address codes in the response
  const addr = listing.address as ExtendedAddress

  if (addr) {
    const newProvinceCode = addr.newProvinceCode
      ? String(addr.newProvinceCode)
      : ''
    const newWardCode = addr.newWardCode ? String(addr.newWardCode) : ''
    const street = addr.newStreet || addr.streetName || ''

    // Set coordinates
    mappedPropertyInfo.address = {
      newAddress: {
        provinceCode: newProvinceCode,
        wardCode: newWardCode,
        street: street || undefined,
      },
      latitude: addr.latitude ?? 0,
      longitude: addr.longitude ?? 0,
    }

    // Also set legacy address if available
    if (addr.legacyProvinceId && addr.legacyDistrictId && addr.legacyWardId) {
      mappedPropertyInfo.address.legacy = {
        provinceId: addr.legacyProvinceId,
        districtId: addr.legacyDistrictId,
        wardId: addr.legacyWardId,
      }

      // Compose legacy address text for display
      const legacyAddressId = `${addr.legacyProvinceId}-${addr.legacyDistrictId}-${addr.legacyWardId}`
      const legacyAddressText =
        addr.fullAddress || addr.legacyWardName
          ? [
              addr.legacyProvinceName,
              addr.legacyDistrictName,
              addr.legacyWardName,
            ]
              .filter(Boolean)
              .join(' - ')
          : ''

      fulltextAddressUpdate.legacyAddressId = legacyAddressId
      fulltextAddressUpdate.legacyAddressText = legacyAddressText
    }

    // Set fulltext address codes
    fulltextAddressUpdate.newProvinceCode = newProvinceCode
    fulltextAddressUpdate.newWardCode = newWardCode
  }

  // Map media
  let mediaItems: Partial<MediaItem>[] = []
  if (listing.media && listing.media.length > 0) {
    const extendedMedia = listing.media as unknown as ExtendedMediaItem[]

    mediaItems = extendedMedia.map((m) => ({
      mediaId: m.mediaId,
      listingId: m.listingId,
      mediaType: m.mediaType as MediaItem['mediaType'],
      sourceType: m.sourceType,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl,
      isPrimary: m.isPrimary,
      sortOrder: m.sortOrder,
      status: m.status as MediaItem['status'],
      fileSize: m.fileSize,
      mimeType: m.mimeType,
      originalFilename: m.originalFilename,
      durationSeconds: m.durationSeconds,
      createdAt: m.createdAt,
    }))
  }

  return {
    propertyInfo: mappedPropertyInfo,
    fulltextAddress: fulltextAddressUpdate,
    media: mediaItems,
  }
}

/**
 * Maps a DraftListingResponse (from create post draft) to form data structure
 * Used by CreatePostContext to populate the form with draft data
 */
export function mapDraftToFormData(
  draft: DraftListingResponse,
): MappedFormData {
  const amenityIds =
    draft.amenities?.map((a) => {
      if (typeof a === 'object' && a !== null) {
        return typeof a.amenityId === 'number'
          ? a.amenityId
          : typeof a.amenityId === 'string'
            ? parseInt(a.amenityId, 10)
            : undefined
      }
      return typeof a === 'number'
        ? a
        : typeof a === 'string'
          ? parseInt(a, 10)
          : undefined
    }) || []

  const validAmenityIds = amenityIds.filter(
    (id): id is number => typeof id === 'number' && !isNaN(id),
  )

  const listingType =
    typeof draft.listingType === 'string'
      ? (draft.listingType.toUpperCase() as LISTING_TYPE)
      : LISTING_TYPE.RENT

  const mappedPropertyInfo: Partial<CreateListingRequest> = {
    title: draft.title || '',
    description: draft.description || '',
    listingType: listingType,
    categoryId:
      typeof draft.categoryId === 'number'
        ? draft.categoryId
        : typeof draft.categoryId === 'string'
          ? parseInt(draft.categoryId, 10)
          : undefined,
    productType: draft.productType,
    price:
      typeof draft.price === 'number'
        ? draft.price
        : typeof draft.price === 'string'
          ? parseFloat(draft.price)
          : undefined,
    priceUnit: draft.priceUnit,
    area:
      typeof draft.area === 'number'
        ? draft.area
        : typeof draft.area === 'string'
          ? parseFloat(draft.area)
          : undefined,
    bedrooms:
      typeof draft.bedrooms === 'number'
        ? draft.bedrooms
        : typeof draft.bedrooms === 'string'
          ? parseInt(draft.bedrooms, 10)
          : undefined,
    bathrooms:
      typeof draft.bathrooms === 'number'
        ? draft.bathrooms
        : typeof draft.bathrooms === 'string'
          ? parseInt(draft.bathrooms, 10)
          : undefined,
    direction: draft.direction,
    furnishing: draft.furnishing,
    roomCapacity:
      typeof draft.roomCapacity === 'number'
        ? draft.roomCapacity
        : typeof draft.roomCapacity === 'string'
          ? parseInt(draft.roomCapacity, 10)
          : undefined,
    waterPrice: draft.waterPrice as CreateListingRequest['waterPrice'],
    electricityPrice:
      draft.electricityPrice as CreateListingRequest['electricityPrice'],
    internetPrice: draft.internetPrice as CreateListingRequest['internetPrice'],
    serviceFee: draft.serviceFee as CreateListingRequest['serviceFee'],
    amenityIds: validAmenityIds,
    vipType: draft.vipType as CreateListingRequest['vipType'],
  }

  // Prepare fulltext address
  const fulltextAddressUpdate: FulltextAddress = {
    newProvinceCode: '',
    newWardCode: '',
    legacyAddressId: '',
    legacyAddressText: '',
    propertyAddressEdited: false,
  }

  // Map address from draft
  if (draft.address) {
    const newProvinceCode = draft.address.newProvinceCode || ''
    const newWardCode = draft.address.newWardCode || ''
    const street = draft.address.newStreet || ''

    mappedPropertyInfo.address = {
      newAddress: {
        provinceCode: newProvinceCode,
        wardCode: newWardCode,
        street: street || undefined,
      },
      latitude: draft.address.latitude ?? 0,
      longitude: draft.address.longitude ?? 0,
    }

    if (
      draft.address.legacyProvinceId &&
      draft.address.legacyDistrictId &&
      draft.address.legacyWardId
    ) {
      mappedPropertyInfo.address.legacy = {
        provinceId: draft.address.legacyProvinceId,
        districtId: draft.address.legacyDistrictId,
        wardId: draft.address.legacyWardId,
      }

      const legacyAddressId = `${draft.address.legacyProvinceId}-${draft.address.legacyDistrictId}-${draft.address.legacyWardId}`
      const legacyAddressText = [
        draft.address.legacyProvinceName,
        draft.address.legacyDistrictName,
        draft.address.legacyWardName,
      ]
        .filter(Boolean)
        .join(' - ')

      fulltextAddressUpdate.legacyAddressId = legacyAddressId
      fulltextAddressUpdate.legacyAddressText = legacyAddressText
    }

    fulltextAddressUpdate.newProvinceCode = newProvinceCode
    fulltextAddressUpdate.newWardCode = newWardCode
  }

  // Map media from draft
  let mediaItems: Partial<MediaItem>[] = []
  if (draft.media && draft.media.length > 0) {
    mediaItems = draft.media.map((m) => ({
      mediaId: m.mediaId,
      mediaType: m.mediaType as MediaItem['mediaType'],
      sourceType: m.sourceType,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl,
      isPrimary: m.isPrimary,
      sortOrder: m.sortOrder,
      status: m.status as MediaItem['status'],
      fileSize: m.fileSize,
      mimeType: m.mimeType,
      originalFilename: m.originalFilename,
      durationSeconds: m.durationSeconds,
      createdAt: m.createdAt,
    }))
  }

  return {
    propertyInfo: mappedPropertyInfo,
    fulltextAddress: fulltextAddressUpdate,
    media: mediaItems,
  }
}
