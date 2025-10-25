import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Card, CardContent } from '@/components/atoms/card'
import { Calendar, Clock, Tag, FileText } from 'lucide-react'
import type { PropertyMetadata as PropertyMetadataType } from '@/types/apartmentDetail.types'

interface PropertyMetadataProps {
  metadata?: PropertyMetadataType
}

const PropertyMetadata: React.FC<PropertyMetadataProps> = ({ metadata }) => {
  const t = useTranslations('apartmentDetail.metadata')

  if (!metadata) {
    return null
  }

  const items = [
    {
      icon: <Calendar className='w-5 h-5' />,
      label: t('postDate'),
      value: metadata.postDate,
    },
    {
      icon: <Clock className='w-5 h-5' />,
      label: t('expiryDate'),
      value: metadata.expiryDate,
    },
    {
      icon: <Tag className='w-5 h-5' />,
      label: t('listingType'),
      value: metadata.listingType,
    },
    {
      icon: <FileText className='w-5 h-5' />,
      label: t('listingId'),
      value: metadata.listingId,
    },
  ]

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      {items.map((item, index) => (
        <Card key={index}>
          <CardContent className='flex flex-col items-center justify-center p-4 text-center'>
            <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-2'>
              {item.icon}
            </div>
            <Typography
              variant='small'
              className='text-muted-foreground mb-1 block'
            >
              {item.label}
            </Typography>
            <Typography variant='p' className='font-semibold'>
              {item.value}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default PropertyMetadata
