import React from 'react'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { ProgressStep } from '@/components/molecules/progressSteps'

interface DefaultStepProps {
  step: ProgressStep
  className?: string
}

export const DefaultStep: React.FC<DefaultStepProps> = ({
  step,
  className,
}) => {
  return (
    <Card
      className={`w-full mx-auto md:max-w-6xl border-0 shadow-none p-0 ${className || ''}`}
    >
      <Card className='bg-card rounded-lg shadow-sm border p-6 sm:p-8'>
        <Card className='text-center py-12 border-0 shadow-none p-0'>
          <Typography variant='h2' className='text-2xl font-bold mb-4'>
            {step.title}
          </Typography>
          <Typography variant='muted'>{step.description}</Typography>
          <Typography variant='muted' className='text-sm mt-4'>
            Coming soon...
          </Typography>
        </Card>
      </Card>
    </Card>
  )
}
