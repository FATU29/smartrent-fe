import React from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/atoms/card'
import SectionHeading from '@/components/atoms/sectionHeading'
import { Amenity } from '@/api/types'
import { getAmenityIcon } from '@/constants/amenities'

interface PropertyFeaturesProps {
  features?: Amenity[]
  title?: string
}

const PropertyFeatures: React.FC<PropertyFeaturesProps> = ({
  features,
  title,
}) => {
  const t = useTranslations('apartmentDetail')

  if (!features || features.length === 0) {
    return null
  }

  return (
    <div className='space-y-3'>
      <SectionHeading title={title || t('sections.features')} />

      <div className='grid grid-cols-5 gap-1.5 sm:gap-2.5'>
        {features.map((feature, index) => (
          <Card
            key={index}
            className='aspect-square py-0 hover:border-primary/50 hover:shadow-md transition-all duration-200 group'
          >
            <CardContent className='flex h-full flex-col items-center justify-center gap-1.5 p-1.5 sm:gap-2 sm:p-3 text-center'>
              <div className='w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-primary/10 group-hover:bg-primary/20 rounded-md flex items-center justify-center text-primary transition-colors shrink-0'>
                {(() => {
                  const IconComponent = getAmenityIcon(feature.icon)
                  return IconComponent ? (
                    <IconComponent className='w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6' />
                  ) : null
                })()}
              </div>
              <p className='font-medium text-foreground text-2xs sm:text-xs md:text-sm line-clamp-2'>
                {feature.name}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PropertyFeatures
