import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Card, CardContent } from '@/components/atoms/card'
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
    <div className='space-y-5'>
      <Typography variant='h3' className='text-xl md:text-2xl font-bold'>
        {title || t('sections.features')}
      </Typography>

      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'>
        {features.map((feature, index) => (
          <Card
            key={index}
            className='hover:border-primary/50 hover:shadow-md transition-all duration-200 group'
          >
            <CardContent className='flex flex-col items-center gap-2.5 p-3 md:p-4 text-center'>
              <div className='w-10 h-10 md:w-11 md:h-11 bg-primary/10 group-hover:bg-primary/20 rounded-lg flex items-center justify-center text-primary transition-colors'>
                {(() => {
                  const IconComponent = getAmenityIcon(feature.icon)
                  return IconComponent ? (
                    <IconComponent className='w-5 h-5 md:w-5.5 md:h-5.5' />
                  ) : null
                })()}
              </div>
              <Typography
                variant='small'
                className='font-semibold text-foreground text-xs md:text-sm line-clamp-2'
              >
                {feature.name}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PropertyFeatures
