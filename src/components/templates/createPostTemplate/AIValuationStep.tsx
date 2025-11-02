import React from 'react'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { AIValuationSection } from '@/components/organisms/createPostSections/aiValuationSection'
import { useTranslations } from 'next-intl'

interface AIValuationStepProps {
  className?: string
}

export const AIValuationStep: React.FC<AIValuationStepProps> = ({
  className,
}) => {
  const t = useTranslations('createPost')

  return (
    <Card
      className={`w-full mx-auto md:max-w-7xl border-0 shadow-none p-0 ${className || ''}`}
    >
      <Card className='bg-card rounded-lg shadow-sm border p-6 sm:p-8'>
        <Card className='mb-6 sm:mb-8 border-0 shadow-none p-0'>
          <Typography
            variant='h2'
            className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3'
          >
            {t('sections.aiValuation.title')}
          </Typography>
          <Typography variant='muted' className='text-sm sm:text-base'>
            {t('sections.aiValuation.description')}
          </Typography>
        </Card>
        <AIValuationSection className='w-full' />
      </Card>
    </Card>
  )
}
