import React from 'react'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'
import { ArrowLeft, ArrowRight, CreditCard, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'

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
  canProceed,
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
            className='w-full sm:w-auto order-2 sm:order-1 h-12 px-6 sm:px-8'
            disabled={isUpdatingDraft}
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            {t('back')}
          </Button>
        )}

        {showUpdateDraftButton && (
          <Button
            variant='secondary'
            onClick={handleUpdateDraft}
            disabled={isUpdatingDraft}
            className='w-full sm:w-auto order-3 sm:order-2 h-12 px-6 sm:px-8'
          >
            <Save className='w-4 h-4 mr-2' />
            {isUpdatingDraft ? t('updatingDraft') : t('updateDraft')}
          </Button>
        )}

        {!isLastStep ? (
          <Button
            onClick={onNext}
            disabled={!canProceed || isUpdatingDraft}
            className='w-full sm:w-auto order-1 sm:order-2 sm:ml-auto h-12 px-6 sm:px-8 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {t('next')}
            <ArrowRight className='w-4 h-4 ml-2' />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed || isUpdatingDraft}
            className='w-full sm:w-auto order-1 sm:order-2 sm:ml-auto h-12 px-6 sm:px-8 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed'
          >
            <CreditCard className='w-4 h-4 mr-2' />
            {getSubmitButtonText()}
          </Button>
        )}
      </Card>
    </Card>
  )
}
