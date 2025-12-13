import React from 'react'
import { ProgressSteps } from '@/components/molecules/progressSteps'
import { HeaderModule } from '@/components/molecules/createPostModules/headerModule'
import { Card } from '@/components/atoms/card'
import { Form } from '@/components/atoms/form'
import { ValidationErrors } from '@/components/templates/shared/ValidationErrors'
import type { ProgressStep } from '@/components/molecules/progressSteps'
import type { UseFormReturn } from 'react-hook-form'
import type { CreateListingRequest } from '@/api/types/property.type'
import type { ValidationError } from '@/components/templates/shared/ValidationErrors'

interface PostTemplateBaseProps {
  className?: string
  form: UseFormReturn<Partial<CreateListingRequest>>
  topRef: React.RefObject<HTMLDivElement | null>
  currentStep: number
  progressSteps: ProgressStep[]
  attemptedSubmit: boolean
  currentErrors: ValidationError[]
  canProceed: boolean
  onBack: () => void
  onNext: () => void
  onSubmit: () => void | Promise<void>
  onStepClick: (stepIndex: number) => void
  stepRenderer: React.ReactNode
  navigationButtons: React.ReactNode
  children?: React.ReactNode
}

export const PostTemplateBase: React.FC<PostTemplateBaseProps> = ({
  className,
  form,
  topRef,
  currentStep,
  progressSteps,
  currentErrors,
  onStepClick,
  children,
}) => {
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
              onStepClick={onStepClick}
            />
          </Card>

          <ValidationErrors
            errors={currentErrors}
            currentStepTitle={progressSteps[currentStep]?.title}
          />

          {children}
        </Card>
      </Card>
    </Form>
  )
}
