import React from 'react'
import { Card, CardContent } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import type { ProgressStep } from '@/components/molecules/progressSteps'

interface DefaultStepProps {
  step: ProgressStep
}

export const DefaultStep: React.FC<DefaultStepProps> = ({ step }) => {
  return (
    <Card className='w-full mx-auto md:max-w-6xl border-0 shadow-none p-0'>
      <CardContent className='p-6 sm:p-8'>
        <div className='text-center'>
          <Typography variant='sectionTitle' as='h3' className='mb-2'>
            {step?.title}
          </Typography>
          <p className='text-muted-foreground'>{step?.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
