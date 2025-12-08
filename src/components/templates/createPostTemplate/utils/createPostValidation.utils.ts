import {
  STEP_0_FIELDS,
  STEP_2_FIELDS,
  STEP_3_FIELDS,
} from '@/utils/createPost/validationSchemas'
import type { CreateListingRequest, MediaItem } from '@/api/types/property.type'
import type { FieldErrors } from 'react-hook-form'

export const getStepFields = (stepIndex: number): readonly string[] => {
  switch (stepIndex) {
    case 0:
      return STEP_0_FIELDS
    case 2:
      return STEP_2_FIELDS
    case 3:
      return STEP_3_FIELDS
    default:
      return []
  }
}

export const hasFormErrors = (
  stepIndex: number,
  errors: FieldErrors<Partial<CreateListingRequest>>,
): boolean => {
  const fieldsToCheck = getStepFields(stepIndex)
  return fieldsToCheck.some((field) => errors[field as keyof typeof errors])
}

export const validateStep0 = (
  propertyInfo: CreateListingRequest | undefined,
): boolean => {
  if (!propertyInfo) return false

  const address = propertyInfo.address

  // Check if coordinates are valid (not 0)
  const hasValidCoordinates =
    !!address?.latitude &&
    !!address?.longitude &&
    address.latitude !== 0 &&
    address.longitude !== 0

  // Check if address structure exists (either newAddress or legacy)
  const hasNewAddress = !!(
    address?.newAddress?.provinceCode && address?.newAddress?.wardCode
  )
  const hasLegacy = !!address?.legacy
  const hasAddressStructure = hasNewAddress || hasLegacy

  const hasAllRequiredFields =
    !!propertyInfo.categoryId &&
    !!propertyInfo.productType &&
    !!propertyInfo.address &&
    hasValidCoordinates &&
    hasAddressStructure &&
    !!propertyInfo.area &&
    !!propertyInfo.price &&
    !!propertyInfo.priceUnit &&
    !!propertyInfo.title &&
    propertyInfo.title.trim().length >= 30 &&
    !!propertyInfo.description &&
    propertyInfo.description.trim().length >= 70 &&
    !!propertyInfo.waterPrice &&
    !!propertyInfo.electricityPrice &&
    !!propertyInfo.internetPrice &&
    !!propertyInfo.serviceFee &&
    !!propertyInfo.furnishing &&
    typeof propertyInfo.bedrooms === 'number' &&
    propertyInfo.bedrooms >= 1 &&
    typeof propertyInfo.bathrooms === 'number' &&
    propertyInfo.bathrooms >= 1 &&
    !!propertyInfo.direction

  return hasAllRequiredFields
}

export const validateStep3 = (
  propertyInfo: CreateListingRequest | undefined,
): boolean => {
  if (!propertyInfo) return false

  const hasVip = !!propertyInfo?.vipType && !!propertyInfo?.durationDays
  const hasBenefit = Array.isArray(propertyInfo?.benefitIds)
    ? propertyInfo.benefitIds?.length > 0
    : false
  const hasStart = !!propertyInfo?.postDate

  return hasStart && (hasVip || hasBenefit)
}

interface MediaUrls {
  video?: string
  images?: string[]
}

/**
 * Validate Step 2 - Media
 * Accepts either old MediaUrls format or new MediaItem[] format
 */
export const validateStep2 = (
  media: MediaUrls | Partial<MediaItem>[] | undefined,
): boolean => {
  if (!media) return false

  // Handle new format: MediaItem[]
  if (Array.isArray(media)) {
    const hasVideo = media.some((m) => m.mediaType === 'VIDEO')
    const imagesCount = media.filter((m) => m.mediaType === 'IMAGE').length
    return hasVideo || imagesCount >= 4
  }

  // Handle old format: MediaUrls
  const images = media.images || []
  const imagesCount = Array.isArray(images) ? images.length : 0
  const hasVideo = !!media.video

  return hasVideo || imagesCount >= 4
}
