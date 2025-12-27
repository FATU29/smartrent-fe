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
import PaymentMethodDialog from '@/components/molecules/paymentMethodDialog'
import { PaymentProvider as MembershipPaymentProvider } from '@/api/types/membership.type'
import { PAYMENT_PROVIDER } from '@/api/types/property.type'
import { useDialog } from '@/hooks/useDialog'
import { toast } from 'sonner'

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

  // Payment method dialog
  const {
    open: paymentDialogOpen,
    handleOpen: openPaymentDialog,
    handleClose: closePaymentDialog,
  } = useDialog()

  // Check if payment provider selection is needed
  const needsPaymentSelection = React.useMemo(() => {
    const hasBenefit = Array.isArray(propertyInfo?.benefitIds)
      ? propertyInfo.benefitIds.length > 0
      : false
    const usingQuota = !!propertyInfo?.useMembershipQuota

    // Need payment selection if NOT using quota/benefits
    return !usingQuota && !hasBenefit
  }, [propertyInfo])

  const handleSubmit = async () => {
    // If payment is needed, open payment method dialog first
    if (needsPaymentSelection) {
      openPaymentDialog()
      return
    }

    // Otherwise, create listing directly (using quota or free listing)
    await createListing()
  }

  const createListing = async (
    selectedProvider?: MembershipPaymentProvider,
  ) => {
    try {
      // Use unified /v1/listings endpoint for all listing types (NORMAL, SILVER, GOLD, DIAMOND)
      // Backend will determine if payment is required based on:
      // - vipType (NORMAL = no payment, SILVER/GOLD/DIAMOND = check quota/payment)
      // - useMembershipQuota flag
      // - benefitIds (if provided, use membership benefits)

      // Convert MembershipPaymentProvider enum to property PaymentProvider type
      let paymentProvider: PAYMENT_PROVIDER | undefined
      if (selectedProvider) {
        switch (selectedProvider) {
          case MembershipPaymentProvider.VNPAY:
            paymentProvider = PAYMENT_PROVIDER.VNPAY
            break
          case MembershipPaymentProvider.MOMO:
            paymentProvider = PAYMENT_PROVIDER.MOMO
            break
          case MembershipPaymentProvider.PAYPAL:
            paymentProvider = PAYMENT_PROVIDER.PAYPAL
            break
        }
      }

      const requestData = {
        ...propertyInfo,
        // Set payment provider if selected from dialog
        ...(paymentProvider && { paymentProvider }),
      }

      const { success, data, message } =
        await ListingService.create(requestData)

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

        // Redirect to payment page
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

  const handleSelectPaymentMethod = React.useCallback(
    async (provider: MembershipPaymentProvider) => {
      closePaymentDialog()

      // Show loading toast
      toast.loading(t('processing'), {
        id: 'create-listing-payment',
      })

      // Create listing with selected payment provider
      await createListing(provider)

      // Dismiss loading toast
      toast.dismiss('create-listing-payment')
    },
    [createListing, closePaymentDialog, t],
  )

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

      {/* Payment Method Dialog */}
      <PaymentMethodDialog
        open={paymentDialogOpen}
        onOpenChange={closePaymentDialog}
        onSelectMethod={handleSelectPaymentMethod}
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
