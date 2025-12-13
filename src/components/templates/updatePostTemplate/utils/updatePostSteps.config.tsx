import type { ProgressStep } from '@/components/molecules/progressSteps'
import { usePostStepsConfig } from '@/components/templates/shared/stepsConfig.utils'

export const useUpdatePostStepsConfig = (
  currentStep: number,
  isStepComplete: (index: number) => boolean,
): ProgressStep[] => {
  // Update post has 4 steps: property-info, ai-valuation, images-video, order-summary
  // Step indices: 0, 1, 2, 4 (skipping package-config at index 3)
  return usePostStepsConfig(currentStep, isStepComplete, [0, 1, 2, 4])
}
