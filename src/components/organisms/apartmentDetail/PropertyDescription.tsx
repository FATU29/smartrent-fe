import React from 'react'
import { useTranslations } from 'next-intl'
import SectionHeading from '@/components/atoms/sectionHeading'

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
    <div className='space-y-3'>
      <SectionHeading title={title || t('sections.description')} />

      <div className='bg-card border border-border rounded-xl p-4 md:p-5 space-y-2.5'>
        {lines.map((line, index) => (
          <p
            key={index}
            className='text-foreground/90 leading-relaxed text-xs md:text-sm'
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

export default PropertyDescription
