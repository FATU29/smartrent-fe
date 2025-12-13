import { Home, Brain, Camera, FileText, ClipboardList } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ProgressStep } from '@/components/molecules/progressSteps'
import { JSX } from 'react'

interface StepConfig {
  id: string
  translationKey: string
  icon: JSX.Element
}

const STEP_CONFIGS: StepConfig[] = [
  {
    id: 'property-info',
    translationKey: 'propertyInfo',
    icon: <Home className='w-4 h-4 sm:w-5 sm:h-5' />,
  },
  {
    id: 'ai-valuation',
    translationKey: 'aiValuation',
    icon: <Brain className='w-4 h-4 sm:w-5 sm:h-5' />,
  },
  {
    id: 'images-video',
    translationKey: 'imagesAndVideo',
    icon: <Camera className='w-4 h-4 sm:w-5 sm:h-5' />,
  },
  {
    id: 'package-config',
    translationKey: 'packageAndConfig',
    icon: <FileText className='w-4 h-4 sm:w-5 sm:h-5' />,
  },
  {
    id: 'order-summary',
    translationKey: 'orderSummary',
    icon: <ClipboardList className='w-4 h-4 sm:w-5 sm:h-5' />,
  },
]

export const usePostStepsConfig = (
  currentStep: number,
  isStepComplete: (index: number) => boolean,
  stepIndices: number[],
): ProgressStep[] => {
  const tSteps = useTranslations('createPost.steps')

  return stepIndices.map((stepIndex, arrayIndex) => {
    const config = STEP_CONFIGS[stepIndex]
    const isLastStep = arrayIndex === stepIndices.length - 1
    return {
      id: config.id,
      title: tSteps(`${config.translationKey}.title`),
      description: tSteps(`${config.translationKey}.description`),
      icon: config.icon,
      isActive: currentStep === arrayIndex,
      isCompleted: isLastStep
        ? currentStep > arrayIndex
        : isStepComplete(arrayIndex) && currentStep > arrayIndex,
    }
  })
}
