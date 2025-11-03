import React, { useState } from 'react'
import classNames from 'classnames'
import { Card, CardContent } from '@/components/atoms/card'
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
  User,
  Phone,
  Camera,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'

interface PropertyCardProps {
  property: PropertyCardType
  onClick?: (property: PropertyCardType) => void
  onFavorite?: (property: PropertyCardType, isFavorite: boolean) => void
  className?: string
  bottomContent?: React.ReactNode
  // Optional user info for compact mode
  userInfo?: {
    name?: string
    avatar?: string
    postedDate?: string
  }
  // Image layout option for compact mode
  imageLayout?: 'left' | 'top'
  // Contact info for compact mode
  contactInfo?: {
    phone?: string
    phoneMasked?: string
    onShowPhone?: () => void
    isPhoneVisible?: boolean
  }
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onClick,
  onFavorite,
  className,
  bottomContent,
  userInfo,
  imageLayout = 'left',
  contactInfo,
}) => {
  const t = useTranslations()
  const { language } = useSwitchLanguage()
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const renderPrice = (price: number, currency: string) => {
    const isVnd = currency === 'VND'
    if (isVnd) {
      const formatted = formatByLocale(price, language)
      return formatted + (language === 'vi' ? '/tháng' : '/month')
    }
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
  const isCompact = className?.includes('compact')
  const isTopLayout = isCompact && imageLayout === 'top'
  const images = property.images || []
  const totalImages = images.length
  const mainImage = images[currentImageIndex] || images[0]
  const thumbnails = images.slice(0, 4) // Show max 4 thumbnails

  // Render image gallery for top layout
  const renderImageGallery = () => {
    if (!isTopLayout) return null

    return (
      <div className='flex gap-1.5'>
        {/* Main Image */}
        <div className='relative flex-1 aspect-[16/9] overflow-hidden rounded-md'>
          <ImageAtom
            src={mainImage || `${basePath}/images/default-image.jpg`}
            defaultImage={DEFAULT_IMAGE}
            alt={property.title}
            className='w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105'
          />

          {/* Image Count Badge */}
          {totalImages > 0 && (
            <div className='absolute bottom-1.5 left-1.5 flex items-center gap-0.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm'>
              <Camera className='w-2.5 h-2.5' />
              <span>{totalImages}</span>
            </div>
          )}

          {/* Favorite Button - Only show if no contact section */}
          {!contactInfo && (
            <Button
              variant='ghost'
              size='sm'
              className={classNames(
                'absolute top-1.5 right-1.5 w-6 h-6 p-0 rounded-full bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 z-10',
                {
                  'bg-destructive text-destructive-foreground hover:bg-destructive/90':
                    isFavorite,
                  'text-foreground hover:text-destructive': !isFavorite,
                },
              )}
              onClick={handleFavoriteClick}
            >
              <Heart
                className={classNames('w-3 h-3', {
                  'fill-current': isFavorite,
                })}
              />
            </Button>
          )}

          {/* Verified Badges */}
          {(property.verified || property.virtual_tour) && (
            <div className='absolute top-1.5 left-1.5 flex flex-col gap-0.5 z-10'>
              {property.verified && (
                <Badge className='bg-green-500 text-white text-[9px] px-1 py-0.5 rounded shadow-sm'>
                  ✓
                </Badge>
              )}
              {property.virtual_tour && (
                <Badge className='bg-blue-500 text-white text-[9px] px-1 py-0.5 rounded shadow-sm flex items-center gap-0.5'>
                  <Video className='w-2 h-2' />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {thumbnails.length > 1 && (
          <div className='flex flex-col gap-1 w-12 md:w-14'>
            {thumbnails.slice(0, 3).map((img, idx) => (
              <button
                key={idx}
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentImageIndex(idx)
                }}
                className={classNames(
                  'relative aspect-square overflow-hidden rounded border transition-all',
                  currentImageIndex === idx
                    ? 'border-primary ring-1 ring-primary/30 border-2'
                    : 'border border-border hover:border-primary/50 opacity-75 hover:opacity-100',
                )}
              >
                <ImageAtom
                  src={img || `${basePath}/images/default-image.jpg`}
                  defaultImage={DEFAULT_IMAGE}
                  alt={`${property.title} ${idx + 1}`}
                  className='w-full h-full object-cover'
                />
              </button>
            ))}
            {totalImages > 3 && (
              <div className='relative aspect-square overflow-hidden rounded border border-border bg-muted flex items-center justify-center'>
                <div className='text-center'>
                  <Typography
                    variant='small'
                    className='text-[9px] font-medium'
                  >
                    +{totalImages - 3}
                  </Typography>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Render single image for left layout
  const renderSingleImage = () => {
    if (isTopLayout) return null

    return (
      <div
        className={classNames(
          'relative overflow-hidden flex-shrink-0',
          isCompact
            ? 'w-40 md:w-48 h-full min-h-[140px] md:min-h-[160px]'
            : 'aspect-[4/3]',
        )}
      >
        <ImageAtom
          src={mainImage || `${basePath}/images/default-image.jpg`}
          defaultImage={DEFAULT_IMAGE}
          alt={property.title}
          className='w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105'
        />

        <Button
          variant='ghost'
          size='sm'
          className={classNames(
            'absolute p-0 rounded-full bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 z-10',
            isCompact
              ? 'top-1 right-1 w-6 h-6'
              : 'top-2 right-2 w-8 h-8 sm:top-3 sm:right-3 sm:w-9 sm:h-9',
            {
              'bg-destructive text-destructive-foreground hover:bg-destructive/90':
                isFavorite,
              'text-foreground hover:text-destructive': !isFavorite,
            },
          )}
          onClick={handleFavoriteClick}
        >
          <Heart
            className={classNames(
              {
                'fill-current': isFavorite,
              },
              isCompact ? 'w-3 h-3' : 'w-3 h-3 sm:w-4 sm:h-4',
            )}
          />
        </Button>

        {(property.verified || property.virtual_tour) && (
          <div
            className={classNames(
              'absolute flex flex-col gap-1 z-10',
              isCompact
                ? 'top-1 left-1 gap-0.5'
                : 'top-2 left-2 sm:top-3 sm:left-3 gap-1 sm:gap-2',
            )}
          >
            {property.verified && (
              <Badge
                className={classNames(
                  'bg-green-500 text-white rounded-md shadow-sm',
                  isCompact ? 'text-[10px] px-1 py-0.5' : 'text-xs px-2 py-1',
                )}
              >
                ✓ {!isCompact && t('homePage.property.verified')}
              </Badge>
            )}
            {property.virtual_tour && (
              <Badge
                className={classNames(
                  'bg-blue-500 text-white rounded-md shadow-sm flex items-center gap-1',
                  isCompact ? 'text-[10px] px-1 py-0.5' : 'text-xs px-2 py-1',
                )}
              >
                <Video className={isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
                {!isCompact && t('homePage.property.video')}
              </Badge>
            )}
          </div>
        )}

        {property.featured && (
          <Badge
            className={classNames(
              'absolute bg-yellow-500 text-white rounded-md shadow-sm flex items-center gap-1 z-10',
              isCompact
                ? 'top-1 right-8 text-[10px] px-1 py-0.5'
                : 'top-2 right-10 sm:top-3 sm:right-12 text-xs px-2 py-1',
            )}
          >
            <Star className={isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
            {!isCompact && t('homePage.property.featured')}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Card
        className={classNames(
          'group cursor-pointer transition-all duration-300 overflow-hidden',
          isCompact
            ? isTopLayout
              ? 'flex flex-col'
              : 'flex flex-row h-auto min-h-[140px] md:min-h-[160px]'
            : 'flex flex-col',
          className,
        )}
        onClick={handleClick}
      >
        {/* Image Gallery - Top Layout */}
        {isTopLayout && <div className='p-2 pb-1'>{renderImageGallery()}</div>}

        {/* Single Image - Left Layout */}
        {renderSingleImage()}

        <CardContent
          className={classNames(
            'flex-1 flex flex-col',
            isCompact
              ? isTopLayout
                ? 'px-2.5 pb-2.5 space-y-1.5'
                : 'p-2.5 space-y-1.5'
              : 'p-3 sm:p-4 space-y-2 sm:space-y-3',
          )}
        >
          <Typography
            variant='h6'
            className={classNames(
              'text-foreground group-hover:text-primary transition-colors duration-200 leading-tight font-semibold',
              isCompact
                ? 'text-sm line-clamp-2 mb-0.5'
                : 'text-sm sm:text-base line-clamp-2',
            )}
          >
            {property.title}
          </Typography>

          {/* Description - Only in compact mode */}
          {isCompact && property.description && (
            <Typography
              variant='small'
              className='text-xs text-muted-foreground line-clamp-2 mb-0.5'
            >
              {property.description}
            </Typography>
          )}

          <div className='flex items-center justify-between gap-2'>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='flex items-center text-xs sm:text-sm text-muted-foreground cursor-help flex-1 min-w-0'>
                  <MapPin
                    className={classNames(
                      'mr-0.5 flex-shrink-0',
                      isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3',
                    )}
                  />
                  <span className='truncate'>{fullAddress}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side='top' className='max-w-xs z-50'>
                <p className='break-words'>{fullAddress}</p>
              </TooltipContent>
            </Tooltip>

            {property.distance && !isCompact && (
              <div className='flex items-center text-xs text-muted-foreground flex-shrink-0'>
                <Navigation className='w-3 h-3 mr-1' />
                <span>
                  {property.distance} {t('homePage.property.distance')}
                </span>
              </div>
            )}
          </div>

          <div className='flex items-center justify-between'>
            <Typography
              variant='h5'
              className={classNames(
                'text-primary font-bold',
                isCompact ? 'text-sm' : 'text-base sm:text-lg',
              )}
            >
              {renderPrice(property.price, property.currency)}
            </Typography>
            {property.area && !isCompact && (
              <Typography
                variant='small'
                className='text-muted-foreground font-medium text-xs sm:text-sm'
              >
                {property.area} {t('homePage.property.area')}
              </Typography>
            )}
          </div>

          <div className='flex items-center justify-between'>
            <div
              className={classNames(
                'flex items-center',
                isCompact ? 'space-x-2' : 'space-x-2 sm:space-x-3 md:space-x-4',
              )}
            >
              <div
                className={classNames(
                  'flex items-center text-muted-foreground',
                  isCompact ? 'text-xs' : 'text-xs sm:text-sm',
                )}
              >
                <Bed
                  className={classNames(
                    'mr-0.5',
                    isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3 sm:w-4 sm:h-4',
                  )}
                />
                <Typography
                  variant='small'
                  className={classNames(
                    'font-medium',
                    isCompact ? 'text-xs' : 'text-xs sm:text-sm',
                  )}
                >
                  {property.bedrooms}
                </Typography>
              </div>
              <div
                className={classNames(
                  'flex items-center text-muted-foreground',
                  isCompact ? 'text-xs' : 'text-xs sm:text-sm',
                )}
              >
                <Bath
                  className={classNames(
                    'mr-0.5',
                    isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3 sm:w-4 sm:h-4',
                  )}
                />
                <Typography
                  variant='small'
                  className={classNames(
                    'font-medium',
                    isCompact ? 'text-xs' : 'text-xs sm:text-sm',
                  )}
                >
                  {property.bathrooms}
                </Typography>
              </div>
              {!isCompact && property.area && (
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

            {!isCompact && (
              <div className='flex items-center text-muted-foreground'>
                <Eye className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                <Typography variant='small' className='text-xs sm:text-sm'>
                  {property.views || 0}
                </Typography>
              </div>
            )}
          </div>

          {/* User Info & Contact - Only in compact mode */}
          {isCompact && (userInfo || contactInfo) && (
            <div className='flex items-center justify-between gap-2 mt-auto pt-1.5 border-t border-border'>
              {/* User Info */}
              {userInfo && (
                <div className='flex items-center gap-1.5 flex-1 min-w-0'>
                  <Avatar className='h-5 w-5 flex-shrink-0'>
                    {userInfo.avatar ? (
                      <AvatarImage
                        src={userInfo.avatar}
                        alt={userInfo.name || 'User'}
                      />
                    ) : (
                      <AvatarFallback className='bg-primary/10 text-primary text-xs'>
                        {userInfo.name ? (
                          userInfo.name.charAt(0).toUpperCase()
                        ) : (
                          <User className='w-3 h-3' />
                        )}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className='flex-1 min-w-0'>
                    {userInfo.name && (
                      <Typography
                        variant='small'
                        className='text-xs font-medium truncate'
                      >
                        {userInfo.name}
                      </Typography>
                    )}
                    {userInfo.postedDate && (
                      <Typography
                        variant='small'
                        className='text-[10px] text-muted-foreground'
                      >
                        {userInfo.postedDate}
                      </Typography>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Button */}
              {contactInfo && (
                <div className='flex items-center gap-1.5 flex-shrink-0'>
                  <Button
                    variant='default'
                    size='sm'
                    className={classNames(
                      'h-7 text-xs font-medium',
                      isTopLayout ? 'px-2.5' : 'px-2',
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      contactInfo.onShowPhone?.()
                    }}
                  >
                    <Phone className='w-3 h-3 mr-1' />
                    {contactInfo.isPhoneVisible && contactInfo.phone
                      ? contactInfo.phone
                      : contactInfo.phoneMasked ||
                        t('homePage.property.showPhone')}
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 w-7 p-0'
                    onClick={(e) => {
                      e.stopPropagation()
                      handleFavoriteClick(e)
                    }}
                  >
                    <Heart
                      className={classNames('w-3.5 h-3.5', {
                        'fill-current text-destructive': isFavorite,
                      })}
                    />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Bottom Content - Custom ReactNode */}
          {bottomContent && (
            <div className={classNames(isCompact ? 'mt-2' : 'mt-auto')}>
              {bottomContent}
            </div>
          )}

          {!isCompact &&
            property.amenities &&
            property.amenities.length > 0 && (
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
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default PropertyCard
