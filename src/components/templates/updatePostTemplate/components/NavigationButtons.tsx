import React from 'react'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'
import { ArrowLeft, ArrowRight, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface NavigationButtonsProps {
  currentStep: number
  totalSteps: number
  canProceed: boolean
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  canProceed,
  onBack,
  onNext,
  onSubmit,
}) => {
  const t = useTranslations('createPost')
  const tUpdate = useTranslations('updatePost')

  const isLastStep = currentStep === totalSteps - 1
  const showBackButton = currentStep > 0

  return (
    <Card className='w-full mx-auto md:max-w-6xl mt-8 sm:mt-12 border-0 shadow-none p-0'>
      <Card className='flex flex-col sm:flex-row gap-4 sm:gap-6 items-center flex-wrap border-0 shadow-none p-0'>
        {showBackButton && (
          <Button
            variant='outline'
            onClick={onBack}
            className='w-full sm:w-auto order-2 sm:order-1 h-12 px-6 sm:px-8'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            {t('back')}
          </Button>
        )}

        {!isLastStep ? (
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className='w-full sm:w-auto order-1 sm:order-2 sm:ml-auto h-12 px-6 sm:px-8 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {t('next')}
            <ArrowRight className='w-4 h-4 ml-2' />
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={!canProceed}
            className='w-full sm:w-auto order-1 sm:order-2 sm:ml-auto h-12 px-6 sm:px-8 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed'
          >
            <Save className='w-4 h-4 mr-2' />
            {tUpdate('updateListing')}
          </Button>
        )}
      </Card>
    </Card>
  )
}
