import type { ProgressStep } from '@/components/molecules/progressSteps'
import { usePostStepsConfig } from '@/components/templates/shared/stepsConfig.utils'

export const useUpdatePostStepsConfig = (
  currentStep: number,
  isStepComplete: (index: number) => boolean,
): ProgressStep[] => {
  // Update post has 5 steps: property-info, ai-valuation, images-video, package-config (readonly), order-summary
  // Step indices: 0, 1, 2, 3, 4 (all steps included, but package-config is readonly)
  return usePostStepsConfig(currentStep, isStepComplete, [0, 1, 2, 3, 4])
}
