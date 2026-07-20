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
  'group w-auto h-12 px-4 sm:px-8 gap-2 text-base font-semibold',
  'bg-gradient-to-r from-primary to-blue-600 hover:to-blue-700',
  'shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35',
  'transition-all duration-200',
)

const SECONDARY_BUTTON_CLASSES = 'w-auto h-12 px-4 sm:px-8 gap-2'

interface NavigationButtonsProps {
  currentStep: number
  totalSteps: number
  canProceed: boolean
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
  onUpdateDraft?: () => void
  isUpdatingDraft?: boolean
  // The publish request is in flight. Distinct from isUpdatingDraft, which only
  // tracks the draft mutation and left the submit CTA clickable twice.
  isSubmitting?: boolean
  // When the user is blocked from posting, the publish/payment CTA is replaced
  // by a "save draft" action so they can still keep their work.
  postingBlocked?: boolean
  onSaveDraft?: () => void
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  onUpdateDraft,
  isUpdatingDraft = false,
  isSubmitting = false,
  postingBlocked = false,
  onSaveDraft,
}) => {
  const t = useTranslations('createPost')
  const { propertyInfo, draftId } = useCreatePost()

  const isLastStep = currentStep === totalSteps - 1
  const showBackButton = currentStep > 0
  // When blocked, the primary CTA already saves the draft — avoid a duplicate.
  const showUpdateDraftButton = !!draftId && !!onUpdateDraft && !postingBlocked

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

  const renderLastStepCta = () => {
    // Blocked users cannot publish/pay — offer "save draft" instead so they
    // keep their work. The payment + đăng tin buttons are hidden entirely.
    if (postingBlocked) {
      return (
        <Button
          onClick={() => onSaveDraft?.()}
          disabled={isUpdatingDraft}
          className={PRIMARY_CTA_CLASSES}
        >
          <Save className='size-4' aria-hidden='true' />
          {t('saveDraft')}
        </Button>
      )
    }
    return (
      <Button
        onClick={handleSubmit}
        disabled={isUpdatingDraft || isSubmitting}
        className={PRIMARY_CTA_CLASSES}
      >
        <CreditCard className='size-4' aria-hidden='true' />
        {getSubmitButtonText()}
      </Button>
    )
  }

  const primaryCta = !isLastStep ? (
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
    renderLastStepCta()
  )

  return (
    <Card className='w-full mx-auto md:max-w-6xl mt-8 sm:mt-12 border-0 shadow-none p-0'>
      <div className='flex flex-col gap-3 sm:gap-4'>
        {/* Back (left) + Next/Submit (right) — always pinned to the edges */}
        <div className='flex flex-row items-center justify-between gap-3'>
          {showBackButton ? (
            <Button
              variant='outline'
              onClick={onBack}
              className={SECONDARY_BUTTON_CLASSES}
              disabled={isUpdatingDraft}
            >
              <ArrowLeft className='size-4' aria-hidden='true' />
              {t('back')}
            </Button>
          ) : (
            <span aria-hidden='true' />
          )}
          {primaryCta}
        </div>

        {/* Secondary actions (e.g. Update Draft) live on their own row below */}
        {showUpdateDraftButton && (
          <div className='flex flex-row flex-wrap items-center gap-3 sm:gap-6'>
            <Button
              variant='secondary'
              onClick={handleUpdateDraft}
              disabled={isUpdatingDraft}
              className={SECONDARY_BUTTON_CLASSES}
            >
              <Save className='size-4' aria-hidden='true' />
              {isUpdatingDraft ? t('updatingDraft') : t('updateDraft')}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
