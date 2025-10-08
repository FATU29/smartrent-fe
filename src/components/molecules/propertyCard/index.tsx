import React, { useState } from 'react'
import classNames from 'classnames'
import { Card } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/atoms/tooltip'
import ImageAtom from '@/components/atoms/imageAtom'
import { PropertyCard as PropertyCardType } from '@/api/types/property.type'
import { basePath, DEFAULT_IMAGE } from '@/constants'
import { useTranslations } from 'next-intl'
import { useSwitchLanguage } from '@/contexts/switchLanguage/index.context'
import { formatByLocale } from '@/utils/currency/convert'
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Square,
  Car,
  Wifi,
  Shield,
  Eye,
  Video,
  Star,
  Navigation,
} from 'lucide-react'

interface PropertyCardProps {
  property: PropertyCardType
  onClick?: (property: PropertyCardType) => void
  onFavorite?: (property: PropertyCardType, isFavorite: boolean) => void
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onClick,
  onFavorite,
}) => {
  const t = useTranslations()
  const { language } = useSwitchLanguage()
  const [isFavorite, setIsFavorite] = useState(false)

  // Unified price formatter: if language=en convert VND->USD else show VND with grouping
  const renderPrice = (price: number, currency: string) => {
    // Assume backend sends VND numeric + currency code like 'VND'. If already USD and language=en, just format.
    const isVnd = currency === 'VND'
    if (isVnd) {
      const formatted = formatByLocale(price, language)
      // formatByLocale already adds symbol & (for vi) suffix ₫
      return formatted + (language === 'vi' ? '/tháng' : '/month')
    }
    // Fallback: non-VND currency keep original style with Intl
    const intl = new Intl.NumberFormat(language === 'en' ? 'en-US' : 'vi-VN', {
      style: 'currency',
      currency,
    }).format(price)
    return intl + (language === 'vi' ? '/tháng' : '/month')
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.(property)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newFavoriteState = !isFavorite
    setIsFavorite(newFavoriteState)
    onFavorite?.(property, newFavoriteState)
  }

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase()
    if (lowerAmenity.includes('parking') || lowerAmenity.includes('garage'))
      return <Car className='w-3 h-3' />
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet'))
      return <Wifi className='w-3 h-3' />
    if (lowerAmenity.includes('security') || lowerAmenity.includes('safe'))
      return <Shield className='w-3 h-3' />
    return null
  }

  const fullAddress = `${property.address}, ${property.city}`

  return (
    <TooltipProvider delayDuration={0}>
      <Card
        className='group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden hover:scale-[1.02] h-full flex flex-col bg-card border shadow-sm hover:border-primary/20'
        onClick={handleClick}
      >
        <div className='relative aspect-[4/3] overflow-hidden'>
          <ImageAtom
            src={property.images?.[0] || `${basePath}/images/default-image.jpg`}
            defaultImage={DEFAULT_IMAGE}
            alt={property.title}
            className='w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105'
          />

          <Button
            variant='ghost'
            size='sm'
            className={classNames(
              'absolute top-2 right-2 w-8 h-8 sm:top-3 sm:right-3 sm:w-9 sm:h-9 p-0 rounded-full bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 z-10',
              {
                'bg-destructive text-destructive-foreground hover:bg-destructive/90':
                  isFavorite,
                'text-foreground hover:text-destructive': !isFavorite,
              },
            )}
            onClick={handleFavoriteClick}
          >
            <Heart
              className={classNames('w-3 h-3 sm:w-4 sm:h-4', {
                'fill-current': isFavorite,
              })}
            />
          </Button>

          <div className='absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-2 z-10'>
            {property.verified && (
              <Badge className='bg-green-500 text-white text-xs px-2 py-1 rounded-md shadow-sm'>
                ✓ {t('homePage.property.verified')}
              </Badge>
            )}
            {property.virtual_tour && (
              <Badge className='bg-blue-500 text-white text-xs px-2 py-1 rounded-md shadow-sm flex items-center gap-1'>
                <Video className='w-3 h-3' />
                {t('homePage.property.video')}
              </Badge>
            )}
          </div>

          {property.featured && (
            <Badge className='absolute top-2 right-10 sm:top-3 sm:right-12 bg-yellow-500 text-white text-xs px-2 py-1 rounded-md shadow-sm flex items-center gap-1 z-10'>
              <Star className='w-3 h-3' />
              {t('homePage.property.featured')}
            </Badge>
          )}
        </div>

        <div className='p-3 sm:p-4 space-y-2 sm:space-y-3 flex-1 flex flex-col'>
          <div className='space-y-1.5 sm:space-y-2'>
            <Typography
              variant='h6'
              className='line-clamp-2 text-sm sm:text-base text-foreground group-hover:text-primary transition-colors duration-200 leading-tight'
            >
              {property.title}
            </Typography>

            <div className='flex items-center justify-between'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='flex items-center text-xs sm:text-sm text-muted-foreground cursor-help flex-1 min-w-0'>
                    <MapPin className='w-3 h-3 mr-1 flex-shrink-0' />
                    <span className='truncate'>{fullAddress}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side='top' className='max-w-xs z-50'>
                  <p className='break-words'>{fullAddress}</p>
                </TooltipContent>
              </Tooltip>

              {property.distance && (
                <div className='flex items-center text-xs text-muted-foreground ml-2 flex-shrink-0'>
                  <Navigation className='w-3 h-3 mr-1' />
                  <span>
                    {property.distance} {t('homePage.property.distance')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <Typography
              variant='h5'
              className='text-primary font-bold text-base sm:text-lg'
            >
              {renderPrice(property.price, property.currency)}
            </Typography>
            {property.area && (
              <Typography
                variant='small'
                className='text-muted-foreground font-medium text-xs sm:text-sm'
              >
                {property.area} {t('homePage.property.area')}
              </Typography>
            )}
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3 sm:space-x-4'>
              <div className='flex items-center text-xs sm:text-sm text-muted-foreground'>
                <Bed className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                <Typography
                  variant='small'
                  className='font-medium text-xs sm:text-sm'
                >
                  {property.bedrooms}
                </Typography>
              </div>
              <div className='flex items-center text-xs sm:text-sm text-muted-foreground'>
                <Bath className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                <Typography
                  variant='small'
                  className='font-medium text-xs sm:text-sm'
                >
                  {property.bathrooms}
                </Typography>
              </div>
              {property.area && (
                <div className='flex items-center text-xs sm:text-sm text-muted-foreground'>
                  <Square className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                  <Typography
                    variant='small'
                    className='font-medium text-xs sm:text-sm'
                  >
                    {property.area} {t('homePage.property.area')}
                  </Typography>
                </div>
              )}
            </div>

            <div className='flex items-center text-muted-foreground'>
              <Eye className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
              <Typography variant='small' className='text-xs sm:text-sm'>
                {property.views || 0}
              </Typography>
            </div>
          </div>

          {property.amenities && property.amenities.length > 0 && (
            <div className='flex items-start flex-wrap gap-1 mt-auto'>
              {property.amenities.slice(0, 2).map((amenity, index) => (
                <Button
                  key={index}
                  variant='secondary'
                  size='sm'
                  className='h-6 px-3 py-0 text-xs rounded-full hover:bg-secondary/80 transition-colors duration-200 min-w-[80px] flex items-center justify-center'
                >
                  {getAmenityIcon(amenity)}
                  <span className='ml-1 truncate'>{amenity}</span>
                </Button>
              ))}
              {property.amenities.length > 2 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='secondary'
                      size='sm'
                      className='h-6 px-3 py-0 text-xs rounded-full hover:bg-secondary/80 transition-colors duration-200 cursor-help min-w-[80px] flex items-center justify-center'
                    >
                      +{property.amenities.length - 2}{' '}
                      {t('homePage.property.more')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='top' className='max-w-xs z-50'>
                    <div className='space-y-1'>
                      <Typography variant='small' className='font-medium'>
                        {t('homePage.property.additionalAmenities')}:
                      </Typography>
                      {property.amenities.slice(2).map((amenity, index) => (
                        <Typography
                          key={index}
                          variant='small'
                          className='block'
                        >
                          • {amenity}
                        </Typography>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </Card>
    </TooltipProvider>
  )
}

export default PropertyCard
