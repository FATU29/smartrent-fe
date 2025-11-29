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
import { StepRenderer } from './components/StepRenderer'

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

  const handleSubmit = () => {
    // Submit logic is handled in NavigationButtons component
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
            totalSteps={progressSteps.length}
            canProceed={canProceed}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit}
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
