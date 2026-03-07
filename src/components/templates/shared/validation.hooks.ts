import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { getStepFields } from './validation.utils'
import type { FieldErrors } from 'react-hook-form'
import type { CreateListingRequest } from '@/api/types/property.type'
import type { MediaItem } from '@/api/types/property.type'
import type { ValidationError } from './ValidationErrors'

interface UsePostValidationParams {
  currentStep: number
  attemptedSubmit: boolean
  errors: FieldErrors<Partial<CreateListingRequest>>
  propertyInfo: Partial<CreateListingRequest> | undefined
  media: Partial<MediaItem>[]
  isCreatePost?: boolean
}

export const usePostValidation = ({
  currentStep,
  attemptedSubmit,
  errors,
  propertyInfo,
  media,
  isCreatePost = false,
}: UsePostValidationParams) => {
  const t = useTranslations('createPost')
  const tValidation = useTranslations('createPost.validation')

  const currentErrors = useMemo((): ValidationError[] => {
    if (!attemptedSubmit) return []

    const errorList: ValidationError[] = []
    const fieldsToCheck = getStepFields(currentStep)

    // Skip form validation for update post at step 3
    const skipFormValidation = !isCreatePost && currentStep === 3

    if (!skipFormValidation) {
      fieldsToCheck.forEach((field) => {
        const fieldError = errors[field as keyof typeof errors]
        if (fieldError) {
          const message = fieldError.message || ''
          let validationKey = message.replace(/^createPost\.validation\./, '')

          // If validationKey contains dots, it might be a yup-generated message
          // Try to extract field name and construct a proper key
          if (validationKey.includes('.')) {
            const fieldNameMatch = validationKey.match(/^(\w+)/)
            if (fieldNameMatch) {
              const fieldName = fieldNameMatch[1]
              // Check if it's an "invalid" type error (oneOf, etc.)
              if (
                validationKey.includes('must be one of') ||
                validationKey.includes('one of the following')
              ) {
                validationKey = `${fieldName}Invalid`
              } else {
                // Fallback to original message if we can't determine the key
                validationKey = message
              }
            } else {
              validationKey = message
            }
          }

          if (!validationKey) {
            return
          }

          // Try to translate, fallback to original message if translation doesn't exist
          let translatedMessage: string
          try {
            translatedMessage = tValidation(validationKey)
            // If translation returns the same key, the key doesn't exist in translations
            if (
              translatedMessage === validationKey &&
              !validationKey.includes('.')
            ) {
              // Only use original message if it's not a simple key
              translatedMessage = message
            }
          } catch {
            translatedMessage = message
          }

          errorList.push({
            key: field,
            message: translatedMessage,
          })
        }
      })
    }

    // Step 3: Package config validation
    if (currentStep === 3) {
      const pi = propertyInfo as unknown as Record<string, unknown>

      // For create post: validate package selection and postDate
      if (isCreatePost) {
        const hasVip = !!pi?.vipType && !!pi?.durationDays
        const hasBenefit = Array.isArray(pi?.benefitsMembership)
          ? (pi?.benefitsMembership as unknown[]).length > 0
          : false

        if (!pi?.postDate || String(pi.postDate).trim().length === 0) {
          errorList.push({
            key: 'postDate',
            message: t('validation.startDateRequired'),
          })
        }

        if (!(hasVip || hasBenefit)) {
          errorList.push({
            key: 'package',
            message: t('validation.packageRequired'),
          })
        }
      }
      // For update post: No validation needed
      // They already have a package and postDate is optional to change
    }

    // Step 2: Media validation
    if (currentStep === 2) {
      const images = media.filter((m) => m.mediaType === 'IMAGE')
      const imagesCount = images.length
      const hasCover = images.some((m) => m.isPrimary === true)
      const video = media.find((m) => m.mediaType === 'VIDEO')
      const hasVideo = !!video

      // For create post: require minimum images and cover
      if (isCreatePost) {
        if (!hasVideo && imagesCount < 4) {
          errorList.push({
            key: 'media',
            message: t('validation.imagesRequired'),
          })
        }

        if (imagesCount > 0 && !hasCover) {
          errorList.push({
            key: 'coverImage',
            message: t('validation.coverImageRequired'),
          })
        }
      }
      // For update post: No validation needed
      // Images can be updated freely, cover image is optional
    }

    return errorList
  }, [
    currentStep,
    attemptedSubmit,
    errors,
    propertyInfo,
    media,
    isCreatePost,
    t,
    tValidation,
  ])

  const canProceed = currentErrors.length === 0

  return {
    currentErrors,
    canProceed,
  }
}
