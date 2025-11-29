import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { getStepFields } from '../utils/createPostValidation.utils'
import type { FieldErrors } from 'react-hook-form'
import type { CreateListingRequest } from '@/api/types/property.type'

interface ValidationError {
  key: string
  message: string
}

export const useCreatePostValidation = (
  currentStep: number,
  attemptedSubmit: boolean,
  errors: FieldErrors<Partial<CreateListingRequest>>,
) => {
  const t = useTranslations('createPost')
  const tValidation = useTranslations('createPost.validation')
  const { propertyInfo, mediaUrls } = useCreatePost()

  const currentErrors = useMemo((): ValidationError[] => {
    if (!attemptedSubmit) return []

    const errorList: ValidationError[] = []
    const fieldsToCheck = getStepFields(currentStep)

    // Collect form validation errors
    fieldsToCheck.forEach((field) => {
      const fieldError = errors[field as keyof typeof errors]
      if (fieldError) {
        const message = fieldError.message || ''
        const validationKey = message.replace(/^createPost\.validation\./, '')

        if (!validationKey || validationKey.includes('.')) {
          return
        }

        const translatedMessage = tValidation(validationKey)
        errorList.push({
          key: field,
          message: translatedMessage,
        })
      }
    })

    // Step 3: Package config validation
    if (currentStep === 3) {
      const pi = propertyInfo as unknown as Record<string, unknown>
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

    // Step 2: Media validation
    if (currentStep === 2) {
      const images = mediaUrls?.images || []
      const imagesCount = Array.isArray(images) ? images.length : 0
      const videoVal = mediaUrls?.video
      const hasVideo = !!videoVal

      if (!hasVideo && imagesCount < 4) {
        errorList.push({
          key: 'media',
          message: t('validation.imagesRequired'),
        })
      }
    }

    return errorList
  }, [currentStep, attemptedSubmit, errors, propertyInfo, t, tValidation])

  const canProceed = currentErrors.length === 0

  return {
    currentErrors,
    canProceed,
  }
}
