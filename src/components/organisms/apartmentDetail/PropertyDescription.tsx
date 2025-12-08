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
    <div className='space-y-5'>
      <Typography variant='h3' className='text-xl md:text-2xl font-bold'>
        {title || t('sections.description')}
      </Typography>

      <div className='bg-card border border-border rounded-xl p-5 md:p-6 space-y-3'>
        {lines.map((line, index) => (
          <Typography
            key={index}
            variant='p'
            className='text-foreground/90 leading-relaxed text-sm md:text-base'
          >
            {line}
          </Typography>
        ))}
      </div>
    </div>
  )
}

export default PropertyDescription
