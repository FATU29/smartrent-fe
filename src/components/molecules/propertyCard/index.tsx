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
import SaveListingButton from '@/components/molecules/saveListingButton'
import CompareToggleBtn from '@/components/molecules/compareToggleBtn'
import { basePath, DEFAULT_IMAGE } from '@/constants'
import { useTranslations } from 'next-intl'
import {
  Bed,
  Bath,
  Square,
  Star,
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
    amenities,
    address,
    postDate,
    productType,
    vipType,
    furnishing,
    direction,
    roomCapacity,
    media,
  } = listing

  const images = media?.filter((m) => m.mediaType === 'IMAGE')
  const video = media?.find((m) => m.mediaType === 'VIDEO')

  const { firstName, lastName } = user || {}
  const userName = firstName && lastName ? `${firstName} ${lastName}` : ''

  const { fullNewAddress: newAddress, fullAddress: legacyAddress } =
    address || {}

  // Get primary image or first image
  const assetsImages = images?.map((img) => img.url) || []
  const assetsVideo = video?.url || null

  const t = useTranslations()
  const tCreatePost = useTranslations()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.(listing)
  }

  const isCompact = className?.includes('compact')
  const isTopLayout = isCompact && imageLayout === 'top'
  const totalImages = assetsImages?.length || 0
  const mainImage = assetsImages?.[0]
  const thumbnails = assetsImages || []

  // Helper functions for displaying additional fields

  const ProductTypeIconMap: Record<
    string,
    React.ComponentType<{ className?: string }>
  > = {
    APARTMENT: Building2,
    HOUSE: Home,
    ROOM: Users,
    STUDIO: Users,
  }
  const ProductTypeIcon = ProductTypeIconMap[productType || ''] || Home

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

  const renderImageGallery = () => {
    if (!isTopLayout) return null

    // Use currentImageIndex to show the selected image
    const displayImage = assetsImages?.[currentImageIndex] || mainImage

    return (
      <div className='flex gap-2'>
        {/* Main Image */}
        <div className='relative flex-1 aspect-video overflow-hidden rounded-lg'>
          {assetsVideo && currentImageIndex === 0 ? (
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
                className='w-full h-full object-cover object-center transition-transform duration-300 group-hover/card:scale-105'
              />
            )
          ) : (
            <ImageAtom
              src={displayImage || `${basePath}/images/default-image.jpg`}
              defaultImage={DEFAULT_IMAGE}
              alt={title}
              className='w-full h-full object-cover object-center transition-all duration-300 group-hover/card:scale-105'
            />
          )}

          {/* Image Count Badge */}
          {totalImages > 0 && (
            <div className='absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm'>
              <Camera className='w-3.5 h-3.5' />
              <span className='font-medium'>{totalImages}</span>
            </div>
          )}

          <div className='absolute top-2 right-2 flex gap-2 z-10'>
            <CompareToggleBtn
              listing={listing}
              variant='ghost'
              size='icon'
              className='bg-background/80 backdrop-blur-sm'
            />
            <SaveListingButton
              listingId={listing.listingId}
              variant='icon'
              className='bg-background/80 backdrop-blur-sm'
            />
          </div>

          {/* Badges - Top Left */}
          <div className='absolute top-2 left-2 flex flex-col gap-1 z-10'>
            {verified && (
              <Badge className='bg-green-500 text-white text-xs px-2 py-1 rounded shadow-sm flex items-center gap-1'>
                <Check className='w-3.5 h-3.5' />
                <span className='font-medium'>
                  {t('homePage.property.verified')}
                </span>
              </Badge>
            )}
            {vipBadgeConfig &&
              (() => {
                const VipIcon = vipBadgeConfig.icon
                return (
                  <Badge
                    className={`${vipBadgeConfig.className} text-xs px-2 py-1 rounded shadow-sm flex items-center gap-1`}
                  >
                    <VipIcon className='w-3.5 h-3.5' />
                    <span className='font-medium'>{vipBadgeConfig.label}</span>
                  </Badge>
                )
              })()}
          </div>
        </div>

        {/* Thumbnails */}
        {thumbnails.length > 1 && (
          <div className='flex flex-col gap-1.5 w-16 md:w-20'>
            {thumbnails.slice(0, 3).map((img, idx) => (
              <button
                key={idx}
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentImageIndex(idx)
                }}
                className={classNames(
                  'relative aspect-square overflow-hidden rounded-md border transition-all',
                  {
                    'border-primary ring-2 ring-primary/30 border-2':
                      currentImageIndex === idx,
                    'border border-border hover:border-primary/50 opacity-75 hover:opacity-100':
                      currentImageIndex !== idx,
                  },
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
              <div className='relative aspect-square overflow-hidden rounded-md border border-border bg-muted flex items-center justify-center'>
                <div className='text-center'>
                  <Typography variant='small' className='text-xs font-semibold'>
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
          className='w-full h-full object-cover object-center transition-transform duration-300 group-hover/card:scale-105'
        />

        <div
          className={classNames(
            'absolute flex gap-1 z-10',
            isCompact ? 'top-1 right-1' : 'top-2 right-2 sm:top-3 sm:right-3',
          )}
        >
          <CompareToggleBtn
            listing={listing}
            variant='ghost'
            size='icon'
            className={classNames(
              'bg-background/80 backdrop-blur-sm',
              isCompact ? 'w-6 h-6' : 'w-8 h-8 sm:w-9 sm:h-9',
            )}
          />
          <SaveListingButton
            listingId={listing.listingId}
            variant='icon'
            className={classNames(
              'bg-background/80 backdrop-blur-sm',
              isCompact
                ? 'w-6 h-6'
                : 'w-8 h-8 sm:top-3 sm:right-3 sm:w-9 sm:h-9',
            )}
            iconClassName={isCompact ? 'w-3 h-3' : 'w-3 h-3 sm:w-4 sm:h-4'}
          />
        </div>

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
          'group/card cursor-pointer transition-all duration-300 overflow-hidden',
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
          className={classNames('flex-1 flex flex-col', {
            'px-3 pb-3 pt-2 space-y-2': isCompact && isTopLayout,
            'p-2.5 space-y-1.5': isCompact && !isTopLayout,
            'p-3 sm:p-4 space-y-2 sm:space-y-3': !isCompact,
          })}
        >
          <div className='flex items-start justify-between gap-2'>
            <Typography
              variant='h6'
              className={classNames(
                'text-foreground group-hover/card:text-primary transition-colors duration-200 leading-tight font-semibold flex-1',
                isCompact
                  ? 'text-base md:text-lg line-clamp-2'
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
                        'flex items-center gap-1',
                        isCompact
                          ? 'text-xs px-2 py-0.5'
                          : 'text-[10px] px-1.5 py-0.5',
                      )}
                    >
                      {ProductTypeIcon && (
                        <ProductTypeIcon
                          className={isCompact ? 'w-3.5 h-3.5' : 'w-3 h-3'}
                        />
                      )}
                      {isCompact &&
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
            </div>
          </div>

          {/* Description - Only in compact mode */}
          {isCompact && description && (
            <Typography
              variant='small'
              className='text-sm text-muted-foreground line-clamp-2'
            >
              {description}
            </Typography>
          )}

          <div className='flex items-start gap-2'>
            <div className='flex-1 min-w-0'>
              <ul className='list-disc list-inside space-y-1'>
                {newAddress && (
                  <li
                    className={classNames(
                      'text-foreground',
                      isCompact ? 'text-sm' : 'text-xs sm:text-sm',
                    )}
                  >
                    <span className='font-medium'>
                      {t('apartmentDetail.address.new')}:
                    </span>{' '}
                    <span className='break-words'>{newAddress}</span>
                  </li>
                )}
                {legacyAddress && (
                  <li
                    className={classNames(
                      'text-muted-foreground',
                      isCompact ? 'text-sm' : 'text-xs sm:text-sm',
                    )}
                  >
                    <span className='font-medium'>
                      {t('apartmentDetail.address.old')}:
                    </span>{' '}
                    <span className='break-words'>{legacyAddress}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <Typography
              variant='h5'
              className={classNames(
                'text-primary font-bold',
                isCompact ? 'text-lg md:text-xl' : 'text-base sm:text-lg',
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
                isCompact ? 'gap-3' : 'space-x-2 sm:space-x-3 md:space-x-4',
              )}
            >
              {bedrooms !== undefined && (
                <div
                  className={classNames(
                    'flex items-center text-muted-foreground',
                    isCompact ? 'text-sm' : 'text-xs sm:text-sm',
                  )}
                >
                  <Bed
                    className={classNames(
                      'mr-1',
                      isCompact ? 'w-4 h-4' : 'w-3 h-3 sm:w-4 sm:h-4',
                    )}
                  />
                  <Typography
                    variant='small'
                    className={classNames(
                      'font-medium',
                      isCompact ? 'text-sm' : 'text-xs sm:text-sm',
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
                    isCompact ? 'text-sm' : 'text-xs sm:text-sm',
                  )}
                >
                  <Bath
                    className={classNames(
                      'mr-1',
                      isCompact ? 'w-4 h-4' : 'w-3 h-3 sm:w-4 sm:h-4',
                    )}
                  />
                  <Typography
                    variant='small'
                    className={classNames(
                      'font-medium',
                      isCompact ? 'text-sm' : 'text-xs sm:text-sm',
                    )}
                  >
                    {bathrooms}
                  </Typography>
                </div>
              )}
              {area && (
                <div
                  className={classNames(
                    'flex items-center text-muted-foreground',
                    isCompact ? 'text-sm' : 'text-xs sm:text-sm',
                  )}
                >
                  <Square
                    className={classNames(
                      'mr-1',
                      isCompact ? 'w-4 h-4' : 'w-3 h-3 sm:w-4 sm:h-4',
                    )}
                  />
                  <Typography
                    variant='small'
                    className={classNames(
                      'font-medium',
                      isCompact ? 'text-sm' : 'text-xs sm:text-sm',
                    )}
                  >
                    {area} m²
                  </Typography>
                </div>
              )}
              {roomCapacity && (
                <div
                  className={classNames(
                    'flex items-center text-muted-foreground',
                    isCompact ? 'text-sm' : 'text-xs sm:text-sm',
                  )}
                >
                  <Users
                    className={classNames(
                      'mr-1',
                      isCompact ? 'w-4 h-4' : 'w-3 h-3 sm:w-4 sm:h-4',
                    )}
                  />
                  <Typography
                    variant='small'
                    className={classNames(
                      'font-medium',
                      isCompact ? 'text-sm' : 'text-xs sm:text-sm',
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

          {/* User Info & Contact - Only show user info in compact mode, no phone button */}
          {isCompact && user && (
            <div className='flex items-center justify-between gap-2 mt-auto pt-2 border-t border-border'>
              {/* User Info */}
              <div className='flex items-center gap-2 flex-1 min-w-0'>
                <div className='flex-1 min-w-0'>
                  {userName && (
                    <Typography
                      variant='small'
                      className='text-sm font-medium truncate'
                    >
                      {userName}
                    </Typography>
                  )}
                  {postDate && (
                    <Typography
                      variant='small'
                      className='text-xs text-muted-foreground'
                    >
                      {formatDate(postDate, 'dd/MM/yyyy')}
                    </Typography>
                  )}
                </div>
              </div>
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
