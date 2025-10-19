import React from 'react'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
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
    <Card
      className={cn(
        'w-full flex justify-center border-0 shadow-none p-0',
        className,
      )}
    >
      {/* Grid layout at all sizes; equal-width columns on desktop */}
      <Card className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-0 border-0 shadow-none p-0'>
        {steps.map((step, index) => (
          <Card
            key={step.id}
            className='flex flex-col items-center space-y-2 relative border-0 shadow-none p-0'
            onClick={() => onStepClick?.(index)}
          >
            {/* Step Circle - Mobile First */}
            <Card
              className={cn(
                'w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 transition-colors shadow-none p-0',
                step.isActive
                  ? 'bg-primary border-primary text-primary-foreground'
                  : step.isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-muted border-muted-foreground/20 text-muted-foreground',
                onStepClick && 'cursor-pointer hover:opacity-80',
              )}
            >
              {step.icon}
            </Card>

            {/* Step Content - Mobile First */}
            <Card className='text-center space-y-1 border-0 shadow-none p-0'>
              <Typography
                variant='h3'
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
              </Typography>
              <Typography
                variant='muted'
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
              </Typography>
            </Card>

            {/* Connector Line - Hidden on mobile, shown on desktop */}
            {index < steps.length - 1 && (
              <Card
                className={cn(
                  'hidden sm:block absolute top-6 sm:top-7 left-1/2 h-0.5 -z-10 border-0 shadow-none p-0',
                  step.isCompleted ? 'bg-green-500' : 'bg-muted-foreground/20',
                )}
                style={{
                  left: 'calc(50% + 28px)',
                  right: '-28px',
                }}
              />
            )}
          </Card>
        ))}
      </Card>
    </Card>
  )
}

export { ProgressSteps }
export type { ProgressStep, ProgressStepsProps }
