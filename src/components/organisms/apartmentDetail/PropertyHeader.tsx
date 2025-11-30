import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Card, CardContent } from '@/components/atoms/card'
import { Separator } from '@/components/atoms/separator'
import { ListingDetail } from '@/api/types'
import { formatByLocale } from '@/utils/currency/convert'
import { useSwitchLanguage } from '@/contexts/switchLanguage/index.context'
import { getPriceUnitTranslationKey } from '@/utils/property'

interface PropertyHeaderProps {
  listing: ListingDetail
}

const PropertyHeader: React.FC<PropertyHeaderProps> = (props) => {
  const t = useTranslations()
  const { language: locale } = useSwitchLanguage()

  const { listing } = props

  const { title, address, price, priceUnit, area, bedrooms, bathrooms } =
    listing || {}

  const { fullNewAddress: newAddress, fullAddress: oldAddress } = address || {}

  return (
    <div className='space-y-4'>
      {/* Title */}
      <Typography
        variant='h1'
        className='text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight'
      >
        {title}
      </Typography>

      {/* Address */}
      <div className='space-y-1'>
        {newAddress && (
          <Typography variant='p' className='text-base text-muted-foreground'>
            {t('apartmentDetail.property.newAddress')}: {newAddress}
          </Typography>
        )}
        {oldAddress && (
          <Typography variant='p' className='text-base text-muted-foreground'>
            {t('apartmentDetail.property.legacyAddress')}: {oldAddress}
          </Typography>
        )}
      </div>

      {/* Key Metrics */}
      <Separator className='my-4' />
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4'>
        {/* Price */}
        <Card>
          <CardContent className='p-4'>
            <Typography
              variant='small'
              className='text-muted-foreground mb-1 block'
            >
              {t('apartmentDetail.property.price')}
            </Typography>
            <Typography
              variant='h3'
              className='text-2xl font-bold text-primary'
            >
              {formatByLocale(price || 0, locale)} /{' '}
              {t(getPriceUnitTranslationKey(priceUnit))}
            </Typography>
          </CardContent>
        </Card>

        {/* Area */}
        <Card>
          <CardContent className='p-4'>
            <Typography
              variant='small'
              className='text-muted-foreground mb-1 block'
            >
              {t('apartmentDetail.property.area')}
            </Typography>
            <Typography variant='h3' className='text-2xl font-bold'>
              {area} m²
            </Typography>
          </CardContent>
        </Card>

        {/* Bedrooms */}
        <Card>
          <CardContent className='p-4'>
            <Typography
              variant='small'
              className='text-muted-foreground mb-1 block'
            >
              {t('apartmentDetail.property.bedrooms')}
            </Typography>
            <Typography variant='h3' className='text-2xl font-bold'>
              {bedrooms}
            </Typography>
          </CardContent>
        </Card>

        {/* Bathrooms */}
        {bathrooms && (
          <Card>
            <CardContent className='p-4'>
              <Typography
                variant='small'
                className='text-muted-foreground mb-1 block'
              >
                {t('apartmentDetail.property.bathrooms')}
              </Typography>
              <Typography variant='h3' className='text-2xl font-bold'>
                {bathrooms}
              </Typography>
            </CardContent>
          </Card>
        )}
      </div>
      <Separator className='my-4' />
    </div>
  )
}

export default PropertyHeader
