import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  MapPin,
  Maximize2,
  Bed,
  Bath,
  ExternalLink,
  Phone,
  User,
  Sofa,
  Compass,
  Droplets,
  Zap,
  Wifi,
  DollarSign,
} from 'lucide-react'

import { Card, CardContent } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
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
}

const UTILITY_LABELS: Record<
  string,
  { icon: React.ElementType; label: string }
> = {
  waterPrice: { icon: Droplets, label: 'Nước' },
  electricityPrice: { icon: Zap, label: 'Điện' },
  internetPrice: { icon: Wifi, label: 'Internet' },
  serviceFee: { icon: DollarSign, label: 'Dịch vụ' },
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
  const { language } = useLanguage()

  const {
    listingId,
    title,
    description,
    price,
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
  } = listing

  const primaryImage =
    media?.find((m) => m.isPrimary)?.url || media?.[0]?.url || DEFAULT_IMAGE

  const formattedPrice = formatByLocale(price, language)

  const contactPhone = ownerContactPhoneNumber || user?.phoneNumber
  const contactName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : null

  const utilities = [
    { key: 'waterPrice', value: waterPrice },
    { key: 'electricityPrice', value: electricityPrice },
    { key: 'internetPrice', value: internetPrice },
    { key: 'serviceFee', value: serviceFee },
  ].filter((u) => u.value !== null && u.value !== undefined)

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300 hover:shadow-lg border border-border/40 bg-card py-0',
        className,
      )}
    >
      <CardContent className='p-0'>
        {/* Image */}
        <div
          className={cn(
            'relative w-full overflow-hidden',
            compact ? 'h-32' : 'h-44',
          )}
        >
          <Image
            src={primaryImage}
            alt={title}
            fill
            className='object-cover'
            sizes='100vw'
          />
          {media && media.length > 1 && (
            <Badge className='absolute bottom-2 left-2 bg-black/60 text-white text-[10px]'>
              {media.length} ảnh
            </Badge>
          )}
        </div>

        <div className='p-3 space-y-2.5'>
          {/* Title + Price */}
          <div>
            <Typography
              variant='p'
              className='font-semibold text-sm line-clamp-2 text-foreground'
            >
              {title}
            </Typography>
            <Typography
              variant='p'
              className='font-bold text-primary text-sm mt-0.5'
            >
              {formattedPrice}
            </Typography>
          </div>

          {/* Key stats */}
          <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
            {bedrooms !== null && bedrooms !== undefined && (
              <div className='flex items-center gap-1'>
                <Bed className='w-3 h-3' />
                <span>{bedrooms}</span>
              </div>
            )}
            {bathrooms !== null && bathrooms !== undefined && (
              <div className='flex items-center gap-1'>
                <Bath className='w-3 h-3' />
                <span>{bathrooms}</span>
              </div>
            )}
            {area !== null && area !== undefined && (
              <div className='flex items-center gap-1'>
                <Maximize2 className='w-3 h-3' />
                <span>
                  {area}m<sup>2</sup>
                </span>
              </div>
            )}
            {furnishing && (
              <div className='flex items-center gap-1'>
                <Sofa className='w-3 h-3' />
                <span className='truncate max-w-[80px]'>
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

          {/* Address */}
          {address?.fullAddress && (
            <div className='flex items-start gap-1 text-xs text-muted-foreground'>
              <MapPin className='w-3 h-3 mt-0.5 flex-shrink-0' />
              <span className='line-clamp-2'>{address.fullAddress}</span>
            </div>
          )}

          {/* Description - hidden in compact mode (AI text already covers analysis) */}
          {!compact && description && (
            <Typography
              variant='small'
              className='text-xs text-muted-foreground line-clamp-3 leading-relaxed'
            >
              {description}
            </Typography>
          )}

          {/* Utilities */}
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
                    className='text-[10px] px-1.5 py-0.5 gap-1'
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
                    className='text-[10px] px-1.5 py-0.5'
                  >
                    {label}
                  </Badge>
                )
              })}
              {amenities.length > (compact ? 3 : 4) && (
                <Badge
                  variant='secondary'
                  className='text-[10px] px-1.5 py-0.5'
                >
                  +{amenities.length - (compact ? 3 : 4)}
                </Badge>
              )}
            </div>
          )}

          {/* Contact */}
          {(contactName || contactPhone) && (
            <div className='flex items-center gap-2 pt-1 border-t border-border/40'>
              {contactName && (
                <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <User className='w-3 h-3' />
                  <span>{contactName}</span>
                </div>
              )}
              {contactPhone && (
                <a
                  href={`tel:${contactPhone}`}
                  className='flex items-center gap-1 text-xs text-primary hover:underline ml-auto'
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className='w-3 h-3' />
                  <span>{contactPhone}</span>
                </a>
              )}
            </div>
          )}

          {/* View Details Button */}
          <Link
            href={`/listing-detail/${listingId}`}
            target='_blank'
            rel='noopener noreferrer'
            className='block'
          >
            <Button
              size='sm'
              variant='outline'
              className='w-full text-xs h-8 px-3 py-1.5 rounded-lg'
            >
              {t('viewDetails')}
              <ExternalLink className='ml-1.5 w-3 h-3' />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
