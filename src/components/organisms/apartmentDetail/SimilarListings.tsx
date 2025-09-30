import React from 'react'
import { useSwitchLanguage } from '@/contexts/switchLanguage/index.context'
import { formatByLocale } from '@/utils/currency/convert'
import { Typography } from '@/components/atoms/typography'
import { Card, CardContent } from '@/components/atoms/card'
import { Bed, Square, MapPin } from 'lucide-react'
import ImageAtom from '@/components/atoms/imageAtom'
import { DEFAULT_IMAGE } from '@/constants'
import { SimilarProperty } from '@/types/apartmentDetail.types'

interface SimilarListingsProps {
  similarProperties: SimilarProperty[]
  onPropertyClick?: (property: SimilarProperty) => void
}

const SimilarListings: React.FC<SimilarListingsProps> = ({
  similarProperties,
  onPropertyClick,
}) => {
  const { language } = useSwitchLanguage()
  const formatPrice = (price: number, currency: string) => {
    const isVnd = currency === 'VND'
    if (isVnd) {
      const f = formatByLocale(price, language)
      return f + (language === 'vi' ? '/tháng' : '/month')
    }
    const intl = new Intl.NumberFormat(language === 'en' ? 'en-US' : 'vi-VN', {
      style: 'currency',
      currency,
    }).format(price)
    return intl + (language === 'vi' ? '/tháng' : '/month')
  }

  const handlePropertyClick = (property: SimilarProperty) => {
    onPropertyClick?.(property)
  }

  if (!similarProperties || similarProperties.length === 0) {
    return (
      <div className='space-y-4'>
        <Typography variant='h4' className='font-semibold'>
          Similar Listings
        </Typography>
        <div className='text-center py-8'>
          <Typography variant='p' className='text-muted-foreground'>
            No similar properties found.
          </Typography>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-3 space-y-6'>
      <Typography variant='h4' className='font-semibold text-xl'>
        Similar Listings
      </Typography>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
        {similarProperties.map((property) => (
          <Card
            key={property.id}
            className='group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden hover:scale-[1.02] h-full flex flex-col border-0 shadow-md'
            onClick={() => handlePropertyClick(property)}
          >
            {/* Property Image */}
            <div className='relative aspect-[4/3] overflow-hidden'>
              <ImageAtom
                src={property.image}
                defaultImage={DEFAULT_IMAGE}
                alt={property.title}
                className='w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105'
              />
            </div>

            <CardContent className='p-4 space-y-3.5 flex-1 flex flex-col'>
              {/* Title */}
              <Typography
                variant='h6'
                className='line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200 leading-tight'
              >
                {property.title}
              </Typography>

              {/* Address */}
              <div className='flex items-center text-xs text-muted-foreground'>
                <MapPin className='w-3 h-3 mr-1.5 flex-shrink-0' />
                <span className='truncate font-medium'>
                  {property.address}, {property.district}, {property.city}
                </span>
              </div>

              {/* Price */}
              <Typography
                variant='h6'
                className='text-primary font-bold text-base'
              >
                {formatPrice(property.price, property.currency)}
              </Typography>

              {/* Property Details */}
              <div className='flex items-center justify-between text-xs text-muted-foreground mt-auto'>
                <div className='flex items-center space-x-3.5'>
                  <div className='flex items-center'>
                    <Bed className='w-3 h-3 mr-1' />
                    <span className='font-semibold'>{property.bedrooms}</span>
                  </div>
                  <div className='flex items-center'>
                    <Square className='w-3 h-3 mr-1' />
                    <span className='font-semibold'>{property.area}m²</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default SimilarListings
