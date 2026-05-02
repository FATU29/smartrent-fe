import React from 'react'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'
import { ArrowLeft, ArrowRight, CreditCard, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { cn } from '@/lib/utils'

// Shared classes for the primary "next" / "submit" CTA — gradient + tinted
// shadow + arrow-slide on hover. Same convention as the membership upgrade
// CTA so primary actions feel consistent across the app.
const PRIMARY_CTA_CLASSES = cn(
  'group w-full sm:w-auto order-1 sm:order-2 sm:ml-auto h-12 px-6 sm:px-8 gap-2 text-base font-semibold',
  'bg-gradient-to-r from-primary to-blue-600 hover:to-blue-700',
  'shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35',
  'transition-all duration-200',
)

interface NavigationButtonsProps {
  currentStep: number
  totalSteps: number
  canProceed: boolean
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
  onUpdateDraft?: () => void
  isUpdatingDraft?: boolean
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  onUpdateDraft,
  isUpdatingDraft = false,
}) => {
  const t = useTranslations('createPost')
  const { propertyInfo, draftId } = useCreatePost()

  const isLastStep = currentStep === totalSteps - 1
  const showBackButton = currentStep > 0
  const showUpdateDraftButton = !!draftId && !!onUpdateDraft

  const getSubmitButtonText = () => {
    const hasBenefit = Array.isArray(propertyInfo?.benefitIds)
      ? propertyInfo.benefitIds.length > 0
      : false
    const usingQuota = !!propertyInfo?.useMembershipQuota

    return usingQuota || hasBenefit ? t('createListing') : t('payment')
  }

  const handleSubmit = () => {
    onSubmit()
  }

  const handleUpdateDraft = () => {
    if (onUpdateDraft) {
      onUpdateDraft()
    }
  }

  return (
    <Card className='w-full mx-auto md:max-w-6xl mt-8 sm:mt-12 border-0 shadow-none p-0'>
      <Card className='flex flex-col sm:flex-row gap-4 sm:gap-6 items-center flex-wrap border-0 shadow-none p-0'>
        {showBackButton && (
          <Button
            variant='outline'
            onClick={onBack}
            className='w-full sm:w-auto order-2 sm:order-1 h-12 px-6 sm:px-8 gap-2'
            disabled={isUpdatingDraft}
          >
            <ArrowLeft className='size-4' aria-hidden='true' />
            {t('back')}
          </Button>
        )}

        {showUpdateDraftButton && (
          <Button
            variant='secondary'
            onClick={handleUpdateDraft}
            disabled={isUpdatingDraft}
            className='w-full sm:w-auto order-3 sm:order-2 h-12 px-6 sm:px-8 gap-2'
          >
            <Save className='size-4' aria-hidden='true' />
            {isUpdatingDraft ? t('updatingDraft') : t('updateDraft')}
          </Button>
        )}

        {!isLastStep ? (
          <Button
            onClick={onNext}
            disabled={isUpdatingDraft}
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
            onClick={handleSubmit}
            disabled={isUpdatingDraft}
            className={PRIMARY_CTA_CLASSES}
          >
            <CreditCard className='size-4' aria-hidden='true' />
            {getSubmitButtonText()}
          </Button>
        )}
      </Card>
    </Card>
  )
}
