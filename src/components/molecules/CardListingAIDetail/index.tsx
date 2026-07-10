import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  MapPin,
  Bath,
  ArrowRight,
  Phone,
  Sofa,
  Compass,
  Droplets,
  Zap,
  Wifi,
  DollarSign,
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import { formatByLocale } from '@/utils/currency/convert'
import { useLanguage } from '@/hooks/useLanguage'
import { DEFAULT_IMAGE } from '@/constants/common'
import type { ChatListing } from '@/api/types/ai.type'

export interface CardListingAIDetailProps {
  listing: ChatListing
  compact?: boolean
  className?: string
  // When provided, "View Details" triggers an in-chat detail lookup instead of
  // navigating to /listing-detail/:id in a new tab.
  onViewDetail?: (listingId: number) => void
}

const UTILITY_ICONS: Record<string, React.ElementType> = {
  waterPrice: Droplets,
  electricityPrice: Zap,
  internetPrice: Wifi,
  serviceFee: DollarSign,
}

// Maps the API price field to its short label key under chat.listing.utilities.
const UTILITY_LABEL_KEYS: Record<string, string> = {
  waterPrice: 'water',
  electricityPrice: 'electricity',
  internetPrice: 'internet',
  serviceFee: 'service',
}

export const CardListingAIDetail: React.FC<CardListingAIDetailProps> = ({
  listing,
  compact = false,
  className,
  onViewDetail,
}) => {
  const t = useTranslations('chat.listing')
  const tFurnishing = useTranslations(
    'createPost.sections.propertyInfo.furnishing',
  )
  const tDirection = useTranslations(
    'createPost.sections.utilitiesStructure.directions',
  )
  const tHome = useTranslations('homePage')
  const { language } = useLanguage()

  const {
    listingId,
    title,
    price,
    priceUnit,
    area,
    bedrooms,
    bathrooms,
    address,
    media,
    furnishing,
    direction,
    amenities,
    waterPrice,
    electricityPrice,
    internetPrice,
    serviceFee,
    user,
    ownerContactPhoneNumber,
    vipType,
    expired,
    listingStatus,
  } = listing

  // Gallery images, primary first, with a safe fallback so there is always
  // at least one slide.
  const images = React.useMemo(() => {
    const withUrl = (media || []).filter((m) => Boolean(m.url))
    const ordered = [...withUrl].sort(
      (a, b) => Number(b.isPrimary) - Number(a.isPrimary),
    )
    const urls = ordered.map((m) => m.url)
    return urls.length > 0 ? urls : [DEFAULT_IMAGE]
  }, [media])
  const totalImages = images.length
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1))
  }
  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1))
  }

  const formattedPrice = formatByLocale(price, language)
  const priceLabel =
    priceUnit === 'YEAR' ? '/năm' : priceUnit === 'DAY' ? '/ngày' : '/tháng'

  const contactPhone =
    ownerContactPhoneNumber ||
    (user ? `${user.phoneCode || ''}${user.phoneNumber || ''}` : '')

  // Only surface utilities that have a meaningful value — "0 đ" rows are noise.
  const utilities = [
    { key: 'waterPrice', value: waterPrice },
    { key: 'electricityPrice', value: electricityPrice },
    { key: 'internetPrice', value: internetPrice },
    { key: 'serviceFee', value: serviceFee },
  ].filter(
    (u) => u.value !== null && u.value !== undefined && Number(u.value) > 0,
  )

  const visibleAmenities = (amenities || [])
    .map((a) =>
      typeof a === 'string' ? a : (a as { name?: string })?.name || '',
    )
    .filter(Boolean) as string[]

  const isVip = vipType === 'DIAMOND' || vipType === 'GOLD'
  const isAvailable = !expired && listingStatus !== 'EXPIRED'

  const cleanPhone = contactPhone
    ? contactPhone.replaceAll(' ', '').replaceAll('.', '').replaceAll('-', '')
    : ''

  const amenityLimit = compact ? 3 : 4

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl overflow-hidden flex flex-col w-full max-w-sm',
        'transition-shadow hover:shadow-md',
        className,
      )}
    >
      {/* ── Image hero ── */}
      {/* Fixed height (not aspect-ratio): keeps the card from ballooning when
          the chat window is widened, so a bigger window shows MORE cards
          instead of a taller hero. */}
      <div
        className={cn(
          'group relative w-full bg-muted',
          compact ? 'h-36' : 'h-44',
        )}
      >
        <Image
          src={images[currentImageIndex]}
          alt={title}
          fill
          className='object-cover'
          sizes='(max-width: 640px) 90vw, 400px'
        />

        {isVip && (
          <span className='absolute top-2 left-2 inline-flex items-center gap-1 bg-white/95 text-foreground rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm z-10'>
            <Star
              className='w-3 h-3 fill-yellow-400 stroke-yellow-400'
              aria-hidden='true'
            />
            {tHome('priorityBadge')}
          </span>
        )}

        {isAvailable && (
          <span className='absolute top-2 right-2 inline-flex items-center gap-1 bg-emerald-500/95 text-white rounded-full px-2 py-0.5 text-xs font-medium shadow-sm z-10'>
            <Check className='w-3 h-3' aria-hidden='true' />
            {t('available')}
          </span>
        )}

        {/* Gallery controls — arrows reveal on hover (always visible on touch
            where there is no hover), plus a live position counter. */}
        {totalImages > 1 && (
          <>
            <button
              type='button'
              onClick={handlePrevImage}
              aria-label={t('prevImage')}
              className='absolute left-1.5 top-1/2 -translate-y-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100 max-md:opacity-100 hover:bg-background'
            >
              <ChevronLeft className='w-4 h-4' aria-hidden='true' />
            </button>
            <button
              type='button'
              onClick={handleNextImage}
              aria-label={t('nextImage')}
              className='absolute right-1.5 top-1/2 -translate-y-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100 max-md:opacity-100 hover:bg-background'
            >
              <ChevronRight className='w-4 h-4' aria-hidden='true' />
            </button>
            <span className='absolute bottom-2 right-2 bg-black/60 text-white rounded-md px-2 py-0.5 text-xs font-medium tabular-nums'>
              {currentImageIndex + 1} / {totalImages}
            </span>
          </>
        )}
      </div>

      {/* ── Body ── */}
      <div className='flex flex-col gap-1.5 p-2.5'>
        {/* Title */}
        <Typography
          variant='p'
          className='text-sm font-semibold text-foreground line-clamp-2 leading-snug'
        >
          {title}
        </Typography>

        {/* Price + key meta */}
        <div className='flex items-end justify-between gap-2 flex-wrap'>
          <div className='flex items-baseline gap-1 min-w-0'>
            <span className='text-base font-bold text-red-500 tabular-nums'>
              {formattedPrice}
            </span>
            <span className='text-xs text-muted-foreground'>{priceLabel}</span>
          </div>

          <div className='flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground'>
            {area !== null && area !== undefined && area > 0 && (
              <span className='inline-flex items-center px-2 py-0.5 bg-muted rounded-full tabular-nums'>
                {area} m²
              </span>
            )}
            {bedrooms !== null && bedrooms !== undefined && bedrooms > 0 && (
              <span className='inline-flex items-center px-2 py-0.5 bg-muted rounded-full tabular-nums'>
                {bedrooms} PN
              </span>
            )}
          </div>
        </div>

        {/* Stats row: bath, furnishing, direction */}
        {(bathrooms || furnishing || direction) && (
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
            {bathrooms !== null && bathrooms !== undefined && bathrooms > 0 && (
              <div className='flex items-center gap-1'>
                <Bath className='w-3.5 h-3.5' aria-hidden='true' />
                <span className='tabular-nums'>{bathrooms}</span>
              </div>
            )}
            {furnishing && (
              <div className='flex items-center gap-1'>
                <Sofa className='w-3.5 h-3.5' aria-hidden='true' />
                <span>
                  {(() => {
                    try {
                      return tFurnishing(furnishing)
                    } catch {
                      return furnishing
                    }
                  })()}
                </span>
              </div>
            )}
            {direction && (
              <div className='flex items-center gap-1'>
                <Compass className='w-3.5 h-3.5' aria-hidden='true' />
                <span>
                  {(() => {
                    try {
                      return tDirection(direction.toLowerCase())
                    } catch {
                      return direction
                    }
                  })()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Address */}
        {address?.fullAddress && (
          <div className='flex items-start gap-1.5 text-xs text-muted-foreground'>
            <MapPin
              className='w-3.5 h-3.5 mt-0.5 flex-shrink-0'
              aria-hidden='true'
            />
            <span className='line-clamp-1'>{address.fullAddress}</span>
          </div>
        )}

        {/* Utilities (only non-zero) */}
        {utilities.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {utilities.map(({ key, value }) => {
              const Icon = UTILITY_ICONS[key]
              const labelKey = UTILITY_LABEL_KEYS[key]
              if (!Icon || !labelKey) return null
              return (
                <Badge
                  key={key}
                  variant='outline'
                  className='gap-1 text-xs font-normal px-2 py-0.5 h-auto'
                >
                  <Icon className='w-3 h-3' aria-hidden='true' />
                  <span>
                    {t(`utilities.${labelKey}`)}:{' '}
                    {formatByLocale(value!, language)}
                  </span>
                </Badge>
              )
            })}
          </div>
        )}

        {/* Amenities */}
        {visibleAmenities.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {visibleAmenities.slice(0, amenityLimit).map((label) => (
              <Badge
                key={label}
                variant='secondary'
                className='text-xs font-normal px-2 py-0.5 h-auto'
              >
                {label}
              </Badge>
            ))}
            {visibleAmenities.length > amenityLimit && (
              <Badge
                variant='secondary'
                className='text-xs font-normal px-2 py-0.5 h-auto'
              >
                +{visibleAmenities.length - amenityLimit}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* ── CTA row ── */}
      <div className='flex items-center gap-2 px-2.5 pb-2.5 pt-0.5'>
        {onViewDetail ? (
          <Button
            type='button'
            onClick={(e) => {
              e.stopPropagation()
              onViewDetail(listingId)
            }}
            className='flex-1 h-9 text-sm font-medium gap-1.5 rounded-lg'
          >
            {t('viewDetails')}
            <ArrowRight
              className='w-4 h-4'
              strokeWidth={2.5}
              aria-hidden='true'
            />
          </Button>
        ) : (
          <Button
            asChild
            className='flex-1 h-9 text-sm font-medium gap-1.5 rounded-lg'
          >
            <Link
              href={`/listing-detail/${listingId}`}
              target='_blank'
              rel='noopener noreferrer'
              onClick={(e) => e.stopPropagation()}
            >
              {t('viewDetails')}
              <ArrowRight
                className='w-4 h-4'
                strokeWidth={2.5}
                aria-hidden='true'
              />
            </Link>
          </Button>
        )}

        {cleanPhone ? (
          <Button
            asChild
            variant='outline'
            size='icon'
            className='h-9 w-9 flex-shrink-0 rounded-lg'
            aria-label={t('call')}
          >
            <a href={`tel:${cleanPhone}`} onClick={(e) => e.stopPropagation()}>
              <Phone
                className='w-4 h-4 text-muted-foreground'
                aria-hidden='true'
              />
            </a>
          </Button>
        ) : (
          <Button
            variant='outline'
            size='icon'
            className='h-9 w-9 flex-shrink-0 rounded-lg opacity-40 cursor-default'
            disabled
            aria-label={t('noPhone')}
          >
            <Phone
              className='w-4 h-4 text-muted-foreground'
              aria-hidden='true'
            />
          </Button>
        )}
      </div>
    </div>
  )
}
