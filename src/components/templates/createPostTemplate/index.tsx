import React, { useEffect, useRef, useState } from 'react'
import {
  ProgressSteps,
  ProgressStep,
} from '@/components/molecules/progressSteps'
import { HeaderModule } from '@/components/molecules/createPostModules/headerModule'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'
import {
  Home,
  Brain,
  Camera,
  FileText,
  ClipboardList,
  ArrowLeft,
  ArrowRight,
  CreditCard,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm, type Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useCreatePost } from '@/contexts/createPost'
import { PropertyInfoStep } from './PropertyInfoStep'
import { AIValuationStep } from './AIValuationStep'
import { MediaStep } from './MediaStep'
import { PackageConfigStep } from './PackageConfigStep'
import { OrderSummaryStep } from './OrderSummaryStep'
import { DefaultStep } from './DefaultStep'
import { Form } from '@/components/atoms/form'
import {
  getCreatePostSchema,
  STEP_0_FIELDS,
  STEP_2_FIELDS,
  STEP_3_FIELDS,
} from '@/utils/createPost/validationSchemas'
import type { CreateListingRequest, PriceType } from '@/api/types/property.type'

interface CreatePostTemplateProps {
  className?: string
}

const CreatePostTemplateContent: React.FC<{ className?: string }> = ({
  className,
}) => {
  const t = useTranslations('createPost')
  const tSteps = useTranslations('createPost.steps')
  const tValidation = useTranslations('createPost.validation')
  const { propertyInfo } = useCreatePost()
  const [currentStep, setCurrentStep] = useState(0)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const topRef = useRef<HTMLDivElement | null>(null)

  // Initialize react-hook-form with validation schema
  const validationSchema = getCreatePostSchema()
  const form = useForm<Partial<CreateListingRequest>>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<
      Partial<CreateListingRequest>
    >,
    defaultValues: {
      title: propertyInfo?.title || '',
      description: propertyInfo?.description || '',
      address: propertyInfo?.address,
      area: propertyInfo?.area || 0,
      price: propertyInfo?.price || 0,
      priceUnit: propertyInfo?.priceUnit,
      propertyType: propertyInfo?.propertyType,
      furnishing: propertyInfo?.furnishing,
      bedrooms: propertyInfo?.bedrooms || 0,
      bathrooms: propertyInfo?.bathrooms || 0,
      direction: propertyInfo?.direction,
      amenityIds: propertyInfo?.amenityIds || [],
      waterPrice: (propertyInfo?.waterPrice as PriceType) || undefined,
      electricityPrice:
        (propertyInfo?.electricityPrice as PriceType) || undefined,
      internetPrice: (propertyInfo?.internetPrice as PriceType) || undefined,
    },
    mode: 'onTouched', // Validate only after field is touched/blurred
    reValidateMode: 'onChange', // Re-validate on change after first validation
  })

  const { trigger, formState } = form
  const { errors } = formState

  const scrollToTop = () => {
    // Scroll the anchor into view (handles inner scrollable containers)
    if (topRef.current) {
      try {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } catch {}
    }
    // Also scroll window for good measure
    if (typeof window !== 'undefined') {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch {}
    }
  }

  // Scroll to top when step changes
  useEffect(() => {
    scrollToTop()
  }, [currentStep])

  // Check if step is complete (synchronous version for UI)
  const isStepComplete = (index: number): boolean => {
    let fieldsToCheck: readonly string[] = []

    switch (index) {
      case 0:
        fieldsToCheck = STEP_0_FIELDS
        break
      case 2:
        fieldsToCheck = STEP_2_FIELDS
        break
      case 3:
        fieldsToCheck = STEP_3_FIELDS
        break
      default:
        return true
    }

    // Check if any required fields have validation errors
    const hasErrors = fieldsToCheck.some(
      (field) => errors[field as keyof typeof errors],
    )

    if (hasErrors) return false

    if (index === 0) {
      const pi = propertyInfo as unknown as Record<string, unknown>
      const address = pi?.address as
        | { latitude?: number; longitude?: number }
        | undefined
      const hasAllRequiredFields =
        !!pi?.propertyType &&
        !!pi?.address &&
        typeof pi?.address === 'object' &&
        !!address?.latitude &&
        !!address?.longitude &&
        !!pi?.area &&
        !!pi?.price &&
        !!pi?.priceUnit &&
        !!pi?.title &&
        (pi?.title as string).trim().length >= 10 &&
        (pi?.title as string).trim().length <= 100 &&
        !!pi?.description &&
        (pi?.description as string).trim().length >= 50 &&
        (pi?.description as string).trim().length <= 2000 &&
        !!pi?.waterPrice &&
        !!pi?.electricityPrice &&
        !!pi?.internetPrice &&
        !!pi?.furnishing &&
        typeof pi?.bedrooms === 'number' &&
        pi?.bedrooms >= 1 &&
        typeof pi?.bathrooms === 'number' &&
        pi?.bathrooms >= 1 &&
        !!pi?.direction

      if (!hasAllRequiredFields) return false
    }
    if (index === 3) {
      const pi = propertyInfo as unknown as Record<string, unknown>
      const hasVip = !!pi?.packageSelection
      const hasBenefit = Array.isArray(pi?.benefitsMembership)
        ? (pi?.benefitsMembership as unknown[]).length > 0
        : false
      const hasStart = !!pi?.postDate
      if (!(hasStart && (hasVip || hasBenefit))) return false
    }

    return true
  }

  const allPreviousComplete = (targetIndex: number) => {
    for (let i = 0; i < targetIndex; i++) {
      if (!isStepComplete(i)) return false
    }
    return true
  }

  const progressSteps: ProgressStep[] = [
    {
      id: 'property-info',
      title: tSteps('propertyInfo.title'),
      description: tSteps('propertyInfo.description'),
      icon: <Home className='w-4 h-4 sm:w-5 sm:h-5' />,
      isActive: currentStep === 0,
      isCompleted: isStepComplete(0) && currentStep > 0,
    },
    {
      id: 'ai-valuation',
      title: tSteps('aiValuation.title'),
      description: tSteps('aiValuation.description'),
      icon: <Brain className='w-4 h-4 sm:w-5 sm:h-5' />,
      isActive: currentStep === 1,
      isCompleted: isStepComplete(1) && currentStep > 1,
    },
    {
      id: 'images-video',
      title: tSteps('imagesAndVideo.title'),
      description: tSteps('imagesAndVideo.description'),
      icon: <Camera className='w-4 h-4 sm:w-5 sm:h-5' />,
      isActive: currentStep === 2,
      isCompleted: isStepComplete(2) && currentStep > 2,
    },
    {
      id: 'package-config',
      title: tSteps('packageAndConfig.title'),
      description: tSteps('packageAndConfig.description'),
      icon: <FileText className='w-4 h-4 sm:w-5 sm:h-5' />,
      isActive: currentStep === 3,
      isCompleted: isStepComplete(3) && currentStep > 3,
    },
    {
      id: 'order-summary',
      title: tSteps('orderSummary.title'),
      description: tSteps('orderSummary.description'),
      icon: <ClipboardList className='w-4 h-4 sm:w-5 sm:h-5' />,
      isActive: currentStep === 4,
      isCompleted: currentStep > 4,
    },
  ]

  const handleNext = async () => {
    // Mark that user has attempted to submit
    setAttemptedSubmit(true)

    // Always scroll to top when pressing Next
    scrollToTop()

    // Special handling for Media step (step 2) - upload pending images
    if (currentStep === 2) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validateMediaStep = (window as any).__validateMediaStep
      if (validateMediaStep) {
        const success = await validateMediaStep()
        if (!success) return // Stop if upload failed
      }
      // Proceed to next step after successful upload
      setCurrentStep(currentStep + 1)
      setAttemptedSubmit(false)
      return
    }

    // Validate all fields in current step
    switch (currentStep) {
      case 0:
      case 3:
        await trigger()
        break
      default:
        // Steps 1 and 4 don't require validation
        if (currentStep < progressSteps.length - 1) {
          setCurrentStep(currentStep + 1)
          setAttemptedSubmit(false) // Reset for next step
        }
        return
    }

    // Check if step is complete after validation
    if (!isStepComplete(currentStep)) {
      return
    }

    // Otherwise proceed to next step
    if (currentStep < progressSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      setAttemptedSubmit(false) // Reset for next step
    }
  }

  const handleBack = () => {
    // Always scroll to top when pressing Back
    scrollToTop()
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex === currentStep) return
    if (allPreviousComplete(stepIndex)) {
      setCurrentStep(stepIndex)
    }
  }

  const renderCurrentSection = () => {
    switch (currentStep) {
      case 0:
        return <PropertyInfoStep />
      case 1:
        return <AIValuationStep />
      case 2:
        return <MediaStep />
      case 3:
        return <PackageConfigStep />
      case 4:
        return <OrderSummaryStep />
      default:
        return <DefaultStep step={progressSteps[currentStep]} />
    }
  }

  // Get current step errors from react-hook-form
  const getCurrentStepErrors = (): Array<{ key: string; message: string }> => {
    // Only show errors after user has attempted to submit
    if (!attemptedSubmit) return []

    const errorList: Array<{ key: string; message: string }> = []
    let fieldsToCheck: readonly string[] = []

    switch (currentStep) {
      case 0:
        fieldsToCheck = STEP_0_FIELDS
        break
      case 2:
        fieldsToCheck = STEP_2_FIELDS
        break
      case 3:
        fieldsToCheck = STEP_3_FIELDS
        break
      default:
        return []
    }

    fieldsToCheck.forEach((field) => {
      const fieldError = errors[field as keyof typeof errors]
      if (fieldError) {
        const message = fieldError.message || ''
        // Normalize validation key (strip prefix if exists)
        const validationKey = message.replace(/^createPost\.validation\./, '')

        // Skip if validationKey is empty or still contains dots (invalid key)
        if (!validationKey || validationKey.includes('.')) {
          return
        }

        // Translate validation key
        const translatedMessage = tValidation(validationKey)

        errorList.push({
          key: field,
          message: translatedMessage,
        })
      }
    })

    // Check for package-required error (from schema test)
    if (currentStep === 3) {
      const pi = propertyInfo as unknown as Record<string, unknown>
      const hasVip = !!pi?.packageSelection
      const hasBenefit = Array.isArray(pi?.benefitsMembership)
        ? (pi?.benefitsMembership as unknown[]).length > 0
        : false

      // Always check postDate first - it's required regardless
      if (!pi?.postDate || String(pi.postDate).trim().length === 0) {
        errorList.push({
          key: 'postDate',
          message: t('validation.startDateRequired'),
        })
      }

      // Then check if at least one package option is selected
      if (!(hasVip || hasBenefit)) {
        errorList.push({
          key: 'package',
          message: t('validation.packageRequired'),
        })
      }
    }

    // Step 2 (Media): Inline error like step 0 instead of toast
    if (currentStep === 2) {
      const pi = propertyInfo as unknown as Record<string, unknown>
      const assets = pi?.['assets'] as unknown as
        | { images?: unknown; video?: unknown }
        | undefined
      const images = (assets?.images as unknown[] | undefined) || []
      const imagesCount = Array.isArray(images) ? images.length : 0
      const videoVal = assets?.video as string | undefined
      const hasVideo = !!videoVal && String(videoVal).trim().length > 0
      if (!hasVideo && imagesCount < 4) {
        errorList.push({
          key: 'media',
          message: t('validation.imagesRequired'),
        })
      }
    }

    return errorList
  }

  const currentErrors = getCurrentStepErrors()
  const canProceed = currentErrors.length === 0

  return (
    <Form {...form}>
      <Card
        className={`min-h-screen bg-background border-0 shadow-none p-0 ${className || ''}`}
      >
        {/* Anchor used for reliable scroll-to-top across inner containers */}
        <div ref={topRef} />
        <Card className='w-full mx-auto md:container md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8 border-0 shadow-none p-0'>
          <HeaderModule />
          <Card className='mb-6 sm:mb-8 flex justify-center border-0 shadow-none p-0'>
            <ProgressSteps
              currentStep={currentStep}
              steps={progressSteps}
              className='bg-card p-4 sm:p-6 rounded-lg shadow-sm border'
              onStepClick={handleStepClick}
            />
          </Card>
          {renderCurrentSection()}

          {/* Validation Errors */}
          {!canProceed && currentErrors.length > 0 && (
            <Card className='w-full mx-auto md:max-w-6xl mt-4 border-0 shadow-none p-0'>
              <div className='bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg'>
                <div className='flex items-start gap-3'>
                  <div className='flex-shrink-0'>
                    <svg
                      className='w-5 h-5 text-red-500'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div className='flex-1'>
                    <h3 className='text-sm font-semibold text-red-800 dark:text-red-300 mb-1'>
                      {t('completeCurrentStep')}
                    </h3>
                    <p className='text-xs text-red-700 dark:text-red-400 mb-2'>
                      {/* Show which step needs attention using translated step title */}
                      {progressSteps[currentStep]?.title}
                    </p>
                    <ul className='text-sm text-red-700 dark:text-red-400 space-y-1'>
                      {currentErrors.map((error) => (
                        <li key={error.key} className='flex items-center gap-2'>
                          <span className='text-red-500'>•</span>
                          {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card className='w-full mx-auto md:max-w-6xl mt-8 sm:mt-12 border-0 shadow-none p-0'>
            <Card className='flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-center flex-wrap border-0 shadow-none p-0'>
              {currentStep > 0 && (
                <Button
                  variant='outline'
                  onClick={handleBack}
                  className='w-full sm:w-auto order-2 sm:order-1 h-12 px-6 sm:px-8'
                >
                  <ArrowLeft className='w-4 h-4 mr-2' />
                  {t('back')}
                </Button>
              )}
              {currentStep < progressSteps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className='w-full sm:w-auto order-1 sm:order-2 h-12 px-6 sm:px-8 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {t('next')}
                  <ArrowRight className='w-4 h-4 ml-2' />
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    const pi = propertyInfo as unknown as Record<
                      string,
                      unknown
                    >
                    const hasBenefit = Array.isArray(pi?.benefitsMembership)
                      ? (pi?.benefitsMembership as unknown[]).length > 0
                      : false
                    // If membership benefit applied, create listing directly; otherwise start payment
                    if (hasBenefit) {
                      console.log(
                        'Creating listing with membership benefit (no payment required)...',
                      )
                      // TODO: Call API to create listing directly
                    } else {
                      console.log('Redirecting to payment...')
                      // TODO: Call API to create payment
                    }
                  }}
                  disabled={!canProceed}
                  className='w-full sm:w-auto order-1 sm:order-2 h-12 px-6 sm:px-8 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  <CreditCard className='w-4 h-4 mr-2' />
                  {Array.isArray(
                    (propertyInfo as unknown as Record<string, unknown>)
                      ?.benefitsMembership,
                  ) &&
                  (
                    (propertyInfo as unknown as Record<string, unknown>)
                      ?.benefitsMembership as unknown[]
                  ).length > 0
                    ? t('createListing')
                    : t('payment')}
                </Button>
              )}
            </Card>
          </Card>
        </Card>
      </Card>
    </Form>
  )
}

const CreatePostTemplate: React.FC<CreatePostTemplateProps> = ({
  className,
}) => {
  return <CreatePostTemplateContent className={className} />
}

export { CreatePostTemplate }
export type { CreatePostTemplateProps }
