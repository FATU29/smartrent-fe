import React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import {
  MapPin,
  Eye,
  TrendingUp,
  Sparkles,
  Bed,
  Bath,
  Square,
  Compass,
  Wifi,
  Car,
  Shield,
  Waves,
  Dumbbell,
  Building,
  Wind,
  Heart,
  Dog,
  Zap,
} from 'lucide-react'
import { ApartmentDetail } from '@/types/apartmentDetail.types'
import { formatByLocale } from '@/utils/currency/convert'

interface ApartmentInfoProps {
  apartment: ApartmentDetail
  onAIPriceEvaluation?: () => void
}

const stripTrailingDong = (value: string): string =>
  value.endsWith('₫') ? value.slice(0, -1).trimEnd() : value

const AMENITY_ICON_RULES: Array<{
  patterns: string[]
  Icon: React.ElementType
}> = [
  { patterns: ['wifi', 'internet'], Icon: Wifi },
  { patterns: ['parking', 'garage'], Icon: Car },
  { patterns: ['security', 'safe'], Icon: Shield },
  { patterns: ['pool', 'swimming'], Icon: Waves },
  { patterns: ['gym', 'fitness'], Icon: Dumbbell },
  { patterns: ['elevator', 'lift'], Icon: Building },
  { patterns: ['air', 'conditioning'], Icon: Wind },
  { patterns: ['balcony'], Icon: Square },
  { patterns: ['pet'], Icon: Dog },
  { patterns: ['laundry'], Icon: Zap },
]

const ApartmentInfo: React.FC<ApartmentInfoProps> = ({
  apartment,
  onAIPriceEvaluation,
}) => {
  const t = useTranslations('apartmentDetail.property')
  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase()
    const matched = AMENITY_ICON_RULES.find(({ patterns }) =>
      patterns.some((p) => lower.includes(p)),
    )
    const Icon = matched?.Icon ?? Heart
    return <Icon className='w-5 h-5' />
  }

  return (
    <div className='space-y-7'>
      {/* Title and Address */}
      <div className='space-y-4'>
        <Typography
          variant='h1'
          className='text-2xl md:text-3xl font-bold text-foreground leading-tight'
        >
          {apartment.title}
        </Typography>

        <div className='flex items-center text-muted-foreground'>
          <MapPin className='w-5 h-5 mt-6 mr-2.5 flex-shrink-0' />
          <Typography variant='p' className='text-base'>
            {apartment.address}, {apartment.city}
          </Typography>
        </div>

        {/* Metadata */}
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <div className='flex items-center space-x-5'>
            <div className='flex items-center'>
              <Eye className='w-4 h-4 mr-1.5' />
              <span className='font-medium'>
                {apartment.views || 0} {t('views')}
              </span>
            </div>
            {apartment.postDate && (
              <span className='font-medium'>
                {t('posted')} {apartment.postDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Price Section */}
      <div className='space-y-4'>
        <div className='flex items-baseline space-x-4'>
          <Typography
            variant='h2'
            className='text-2xl md:text-3xl font-bold text-primary'
          >
            {apartment.currency === 'VND'
              ? formatByLocale(apartment.price, 'vi-VN') +
                ' ' +
                t('pricePerMonth')
              : new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: apartment.currency,
                }).format(apartment.price) +
                ' ' +
                t('pricePerMonth')}
          </Typography>
          {apartment.priceIncrease && (
            <div className='flex items-center text-red-600'>
              <TrendingUp className='w-4 h-4 mr-1.5' />
              <Typography variant='small' className='font-semibold'>
                +
                {apartment.currency === 'VND'
                  ? stripTrailingDong(
                      formatByLocale(apartment.priceIncrease.amount, 'vi-VN'),
                    )
                  : new Intl.NumberFormat('en-US').format(
                      apartment.priceIncrease.amount,
                    )}{' '}
                {apartment.currency} ({apartment.priceIncrease.percentage}%)
              </Typography>
            </div>
          )}
        </div>

        {/* Smart Pricing Box */}
        {apartment.smartPriceScore && (
          <div className='bg-gradient-to-r from-purple-600 to-blue-600 text-white p-5 rounded-xl shadow-lg'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <div className='flex items-center space-x-2.5 mb-3'>
                  <Sparkles className='w-5 h-5' />
                  <Typography variant='h6' className='font-semibold text-white'>
                    {t('smartPrice.title')}
                  </Typography>
                </div>
                <Typography
                  variant='small'
                  className='text-purple-100 mb-4 leading-relaxed'
                >
                  {t('smartPrice.description')}
                </Typography>
                <Button
                  variant='secondary'
                  className='bg-white/20 hover:bg-white/30 text-white border-white/20 font-medium'
                  onClick={onAIPriceEvaluation}
                >
                  {t('smartPrice.button')}
                </Button>
              </div>
              <div className='text-right ml-4'>
                <Typography variant='small' className='text-purple-100 mb-1'>
                  {t('smartPrice.score')}
                </Typography>
                <Typography variant='h5' className='font-bold text-white'>
                  {apartment.smartPriceScore}/10
                </Typography>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Apartment Details Grid */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-gray-50 p-4 rounded-lg text-center'>
          <Square className='w-6 h-6 mx-auto mb-2 text-primary' />
          <Typography variant='h6' className='font-semibold'>
            {apartment.area}m²
          </Typography>
          <Typography variant='small' className='text-muted-foreground'>
            {t('area')}
          </Typography>
        </div>

        <div className='bg-gray-50 p-4 rounded-lg text-center'>
          <Bed className='w-6 h-6 mx-auto mb-2 text-primary' />
          <Typography variant='h6' className='font-semibold'>
            {apartment.bedrooms}
          </Typography>
          <Typography variant='small' className='text-muted-foreground'>
            {t('bedrooms')}
          </Typography>
        </div>

        <div className='bg-gray-50 p-4 rounded-lg text-center'>
          <Bath className='w-6 h-6 mx-auto mb-2 text-primary' />
          <Typography variant='h6' className='font-semibold'>
            {apartment.bathrooms}
          </Typography>
          <Typography variant='small' className='text-muted-foreground'>
            {t('bathrooms')}
          </Typography>
        </div>

        {apartment.direction && (
          <div className='bg-gray-50 p-4 rounded-lg text-center'>
            <Compass className='w-6 h-6 mx-auto mb-2 text-primary' />
            <Typography variant='h6' className='font-semibold'>
              {apartment.direction}
            </Typography>
            <Typography variant='small' className='text-muted-foreground'>
              {t('direction')}
            </Typography>
          </div>
        )}
      </div>

      {/* Description */}
      {apartment.fullDescription && (
        <div className='space-y-3'>
          <Typography variant='h5' className='font-semibold'>
            {t('description')}
          </Typography>
          <Typography
            variant='p'
            className='text-muted-foreground leading-relaxed'
          >
            {apartment.fullDescription}
          </Typography>
        </div>
      )}

      {/* Amenities Section */}
      {apartment.amenities && apartment.amenities.length > 0 && (
        <div className='space-y-3'>
          <Typography variant='h5' className='font-semibold'>
            {t('amenities')}
          </Typography>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
            {apartment.amenities.map((amenity, index) => (
              <div
                key={index}
                className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
              >
                <div className='text-primary'>{getAmenityIcon(amenity)}</div>
                <Typography variant='small' className='font-medium'>
                  {amenity}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ApartmentInfo
