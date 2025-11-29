import {
  STEP_0_FIELDS,
  STEP_2_FIELDS,
  STEP_3_FIELDS,
} from '@/utils/createPost/validationSchemas'
import type { CreateListingRequest } from '@/api/types/property.type'
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
  const hasAllRequiredFields =
    !!propertyInfo.categoryId &&
    !!propertyInfo.propertyType &&
    !!propertyInfo.address &&
    !!address?.latitude &&
    !!address?.longitude &&
    !!propertyInfo.area &&
    !!propertyInfo.price &&
    !!propertyInfo.priceUnit &&
    !!propertyInfo.title &&
    propertyInfo.title.trim().length >= 10 &&
    propertyInfo.title.trim().length <= 100 &&
    !!propertyInfo.description &&
    propertyInfo.description.trim().length >= 50 &&
    propertyInfo.description.trim().length <= 2000 &&
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

  const hasVip = !!propertyInfo.vipType && !!propertyInfo.durationDays
  const hasBenefit = Array.isArray(propertyInfo.benefitsMembership)
    ? propertyInfo.benefitsMembership.length > 0
    : false
  const hasStart = !!propertyInfo.postDate

  return hasStart && (hasVip || hasBenefit)
}

interface MediaUrls {
  video?: string
  images?: string[]
}

export const validateStep2 = (mediaUrls: MediaUrls | undefined): boolean => {
  if (!mediaUrls) return false

  const images = mediaUrls.images || []
  const imagesCount = Array.isArray(images) ? images.length : 0
  const hasVideo = !!mediaUrls.video

  return hasVideo || imagesCount >= 4
}
