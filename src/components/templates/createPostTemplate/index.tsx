import React from 'react'
import { useCreatePostSteps } from './hooks/useCreatePostSteps'
import { useCreatePostValidation } from './hooks/useCreatePostValidation'
import { useCreatePostStepsConfig } from './utils/createPostSteps.config'
import { NavigationButtons } from './components/NavigationButtons'
import { ListingService } from '@/api/services/listing.service'
import { useCreatePost } from '@/contexts/createPost'
import { useRouter } from 'next/router'
import { StepRenderer } from './components/StepRenderer'
import { useTranslations } from 'next-intl'
import NotificationDialog from '@/components/molecules/notifications/NotificationDialog'
import { PostTemplateBase } from '@/components/templates/shared/PostTemplateBase'

interface CreatePostTemplateProps {
  className?: string
}

const CreatePostTemplateContent: React.FC<{ className?: string }> = ({
  className,
}) => {
  const {
    currentStep,
    attemptedSubmit,
    topRef,
    form,
    isStepComplete,
    handleNext,
    handleBack,
    handleStepClick,
  } = useCreatePostSteps()

  const progressSteps = useCreatePostStepsConfig(currentStep, isStepComplete)

  const { currentErrors, canProceed } = useCreatePostValidation(
    currentStep,
    attemptedSubmit,
    form.formState.errors,
  )

  const {
    propertyInfo,
    resetPropertyInfo,
    setIsSubmitSuccess,
    draftId,
    fulltextAddress,
  } = useCreatePost()
  const router = useRouter()
  const t = useTranslations('createPost.submit')

  React.useEffect(() => {
    if (draftId && propertyInfo && Object.keys(propertyInfo).length > 1) {
      form.reset(propertyInfo)
    }
  }, [draftId, propertyInfo, fulltextAddress, form])

  const [successOpen, setSuccessOpen] = React.useState(false)
  const [successTitle, setSuccessTitle] = React.useState<string>('')
  const [successDesc, setSuccessDesc] = React.useState<string>('')
  const [errorOpen, setErrorOpen] = React.useState(false)
  const [errorTitle, setErrorTitle] = React.useState<string>('')
  const [errorDesc, setErrorDesc] = React.useState<string>('')

  const handleSubmit = async () => {
    try {
      // Use unified /v1/listings endpoint for all listing types (NORMAL, SILVER, GOLD, DIAMOND)
      // Backend will determine if payment is required based on:
      // - vipType (NORMAL = no payment, SILVER/GOLD/DIAMOND = check quota/payment)
      // - useMembershipQuota flag
      // - benefitIds (if provided, use membership benefits)

      const { success, data, message } =
        await ListingService.create(propertyInfo)

      if (!success || !data) {
        setErrorTitle(t('errorTitle'))
        setErrorDesc(message || t('createFailed'))
        setErrorOpen(true)
        return
      }

      // Check if payment is required
      if (data.paymentRequired && data.paymentUrl) {
        // Clear any previous payment session storage
        sessionStorage.removeItem('pendingMembership')

        // Store listing info in session storage for tracking after payment callback
        const listingPaymentInfo = {
          title: propertyInfo?.title,
          vipType: propertyInfo?.vipType,
          durationDays: propertyInfo?.durationDays,
          transactionId: data.transactionId,
          transactionType: 'POST_FEE',
        }
        sessionStorage.setItem(
          'pendingListingCreation',
          JSON.stringify(listingPaymentInfo),
        )

        // Redirect to VNPAY payment page
        setIsSubmitSuccess(true)
        window.location.href = data.paymentUrl
        return
      }

      // Listing created successfully without payment (used quota or free NORMAL listing)
      setIsSubmitSuccess(true)
      setSuccessTitle(t('successTitle'))
      setSuccessDesc(t('successDescription'))
      setSuccessOpen(true)

      // Redirect to listing detail if listingId is available
      if (data.listingId) {
        setTimeout(() => {
          router.push(`/listing-detail/${data.listingId}`)
        }, 2000)
      }
    } catch (err) {
      setErrorTitle(t('errorTitle'))
      setErrorDesc(err instanceof Error ? err.message : t('unexpectedError'))
      setErrorOpen(true)
    }
  }

  return (
    <PostTemplateBase
      className={className}
      form={form}
      topRef={topRef}
      currentStep={currentStep}
      progressSteps={progressSteps}
      attemptedSubmit={attemptedSubmit}
      currentErrors={currentErrors}
      canProceed={canProceed}
      onBack={handleBack}
      onNext={handleNext}
      onSubmit={handleSubmit}
      onStepClick={handleStepClick}
      stepRenderer={
        <StepRenderer
          currentStep={currentStep}
          progressSteps={progressSteps}
          attemptedSubmit={attemptedSubmit}
        />
      }
      navigationButtons={
        <NavigationButtons
          currentStep={currentStep}
          totalSteps={progressSteps?.length}
          canProceed={canProceed}
          onBack={handleBack}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      }
    >
      {/* Success Dialog */}
      <NotificationDialog
        open={successOpen}
        title={successTitle}
        description={successDesc}
        okText={t('ok')}
        onOpenChange={setSuccessOpen}
        onOk={async () => {
          setIsSubmitSuccess(true) // Set context flag before navigation
          resetPropertyInfo() // Clear context before navigation
          await router.push('/seller/listings')
        }}
      />
      {/* Error Dialog */}
      <NotificationDialog
        open={errorOpen}
        title={errorTitle}
        description={errorDesc}
        okText={t('ok')}
        onOpenChange={setErrorOpen}
      />
    </PostTemplateBase>
  )
}

const CreatePostTemplate: React.FC<CreatePostTemplateProps> = ({
  className,
}) => {
  return <CreatePostTemplateContent className={className} />
}

export { CreatePostTemplate }
export type { CreatePostTemplateProps }
