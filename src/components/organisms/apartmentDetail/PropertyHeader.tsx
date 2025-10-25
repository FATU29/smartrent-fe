import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Badge } from '@/components/atoms/badge'
import { Card, CardContent } from '@/components/atoms/card'
import { Separator } from '@/components/atoms/separator'
import { ChevronRight, TrendingUp } from 'lucide-react'
import type { ApartmentDetail } from '@/types/apartmentDetail.types'

interface PropertyHeaderProps {
  apartment: ApartmentDetail
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ apartment }) => {
  const t = useTranslations('apartmentDetail')

  const formatPrice = (price: number): string => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(2)} tỷ`
    }
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`
    }
    return price.toString()
  }

  const formatPricePerSqm = (price: number): string => {
    return `~${(price / 1000000).toFixed(2)} triệu/m²`
  }

  return (
    <div className='space-y-4'>
      {/* Breadcrumb */}
      {apartment.breadcrumb && (
        <div className='flex items-center gap-2 text-sm text-muted-foreground flex-wrap'>
          <Typography
            variant='small'
            className='hover:text-primary cursor-pointer transition-colors'
          >
            {apartment.breadcrumb.category}
          </Typography>
          <ChevronRight className='w-4 h-4' />
          <Typography
            variant='small'
            className='hover:text-primary cursor-pointer transition-colors'
          >
            {apartment.breadcrumb.city}
          </Typography>
          <ChevronRight className='w-4 h-4' />
          <Typography
            variant='small'
            className='hover:text-primary cursor-pointer transition-colors'
          >
            {apartment.breadcrumb.district}
          </Typography>
          <ChevronRight className='w-4 h-4' />
          <Typography variant='small' className='text-foreground font-medium'>
            {apartment.property_type}
          </Typography>
        </div>
      )}

      {/* Title */}
      <Typography
        variant='h1'
        className='text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight'
      >
        {apartment.title}
      </Typography>

      {/* Address */}
      <Typography variant='p' className='text-base text-muted-foreground'>
        {apartment.address}
      </Typography>

      {/* Key Metrics */}
      <Separator className='my-4' />
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 py-4'>
        {/* Price */}
        <Card>
          <CardContent className='p-4'>
            <Typography
              variant='small'
              className='text-muted-foreground mb-1 block'
            >
              {t('property.price')}
            </Typography>
            <Typography
              variant='h3'
              className='text-2xl font-bold text-primary'
            >
              {formatPrice(apartment.price)}
            </Typography>
            {apartment.pricePerSqm && (
              <Typography variant='small' className='text-muted-foreground'>
                {formatPricePerSqm(apartment.pricePerSqm)}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Area */}
        <Card>
          <CardContent className='p-4'>
            <Typography
              variant='small'
              className='text-muted-foreground mb-1 block'
            >
              {t('property.area')}
            </Typography>
            <Typography variant='h3' className='text-2xl font-bold'>
              {apartment.area} m²
            </Typography>
            {apartment.frontWidth && (
              <Typography variant='small' className='text-muted-foreground'>
                Mặt tiền {apartment.frontWidth} m
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Bedrooms */}
        <Card>
          <CardContent className='p-4'>
            <Typography
              variant='small'
              className='text-muted-foreground mb-1 block'
            >
              Phòng ngủ
            </Typography>
            <Typography variant='h3' className='text-2xl font-bold'>
              {apartment.bedrooms} PN
            </Typography>
            {apartment.bathrooms && (
              <Typography variant='small' className='text-muted-foreground'>
                {apartment.bathrooms} phòng tắm
              </Typography>
            )}
          </CardContent>
        </Card>
      </div>
      <Separator className='my-4' />

      {/* Price Increase Badge */}
      {apartment.priceIncrease && (
        <Badge
          variant='outline'
          className='inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border-emerald-200'
        >
          <TrendingUp className='w-4 h-4' />
          <Typography variant='small' className='font-semibold'>
            {apartment.priceIncrease.percentage}%
          </Typography>
          <Typography variant='small'>
            Giá bán đã tăng trong 1 năm qua
          </Typography>
        </Badge>
      )}
    </div>
  )
}

export default PropertyHeader
