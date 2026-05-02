import React from 'react'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'
import { ArrowLeft, ArrowRight, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

// Same primary-CTA shape as the create-post NavigationButtons.
const PRIMARY_CTA_CLASSES = cn(
  'group w-full sm:w-auto order-1 sm:order-2 sm:ml-auto h-12 px-6 sm:px-8 gap-2 text-base font-semibold',
  'bg-gradient-to-r from-primary to-blue-600 hover:to-blue-700',
  'shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35',
  'transition-all duration-200',
  'disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none',
)

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
            className='w-full sm:w-auto order-2 sm:order-1 h-12 px-6 sm:px-8 gap-2'
          >
            <ArrowLeft className='size-4' aria-hidden='true' />
            {t('back')}
          </Button>
        )}

        {!isLastStep ? (
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className={PRIMARY_CTA_CLASSES}
          >
            {t('next')}
            <ArrowRight
              className='size-4 transition-transform duration-200 group-hover:translate-x-0.5'
              aria-hidden='true'
            />
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={!canProceed}
            className={PRIMARY_CTA_CLASSES}
          >
            <Save className='size-4' aria-hidden='true' />
            {tUpdate('updateListing')}
          </Button>
        )}
      </Card>
    </Card>
  )
}
