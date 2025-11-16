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
import type { PropertyInfo } from '@/contexts/createPost'
import type { PriceType } from '@/api/types/property.type'

interface CreatePostTemplateProps {
  className?: string
}

const CreatePostTemplateContent: React.FC<{ className?: string }> = ({
  className,
}) => {
  const t = useTranslations('createPost')
  const tSteps = useTranslations('createPost.steps')
  const tValidation = useTranslations('createPost.validation')
  const { propertyInfo, updatePropertyInfo } = useCreatePost()
  const [currentStep, setCurrentStep] = useState(0)
  const topRef = useRef<HTMLDivElement | null>(null)

  // Initialize react-hook-form with validation schema
  const validationSchema = getCreatePostSchema()
  const form = useForm<Partial<PropertyInfo>>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<
      Partial<PropertyInfo>
    >,
    defaultValues: {
      propertyAddress: propertyInfo?.propertyAddress || '',
      area: propertyInfo?.area || 0,
      price: propertyInfo?.price || 0,
      listingTitle: propertyInfo?.listingTitle || '',
      propertyDescription: propertyInfo?.propertyDescription || '',
      fullName: propertyInfo?.fullName || '',
      email: propertyInfo?.email || '',
      phoneNumber: propertyInfo?.phoneNumber || '',
      waterPrice: (propertyInfo?.waterPrice as PriceType) || undefined,
      electricityPrice:
        (propertyInfo?.electricityPrice as PriceType) || undefined,
      internetPrice: (propertyInfo?.internetPrice as PriceType) || undefined,
      interiorCondition: propertyInfo?.interiorCondition || undefined,
      bedrooms: propertyInfo?.bedrooms || 0,
      bathrooms: propertyInfo?.bathrooms || 0,
      moveInDate: propertyInfo?.moveInDate || '',
      images: propertyInfo?.images || [],
      videoUrl: propertyInfo?.videoUrl || '',
      selectedMembershipPlanId: propertyInfo?.selectedMembershipPlanId || '',
      selectedVoucherPackageId: propertyInfo?.selectedVoucherPackageId || '',
      selectedPackageType: propertyInfo?.selectedPackageType || '',
      selectedDuration: propertyInfo?.selectedDuration || 0,
      packageStartDate: propertyInfo?.packageStartDate || '',
    },
    mode: 'onChange', // Validate on change for all fields
    reValidateMode: 'onChange', // Re-validate on change
  })

  const { trigger, formState, watch, setValue } = form
  const { errors } = formState

  // Watch form values and sync with context
  const watchedValues = watch()
  const isSyncingRef = useRef(false)

  // Sync form values to context when they change
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && !isSyncingRef.current) {
        isSyncingRef.current = true
        const fieldValue = value[name as keyof typeof value]
        updatePropertyInfo({ [name]: fieldValue } as Partial<PropertyInfo>)
        // Reset sync flag after a short delay
        setTimeout(() => {
          isSyncingRef.current = false
        }, 0)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, updatePropertyInfo])

  // Sync context values to form when they change (for external updates)
  useEffect(() => {
    if (isSyncingRef.current) return

    const updates: Partial<PropertyInfo> = {}
    let hasUpdates = false

    if (propertyInfo?.propertyAddress !== watchedValues.propertyAddress) {
      updates.propertyAddress = propertyInfo?.propertyAddress || ''
      hasUpdates = true
    }
    if (propertyInfo?.area !== watchedValues.area) {
      updates.area = propertyInfo?.area || 0
      hasUpdates = true
    }
    if (propertyInfo?.price !== watchedValues.price) {
      updates.price = propertyInfo?.price || 0
      hasUpdates = true
    }
    if (propertyInfo?.listingTitle !== watchedValues.listingTitle) {
      updates.listingTitle = propertyInfo?.listingTitle || ''
      hasUpdates = true
    }
    if (
      propertyInfo?.propertyDescription !== watchedValues.propertyDescription
    ) {
      updates.propertyDescription = propertyInfo?.propertyDescription || ''
      hasUpdates = true
    }
    if (propertyInfo?.fullName !== watchedValues.fullName) {
      updates.fullName = propertyInfo?.fullName || ''
      hasUpdates = true
    }
    if (propertyInfo?.email !== watchedValues.email) {
      updates.email = propertyInfo?.email || ''
      hasUpdates = true
    }
    if (propertyInfo?.phoneNumber !== watchedValues.phoneNumber) {
      updates.phoneNumber = propertyInfo?.phoneNumber || ''
      hasUpdates = true
    }
    if (propertyInfo?.waterPrice !== watchedValues.waterPrice) {
      updates.waterPrice = propertyInfo?.waterPrice || undefined
      hasUpdates = true
    }
    if (propertyInfo?.electricityPrice !== watchedValues.electricityPrice) {
      updates.electricityPrice = propertyInfo?.electricityPrice || undefined
      hasUpdates = true
    }
    if (propertyInfo?.internetPrice !== watchedValues.internetPrice) {
      updates.internetPrice = propertyInfo?.internetPrice || undefined
      hasUpdates = true
    }
    if (propertyInfo?.interiorCondition !== watchedValues.interiorCondition) {
      updates.interiorCondition = propertyInfo?.interiorCondition || undefined
      hasUpdates = true
    }
    if (propertyInfo?.bedrooms !== watchedValues.bedrooms) {
      updates.bedrooms = propertyInfo?.bedrooms || 0
      hasUpdates = true
    }
    if (propertyInfo?.bathrooms !== watchedValues.bathrooms) {
      updates.bathrooms = propertyInfo?.bathrooms || 0
      hasUpdates = true
    }
    if (propertyInfo?.moveInDate !== watchedValues.moveInDate) {
      updates.moveInDate = propertyInfo?.moveInDate || ''
      hasUpdates = true
    }
    if (propertyInfo?.images !== watchedValues.images) {
      updates.images = propertyInfo?.images || []
      hasUpdates = true
    }
    if (propertyInfo?.videoUrl !== watchedValues.videoUrl) {
      updates.videoUrl = propertyInfo?.videoUrl || ''
      hasUpdates = true
    }
    if (
      propertyInfo?.selectedMembershipPlanId !==
      watchedValues.selectedMembershipPlanId
    ) {
      updates.selectedMembershipPlanId =
        propertyInfo?.selectedMembershipPlanId || ''
      hasUpdates = true
    }
    if (
      propertyInfo?.selectedVoucherPackageId !==
      watchedValues.selectedVoucherPackageId
    ) {
      updates.selectedVoucherPackageId =
        propertyInfo?.selectedVoucherPackageId || ''
      hasUpdates = true
    }
    if (
      propertyInfo?.selectedPackageType !== watchedValues.selectedPackageType
    ) {
      updates.selectedPackageType = propertyInfo?.selectedPackageType || ''
      hasUpdates = true
    }
    if (propertyInfo?.selectedDuration !== watchedValues.selectedDuration) {
      updates.selectedDuration = propertyInfo?.selectedDuration || 0
      hasUpdates = true
    }
    if (propertyInfo?.packageStartDate !== watchedValues.packageStartDate) {
      updates.packageStartDate = propertyInfo?.packageStartDate || ''
      hasUpdates = true
    }

    if (hasUpdates) {
      isSyncingRef.current = true
      Object.entries(updates).forEach(([key, value]) => {
        setValue(key as keyof PropertyInfo, value as any, {
          shouldValidate: false,
        })
      })
      setTimeout(() => {
        isSyncingRef.current = false
      }, 0)
    }
  }, [propertyInfo, setValue, watchedValues])

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

    // Check if all required fields have errors
    const hasErrors = fieldsToCheck.some(
      (field) => errors[field as keyof typeof errors],
    )

    // For step 3, also check package selection
    if (index === 3) {
      const hasPackage =
        !!propertyInfo?.selectedMembershipPlanId ||
        !!propertyInfo?.selectedVoucherPackageId ||
        !!propertyInfo?.selectedPackageType
      if (!hasPackage) {
        // If any package-related field is touched, validation should fail
        const packageFieldsTouched =
          errors.selectedMembershipPlanId ||
          errors.selectedVoucherPackageId ||
          errors.selectedPackageType
        if (packageFieldsTouched || errors.root) {
          return false
        }
      }
    }

    return !hasErrors
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
    // Always scroll to top when pressing Next
    scrollToTop()

    // Validate all fields in current step
    let fieldsToValidate: readonly string[] = []
    switch (currentStep) {
      case 0:
        // Validate all fields in step 0
        fieldsToValidate = STEP_0_FIELDS
        break
      case 2:
        // Validate all fields in step 2
        fieldsToValidate = STEP_2_FIELDS
        break
      case 3:
        // Validate all fields in step 3
        fieldsToValidate = STEP_3_FIELDS
        break
      default:
        // Steps 1 and 4 don't require validation
        if (currentStep < progressSteps.length - 1) {
          setCurrentStep(currentStep + 1)
        }
        return
    }

    // Trigger validation for all fields in current step
    await trigger(fieldsToValidate as any)

    // For step 3, also trigger full validation to ensure object-level test runs
    if (currentStep === 3) {
      await trigger()
    }

    // Check if step is complete after validation
    if (!isStepComplete(currentStep)) {
      return
    }

    // Otherwise proceed to next step
    if (currentStep < progressSteps.length - 1) {
      setCurrentStep(currentStep + 1)
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

    // Collect errors from form state
    fieldsToCheck.forEach((field) => {
      const fieldError = errors[field as keyof typeof errors]
      if (fieldError) {
        const message = fieldError.message || ''
        // Normalize validation key (strip prefix if exists)
        const validationKey = message.replace(/^createPost\.validation\./, '')
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
      const hasPackage =
        !!propertyInfo?.selectedMembershipPlanId ||
        !!propertyInfo?.selectedVoucherPackageId ||
        !!propertyInfo?.selectedPackageType
      if (!hasPackage) {
        // Check if package fields are touched/validated
        const packageFieldsTouched =
          errors.selectedMembershipPlanId ||
          errors.selectedVoucherPackageId ||
          errors.selectedPackageType
        if (packageFieldsTouched || errors.root) {
          errorList.push({
            key: 'package',
            message: t('validation.packageRequired'),
          })
        }
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
                  className='w-full sm:w-auto order-1 sm:order-2 h-12 px-6 sm:px-8 bg-primary hover:bg-primary/90'
                >
                  {t('next')}
                  <ArrowRight className='w-4 h-4 ml-2' />
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    // If promotion applied, proceed to upload immediately; otherwise start payment
                    if (propertyInfo.appliedPromotionBenefitId) {
                      console.log('Proceeding to upload with promotion...')
                    } else {
                      console.log('Processing payment...')
                    }
                  }}
                  disabled={!canProceed}
                  className='w-full sm:w-auto order-1 sm:order-2 h-12 px-6 sm:px-8 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  <CreditCard className='w-4 h-4 mr-2' />
                  {propertyInfo.appliedPromotionBenefitId
                    ? t('uploadNow')
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
