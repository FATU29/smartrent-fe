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
    <div className='space-y-6'>
      <Typography variant='h3' className='text-xl font-bold'>
        {title || t('sections.features')}
      </Typography>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {features.map((feature, index) => (
          <Card
            key={index}
            className='hover:border-primary/50 transition-colors'
          >
            <CardContent className='flex items-start gap-4 p-4'>
              <div className='flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary'>
                {(() => {
                  const IconComponent = getAmenityIcon(feature.icon)
                  return IconComponent ? (
                    <IconComponent className='w-5 h-5' />
                  ) : null
                })()}
              </div>
              <div className='flex-1 min-w-0'>
                <Typography
                  variant='small'
                  className='text-muted-foreground mb-1 block'
                >
                  {feature.name}
                </Typography>
                <Typography variant='p' className='font-semibold truncate'>
                  {feature.description}
                </Typography>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PropertyFeatures
