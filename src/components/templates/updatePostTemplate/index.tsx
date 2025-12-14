import React, { useEffect, useState, useCallback } from 'react'
import { useUpdatePostSteps } from './hooks/useUpdatePostSteps'
import { useUpdatePostValidation } from './hooks/useUpdatePostValidation'
import { useUpdatePostStepsConfig } from './utils/updatePostSteps.config'
import { NavigationButtons } from './components/NavigationButtons'
import { ListingService } from '@/api/services/listing.service'
import type { CreateListingRequest } from '@/api/types/property.type'
import { useCreatePost } from '@/contexts/createPost'
import { useRouter } from 'next/router'
import { StepRenderer } from './components/StepRenderer'
import { useTranslations } from 'next-intl'
import NotificationDialog from '@/components/molecules/notifications/NotificationDialog'
import { getFormDefaultValues } from '@/components/templates/shared/form.utils'
import { PostTemplateBase } from '@/components/templates/shared/PostTemplateBase'

interface UpdatePostTemplateProps {
  className?: string
}

interface DialogState {
  isOpen: boolean
  title: string
  description: string
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

  const { propertyInfo, resetPropertyInfo, setIsSubmitSuccess } =
    useCreatePost()
  const router = useRouter()
  const listingId = router.query.id as string | undefined
  const t = useTranslations('updatePost.submit')
  const tCreate = useTranslations('createPost.submit')

  useEffect(() => {
    if (propertyInfo && Object.keys(propertyInfo).length > 1) {
      const defaultValues = getFormDefaultValues(propertyInfo)
      form.reset(defaultValues)
    }
  }, [propertyInfo, form])

  const [successDialog, setSuccessDialog] = useState<DialogState>({
    isOpen: false,
    title: '',
    description: '',
  })

  const [errorDialog, setErrorDialog] = useState<DialogState>({
    isOpen: false,
    title: '',
    description: '',
  })

  const handleSubmit = useCallback(async () => {
    setAttemptedSubmit(true)

    const allStepsComplete = progressSteps.every((_, index) =>
      isStepComplete(index),
    )

    if (!canProceed || !allStepsComplete) {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    if (!listingId) {
      setErrorDialog({
        isOpen: true,
        title: t('errorTitle'),
        description: t('noListingId'),
      })
      return
    }

    try {
      const { success, message } = await ListingService.update(
        listingId,
        propertyInfo as CreateListingRequest,
      )

      if (!success) {
        setErrorDialog({
          isOpen: true,
          title: t('errorTitle'),
          description: message || t('updateFailed'),
        })
        return
      }

      setIsSubmitSuccess(true)
      setSuccessDialog({
        isOpen: true,
        title: t('successTitle'),
        description: t('successDescription'),
      })
    } catch (err) {
      console.error('Submit error:', err)
      setErrorDialog({
        isOpen: true,
        title: t('errorTitle'),
        description: err instanceof Error ? err.message : t('unexpectedError'),
      })
    }
  }, [
    setAttemptedSubmit,
    progressSteps,
    isStepComplete,
    topRef,
    listingId,
    t,
    propertyInfo,
    setIsSubmitSuccess,
    canProceed,
    currentErrors,
  ])

  const handleSuccessClose = useCallback(async () => {
    setIsSubmitSuccess(true)
    resetPropertyInfo()
    await router.push('/seller/listings')
  }, [setIsSubmitSuccess, resetPropertyInfo, router])

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
      <NotificationDialog
        open={successDialog.isOpen}
        title={successDialog.title}
        description={successDialog.description}
        okText={tCreate('ok')}
        onOpenChange={(open) =>
          setSuccessDialog({ ...successDialog, isOpen: open })
        }
        onOk={handleSuccessClose}
      />

      <NotificationDialog
        open={errorDialog.isOpen}
        title={errorDialog.title}
        description={errorDialog.description}
        okText={tCreate('ok')}
        onOpenChange={(open) =>
          setErrorDialog({ ...errorDialog, isOpen: open })
        }
      />
    </PostTemplateBase>
  )
}

export const UpdatePostTemplate: React.FC<UpdatePostTemplateProps> = ({
  className,
}) => {
  return <UpdatePostTemplateContent className={className} />
}

export type { UpdatePostTemplateProps }
