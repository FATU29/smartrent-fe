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
import { OrderSummarySection } from '@/components/organisms/createPostSections/orderSummarySection'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
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
          !propertyInfo.selectedVoucherPackageId &&
          !propertyInfo.selectedPackageType
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
          <Card className='w-full mx-auto md:max-w-6xl border-0 shadow-none p-0'>
            <Card className='bg-card rounded-lg shadow-sm border p-6 sm:p-8'>
              <Card className='mb-6 sm:mb-8 border-0 shadow-none p-0'>
                <Typography
                  variant='h2'
                  className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3'
                >
                  {t('sections.propertyInfo.title')}
                </Typography>
                <Typography variant='muted' className='text-sm sm:text-base'>
                  {t('sections.propertyInfo.description')}
                </Typography>
              </Card>
              <PropertyInfoSection className='w-full' />
            </Card>
          </Card>
        )
      case 1:
        return (
          <Card className='w-full mx-auto md:max-w-7xl border-0 shadow-none p-0'>
            <Card className='bg-card rounded-lg shadow-sm border p-6 sm:p-8'>
              <Card className='mb-6 sm:mb-8 border-0 shadow-none p-0'>
                <Typography
                  variant='h2'
                  className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3'
                >
                  {t('sections.aiValuation.title')}
                </Typography>
                <Typography variant='muted' className='text-sm sm:text-base'>
                  {t('sections.aiValuation.description')}
                </Typography>
              </Card>
              <AIValuationSection className='w-full' />
            </Card>
          </Card>
        )
      case 2:
        return (
          <Card className='w-full mx-auto md:max-w-7xl border-0 shadow-none p-0'>
            <Card className='bg-card rounded-lg shadow-sm border p-6 sm:p-8'>
              <Card className='mb-6 sm:mb-8 border-0 shadow-none p-0'>
                <Typography
                  variant='h2'
                  className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3'
                >
                  {t('sections.media.title')}
                </Typography>
                <Typography variant='muted' className='text-sm sm:text-base'>
                  {t('sections.media.description')}
                </Typography>
              </Card>
              <MediaSection className='w-full' showHeader={false} />
            </Card>
          </Card>
        )
      case 3:
        return (
          <Card className='w-full mx-auto md:max-w-7xl border-0 shadow-none p-0'>
            <Card className='bg-card rounded-lg shadow-sm border p-6 sm:p-8'>
              <PackageConfigSection className='w-full' />
            </Card>
          </Card>
        )
      case 4:
        return (
          <Card className='w-full mx-auto md:max-w-7xl border-0 shadow-none p-0'>
            <Card className='bg-card rounded-lg shadow-sm border p-6 sm:p-8'>
              <OrderSummarySection className='w-full' />
            </Card>
          </Card>
        )
      default:
        return (
          <Card className='w-full mx-auto md:max-w-6xl border-0 shadow-none p-0'>
            <Card className='bg-card rounded-lg shadow-sm border p-6 sm:p-8'>
              <Card className='text-center py-12 border-0 shadow-none p-0'>
                <Typography variant='h2' className='text-2xl font-bold mb-4'>
                  {progressSteps[currentStep].title}
                </Typography>
                <Typography variant='muted'>
                  {progressSteps[currentStep].description}
                </Typography>
                <Typography variant='muted' className='text-sm mt-4'>
                  Coming soon...
                </Typography>
              </Card>
            </Card>
          </Card>
        )
    }
  }

  const currentErrors = getStepErrors(currentStep)
  const canProceed = currentErrors.length === 0

  return (
    <Card
      className={`min-h-screen bg-background border-0 shadow-none p-0 ${className || ''}`}
    >
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
                  // TODO: Handle payment
                  console.log('Processing payment...')
                }}
                disabled={!canProceed}
                className='w-full sm:w-auto order-1 sm:order-2 h-12 px-6 sm:px-8 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed'
              >
                <CreditCard className='w-4 h-4 mr-2' />
                {t('payment')}
              </Button>
            )}
          </Card>
          {!canProceed && (
            <Card className='mt-3 w-full flex flex-col gap-1 text-xs text-destructive text-center sm:text-right border-0 shadow-none p-0'>
              <Typography variant='muted' className='text-destructive'>
                {t('completeCurrentStep') ||
                  'Vui lòng hoàn thành bước này trước khi tiếp tục'}
              </Typography>
              {/* Simple mapping of error codes to readable (temporary, could i18n later) */}
              <Card className='flex flex-wrap gap-x-3 gap-y-1 justify-center sm:justify-end border-0 shadow-none p-0'>
                {currentErrors.includes('address') && (
                  <Typography variant='muted' className='text-destructive'>
                    • Địa chỉ
                  </Typography>
                )}
                {currentErrors.includes('area') && (
                  <Typography variant='muted' className='text-destructive'>
                    • Diện tích
                  </Typography>
                )}
                {currentErrors.includes('price') && (
                  <Typography variant='muted' className='text-destructive'>
                    • Giá
                  </Typography>
                )}
                {currentErrors.includes('imagesMin') && (
                  <Typography variant='muted' className='text-destructive'>
                    • Tối thiểu 3 ảnh
                  </Typography>
                )}
                {currentErrors.includes('package') && (
                  <Typography variant='muted' className='text-destructive'>
                    • Chọn gói hoặc voucher
                  </Typography>
                )}
              </Card>
            </Card>
          )}
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
