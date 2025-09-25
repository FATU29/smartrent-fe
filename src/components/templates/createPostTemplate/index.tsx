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
import { CreatePostProvider } from '@/contexts/createPost'

interface CreatePostTemplateProps {
  className?: string
}

const CreatePostTemplate: React.FC<CreatePostTemplateProps> = ({
  className,
}) => {
  const t = useTranslations('createPost')
  const tSteps = useTranslations('createPost.steps')
  const [currentStep, setCurrentStep] = useState(0)

  // Define progress steps
  const progressSteps: ProgressStep[] = [
    {
      id: 'property-info',
      title: tSteps('propertyInfo.title'),
      description: tSteps('propertyInfo.description'),
      icon: <Home className='w-4 h-4 sm:w-5 sm:h-5' />,
      isActive: currentStep === 0,
      isCompleted: currentStep > 0,
    },
    {
      id: 'ai-valuation',
      title: tSteps('aiValuation.title'),
      description: tSteps('aiValuation.description'),
      icon: <Brain className='w-4 h-4 sm:w-5 sm:h-5' />,
      isActive: currentStep === 1,
      isCompleted: currentStep > 1,
    },
    {
      id: 'images-video',
      title: tSteps('imagesAndVideo.title'),
      description: tSteps('imagesAndVideo.description'),
      icon: <Camera className='w-4 h-4 sm:w-5 sm:h-5' />,
      isActive: currentStep === 2,
      isCompleted: currentStep > 2,
    },
    {
      id: 'package-config',
      title: tSteps('packageAndConfig.title'),
      description: tSteps('packageAndConfig.description'),
      icon: <FileText className='w-4 h-4 sm:w-5 sm:h-5' />,
      isActive: currentStep === 3,
      isCompleted: currentStep > 3,
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
    setCurrentStep(stepIndex)
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
              <MediaSection className='w-full' />
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

  return (
    <CreatePostProvider>
      <div className={`min-h-screen bg-background ${className || ''}`}>
        {/* Container - full width on mobile, constrained from md+ */}
        <div className='w-full mx-auto  md:container md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8'>
          {/* Header Module */}
          <HeaderModule />

          {/* Progress Steps */}
          <div className='mb-6 sm:mb-8'>
            <ProgressSteps
              currentStep={currentStep}
              steps={progressSteps}
              className='bg-card p-4 sm:p-6 rounded-lg shadow-sm border'
              onStepClick={handleStepClick}
            />
          </div>

          {/* Form Content - Render current section */}
          {renderCurrentSection()}

          {/* Navigation Buttons */}
          <div className='w-full mx-auto md:max-w-6xl mt-8 sm:mt-12'>
            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-center flex-wrap'>
              {/* Back Button */}
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

              {/* Next Button */}
              {currentStep < progressSteps.length - 1 && (
                <Button
                  onClick={handleNext}
                  className='w-full sm:w-auto order-1 sm:order-2 h-12 px-6 sm:px-8 bg-primary hover:bg-primary/90'
                >
                  {t('next')}
                  <ArrowRight className='w-4 h-4 ml-2' />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </CreatePostProvider>
  )
}

export { CreatePostTemplate }
export type { CreatePostTemplateProps }
