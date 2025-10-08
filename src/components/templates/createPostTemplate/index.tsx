import React, { useState } from 'react'
import {
  ProgressSteps,
  ProgressStep,
} from '@/components/molecules/progressSteps'
import { HeaderModule } from '@/components/molecules/createPostModules/headerModule'
import { PropertyInfoSection } from '@/components/organisms/createPostSections/propertyInfoSection'
import { AIValuationSection } from '@/components/organisms/createPostSections/aiValuationSection'
import { Button } from '@/components/atoms/button'
import { MediaSection } from '@/components/organisms/createPostSections/mediaSection'
import { PackageConfigSection } from '@/components/organisms/createPostSections/packageConfigSection'
import {
  Home,
  Brain,
  Camera,
  FileText,
  ClipboardList,
  Eye,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { CreatePostProvider, useCreatePost } from '@/contexts/createPost'

interface CreatePostTemplateProps {
  className?: string
}

// Inner component to access context values
const CreatePostTemplateContent: React.FC<{ className?: string }> = ({
  className,
}) => {
  const t = useTranslations('createPost')
  const tSteps = useTranslations('createPost.steps')
  const { propertyInfo } = useCreatePost()
  const [currentStep, setCurrentStep] = useState(0)

  // Collect validation errors for a step
  const getStepErrors = (index: number): string[] => {
    const errors: string[] = []
    switch (index) {
      case 0: {
        if (!propertyInfo.propertyAddress?.trim()) errors.push('address')
        if (!propertyInfo.area || propertyInfo.area <= 0) errors.push('area')
        if (!propertyInfo.price || propertyInfo.price <= 0) errors.push('price')
        break
      }
      case 2: {
        const count = propertyInfo.images?.length || 0
        if (count < 3) errors.push('imagesMin')
        break
      }
      case 3: {
        if (
          !propertyInfo.selectedMembershipPlanId &&
          !propertyInfo.selectedVoucherPackageId
        )
          errors.push('package')
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
    {
      id: 'review-payment',
      title: tSteps('reviewAndPayment.title'),
      description: tSteps('reviewAndPayment.description'),
      icon: <Eye className='w-4 h-4 sm:w-5 sm:h-5' />,
      isActive: currentStep === 5,
      isCompleted: currentStep > 5,
    },
  ]

  const handleNext = () => {
    if (!isStepComplete(currentStep)) return
    if (currentStep < progressSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
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
        return (
          <div className='w-full mx-auto md:max-w-6xl'>
            <div className='bg-card rounded-lg shadow-sm border p-6 sm:p-8'>
              <div className='mb-6 sm:mb-8'>
                <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3'>
                  {t('sections.propertyInfo.title')}
                </h2>
                <p className='text-sm sm:text-base text-muted-foreground'>
                  {t('sections.propertyInfo.description')}
                </p>
              </div>
              <PropertyInfoSection className='w-full' />
            </div>
          </div>
        )
      case 1:
        return (
          <div className='w-full mx-auto md:max-w-7xl'>
            <div className='bg-card rounded-lg shadow-sm border p-6 sm:p-8'>
              <div className='mb-6 sm:mb-8'>
                <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3'>
                  {t('sections.aiValuation.title')}
                </h2>
                <p className='text-sm sm:text-base text-muted-foreground'>
                  {t('sections.aiValuation.description')}
                </p>
              </div>
              <AIValuationSection className='w-full' />
            </div>
          </div>
        )
      case 2:
        return (
          <div className='w-full mx-auto md:max-w-7xl'>
            <div className='bg-card rounded-lg shadow-sm border p-6 sm:p-8'>
              <div className='mb-6 sm:mb-8'>
                <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3'>
                  {t('sections.media.title')}
                </h2>
                <p className='text-sm sm:text-base text-muted-foreground'>
                  {t('sections.media.description')}
                </p>
              </div>
              <MediaSection className='w-full' showHeader={false} />
            </div>
          </div>
        )
      case 3:
        return (
          <div className='w-full mx-auto md:max-w-7xl'>
            <div className='bg-card rounded-lg shadow-sm border p-6 sm:p-8'>
              <PackageConfigSection className='w-full' />
            </div>
          </div>
        )
      default:
        return (
          <div className='w-full mx-auto md:max-w-6xl'>
            <div className='bg-card rounded-lg shadow-sm border p-6 sm:p-8'>
              <div className='text-center py-12'>
                <h2 className='text-2xl font-bold mb-4'>
                  {progressSteps[currentStep].title}
                </h2>
                <p className='text-muted-foreground'>
                  {progressSteps[currentStep].description}
                </p>
                <p className='text-sm text-muted-foreground mt-4'>
                  Coming soon...
                </p>
              </div>
            </div>
          </div>
        )
    }
  }

  const currentErrors = getStepErrors(currentStep)
  const canProceed = currentErrors.length === 0

  return (
    <div className={`min-h-screen bg-background ${className || ''}`}>
      <div className='w-full mx-auto  md:container md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8'>
        <HeaderModule />
        <div className='mb-6 sm:mb-8'>
          <ProgressSteps
            currentStep={currentStep}
            steps={progressSteps}
            className='bg-card p-4 sm:p-6 rounded-lg shadow-sm border'
            onStepClick={handleStepClick}
          />
        </div>
        {renderCurrentSection()}
        <div className='w-full mx-auto md:max-w-6xl mt-8 sm:mt-12'>
          <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-center flex-wrap'>
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
            {currentStep < progressSteps.length - 1 && (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className='w-full sm:w-auto order-1 sm:order-2 h-12 px-6 sm:px-8 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed'
              >
                {t('next')}
                <ArrowRight className='w-4 h-4 ml-2' />
              </Button>
            )}
          </div>
          {!canProceed && (
            <div className='mt-3 w-full flex flex-col gap-1 text-xs text-destructive text-center sm:text-right'>
              <p>
                {t('completeCurrentStep') ||
                  'Vui lòng hoàn thành bước này trước khi tiếp tục'}
              </p>
              {/* Simple mapping of error codes to readable (temporary, could i18n later) */}
              <div className='flex flex-wrap gap-x-3 gap-y-1 justify-center sm:justify-end'>
                {currentErrors.includes('address') && <span>• Địa chỉ</span>}
                {currentErrors.includes('area') && <span>• Diện tích</span>}
                {currentErrors.includes('price') && <span>• Giá</span>}
                {currentErrors.includes('imagesMin') && (
                  <span>• Tối thiểu 3 ảnh</span>
                )}
                {currentErrors.includes('package') && (
                  <span>• Chọn gói hoặc voucher</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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
