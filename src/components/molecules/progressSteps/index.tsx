import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  isActive: boolean
  isCompleted: boolean
}

interface ProgressStepsProps {
  currentStep: number
  steps: ProgressStep[]
  className?: string
  onStepClick?: (stepIndex: number) => void
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  className,
  onStepClick,
}) => {
  return (
    <div className={cn('w-full', className)}>
      {/* Grid layout at all sizes; equal-width columns on desktop */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-0'>
        {steps.map((step, index) => (
          <div
            key={step.id}
            className='flex flex-col items-center space-y-2 relative'
            onClick={() => onStepClick?.(index)}
          >
            {/* Step Circle - Mobile First */}
            <div
              className={cn(
                'w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 transition-colors',
                step.isActive
                  ? 'bg-primary border-primary text-primary-foreground'
                  : step.isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-muted border-muted-foreground/20 text-muted-foreground',
                onStepClick && 'cursor-pointer hover:opacity-80',
              )}
            >
              {step.icon}
            </div>

            {/* Step Content - Mobile First */}
            <div className='text-center space-y-1'>
              <h3
                className={cn(
                  'text-[11px] sm:text-xs font-medium leading-tight tracking-tight',
                  step.isActive
                    ? 'text-primary'
                    : step.isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground',
                )}
              >
                {step.title}
              </h3>
              <p
                className={cn(
                  'hidden sm:block text-[10px] leading-snug',
                  step.isActive
                    ? 'text-muted-foreground'
                    : step.isCompleted
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/60',
                )}
              >
                {step.description}
              </p>
            </div>

            {/* Connector Line - Hidden on mobile, shown on desktop */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'hidden sm:block absolute top-6 sm:top-7 left-1/2 h-0.5 -z-10',
                  step.isCompleted ? 'bg-green-500' : 'bg-muted-foreground/20',
                )}
                style={{
                  left: 'calc(50% + 28px)',
                  right: '-28px',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export { ProgressSteps }
export type { ProgressStep, ProgressStepsProps }
