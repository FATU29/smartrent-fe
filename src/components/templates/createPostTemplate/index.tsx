import React from 'react'
import { ProgressSteps } from '@/components/molecules/progressSteps'
import { HeaderModule } from '@/components/molecules/createPostModules/headerModule'
import { Card } from '@/components/atoms/card'
import { Form } from '@/components/atoms/form'
import { useCreatePostSteps } from './hooks/useCreatePostSteps'
import { useCreatePostValidation } from './hooks/useCreatePostValidation'
import { useCreatePostStepsConfig } from './utils/createPostSteps.config'
import { ValidationErrors } from './components/ValidationErrors'
import { NavigationButtons } from './components/NavigationButtons'
import { ListingService } from '@/api/services/listing.service'
import type { CreateVipListingRequest } from '@/api/types/property.type'
import { useCreatePost } from '@/contexts/createPost'
import { useRouter } from 'next/router'
import { StepRenderer } from './components/StepRenderer'
import { useTranslations } from 'next-intl'
import NotificationDialog from '@/components/molecules/notifications/NotificationDialog'

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

  const { propertyInfo } = useCreatePost()
  const router = useRouter()
  const t = useTranslations('createPost.submit')

  const [successOpen, setSuccessOpen] = React.useState(false)
  const [successTitle, setSuccessTitle] = React.useState<string>('')
  const [successDesc, setSuccessDesc] = React.useState<string>('')
  const [errorOpen, setErrorOpen] = React.useState(false)
  const [errorTitle, setErrorTitle] = React.useState<string>('')
  const [errorDesc, setErrorDesc] = React.useState<string>('')

  const handleSubmit = async () => {
    try {
      // If using membership quota or selected benefits, create standard listing (free flow)
      const useQuota =
        !!propertyInfo?.useMembershipQuota ||
        (!!propertyInfo?.benefitIds && propertyInfo.benefitIds.length > 0)

      if (useQuota) {
        const { success, data, message } =
          await ListingService.create(propertyInfo)
        if (!success || !data) {
          setErrorTitle(t('errorTitle'))
          setErrorDesc(message || t('createFailed'))
          setErrorOpen(true)
          return
        }
        setSuccessTitle(t('successTitle'))
        setSuccessDesc(t('successDescription'))
        setSuccessOpen(true)
        return
      }

      const { success, data, message } = await ListingService.createVip(
        propertyInfo as CreateVipListingRequest,
      )
      if (!success || !data) {
        setErrorTitle(t('errorTitle'))
        setErrorDesc(message || t('createVipFailed'))
        setErrorOpen(true)
        return
      }
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
        return
      }
      await router.push(`/listing-detail/${data.listingId}`)
    } catch (err) {
      console.error('Submit error:', err)
      setErrorTitle(t('errorTitle'))
      setErrorDesc(err instanceof Error ? err.message : t('unexpectedError'))
      setErrorOpen(true)
    }
  }

  return (
    <Form {...form}>
      <Card
        className={`min-h-screen bg-background border-0 shadow-none p-0 ${className || ''}`}
      >
        <div ref={topRef} />
        <Card className='w-full mx-auto md:container md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8 border-0 shadow-none p-0'>
          <HeaderModule />

          <Card className='mb-6 sm:mb-8 flex justify-center border-0 shadow-none p-0'>
            <ProgressSteps
              currentStep={currentStep}
              steps={progressSteps}
              className='bg-card p-4 sm:p-6 rounded-lg shadow-sm border'
              onStepClick={handleStepClick}
            />
          </Card>

          <StepRenderer
            currentStep={currentStep}
            progressSteps={progressSteps}
          />

          <ValidationErrors
            errors={currentErrors}
            currentStepTitle={progressSteps[currentStep]?.title}
          />

          <NavigationButtons
            currentStep={currentStep}
            totalSteps={progressSteps?.length}
            canProceed={canProceed}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />

          {/* Success Dialog */}
          <NotificationDialog
            open={successOpen}
            title={successTitle}
            description={successDesc}
            okText={t('ok')}
            onOpenChange={setSuccessOpen}
            onOk={async () => {
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
        </Card>
      </Card>
    </Form>
  )
}

const CreatePostTemplate: React.FC<CreatePostTemplateProps> = ({
  className,
}) => {
  return <CreatePostTemplateContent className={className} />
}

export { CreatePostTemplate }
export type { CreatePostTemplateProps }
