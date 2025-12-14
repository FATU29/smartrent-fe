import { useState, useRef, useEffect, useCallback } from 'react'
import {
  hasFormErrors,
  validateStep0,
  validateStep2,
  validateStep3,
} from './validation.utils'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import type { UseFormReturn } from 'react-hook-form'
import type { CreateListingRequest } from '@/api/types/property.type'
import type { MediaItem } from '@/api/types/property.type'

interface VideoUploadProgressState {
  isUploading: boolean
  progress: number
  error?: string | null
  fileName?: string | null
}

interface ImagesUploadProgressState {
  isUploading: boolean
  uploadedCount: number
  totalCount: number
  error?: string | null
}

interface UsePostStepsParams {
  totalSteps: number
  form: UseFormReturn<Partial<CreateListingRequest>>
  propertyInfo: Partial<CreateListingRequest> | undefined
  media: Partial<MediaItem>[]
  videoUploadProgress: VideoUploadProgressState
  imagesUploadProgress: ImagesUploadProgressState
  isCreatePost?: boolean
}

export const usePostSteps = ({
  totalSteps,
  form,
  propertyInfo,
  media,
  videoUploadProgress,
  imagesUploadProgress,
  isCreatePost = false,
}: UsePostStepsParams) => {
  const t = useTranslations('createPost')
  const { trigger, formState } = form
  const { errors } = formState

  const [currentStep, setCurrentStep] = useState(0)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const topRef = useRef<HTMLDivElement | null>(null)

  const scrollToTop = useCallback(() => {
    if (topRef.current) {
      try {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } catch {}
    }
    if (typeof window !== 'undefined') {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch {}
    }
  }, [])

  useEffect(() => {
    scrollToTop()
  }, [currentStep, scrollToTop])

  const isStepComplete = useCallback(
    (index: number): boolean => {
      // For update post: step 2 and 3 have relaxed validation
      if (!isCreatePost) {
        if (index === 3) {
          return true
        }
        if (index === 2) {
          return validateStep2(media, false)
        }
      }

      // Check form errors for other cases
      if (hasFormErrors(index, errors)) {
        return false
      }

      // Step-specific validation
      switch (index) {
        case 0:
          return validateStep0(propertyInfo as CreateListingRequest | undefined)
        case 2:
          return validateStep2(media, isCreatePost)
        case 3:
          if (isCreatePost) {
            return validateStep3(
              propertyInfo as CreateListingRequest | undefined,
            )
          }
          return true
        default:
          return true
      }
    },
    [errors, propertyInfo, media, isCreatePost],
  )

  const allPreviousComplete = useCallback(
    (targetIndex: number) => {
      for (let i = 0; i < targetIndex; i++) {
        if (!isStepComplete(i)) return false
      }
      return true
    },
    [isStepComplete],
  )

  const handleNext = useCallback(async () => {
    setAttemptedSubmit(true)
    scrollToTop()

    const proceedNext = () => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1)
        setAttemptedSubmit(false)
      }
    }

    // Handle media step validation - check if media is uploaded
    if (currentStep === 2) {
      if (videoUploadProgress.isUploading) {
        toast.error(
          t('validation.videoUploadInProgress') ||
            'Please wait for video upload to complete before continuing',
        )
        return
      }
      if (imagesUploadProgress.isUploading) {
        toast.error(
          t('validation.imagesUploadInProgress') ||
            'Please wait for images upload to complete before continuing',
        )
        return
      }

      // Check validation via exposed window method
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validateMediaStep = (window as any).__validateMediaStep
      if (validateMediaStep) {
        const success = await validateMediaStep()
        if (!success) return
      }

      proceedNext()
      return
    }

    // Steps that don't require validation - proceed directly
    const skipValidationSteps = isCreatePost ? [1, 4] : [1, 3, 4]
    if (skipValidationSteps.includes(currentStep)) {
      proceedNext()
      return
    }

    // Validate steps that require form validation
    const validationSteps = isCreatePost ? [0, 3] : [0]
    if (validationSteps.includes(currentStep)) {
      await trigger()
    }

    // Check if step is complete after validation
    if (!isStepComplete(currentStep)) {
      return
    }

    // Proceed to next step
    proceedNext()
  }, [
    currentStep,
    totalSteps,
    scrollToTop,
    videoUploadProgress.isUploading,
    imagesUploadProgress.isUploading,
    trigger,
    isStepComplete,
    isCreatePost,
    t,
  ])

  const handleBack = useCallback(() => {
    scrollToTop()
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep, scrollToTop])

  const handleStepClick = useCallback(
    (stepIndex: number) => {
      if (stepIndex === currentStep) return
      if (allPreviousComplete(stepIndex)) {
        setCurrentStep(stepIndex)
      }
    },
    [currentStep, allPreviousComplete],
  )

  return {
    currentStep,
    attemptedSubmit,
    topRef,
    form,
    isStepComplete,
    handleNext,
    handleBack,
    handleStepClick,
    setAttemptedSubmit,
  }
}
