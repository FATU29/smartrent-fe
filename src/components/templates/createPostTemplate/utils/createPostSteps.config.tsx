import type { ProgressStep } from '@/components/molecules/progressSteps'
import { usePostStepsConfig } from '@/components/templates/shared/stepsConfig.utils'

export const useCreatePostStepsConfig = (
  currentStep: number,
  isStepComplete: (index: number) => boolean,
): ProgressStep[] => {
  // Create post has 5 steps: property-info, ai-valuation, images-video, package-config, order-summary
  // Step indices: 0, 1, 2, 3, 4
  return usePostStepsConfig(currentStep, isStepComplete, [0, 1, 2, 3, 4])
}
