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
import { isYouTube } from '@/utils/video/url'
import { CreatePostProvider, useCreatePost } from '@/contexts/createPost'
import { PropertyInfoStep } from './PropertyInfoStep'
import { AIValuationStep } from './AIValuationStep'
import { MediaStep } from './MediaStep'
import { PackageConfigStep } from './PackageConfigStep'
import { OrderSummaryStep } from './OrderSummaryStep'
import { DefaultStep } from './DefaultStep'

interface CreatePostTemplateProps {
  className?: string
}

const CreatePostTemplateContent: React.FC<{ className?: string }> = ({
  className,
}) => {
  const t = useTranslations('createPost')
  const tSteps = useTranslations('createPost.steps')
  const { propertyInfo } = useCreatePost()
  const [currentStep, setCurrentStep] = useState(0)
  const topRef = useRef<HTMLDivElement | null>(null)

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

  const getStepErrors = (index: number): string[] => {
    const errors: string[] = []
    switch (index) {
      case 0: {
        if (!propertyInfo?.propertyAddress?.trim()) errors.push('address')
        if (!propertyInfo?.area || propertyInfo?.area <= 0) errors.push('area')
        if (!propertyInfo?.price || propertyInfo?.price <= 0)
          errors.push('price')
        break
      }
      case 2: {
        const count = propertyInfo?.images?.length || 0
        const url = propertyInfo?.videoUrl || ''
        const isYT = typeof url === 'string' && isYouTube(url)
        // Accept if either at least 3 images or a YouTube link is provided
        if (count < 3 && !isYT) errors.push('imagesMin')
        break
      }
      case 3: {
        // Require a package selection (any of the supported types)
        if (
          !propertyInfo?.selectedMembershipPlanId &&
          !propertyInfo?.selectedVoucherPackageId &&
          !propertyInfo?.selectedPackageType
        ) {
          errors.push('package')
        }
        // Require duration
        if (
          !propertyInfo?.selectedDuration ||
          propertyInfo.selectedDuration <= 0
        ) {
          errors.push('duration')
        }
        // Require start date
        if (
          !propertyInfo?.packageStartDate ||
          !propertyInfo.packageStartDate.trim()
        ) {
          errors.push('startDate')
        }
        break
      }
      default:
        break
    }
    return errors
  }

  const isStepComplete = (index: number): boolean =>
    getStepErrors(index).length === 0

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

  const handleNext = () => {
    // Always scroll to top when pressing Next
    scrollToTop()

    // If current step is not complete, stop here (show validation section)
    if (!isStepComplete(currentStep)) return

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

  const currentErrors = getStepErrors(currentStep)
  const canProceed = currentErrors.length === 0

  const getErrorMessage = (errorKey: string): string => {
    switch (errorKey) {
      case 'address':
        return t('validation.addressRequired')
      case 'area':
        return t('validation.areaRequired')
      case 'price':
        return t('validation.priceRequired')
      case 'imagesMin':
        return (
          t('validation.mediaImagesOrYoutube') ||
          'Vui lòng thêm ít nhất 3 ảnh hoặc 1 liên kết YouTube'
        )
      case 'package':
        return t('validation.packageRequired')
      case 'duration':
        return t('validation.durationRequired')
      case 'startDate':
        return t('validation.startDateRequired')
      default:
        return ''
    }
  }

  return (
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
                      <li key={error} className='flex items-center gap-2'>
                        <span className='text-red-500'>•</span>
                        {getErrorMessage(error)}
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
  )
}

const CreatePostTemplate: React.FC<CreatePostTemplateProps> = ({
  className,
}) => {
  return (
    <CreatePostProvider>
      <CreatePostTemplateContent className={className} />
    </CreatePostProvider>
  )
}

export { CreatePostTemplate }
export type { CreatePostTemplateProps }
