import React from 'react'
import { Card, CardContent } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import ImageAtom from '@/components/atoms/imageAtom'
import { ListingDetail } from '@/api/types'
import { formatByLocale } from '@/utils/currency/convert'
import { useTranslations } from 'next-intl'
import { Bed, Bath, Square, MapPin, X, ExternalLink } from 'lucide-react'
import { DEFAULT_IMAGE } from '@/constants'
import { useRouter } from 'next/router'
import { buildApartmentDetailRoute } from '@/constants/route'

interface MapPropertyCardProps {
  listing: ListingDetail
  onClose?: () => void
}

const MapPropertyCard: React.FC<MapPropertyCardProps> = ({
  listing,
  onClose,
}) => {
  const t = useTranslations()
  const router = useRouter()

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
    vipType,
  } = listing

  const primaryImage = media?.find(
    (m) => m.isPrimary && m.mediaType === 'IMAGE',
  )
  const imageUrl = primaryImage?.url || media?.[0]?.url || DEFAULT_IMAGE

  const handleViewDetails = () => {
    const route = buildApartmentDetailRoute(String(listingId))
    router.push(route)
  }

  return (
    <Card className='w-80 shadow-xl border-2 relative animate-in fade-in zoom-in duration-200'>
      {onClose && (
        <Button
          variant='ghost'
          size='icon'
          className='absolute top-2 right-2 z-10 bg-white/80 hover:bg-white'
          onClick={onClose}
        >
          <X className='h-4 w-4' />
        </Button>
      )}

      <div className='relative h-48 w-full overflow-hidden rounded-t-lg'>
        <ImageAtom
          src={imageUrl}
          alt={title}
          width={320}
          height={192}
          className='object-cover w-full h-full'
        />
        {vipType &&
          vipType !== 'NORMAL' &&
          (() => {
            // Determine badge color based on vipType
            let badgeColor = 'bg-gray-400'
            if (vipType === 'DIAMOND') {
              badgeColor = 'bg-blue-600'
            } else if (vipType === 'GOLD') {
              badgeColor = 'bg-yellow-500'
            }

            return (
              <Badge
                className={`absolute top-2 left-2 ${badgeColor} text-white`}
              >
                {vipType}
              </Badge>
            )
          })()}
      </div>

      <CardContent className='p-4 space-y-3'>
        {/* Price */}
        <div className='flex items-baseline gap-2'>
          <span className='text-2xl font-bold text-primary'>
            {formatByLocale(price, 'vi-VN')}
          </span>
          {priceUnit && (
            <span className='text-sm text-muted-foreground'>
              /{t(`createPost.${priceUnit.toLowerCase()}`)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className='font-semibold text-base line-clamp-2 min-h-[3rem]'>
          {title}
        </h3>

        {/* Property Details */}
        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
          {area && (
            <div className='flex items-center gap-1'>
              <Square className='h-4 w-4' />
              <span>{area}m²</span>
            </div>
          )}
          {bedrooms && (
            <div className='flex items-center gap-1'>
              <Bed className='h-4 w-4' />
              <span>{bedrooms}</span>
            </div>
          )}
          {bathrooms && (
            <div className='flex items-center gap-1'>
              <Bath className='h-4 w-4' />
              <span>{bathrooms}</span>
            </div>
          )}
        </div>

        {/* Address */}
        {address && (
          <div className='flex items-start gap-2 text-sm text-muted-foreground'>
            <MapPin className='h-4 w-4 mt-0.5 flex-shrink-0' />
            <span className='line-clamp-2'>
              {address.fullNewAddress || address.fullAddress}
            </span>
          </div>
        )}

        {/* View Details Button */}
        <Button
          className='w-full mt-2'
          onClick={handleViewDetails}
          variant='default'
        >
          <ExternalLink className='h-4 w-4 mr-2' />
          {t('common.viewDetails')}
        </Button>
      </CardContent>
    </Card>
  )
}

export default MapPropertyCard
