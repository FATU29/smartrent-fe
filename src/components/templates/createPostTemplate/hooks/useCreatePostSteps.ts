import { useState, useRef, useEffect, useCallback } from 'react'
import { useCreatePost } from '@/contexts/createPost'
import { useCreatePostForm } from './useCreatePostForm'
import {
  hasFormErrors,
  validateStep0,
  validateStep2,
  validateStep3,
} from '../utils/createPostValidation.utils'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

const TOTAL_STEPS = 5

export const useCreatePostSteps = () => {
  const t = useTranslations('createPost')
  const { propertyInfo, mediaUrls, videoUploadProgress, imagesUploadProgress } =
    useCreatePost()
  const form = useCreatePostForm()
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
      // Check form errors first
      if (hasFormErrors(index, errors)) {
        return false
      }

      // Step-specific validation
      switch (index) {
        case 0:
          return validateStep0(propertyInfo)
        case 2:
          return validateStep2(mediaUrls)
        case 3:
          return validateStep3(propertyInfo)
        default:
          return true
      }
    },
    [errors, propertyInfo, mediaUrls],
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
      if (currentStep < TOTAL_STEPS - 1) {
        setCurrentStep(currentStep + 1)
        setAttemptedSubmit(false)
      }
    }

    const handleMediaStep = async () => {
      if (videoUploadProgress.isUploading) {
        toast.error(
          t('validation.videoUploadInProgress') ||
            'Vui lòng đợi video tải lên hoàn tất trước khi tiếp tục',
        )
        return false
      }
      if (imagesUploadProgress.isUploading) {
        toast.error(
          t('validation.imagesUploadInProgress') ||
            'Vui lòng đợi ảnh tải lên hoàn tất trước khi tiếp tục',
        )
        return false
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validateMediaStep = (window as any).__validateMediaStep
      if (validateMediaStep) {
        const success = await validateMediaStep()
        if (!success) return false
      }
      return true
    }

    if (currentStep === 2) {
      const ok = await handleMediaStep()
      if (!ok) return
      proceedNext()
      return
    }

    // Steps 1 and 4 don't require validation - proceed directly
    if (currentStep === 1 || currentStep === 4) {
      proceedNext()
      return
    }

    // Validate steps that require form validation (0 and 3)
    if (currentStep === 0 || currentStep === 3) {
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
    scrollToTop,
    videoUploadProgress.isUploading,
    imagesUploadProgress.isUploading,
    trigger,
    isStepComplete,
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
  }
}
