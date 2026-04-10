import type {
  CreateListingRequest,
  ListingDetail,
  MediaItem,
  PriceType,
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
  street?: string | null
  provinceCode?: string
  provinceName?: string
  wardCode?: string
  wardName?: string
  districtCode?: string
  districtName?: string
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

const PRICE_TYPE_VALUES: readonly PriceType[] = [
  'NEGOTIABLE',
  'SET_BY_OWNER',
  'PROVIDER_RATE',
] as const

const toPriceType = (value: unknown): PriceType | undefined => {
  if (typeof value !== 'string') return undefined
  return PRICE_TYPE_VALUES.includes(value as PriceType)
    ? (value as PriceType)
    : undefined
}

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  return undefined
}

const toTrimmedString = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

const pickFirstString = (...values: unknown[]): string => {
  for (const value of values) {
    const normalized = toTrimmedString(value)
    if (normalized) return normalized
  }
  return ''
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
    waterPrice: toPriceType(listing.waterPrice),
    electricityPrice: toPriceType(listing.electricityPrice),
    internetPrice: toPriceType(listing.internetPrice),
    serviceFee: toPriceType(listing.serviceFee),
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
    newProvinceName: '',
    newWardCode: '',
    newWardName: '',
    legacyAddressId: '',
    legacyAddressText: '',
    propertyAddressEdited: false,
  }

  // Map address - ListingDetail has address codes in the response
  const addr = listing.address as ExtendedAddress

  if (addr) {
    const newProvinceCode = pickFirstString(
      addr.newProvinceCode,
      addr.provinceCode,
    )
    const newWardCode = pickFirstString(addr.newWardCode, addr.wardCode)
    const newProvinceName = pickFirstString(
      addr.newProvinceName,
      addr.provinceName,
    )
    const newWardName = pickFirstString(addr.newWardName, addr.wardName)
    const street = pickFirstString(
      addr.streetName,
      addr.newStreet,
      addr.street,
      addr.legacyStreet,
    )
    const backendDisplayAddress = pickFirstString(addr.fullNewAddress)

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
      const legacyAddressText = [
        addr.legacyProvinceName,
        addr.legacyDistrictName,
        addr.legacyWardName,
      ]
        .filter(Boolean)
        .join(' - ')

      fulltextAddressUpdate.legacyAddressId = legacyAddressId
      fulltextAddressUpdate.legacyAddressText =
        legacyAddressText || pickFirstString(addr.fullAddress)
    }

    // Set fulltext address codes
    fulltextAddressUpdate.newProvinceCode = newProvinceCode
    fulltextAddressUpdate.newProvinceName = newProvinceName
    fulltextAddressUpdate.newWardCode = newWardCode
    fulltextAddressUpdate.newWardName = newWardName

    if (backendDisplayAddress) {
      fulltextAddressUpdate.displayAddress = backendDisplayAddress
      fulltextAddressUpdate.propertyAddress = backendDisplayAddress
      fulltextAddressUpdate.fullAddressNew = backendDisplayAddress
    }
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
  const draftAny = draft as DraftListingResponse & {
    durationDays?: number | string | null
    postDate?: string | Date | null
    expiryDate?: string | Date | null
    benefitIds?: Array<number | string> | null
    useMembershipQuota?: boolean | null
  }

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

  const vipType =
    typeof draft.vipType === 'string' && draft.vipType.trim()
      ? (draft.vipType.toUpperCase() as CreateListingRequest['vipType'])
      : undefined

  const draftDurationDays = toNumber(draftAny.durationDays)
  const draftPostDate = draftAny.postDate ? new Date(draftAny.postDate) : null
  const draftExpiryDate = draftAny.expiryDate
    ? new Date(draftAny.expiryDate)
    : null

  const draftBenefitIds = Array.isArray(draftAny.benefitIds)
    ? draftAny.benefitIds
        .map((id) => toNumber(id))
        .filter((id): id is number => typeof id === 'number' && !isNaN(id))
    : undefined

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
    vipType,
    durationDays: draftDurationDays as CreateListingRequest['durationDays'],
    postDate:
      draftPostDate && !isNaN(draftPostDate.getTime())
        ? draftPostDate
        : undefined,
    expiryDate:
      draftExpiryDate && !isNaN(draftExpiryDate.getTime())
        ? draftExpiryDate
        : undefined,
    benefitIds: draftBenefitIds,
    useMembershipQuota:
      typeof draftAny.useMembershipQuota === 'boolean'
        ? draftAny.useMembershipQuota
        : undefined,
  }

  // Prepare fulltext address
  const fulltextAddressUpdate: FulltextAddress = {
    newProvinceCode: '',
    newProvinceName: '',
    newWardCode: '',
    newWardName: '',
    legacyAddressId: '',
    legacyAddressText: '',
    propertyAddressEdited: false,
  }

  // Map address from draft
  if (draft.address) {
    const address = draft.address as DraftListingResponse['address'] & {
      // Unified address fields returned by current backend
      provinceCode?: string | number | null
      districtCode?: string | number | null
      wardCode?: string | number | null
      provinceName?: string | null
      wardName?: string | null
      street?: string | null
      districtName?: string | null
      // Legacy expanded fields from older response shape
      legacyProvinceId?: number | null
      legacyDistrictId?: number | null
      legacyWardId?: number | null
      legacyProvinceName?: string | null
      legacyDistrictName?: string | null
      legacyWardName?: string | null
      legacyStreet?: string | null
      newProvinceCode?: string | null
      newWardCode?: string | null
      newStreet?: string | null
      streetName?: string | null
      addressType?: string | null
      fullAddress?: string | null
      fullNewAddress?: string | null
      latitude?: number | string | null
      longitude?: number | string | null
    }

    const addressType = toTrimmedString(address.addressType).toUpperCase()
    const isLikelyLegacy =
      addressType === 'OLD' ||
      !!address.legacyProvinceId ||
      !!address.legacyDistrictId ||
      !!address.legacyWardId ||
      !!address.districtCode
    const isLikelyNew =
      addressType === 'NEW' ||
      (!isLikelyLegacy &&
        (!!address.newProvinceCode ||
          !!address.newWardCode ||
          !!address.fullNewAddress ||
          (!!address.provinceCode && !address.districtCode)))

    const newProvinceCode = pickFirstString(
      address.newProvinceCode,
      isLikelyNew ? address.provinceCode : undefined,
      address.provinceCode,
    )
    const newWardCode = pickFirstString(
      address.newWardCode,
      isLikelyNew ? address.wardCode : undefined,
      address.wardCode,
    )
    const newProvinceName = pickFirstString(
      address.newProvinceName,
      isLikelyNew ? address.provinceName : undefined,
      address.provinceName,
    )
    const newWardName = pickFirstString(
      address.newWardName,
      isLikelyNew ? address.wardName : undefined,
      address.wardName,
    )
    const backendDisplayAddress = pickFirstString(address.fullNewAddress)
    const street = pickFirstString(
      address.streetName,
      address.newStreet,
      address.street,
      address.legacyStreet,
    )

    const latitude = toNumber(address.latitude) ?? 0
    const longitude = toNumber(address.longitude) ?? 0

    mappedPropertyInfo.address = {
      newAddress: {
        provinceCode: newProvinceCode,
        wardCode: newWardCode,
        street: street || undefined,
      },
      latitude,
      longitude,
    }

    const legacyProvinceId =
      toNumber(address.legacyProvinceId) ??
      (isLikelyLegacy ? toNumber(address.provinceCode) : undefined)
    const legacyDistrictId =
      toNumber(address.legacyDistrictId) ??
      (isLikelyLegacy ? toNumber(address.districtCode) : undefined)
    const legacyWardId =
      toNumber(address.legacyWardId) ??
      (isLikelyLegacy ? toNumber(address.wardCode) : undefined)

    if (legacyProvinceId && legacyDistrictId && legacyWardId) {
      mappedPropertyInfo.address.legacy = {
        provinceId: legacyProvinceId,
        districtId: legacyDistrictId,
        wardId: legacyWardId,
      }

      const legacyAddressId = `${legacyProvinceId}-${legacyDistrictId}-${legacyWardId}`
      const legacyAddressText = [
        address.legacyProvinceName ||
          (isLikelyLegacy ? address.provinceName : null),
        address.legacyDistrictName ||
          (isLikelyLegacy ? address.districtName : null),
        address.legacyWardName || (isLikelyLegacy ? address.wardName : null),
      ]
        .filter(Boolean)
        .join(' - ')

      fulltextAddressUpdate.legacyAddressId = legacyAddressId
      fulltextAddressUpdate.legacyAddressText =
        legacyAddressText || pickFirstString(address.fullAddress)
    } else {
      const fallbackLegacyText = pickFirstString(address.fullAddress)
      if (fallbackLegacyText) {
        fulltextAddressUpdate.legacyAddressText = fallbackLegacyText
      }
    }

    fulltextAddressUpdate.newProvinceCode = newProvinceCode
    fulltextAddressUpdate.newProvinceName = newProvinceName
    fulltextAddressUpdate.newWardCode = newWardCode
    fulltextAddressUpdate.newWardName = newWardName

    if (backendDisplayAddress) {
      fulltextAddressUpdate.displayAddress = backendDisplayAddress
      fulltextAddressUpdate.propertyAddress = backendDisplayAddress
      fulltextAddressUpdate.fullAddressNew = backendDisplayAddress
    }
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
