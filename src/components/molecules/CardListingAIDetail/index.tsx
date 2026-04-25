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

  const utilities = [
    { key: 'waterPrice', value: waterPrice },
    { key: 'electricityPrice', value: electricityPrice },
    { key: 'internetPrice', value: internetPrice },
    { key: 'serviceFee', value: serviceFee },
  ].filter((u) => u.value !== null && u.value !== undefined)

  const isVip = vipType === 'DIAMOND' || vipType === 'GOLD'
  const isAvailable = !expired && listingStatus !== 'EXPIRED'
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl overflow-hidden',
        className,
      )}
    >
      {/* ── Horizontal header ── */}
      <div className='flex'>
        {/* Thumbnail */}
        <div className='relative w-24 h-24 flex-shrink-0'>
          <Image
            src={primaryImage}
            alt={title}
            fill
            className='object-cover'
            sizes='96px'
          />
          {isVip && (
            <div className='absolute top-1 left-1'>
              <span className='inline-flex items-center gap-0.5 bg-white/90 rounded-full px-1.5 py-0.5 text-[9px] font-semibold shadow-sm'>
                <Star
                  className='w-2.5 h-2.5 fill-yellow-400 stroke-yellow-400'
                  aria-hidden='true'
                />
                {tHome('priorityBadge')}
              </span>
            </div>
          )}
          {media && media.length > 1 && (
            <span className='absolute bottom-1 right-1 bg-black/60 rounded text-[9px] text-white px-1 py-0.5 font-medium'>
              1/{media.length}
            </span>
          )}
        </div>

        {/* Key info */}
        <div className='flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-between'>
          <p className='text-[13px] font-semibold text-foreground line-clamp-2 leading-tight'>
            {title}
          </p>

          <div>
            <div className='flex items-baseline gap-1'>
              <span className='text-red-500 font-bold text-sm'>
                {formattedPrice}
              </span>
              <span className='text-muted-foreground text-[10px]'>
                {priceLabel}
              </span>
            </div>

            <div className='flex items-center gap-1 mt-1 flex-wrap'>
              {area !== null && area !== undefined && area > 0 && (
                <span className='px-1.5 py-0.5 bg-muted rounded-full text-[10px] text-muted-foreground'>
                  {area} m²
                </span>
              )}
              {bedrooms !== null && bedrooms !== undefined && bedrooms > 0 && (
                <span className='px-1.5 py-0.5 bg-muted rounded-full text-[10px] text-muted-foreground'>
                  {bedrooms} PN
                </span>
              )}
              {isAvailable && (
                <span className='inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 rounded-full text-[10px] text-emerald-600'>
                  <Check className='w-2.5 h-2.5' aria-hidden='true' />
                  Trống
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Extra details ── */}
      <div className='px-3 pb-2 space-y-1.5 border-t border-border pt-2'>
        {/* Stats row: bath, furnishing, direction */}
        {((bathrooms !== null && bathrooms !== undefined) ||
          furnishing ||
          direction) && (
          <div className='flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground'>
            {bathrooms !== null && bathrooms !== undefined && bathrooms > 0 && (
              <div className='flex items-center gap-1'>
                <Bath className='w-3 h-3' />
                <span>{bathrooms}</span>
              </div>
            )}
            {furnishing && (
              <div className='flex items-center gap-1'>
                <Sofa className='w-3 h-3' />
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
                <Compass className='w-3 h-3' />
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

        {/* Full address */}
        {address?.fullAddress && (
          <div className='flex items-start gap-1 text-[11px] text-muted-foreground'>
            <MapPin className='w-3 h-3 mt-0.5 flex-shrink-0' />
            <span className='line-clamp-1'>{address.fullAddress}</span>
          </div>
        )}

        {/* Utilities */}
        {utilities.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {utilities.map(({ key, value }) => {
              const config = UTILITY_LABELS[key]
              if (!config) return null
              const Icon = config.icon
              return (
                <Badge
                  key={key}
                  variant='outline'
                  className='text-[10px] px-1.5 py-0.5 gap-1 h-auto'
                >
                  <Icon className='w-2.5 h-2.5' />
                  {config.label}: {formatByLocale(value!, language)}
                </Badge>
              )
            })}
          </div>
        )}

        {/* Amenities */}
        {amenities && amenities.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {amenities.slice(0, compact ? 3 : 4).map((amenity, idx) => {
              const label =
                typeof amenity === 'string'
                  ? amenity
                  : (amenity as { name?: string })?.name || ''
              if (!label) return null
              return (
                <Badge
                  key={label || idx}
                  variant='secondary'
                  className='text-[10px] px-1.5 py-0.5 h-auto'
                >
                  {label}
                </Badge>
              )
            })}
            {amenities.length > (compact ? 3 : 4) && (
              <Badge
                variant='secondary'
                className='text-[10px] px-1.5 py-0.5 h-auto'
              >
                +{amenities.length - (compact ? 3 : 4)}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* ── CTA row ── */}
      <div className='flex gap-1.5 px-2.5 py-2 border-t border-border'>
        <Link
          href={`/listing-detail/${listingId}`}
          target='_blank'
          rel='noopener noreferrer'
          className='flex-1'
          onClick={(e) => e.stopPropagation()}
        >
          <Button className='w-full bg-primary text-primary-foreground hover:bg-primary/90 h-7 text-[11px] font-normal normal-case gap-1 rounded-lg'>
            {t('viewDetails')}
            <ArrowRight
              className='w-2.5 h-2.5'
              strokeWidth={2.5}
              aria-hidden='true'
            />
          </Button>
        </Link>
        {contactPhone ? (
          <a
            href={`tel:${contactPhone.replaceAll(' ', '').replaceAll('.', '').replaceAll('-', '')}`}
            onClick={(e) => e.stopPropagation()}
            aria-label='Gọi điện'
          >
            <Button
              variant='outline'
              size='icon'
              className='h-7 w-7 border-border hover:bg-accent flex-shrink-0 rounded-lg'
            >
              <Phone
                className='w-3 h-3 text-muted-foreground'
                aria-hidden='true'
              />
            </Button>
          </a>
        ) : (
          <Button
            variant='outline'
            size='icon'
            className='h-7 w-7 border-border flex-shrink-0 rounded-lg opacity-40 cursor-default'
            disabled
            aria-label='Không có số điện thoại'
          >
            <Phone
              className='w-3 h-3 text-muted-foreground'
              aria-hidden='true'
            />
          </Button>
        )}
      </div>
    </div>
  )
}
