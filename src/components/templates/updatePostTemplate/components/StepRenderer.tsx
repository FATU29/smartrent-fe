import React from 'react'
import { PropertyInfoStep } from '../PropertyInfoStep'
import { AIValuationStep } from '../AIValuationStep'
import { MediaStep } from '../MediaStep'
import { PackageConfigStep } from '../PackageConfigStep'
import { OrderSummaryStep } from '../OrderSummaryStep'
import type { ProgressStep } from '@/components/molecules/progressSteps'
import { DefaultStep } from './DefaultStep'

interface StepRendererProps {
  currentStep: number
  progressSteps: ProgressStep[]
  attemptedSubmit: boolean
}

export const StepRenderer: React.FC<StepRendererProps> = ({
  currentStep,
  progressSteps,
  attemptedSubmit,
}) => {
  switch (currentStep) {
    case 0:
      return <PropertyInfoStep attemptedSubmit={attemptedSubmit} />
    case 1:
      return <AIValuationStep />
    case 2:
      return <MediaStep />
    case 3:
      return <PackageConfigStep />
    case 4:
      return <OrderSummaryStep />
    default:
      return <DefaultStep step={progressSteps[currentStep]} />
  }
}
