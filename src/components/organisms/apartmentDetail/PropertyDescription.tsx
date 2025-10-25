import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'

interface PropertyDescriptionProps {
  description?: string
  title?: string
}

const PropertyDescription: React.FC<PropertyDescriptionProps> = ({
  description,
  title,
}) => {
  const t = useTranslations('apartmentDetail')

  if (!description) {
    return null
  }

  // Split description by newlines and render each line
  const lines = description.split('\n').filter((line) => line.trim())

  return (
    <div className='space-y-4'>
      <Typography variant='h3' className='text-xl font-bold'>
        {title || t('sections.description')}
      </Typography>

      <div className='space-y-2'>
        {lines.map((line, index) => (
          <Typography
            key={index}
            variant='p'
            className='text-muted-foreground leading-relaxed'
          >
            {line}
          </Typography>
        ))}
      </div>
    </div>
  )
}

export default PropertyDescription
