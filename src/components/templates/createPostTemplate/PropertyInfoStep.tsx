import React from 'react'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { PropertyInfoSection } from '@/components/organisms/createPostSections/propertyInfoSection'
import { useTranslations } from 'next-intl'

interface PropertyInfoStepProps {
  className?: string
}

export const PropertyInfoStep: React.FC<PropertyInfoStepProps> = ({
  className,
}) => {
  const t = useTranslations('createPost')

  return (
    <Card
      className={`w-full mx-auto md:max-w-6xl border-0 shadow-none p-0 ${className || ''}`}
    >
      <Card className='bg-card rounded-lg shadow-sm border p-6 sm:p-8'>
        <Card className='mb-6 sm:mb-8 border-0 shadow-none p-0'>
          <Typography
            variant='h2'
            className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3'
          >
            {t('sections.propertyInfo.title')}
          </Typography>
          <Typography variant='muted' className='text-sm sm:text-base'>
            {t('sections.propertyInfo.description')}
          </Typography>
        </Card>
        <PropertyInfoSection className='w-full' />
      </Card>
    </Card>
  )
}
