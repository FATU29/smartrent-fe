import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Card, CardContent } from '@/components/atoms/card'
import {
  DollarSign,
  Building,
  Square,
  ArrowRightLeft,
  Bed,
  Car,
  Bath,
  FileText,
} from 'lucide-react'
import type { PropertyFeature } from '@/types/apartmentDetail.types'

interface PropertyFeaturesProps {
  features?: PropertyFeature[]
  title?: string
}

const getFeatureIcon = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    money: <DollarSign className='w-5 h-5' />,
    building: <Building className='w-5 h-5' />,
    area: <Square className='w-5 h-5' />,
    width: <ArrowRightLeft className='w-5 h-5' />,
    bed: <Bed className='w-5 h-5' />,
    road: <Car className='w-5 h-5' />,
    bath: <Bath className='w-5 h-5' />,
    document: <FileText className='w-5 h-5' />,
  }
  return iconMap[iconName] || <Square className='w-5 h-5' />
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
                {getFeatureIcon(feature.icon)}
              </div>
              <div className='flex-1 min-w-0'>
                <Typography
                  variant='small'
                  className='text-muted-foreground mb-1 block'
                >
                  {feature.label}
                </Typography>
                <Typography variant='p' className='font-semibold truncate'>
                  {feature.value}
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
