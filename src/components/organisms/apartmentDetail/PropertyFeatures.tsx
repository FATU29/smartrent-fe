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

      <div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5'>
        {features.map((feature, index) => (
          <Card
            key={index}
            className='hover:border-primary/50 hover:shadow-md transition-all duration-200 group'
          >
            <CardContent className='flex flex-col items-center gap-2 p-2.5 md:p-3 text-center'>
              <div className='w-8 h-8 md:w-9 md:h-9 bg-primary/10 group-hover:bg-primary/20 rounded-md flex items-center justify-center text-primary transition-colors'>
                {(() => {
                  const IconComponent = getAmenityIcon(feature.icon)
                  return IconComponent ? (
                    <IconComponent className='w-4 h-4 md:w-4.5 md:h-4.5' />
                  ) : null
                })()}
              </div>
              <p className='font-medium text-foreground text-2xs md:text-xs line-clamp-2'>
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
