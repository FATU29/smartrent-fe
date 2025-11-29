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
import { basePath, DEFAULT_IMAGE } from '@/constants'
import { useTranslations } from 'next-intl'
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Square,
  Star,
  Phone,
  Camera,
  Check,
  Home,
  Building2,
  Users,
  Compass,
  Sofa,
  Crown,
  Sparkles,
} from 'lucide-react'
import { ListingDetail } from '@/api/types'
import { getAmenityIcon } from '@/constants/amenities'
import { formatDate } from 'date-fns'
import { isYouTube, toYouTubeEmbed } from '@/utils/video/url'
import { formatByLocale } from '@/utils/currency/convert'
import {
  getProductTypeTranslationKey,
  getDirectionTranslationKey,
  getFurnishingTranslationKey,
} from '@/utils/property'

interface PropertyCardProps {
  listing: ListingDetail
  onClick?: (listing: ListingDetail) => void
  onFavorite?: (listing: ListingDetail, isFavorite: boolean) => void
  className?: string
  bottomContent?: React.ReactNode
  imageLayout?: 'left' | 'top'
}

const PropertyCard: React.FC<PropertyCardProps> = (props) => {
  const {
    listing,
    onClick,
    onFavorite,
    className,
    bottomContent,
    imageLayout = 'left',
  } = props

  const {
    title,
    description,
    price,
    priceUnit,
    area,
    bedrooms,
    bathrooms,
    verified,
    user,
    assets,
    amenities,
    address,
    postDate,
    productType,
    listingType,
    vipType,
    furnishing,
    direction,
    roomCapacity,
  } = listing

  const { images: assetsImages, video: assetsVideo } = assets || {}

  const { firstName, lastName, phoneNumber } = user || {}

  const userName = `${firstName} ${lastName}`

  const { new: newAddress, legacy: legacyAddress } = address || {}

  const t = useTranslations()
  const tCreatePost = useTranslations()
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.(listing)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newFavoriteState = !isFavorite
    setIsFavorite(newFavoriteState)
    onFavorite?.(listing, newFavoriteState)
  }

  const isCompact = className?.includes('compact')
  const isTopLayout = isCompact && imageLayout === 'top'
  const totalImages = assetsImages?.length || 0
  const mainImage = assetsImages?.[0]
  const thumbnails = assetsImages || []

  // Helper functions for displaying additional fields

  const getProductTypeIcon = () => {
    switch (productType) {
      case 'APARTMENT':
        return Building2
      case 'HOUSE':
        return Home
      case 'ROOM':
      case 'STUDIO':
        return Users
      default:
        return Home
    }
  }

  const getVipBadgeConfig = () => {
    if (!vipType || vipType === 'NORMAL') return null
    const configs: Record<
      string,
      {
        label: string
        className: string
        icon: React.ComponentType<{ className?: string }>
      }
    > = {
      SILVER: {
        label: 'VIP Silver',
        className: 'bg-gray-500 text-white',
        icon: Sparkles,
      },
      GOLD: {
        label: 'VIP Gold',
        className: 'bg-yellow-500 text-white',
        icon: Crown,
      },
      DIAMOND: {
        label: 'VIP Diamond',
        className: 'bg-blue-500 text-white',
        icon: Crown,
      },
    }
    return configs[vipType]
  }

  const vipBadgeConfig = getVipBadgeConfig()
  const ProductTypeIcon = getProductTypeIcon()

  const renderImageGallery = () => {
    if (!isTopLayout) return null

    return (
      <div className='flex gap-1.5'>
        {/* Main Image */}
        <div className='relative flex-1 aspect-[16/9] overflow-hidden rounded-md'>
          {assetsVideo ? (
            isYouTube(assetsVideo) ? (
              <div className='w-full h-full'>
                <iframe
                  src={toYouTubeEmbed(assetsVideo) || ''}
                  className='w-full h-full'
                  title={`video-${listing.listingId}`}
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                  allowFullScreen
                />
              </div>
            ) : (
              <video
                src={assetsVideo}
                controls
                className='w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105'
              />
            )
          ) : (
            <ImageAtom
              src={mainImage || `${basePath}/images/default-image.jpg`}
              defaultImage={DEFAULT_IMAGE}
              alt={title}
              className='w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105'
            />
          )}

          {/* Image Count Badge */}
          {totalImages > 0 && (
            <div className='absolute bottom-1.5 left-1.5 flex items-center gap-0.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm'>
              <Camera className='w-2.5 h-2.5' />
              <span>{totalImages}</span>
            </div>
          )}

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

          {/* Badges - Top Left */}
          <div className='absolute top-1.5 left-1.5 flex flex-col gap-0.5 z-10'>
            {verified && (
              <Badge className='bg-green-500 text-white text-[9px] px-1 py-0.5 rounded shadow-sm flex items-center justify-center'>
                <Check className='w-2.5 h-2.5' />
              </Badge>
            )}
            {vipBadgeConfig &&
              (() => {
                const VipIcon = vipBadgeConfig.icon
                return (
                  <Badge
                    className={`${vipBadgeConfig.className} text-[9px] px-1 py-0.5 rounded shadow-sm flex items-center gap-0.5`}
                  >
                    <VipIcon className='w-2.5 h-2.5' />
                  </Badge>
                )
              })()}
          </div>
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
                  alt={`${title} ${idx + 1}`}
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
          alt={title}
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

        {/* Badges - Top Left */}
        <div
          className={classNames(
            'absolute flex flex-col gap-1 z-10',
            isCompact
              ? 'top-1 left-1 gap-0.5'
              : 'top-2 left-2 sm:top-3 sm:left-3 gap-1 sm:gap-2',
          )}
        >
          {verified && (
            <Badge
              className={classNames(
                'bg-green-500 text-white rounded-md shadow-sm flex items-center gap-0.5',
                isCompact ? 'text-[10px] px-1 py-0.5' : 'text-xs px-2 py-1',
              )}
            >
              <Check className={isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
              {!isCompact && t('homePage.property.verified')}
            </Badge>
          )}
          {vipBadgeConfig &&
            (() => {
              const VipIcon = vipBadgeConfig.icon
              return (
                <Badge
                  className={classNames(
                    `${vipBadgeConfig.className} rounded-md shadow-sm flex items-center gap-0.5`,
                    isCompact ? 'text-[10px] px-1 py-0.5' : 'text-xs px-2 py-1',
                  )}
                >
                  <VipIcon className={isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
                  {!isCompact && vipBadgeConfig.label}
                </Badge>
              )
            })()}
        </div>

        {amenities && amenities.length > 0 && (
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
          <div className='flex items-start justify-between gap-2'>
            <Typography
              variant='h6'
              className={classNames(
                'text-foreground group-hover:text-primary transition-colors duration-200 leading-tight font-semibold flex-1',
                isCompact
                  ? 'text-sm line-clamp-2'
                  : 'text-sm sm:text-base line-clamp-2',
              )}
            >
              {title}
            </Typography>
            {/* Property Type & Listing Type Badges */}
            <div className='flex items-center gap-1 flex-shrink-0'>
              {productType && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant='secondary'
                      className={classNames(
                        'flex items-center gap-0.5',
                        isCompact
                          ? 'text-[9px] px-1 py-0'
                          : 'text-[10px] px-1.5 py-0.5',
                      )}
                    >
                      {ProductTypeIcon && (
                        <ProductTypeIcon
                          className={isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'}
                        />
                      )}
                      {!isCompact &&
                        tCreatePost(getProductTypeTranslationKey(productType))}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side='top' className='z-50'>
                    <p>
                      {tCreatePost(getProductTypeTranslationKey(productType)) ||
                        productType}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
              {listingType === 'SHARE' && (
                <Badge
                  variant='outline'
                  className={classNames(
                    'text-[9px] px-1 py-0 border-primary/30 text-primary',
                    isCompact ? '' : 'text-[10px] px-1.5 py-0.5',
                  )}
                >
                  Share
                </Badge>
              )}
            </div>
          </div>

          {/* Description - Only in compact mode */}
          {isCompact && description && (
            <Typography
              variant='small'
              className='text-xs text-muted-foreground line-clamp-2 mb-0.5'
            >
              {description}
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
                  <span className='truncate'>
                    {newAddress}
                    {legacyAddress && (
                      <span className='text-muted-foreground/70'>
                        {' '}
                        • {legacyAddress}
                      </span>
                    )}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side='top' className='max-w-xs z-50'>
                <p className='break-words'>
                  {newAddress}
                  {legacyAddress && (
                    <>
                      <br />
                      <span className='text-muted-foreground/70'>
                        {legacyAddress}
                      </span>
                    </>
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className='flex items-center justify-between'>
            <Typography
              variant='h5'
              className={classNames(
                'text-primary font-bold',
                isCompact ? 'text-sm' : 'text-base sm:text-lg',
              )}
            >
              {formatByLocale(price, priceUnit)}
            </Typography>
            {area && !isCompact && (
              <Typography
                variant='small'
                className='text-muted-foreground font-medium text-xs sm:text-sm'
              >
                {area} {t('homePage.property.area')}
              </Typography>
            )}
          </div>

          <div className='flex items-center justify-between flex-wrap gap-2'>
            <div
              className={classNames(
                'flex items-center flex-wrap',
                isCompact ? 'space-x-2' : 'space-x-2 sm:space-x-3 md:space-x-4',
              )}
            >
              {bedrooms !== undefined && (
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
                    {bedrooms}
                  </Typography>
                </div>
              )}
              {bathrooms !== undefined && (
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
                    {bathrooms}
                  </Typography>
                </div>
              )}
              {!isCompact && area && (
                <div className='flex items-center text-xs sm:text-sm text-muted-foreground'>
                  <Square className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                  <Typography
                    variant='small'
                    className='font-medium text-xs sm:text-sm'
                  >
                    {area} {t('homePage.property.area')}
                  </Typography>
                </div>
              )}
              {roomCapacity && listingType === 'SHARE' && (
                <div
                  className={classNames(
                    'flex items-center text-muted-foreground',
                    isCompact ? 'text-xs' : 'text-xs sm:text-sm',
                  )}
                >
                  <Users
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
                    {roomCapacity}
                  </Typography>
                </div>
              )}
            </div>
            {/* Additional Info - Right Side */}
            <div className='flex items-center gap-1.5 flex-wrap'>
              {furnishing && !isCompact && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 hover:bg-muted transition-colors'>
                      <Sofa className='w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0' />
                      <Typography
                        variant='small'
                        className='font-medium text-xs sm:text-sm'
                      >
                        {tCreatePost(getFurnishingTranslationKey(furnishing))}
                      </Typography>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side='top' className='z-50'>
                    <p>
                      {t('apartmentDetail.property.furnishing')}:{' '}
                      {tCreatePost(getFurnishingTranslationKey(furnishing))}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
              {direction && !isCompact && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 hover:bg-muted transition-colors'>
                      <Compass className='w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0' />
                      <Typography
                        variant='small'
                        className='font-medium text-xs sm:text-sm'
                      >
                        {tCreatePost(getDirectionTranslationKey(direction))}
                      </Typography>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side='top' className='z-50'>
                    <p>
                      {t('apartmentDetail.property.direction')}:{' '}
                      {tCreatePost(getDirectionTranslationKey(direction))}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* User Info & Contact - Only in compact mode */}
          {isCompact && user && (
            <div className='flex items-center justify-between gap-2 mt-auto pt-1.5 border-t border-border'>
              {/* User Info */}
              {user && (
                <div className='flex items-center gap-1.5 flex-1 min-w-0'>
                  <div className='flex-1 min-w-0'>
                    {userName && (
                      <Typography
                        variant='small'
                        className='text-xs font-medium truncate'
                      >
                        {userName}
                      </Typography>
                    )}
                    {postDate && (
                      <Typography
                        variant='small'
                        className='text-[10px] text-muted-foreground'
                      >
                        {formatDate(postDate, 'dd/MM/yyyy')}
                      </Typography>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Button */}
              {phoneNumber && (
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
                    }}
                  >
                    <Phone className='w-3 h-3 mr-1' />
                    {phoneNumber}
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

          {!isCompact && amenities && amenities.length > 0 && (
            <div className='flex items-start flex-wrap gap-1 mt-auto'>
              {amenities.slice(0, 2).map((amenity, index) => {
                const IconComponent = getAmenityIcon(amenity.name)
                return (
                  <Button
                    key={index}
                    variant='secondary'
                    size='sm'
                    className='h-6 px-3 py-0 text-xs rounded-full hover:bg-secondary/80 transition-colors duration-200 min-w-[80px] flex items-center justify-center'
                  >
                    {IconComponent ? (
                      <IconComponent className='w-3 h-3' />
                    ) : null}
                    <span className='ml-1 truncate'>{amenity.name}</span>
                  </Button>
                )
              })}
              {amenities.length > 2 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='secondary'
                      size='sm'
                      className='h-6 px-3 py-0 text-xs rounded-full hover:bg-secondary/80 transition-colors duration-200 cursor-help min-w-[80px] flex items-center justify-center'
                    >
                      +{amenities.length - 2} {t('homePage.property.more')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='top' className='max-w-xs z-50'>
                    <div className='space-y-1'>
                      <Typography variant='small' className='font-medium'>
                        {t('homePage.property.additionalAmenities')}:
                      </Typography>
                      {amenities.slice(2).map((amenity, index) => (
                        <Typography
                          key={index}
                          variant='small'
                          className='block'
                        >
                          • {amenity.name}
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
