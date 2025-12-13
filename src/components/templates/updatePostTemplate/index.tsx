import React from 'react'
import { useUpdatePostSteps } from './hooks/useUpdatePostSteps'
import { useUpdatePostValidation } from './hooks/useUpdatePostValidation'
import { useUpdatePostStepsConfig } from './utils/updatePostSteps.config'
import { NavigationButtons } from './components/NavigationButtons'
import { ListingService } from '@/api/services/listing.service'
import type { CreateListingRequest } from '@/api/types/property.type'
import { useUpdatePost } from '@/contexts/updatePost'
import { useRouter } from 'next/router'
import { StepRenderer } from './components/StepRenderer'
import { useTranslations } from 'next-intl'
import NotificationDialog from '@/components/molecules/notifications/NotificationDialog'
import { getFormDefaultValues } from '@/components/templates/shared/form.utils'
import { PostTemplateBase } from '@/components/templates/shared/PostTemplateBase'

interface UpdatePostTemplateProps {
  className?: string
}

const UpdatePostTemplateContent: React.FC<{ className?: string }> = ({
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
    setAttemptedSubmit,
  } = useUpdatePostSteps()

  const progressSteps = useUpdatePostStepsConfig(currentStep, isStepComplete)

  const { currentErrors, canProceed } = useUpdatePostValidation(
    currentStep,
    attemptedSubmit,
    form.formState.errors,
  )

  const { propertyInfo, resetPropertyInfo, setIsSubmitSuccess, listingId } =
    useUpdatePost()
  const router = useRouter()
  const t = useTranslations('updatePost.submit')
  const tCreate = useTranslations('createPost.submit')

  React.useEffect(() => {
    if (listingId && propertyInfo && Object.keys(propertyInfo).length > 1) {
      // Reset form with propertyInfo to sync form state with context
      form.reset(getFormDefaultValues(propertyInfo))
    }
  }, [listingId, propertyInfo, form])

  const [successOpen, setSuccessOpen] = React.useState(false)
  const [successTitle, setSuccessTitle] = React.useState<string>('')
  const [successDesc, setSuccessDesc] = React.useState<string>('')
  const [errorOpen, setErrorOpen] = React.useState(false)
  const [errorTitle, setErrorTitle] = React.useState<string>('')
  const [errorDesc, setErrorDesc] = React.useState<string>('')

  const handleSubmit = async () => {
    // Trigger validation for all steps before submitting
    setAttemptedSubmit(true)

    // Validate the current step (last step)
    const isValid = await form.trigger()

    // Check if all steps are complete
    const allStepsComplete = progressSteps.every((_, index) =>
      isStepComplete(index),
    )

    if (!isValid || !allStepsComplete) {
      // Scroll to top to show validation errors
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      return
    }

    if (!listingId) {
      setErrorTitle(t('errorTitle'))
      setErrorDesc(t('noListingId'))
      setErrorOpen(true)
      return
    }

    try {
      const { success, message } = await ListingService.update(
        listingId,
        propertyInfo as CreateListingRequest,
      )

      if (!success) {
        setErrorTitle(t('errorTitle'))
        setErrorDesc(message || t('updateFailed'))
        setErrorOpen(true)
        return
      }

      setIsSubmitSuccess(true)
      setSuccessTitle(t('successTitle'))
      setSuccessDesc(t('successDescription'))
      setSuccessOpen(true)
    } catch (err) {
      console.error('Submit error:', err)
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
        okText={tCreate('ok')}
        onOpenChange={setSuccessOpen}
        onOk={async () => {
          setIsSubmitSuccess(true)
          resetPropertyInfo()
          await router.push('/seller/listings')
        }}
      />
      {/* Error Dialog */}
      <NotificationDialog
        open={errorOpen}
        title={errorTitle}
        description={errorDesc}
        okText={tCreate('ok')}
        onOpenChange={setErrorOpen}
      />
    </PostTemplateBase>
  )
}

const UpdatePostTemplate: React.FC<UpdatePostTemplateProps> = ({
  className,
}) => {
  return <UpdatePostTemplateContent className={className} />
}

export { UpdatePostTemplate }
export type { UpdatePostTemplateProps }
