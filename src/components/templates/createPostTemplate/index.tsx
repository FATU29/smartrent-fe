import { SELLER_ROUTES } from '@/constants'
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
import {
  PAYMENT_PROVIDER,
  LISTING_ERROR_CODES,
} from '@/api/types/property.type'
import { useDialog } from '@/hooks/useDialog'
import { toast } from 'sonner'
import { isSePayResult, startGatewayCheckout } from '@/utils/payment'
import { useUpdateDraft } from '@/hooks/useListings/useUpdateDraft'
import { useDeleteDraft } from '@/hooks/useListings/useDeleteDraft'
import { useCreateDraft } from '@/hooks/useListings/useCreateDraft'
import { useAuth } from '@/hooks/useAuth'

interface CreatePostTemplateProps {
  className?: string
}

const CREATE_POST_BYPASS_DRAFT_GUARD_EVENT = 'create-post:bypass-draft-guard'

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
  const tDraft = useTranslations('createPost')
  const { user } = useAuth()
  // Admin-blocked users can fill the form and save drafts, but cannot publish/pay.
  const postingBlocked = Boolean(user?.postingBlocked)

  const { mutate: updateDraft, isPending: isUpdatingDraft } = useUpdateDraft()
  const { mutateAsync: deleteDraft } = useDeleteDraft()
  const { mutateAsync: createDraftAsync } = useCreateDraft()

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
  // Shown when the user has been blocked from posting by an admin
  const [blockedOpen, setBlockedOpen] = React.useState(false)
  const [blockedDesc, setBlockedDesc] = React.useState<string>('')

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
          case MembershipPaymentProvider.SEPAY:
            paymentProvider = PAYMENT_PROVIDER.SEPAY
            break
          case MembershipPaymentProvider.ZALOPAY:
            paymentProvider = PAYMENT_PROVIDER.ZALOPAY
            break
        }
      }

      const requestData = {
        ...propertyInfo,
        // Set payment provider if selected from dialog
        ...(paymentProvider && { paymentProvider }),
      }

      const { success, data, message, code } =
        await ListingService.create(requestData)

      if (!success || !data) {
        // User blocked from posting by an admin → show dedicated notice
        if (code === LISTING_ERROR_CODES.USER_POSTING_BLOCKED) {
          setBlockedDesc(message || t('blockedDescription'))
          setBlockedOpen(true)
          return
        }
        setErrorTitle(t('errorTitle'))
        setErrorDesc(message || t('createFailed'))
        setErrorOpen(true)
        return
      }

      // Check if payment is required
      if (data.paymentRequired && (data.paymentUrl || isSePayResult(data))) {
        // Clear any previous payment session storage
        sessionStorage.removeItem('pendingMembership')
        sessionStorage.removeItem('pendingMembershipUpgrade')

        // Redirecting to the payment gateway (SePay hosted checkout or e.g.
        // ZaloPay) is a full-page navigation that destroys the in-memory form
        // state (CreatePostProvider). If the user abandons or fails the
        // payment, the form would otherwise be lost. Persist the listing
        // content as a DB draft first so it can be recovered via
        // /seller/create-post?draftId=... on return. When already editing an
        // existing draft, reuse it instead of creating a duplicate.
        let recoverableDraftId: string | number | null = draftId || null
        if (!recoverableDraftId) {
          try {
            const draftResponse = await createDraftAsync({
              ...propertyInfo,
              isDraft: true,
            })
            if (draftResponse.success && draftResponse.data) {
              recoverableDraftId = draftResponse.data.listingId
            }
          } catch (draftError) {
            // Non-fatal: payment can still proceed, only recovery is unavailable.
            console.error(
              'Failed to auto-save draft before payment redirect:',
              draftError,
            )
          }
        }

        // Store listing info in session storage for tracking after payment
        // callback (the draft is deleted on success by /payment/result).
        const listingPaymentInfo = {
          title: propertyInfo?.title,
          vipType: propertyInfo?.vipType,
          durationDays: propertyInfo?.durationDays,
          transactionId: data.transactionId,
          transactionType: 'POST_FEE',
          draftId: recoverableDraftId, // Used to recover on failure / delete on success
        }
        sessionStorage.setItem(
          'pendingListingCreation',
          JSON.stringify(listingPaymentInfo),
        )

        // Send the user to the gateway: SePay POST-submits the signed fields,
        // others GET-redirect to the paymentUrl. Persists the pending txn ref.
        setIsSubmitSuccess(true)
        window.dispatchEvent(
          new CustomEvent(CREATE_POST_BYPASS_DRAFT_GUARD_EVENT),
        )
        startGatewayCheckout(data)
        return
      }

      // Listing created successfully without payment (used quota or free NORMAL listing)
      // If recreating from draft, delete the draft
      if (draftId) {
        try {
          await deleteDraft(draftId)
        } catch (error) {
          console.error('Failed to delete draft after listing creation:', error)
        }
      }

      setIsSubmitSuccess(true)
      setSuccessTitle(t('successTitle'))
      setSuccessDesc(t('successDescription'))
      setSuccessOpen(true)
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

  const handleUpdateDraft = React.useCallback(() => {
    if (!draftId) {
      toast.error(tDraft('draftUpdateFailed'))
      return
    }

    const draftPayload = {
      ...propertyInfo,
      isDraft: true,
    }

    updateDraft(
      { draftId, data: draftPayload },
      {
        onSuccess: (response) => {
          if (response.success) {
            toast.success(tDraft('draftUpdated'))
          } else {
            toast.error(response.message || tDraft('draftUpdateFailed'))
          }
        },
        onError: () => {
          toast.error(tDraft('draftUpdateFailed'))
        },
      },
    )
  }, [draftId, propertyInfo, updateDraft, tDraft])

  // Save-as-draft entry point for blocked users (and general use). Updates the
  // existing draft when editing one, otherwise creates a new draft, then routes
  // to the drafts list so the user keeps their work without publishing.
  const handleSaveDraft = React.useCallback(async () => {
    if (draftId) {
      handleUpdateDraft()
      return
    }
    try {
      const response = await createDraftAsync({
        ...propertyInfo,
        isDraft: true,
      })
      if (response.success && response.data) {
        toast.success(tDraft('draftSaved'))
        setIsSubmitSuccess(true)
        resetPropertyInfo()
        await router.push(SELLER_ROUTES.DRAFTS)
      } else {
        toast.error(response.message || tDraft('draftUpdateFailed'))
      }
    } catch (error) {
      console.error('Failed to save draft:', error)
      toast.error(tDraft('draftUpdateFailed'))
    }
  }, [
    draftId,
    handleUpdateDraft,
    createDraftAsync,
    propertyInfo,
    tDraft,
    setIsSubmitSuccess,
    resetPropertyInfo,
    router,
  ])

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
          onUpdateDraft={handleUpdateDraft}
          isUpdatingDraft={isUpdatingDraft}
          postingBlocked={postingBlocked}
          onSaveDraft={handleSaveDraft}
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
          await router.push(SELLER_ROUTES.LISTINGS)
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

      {/* Posting Blocked Dialog */}
      <NotificationDialog
        open={blockedOpen}
        title={t('blockedTitle')}
        description={blockedDesc}
        okText={t('ok')}
        onOpenChange={setBlockedOpen}
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
