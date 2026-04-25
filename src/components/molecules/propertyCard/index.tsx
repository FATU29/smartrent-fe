import React, { useState } from 'react'
import classNames from 'classnames'
import { Card, CardContent } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
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
  Camera,
  Check,
  Home,
  Building2,
  Users,
  Compass,
  Sofa,
  Sparkles,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { ListingDetail } from '@/api/types'
import { isYouTube, toYouTubeEmbed } from '@/utils/video/url'
import { formatByLocale } from '@/utils/currency/convert'
import {
  getProductTypeTranslationKey,
  getDirectionTranslationKey,
  getFurnishingTranslationKey,
} from '@/utils/property'
import BrokerAvatar from '@/components/molecules/brokerAvatar'

interface PropertyCardProps {
  listing: ListingDetail
  onClick?: (listing: ListingDetail) => void
  onFavorite?: (listing: ListingDetail, isFavorite: boolean) => void
  className?: string
  bottomContent?: React.ReactNode
  imageLayout?: 'left' | 'top'
}

// Stats pill component for consistent styling
const StatPill: React.FC<{
  icon: React.ReactNode
  value: React.ReactNode
  label?: string
}> = ({ icon, value, label }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/60 hover:bg-muted transition-colors duration-200'>
        <span className='text-primary'>{icon}</span>
        <Typography
          variant='small'
          className='font-semibold text-sm text-foreground'
        >
          {value}
        </Typography>
      </div>
    </TooltipTrigger>
    {label && (
      <TooltipContent side='top' className='z-50'>
        <p>{label}</p>
      </TooltipContent>
    )}
  </Tooltip>
)

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
    address,
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
  const userName = `${firstName || ''} ${lastName || ''}`.trim()
  const isProfessionalBroker =
    Boolean(user?.isBroker) || user?.brokerVerificationStatus === 'APPROVED'

  const { fullNewAddress: newAddress, fullAddress: legacyAddress } =
    address || {}

  const displayAddress = newAddress || legacyAddress

  // Get primary image or first image
  const assetsImages = images?.map((img) => img.url) || []
  const assetsVideo = video?.url || null

  const t = useTranslations()
  const tCreatePost = useTranslations()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger onClick if it's provided and not wrapped in Link
    if (onClick) {
      e.stopPropagation()
      onClick(listing)
    }
  }

  const isCompact = className?.includes('compact')
  const isTopLayout = isCompact && imageLayout === 'top'
  const totalImages = assetsImages?.length || 0
  const mainImage = assetsImages?.[0]
  const thumbnails = assetsImages || []
  const maxThumbnailSlots = 3
  const hasThumbnailOverflow = thumbnails.length > maxThumbnailSlots
  const visibleThumbnails = hasThumbnailOverflow
    ? thumbnails.slice(0, maxThumbnailSlots - 1)
    : thumbnails.slice(0, maxThumbnailSlots)
  const hiddenThumbnailCount = thumbnails.length - visibleThumbnails.length

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
    if (!vipType || vipType === 'NORMAL' || vipType === 'SILVER') return null
    return {
      label: t('homePage.priorityBadge'),
      className:
        'bg-gradient-to-r from-primary to-primary/80 text-white shadow-sm',
      borderClassName: 'ring-1 ring-primary/30',
      icon: Sparkles,
    }
  }

  const vipBadgeConfig = getVipBadgeConfig()

  // Get VIP card border style
  const getVipCardBorder = () => {
    if (!vipType || vipType === 'NORMAL') return ''
    const borders: Record<string, string> = {
      SILVER: 'ring-1 ring-gray-300/50',
      GOLD: 'ring-1 ring-yellow-400/50',
      DIAMOND: 'ring-1 ring-blue-400/50',
    }
    return borders[vipType] || ''
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1))
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1))
  }

  const renderImageGallery = () => {
    if (!isTopLayout) return null

    // Use currentImageIndex to show the selected image
    const displayImage = assetsImages?.[currentImageIndex] || mainImage

    return (
      <div className='p-2 pb-1'>
        <div className='flex gap-2 h-[220px] md:h-[244px]'>
          {/* Main Image */}
          <div className='relative flex-1 h-full overflow-hidden rounded-lg'>
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
                  className='w-full h-full object-cover object-center transition-transform duration-500 group-hover/card:scale-105'
                />
              )
            ) : (
              <ImageAtom
                src={displayImage || `${basePath}/images/default-image.jpg`}
                defaultImage={DEFAULT_IMAGE}
                alt={title}
                className='w-full h-full object-cover object-center transition-all duration-500 group-hover/card:scale-105'
              />
            )}

            {/* Bottom gradient overlay */}
            <div className='absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none' />

            {/* Image navigation arrows - only show on hover */}
            {totalImages > 1 && (
              <>
                <button
                  type='button'
                  onClick={handlePrevImage}
                  className='absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 hover:bg-card shadow-sm z-10'
                  aria-label='Previous image'
                >
                  <ChevronLeft className='w-4 h-4 text-foreground' />
                </button>
                <button
                  type='button'
                  onClick={handleNextImage}
                  className='absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 hover:bg-card shadow-sm z-10'
                  aria-label='Next image'
                >
                  <ChevronRight className='w-4 h-4 text-foreground' />
                </button>
              </>
            )}

            {/* Image Count Badge */}
            {totalImages > 0 && (
              <div className='absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-md'>
                <Camera className='w-3.5 h-3.5' />
                <span className='font-medium'>{totalImages}</span>
              </div>
            )}

            {/* Image dots indicator */}
            {totalImages > 1 && totalImages <= 5 && (
              <div className='absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1'>
                {assetsImages.slice(0, 5).map((img, idx) => (
                  <span
                    key={`dot-${idx}-${img || ''}`}
                    className={classNames(
                      'w-1.5 h-1.5 rounded-full transition-all duration-200',
                      currentImageIndex === idx
                        ? 'bg-white w-3'
                        : 'bg-white/50',
                    )}
                  />
                ))}
              </div>
            )}

            <div className='absolute top-2 right-2 flex gap-1.5 z-10'>
              <CompareToggleBtn
                listing={listing}
                variant='ghost'
                size='icon'
                className='bg-card/80 backdrop-blur-md hover:bg-card shadow-sm rounded-full transition-all duration-200'
              />
              <SaveListingButton
                listingId={listing.listingId}
                variant='icon'
                className='bg-card/80 backdrop-blur-md hover:bg-card shadow-sm rounded-full transition-all duration-200'
              />
            </div>

            {/* Badges - Top Left */}
            <div className='absolute top-2 left-2 flex flex-col gap-1.5 z-10'>
              {verified && (
                <Badge className='bg-emerald-500/90 text-white text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 backdrop-blur-sm'>
                  <Check className='w-3 h-3' />
                  <span className='font-medium text-[11px]'>
                    {t('homePage.property.verified')}
                  </span>
                </Badge>
              )}
              {vipBadgeConfig &&
                (() => {
                  const VipIcon = vipBadgeConfig.icon
                  return (
                    <Badge
                      className={`${vipBadgeConfig.className} text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 backdrop-blur-sm`}
                    >
                      <VipIcon className='w-3 h-3' />
                      <span className='font-medium text-[11px]'>
                        {vipBadgeConfig.label}
                      </span>
                    </Badge>
                  )
                })()}
            </div>
          </div>

          {/* Thumbnails */}
          {thumbnails.length > 1 && (
            <div className='flex h-full flex-col gap-2 w-[68px] md:w-[76px] shrink-0 overflow-hidden'>
              {visibleThumbnails.map((img, idx) => (
                <button
                  key={`thumb-${idx}-${img || ''}`}
                  type='button'
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setCurrentImageIndex(idx)
                  }}
                  className={classNames(
                    'relative size-[68px] md:size-[76px] aspect-square shrink-0 rounded-xl p-[2px] transition-all duration-200',
                    {
                      'bg-primary ring-1 ring-primary/25 shadow-sm':
                        currentImageIndex === idx,
                      'bg-transparent ring-1 ring-border/50 hover:ring-primary/40 opacity-80 hover:opacity-100':
                        currentImageIndex !== idx,
                    },
                  )}
                >
                  <div className='h-full w-full overflow-hidden rounded-[10px]'>
                    <ImageAtom
                      src={img || `${basePath}/images/default-image.jpg`}
                      defaultImage={DEFAULT_IMAGE}
                      alt={`${title} ${idx + 1}`}
                      className='w-full h-full object-cover'
                    />
                  </div>
                </button>
              ))}
              {hasThumbnailOverflow && (
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setCurrentImageIndex(visibleThumbnails.length)
                  }}
                  className='relative size-[68px] md:size-[76px] aspect-square shrink-0 overflow-hidden rounded-xl ring-1 ring-border/60 bg-muted/80 flex items-center justify-center cursor-pointer hover:bg-muted transition-colors'
                >
                  <div className='text-center'>
                    <Typography
                      variant='small'
                      className='text-xs font-bold text-muted-foreground'
                    >
                      +{hiddenThumbnailCount}
                    </Typography>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
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
          className='w-full h-full object-cover object-center transition-transform duration-500 group-hover/card:scale-105'
        />

        {/* Bottom gradient */}
        <div className='absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent pointer-events-none' />

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
              'bg-card/80 backdrop-blur-md rounded-full shadow-sm hover:bg-card transition-all',
              isCompact ? 'w-6 h-6' : 'w-8 h-8 sm:w-9 sm:h-9',
            )}
          />
          <SaveListingButton
            listingId={listing.listingId}
            variant='icon'
            className={classNames(
              'bg-card/80 backdrop-blur-md rounded-full shadow-sm hover:bg-card transition-all',
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
                'bg-emerald-500/90 text-white rounded-full shadow-md flex items-center gap-0.5 backdrop-blur-sm',
                isCompact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1',
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
                    `${vipBadgeConfig.className} rounded-full shadow-md flex items-center gap-0.5 backdrop-blur-sm`,
                    isCompact
                      ? 'text-[10px] px-1.5 py-0.5'
                      : 'text-xs px-2.5 py-1',
                  )}
                >
                  <VipIcon className={isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
                  {!isCompact && vipBadgeConfig.label}
                </Badge>
              )
            })()}
        </div>

        {/* Image count - bottom left */}
        {totalImages > 0 && (
          <div
            className={classNames(
              'absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/60 text-white rounded-full backdrop-blur-md',
              isCompact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5',
            )}
          >
            <Camera className={isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
            <span className='font-medium'>{totalImages}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Card
        className={classNames(
          'group/card cursor-pointer overflow-hidden transition-all duration-300 py-0',
          'hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5',
          'border-border/60 hover:border-primary/30',
          getVipCardBorder(),
          isCompact
            ? isTopLayout
              ? 'flex flex-col h-full'
              : 'flex flex-row h-auto min-h-[140px] md:min-h-[160px]'
            : 'flex flex-col h-full',
          className,
        )}
        onClick={onClick ? handleClick : undefined}
      >
        {/* Image Gallery - Top Layout */}
        {isTopLayout && renderImageGallery()}

        {/* Single Image - Left Layout */}
        {renderSingleImage()}

        <CardContent
          className={classNames('flex-1 flex flex-col', {
            'px-3 pb-3 pt-2 space-y-2.5': isCompact && isTopLayout,
            'p-2.5 space-y-1.5': isCompact && !isTopLayout,
            'p-3 sm:p-4 space-y-2 sm:space-y-3': !isCompact,
          })}
        >
          {/* Title & Property Type Row */}
          <div className='flex items-start justify-between gap-2'>
            <Typography
              variant='h6'
              className={classNames(
                'text-foreground group-hover/card:text-primary transition-colors duration-200 leading-tight font-semibold flex-1',
                isCompact
                  ? 'text-base md:text-lg line-clamp-2 min-h-[2.75rem]'
                  : 'text-sm sm:text-base line-clamp-2',
              )}
            >
              {title}
            </Typography>
            {/* Property Type Badge */}
            <div className='flex items-center gap-1 flex-shrink-0'>
              {productType && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant='secondary'
                      className={classNames(
                        'flex items-center gap-1 rounded-full font-medium',
                        isCompact
                          ? 'text-xs px-2.5 py-0.5'
                          : 'text-[10px] px-2 py-0.5',
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

          {/* Address - Compact one-liner with icon */}
          {displayAddress && (
            <div className='flex items-start gap-1.5 min-w-0'>
              <MapPin
                className={classNames(
                  'flex-shrink-0 text-muted-foreground mt-0.5',
                  isCompact ? 'w-3.5 h-3.5' : 'w-3 h-3',
                )}
              />
              <Typography
                variant='small'
                className={classNames(
                  'text-muted-foreground line-clamp-1 leading-snug',
                  isCompact ? 'text-sm' : 'text-xs sm:text-sm',
                )}
              >
                {displayAddress}
              </Typography>
            </div>
          )}

          {/* Price Row */}
          <div className='flex items-center justify-between gap-2'>
            <Typography
              variant='h5'
              className={classNames(
                'text-primary font-bold tracking-tight',
                isCompact ? 'text-lg md:text-xl' : 'text-base sm:text-lg',
              )}
            >
              {formatByLocale(price, priceUnit)}
            </Typography>
            {/* Area as secondary price info */}
            {area && isCompact && (
              <Typography
                variant='small'
                className='text-xs text-muted-foreground font-medium bg-muted/60 px-2 py-0.5 rounded-full'
              >
                {formatByLocale(Math.round(price / area), 'VND')}
                /m²
              </Typography>
            )}
          </div>

          {/* Property Stats - Pill Style */}
          <div className='flex items-center flex-wrap gap-2'>
            {bedrooms !== undefined && (
              <StatPill
                icon={<Bed className={isCompact ? 'w-3.5 h-3.5' : 'w-3 h-3'} />}
                value={bedrooms}
                label={`${bedrooms} ${t('homePage.property.bedrooms')}`}
              />
            )}
            {bathrooms !== undefined && (
              <StatPill
                icon={
                  <Bath className={isCompact ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
                }
                value={bathrooms}
                label={`${bathrooms} ${t('homePage.property.bathrooms')}`}
              />
            )}
            {area && (
              <StatPill
                icon={
                  <Square className={isCompact ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
                }
                value={`${area} m²`}
              />
            )}
            {roomCapacity && (
              <StatPill
                icon={
                  <Users className={isCompact ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
                }
                value={roomCapacity}
                label={`${t('homePage.property.capacity')}: ${roomCapacity}`}
              />
            )}
            {/* Compact inline furnishing & direction */}
            {furnishing && isCompact && (
              <StatPill
                icon={<Sofa className='w-3.5 h-3.5' />}
                value={tCreatePost(getFurnishingTranslationKey(furnishing))}
                label={`${t('apartmentDetail.property.furnishing')}: ${tCreatePost(getFurnishingTranslationKey(furnishing))}`}
              />
            )}
            {direction && isCompact && (
              <StatPill
                icon={<Compass className='w-3.5 h-3.5' />}
                value={tCreatePost(getDirectionTranslationKey(direction))}
                label={`${t('apartmentDetail.property.direction')}: ${tCreatePost(getDirectionTranslationKey(direction))}`}
              />
            )}
          </div>

          {/* Description - Only in compact mode */}
          {isCompact && (
            <div className='min-h-[2.75rem]'>
              {description && (
                <Typography
                  variant='small'
                  className='text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed'
                >
                  {description}
                </Typography>
              )}
            </div>
          )}

          {/* Non-compact layout: furnishing & direction */}
          {!isCompact && (furnishing || direction) && (
            <div className='flex items-center gap-1.5 flex-wrap'>
              {furnishing && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 hover:bg-muted transition-colors'>
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
              {direction && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 hover:bg-muted transition-colors'>
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
          )}

          {/* User Info & Post Date Footer */}
          {user && (
            <div className='flex items-center justify-between gap-2 mt-auto pt-2.5 border-t border-border/60'>
              <div className='flex items-center gap-2 flex-1 min-w-0'>
                <BrokerAvatar
                  avatarUrl={user.avatarUrl}
                  firstName={firstName}
                  lastName={lastName}
                  sizeClassName={isCompact ? 'size-10' : 'size-9'}
                  showBrokerBadge={isProfessionalBroker}
                  fallbackClassName={isCompact ? 'text-sm' : 'text-xs'}
                />
                <div className='flex-1 min-w-0'>
                  {userName && (
                    <Typography
                      variant='small'
                      className={classNames(
                        'font-medium truncate block',
                        isCompact ? 'text-sm' : 'text-xs sm:text-sm',
                      )}
                    >
                      {userName}
                    </Typography>
                  )}
                  {isProfessionalBroker && (
                    <span className='inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/20 dark:text-emerald-300'>
                      {t('userMenu.proBroker')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Content - Custom ReactNode */}
          {bottomContent && <div className='mt-2'>{bottomContent}</div>}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default PropertyCard
