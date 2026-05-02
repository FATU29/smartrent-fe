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
} from 'lucide-react'

import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
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

const UTILITY_LABELS: Record<
  string,
  { icon: React.ElementType; label: string }
> = {
  waterPrice: { icon: Droplets, label: 'Nước' },
  electricityPrice: { icon: Zap, label: 'Điện' },
  internetPrice: { icon: Wifi, label: 'Internet' },
  serviceFee: { icon: DollarSign, label: 'DV' },
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

  const primaryImage =
    media?.find((m) => m.isPrimary)?.url || media?.[0]?.url || DEFAULT_IMAGE

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
        'bg-card border border-border rounded-xl overflow-hidden flex flex-col',
        'transition-shadow hover:shadow-md',
        className,
      )}
    >
      {/* ── Image hero ── */}
      <div className='relative w-full aspect-[4/3] bg-muted'>
        <Image
          src={primaryImage}
          alt={title}
          fill
          className='object-cover'
          sizes='(max-width: 640px) 90vw, 400px'
        />

        {isVip && (
          <span className='absolute top-2 left-2 inline-flex items-center gap-1 bg-white/95 text-foreground rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm'>
            <Star
              className='w-3 h-3 fill-yellow-400 stroke-yellow-400'
              aria-hidden='true'
            />
            {tHome('priorityBadge')}
          </span>
        )}

        {isAvailable && (
          <span className='absolute top-2 right-2 inline-flex items-center gap-1 bg-emerald-500/95 text-white rounded-full px-2 py-0.5 text-xs font-medium shadow-sm'>
            <Check className='w-3 h-3' aria-hidden='true' />
            Trống
          </span>
        )}

        {media && media.length > 1 && (
          <span className='absolute bottom-2 right-2 bg-black/60 text-white rounded-md px-2 py-0.5 text-xs font-medium tabular-nums'>
            1 / {media.length}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className='flex flex-col gap-2 p-3'>
        {/* Title */}
        <p className='text-sm font-semibold text-foreground line-clamp-2 leading-snug'>
          {title}
        </p>

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
              const config = UTILITY_LABELS[key]
              if (!config) return null
              const Icon = config.icon
              return (
                <Badge
                  key={key}
                  variant='outline'
                  className='gap-1 text-xs font-normal px-2 py-0.5 h-auto'
                >
                  <Icon className='w-3 h-3' aria-hidden='true' />
                  <span>
                    {config.label}: {formatByLocale(value!, language)}
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
      <div className='flex items-center gap-2 px-3 pb-3 pt-1'>
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
            aria-label='Gọi điện'
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
            aria-label='Không có số điện thoại'
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
