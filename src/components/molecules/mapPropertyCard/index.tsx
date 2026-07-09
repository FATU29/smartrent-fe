import React from 'react'
import classNames from 'classnames'
import { Badge } from '@/components/atoms/badge'
import { Typography } from '@/components/atoms/typography'
import ImageAtom from '@/components/atoms/imageAtom'
import SaveListingButton from '@/components/molecules/saveListingButton'
import CompareToggleBtn from '@/components/molecules/compareToggleBtn'
import BrokerAvatar from '@/components/molecules/brokerAvatar'
import { basePath, DEFAULT_IMAGE } from '@/constants'
import { useTranslations } from 'next-intl'
import {
  Bed,
  Bath,
  Square,
  Users,
  Camera,
  Check,
  Sparkles,
  MapPin,
} from 'lucide-react'
import { ListingDetail } from '@/api/types'
import { formatByLocale } from '@/utils/currency/convert'

interface MapPropertyCardProps {
  listing: ListingDetail
  onClick?: (listing: ListingDetail) => void
  bottomContent?: React.ReactNode
  className?: string
  // Denser layout for the map sidebar list (3-per-row). The selected-pin
  // overlay keeps the roomier default (compact=false).
  compact?: boolean
}

const StatPill: React.FC<{
  icon: React.ReactNode
  value: React.ReactNode
  compact?: boolean
}> = ({ icon, value, compact }) => (
  <div
    className={classNames(
      'flex items-center rounded-lg bg-muted/60',
      compact ? 'gap-1 px-2 py-1' : 'gap-1.5 px-2.5 py-1.5',
    )}
  >
    <span className='text-primary'>{icon}</span>
    <Typography variant='small' className='font-semibold text-foreground'>
      {value}
    </Typography>
  </div>
)

// Dedicated, flat listing card used only on the map (the left drawer list and
// the selected-listing overlay). It is a copy of PropertyCard WITHOUT the Card
// chrome (border / rounded corners / footer divider) so it sits flush inside
// the map containers, which provide their own border and rounding. PropertyCard
// is intentionally not reused here to avoid those nested-card artifacts.
const MapPropertyCardBase: React.FC<MapPropertyCardProps> = ({
  listing,
  onClick,
  bottomContent,
  className,
  compact = false,
}) => {
  const t = useTranslations()
  const {
    title,
    price,
    priceUnit,
    area,
    bedrooms,
    bathrooms,
    verified,
    user,
    address,
    vipType,
    roomCapacity,
    media,
  } = listing

  const images = media?.filter((m) => m.mediaType === 'IMAGE') || []
  const totalImages = images.length
  const mainImage = images[0]?.url
  const displayAddress = address?.fullNewAddress || address?.fullAddress
  const { firstName, lastName } = user || {}
  const userName = `${firstName || ''} ${lastName || ''}`.trim()
  const isProfessionalBroker =
    Boolean(user?.isBroker) || user?.brokerVerificationStatus === 'APPROVED'
  const isPriority = vipType === 'GOLD' || vipType === 'DIAMOND'

  return (
    <div
      className={classNames('flex flex-col h-full bg-card', className)}
      onClick={onClick ? () => onClick(listing) : undefined}
    >
      {/* Image */}
      <div className={compact ? 'p-1.5 pb-0' : 'p-2 pb-0'}>
        <div
          className={classNames(
            'relative overflow-hidden rounded-lg',
            compact ? 'aspect-[16/10]' : 'aspect-[4/3]',
          )}
        >
          <ImageAtom
            src={mainImage || `${basePath}/images/default-image.jpg`}
            defaultImage={DEFAULT_IMAGE}
            alt={title}
            className='w-full h-full object-cover object-center'
          />
          <div className='absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent pointer-events-none' />

          {/* Save / compare actions */}
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

          {/* Badges */}
          <div className='absolute top-2 left-2 flex flex-col gap-1.5 z-10'>
            {verified && (
              <Badge className='bg-emerald-500/90 text-white text-2xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 backdrop-blur-sm'>
                <Check className='w-3 h-3' />
                <span className='font-medium'>
                  {t('homePage.property.verified')}
                </span>
              </Badge>
            )}
            {isPriority && (
              <Badge className='bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-2xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 backdrop-blur-sm'>
                <Sparkles className='w-3 h-3' />
                <span className='font-medium'>
                  {t('homePage.priorityBadge')}
                </span>
              </Badge>
            )}
          </div>

          {/* Image count */}
          {totalImages > 0 && (
            <div className='absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-md'>
              <Camera className='w-3.5 h-3.5' />
              <span className='font-medium'>{totalImages}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={classNames(
          'flex flex-1 flex-col',
          compact ? 'gap-1.5 p-2.5' : 'gap-2 p-3',
        )}
      >
        <Typography
          variant='h6'
          className='text-foreground leading-tight font-semibold line-clamp-2'
        >
          {title}
        </Typography>

        {displayAddress && (
          <div className='flex items-start gap-1.5 min-w-0'>
            <MapPin className='w-3 h-3 flex-shrink-0 text-muted-foreground mt-0.5' />
            <Typography
              variant='small'
              className='text-muted-foreground line-clamp-1 leading-snug'
            >
              {displayAddress}
            </Typography>
          </div>
        )}

        <Typography
          variant={compact ? 'h6' : 'h5'}
          className='text-primary font-bold tracking-tight'
        >
          {formatByLocale(price, priceUnit)}
        </Typography>

        <div className='flex items-center flex-wrap gap-2'>
          {bedrooms !== undefined && (
            <StatPill
              icon={<Bed className='w-3 h-3' />}
              value={bedrooms}
              compact={compact}
            />
          )}
          {bathrooms !== undefined && (
            <StatPill
              icon={<Bath className='w-3 h-3' />}
              value={bathrooms}
              compact={compact}
            />
          )}
          {area && (
            <StatPill
              icon={<Square className='w-3 h-3' />}
              value={`${area} m²`}
              compact={compact}
            />
          )}
          {roomCapacity && (
            <StatPill
              icon={<Users className='w-3 h-3' />}
              value={roomCapacity}
              compact={compact}
            />
          )}
        </div>

        {/* Agent footer (no divider) */}
        {user && (
          <div className='flex items-center gap-2 mt-auto pt-1'>
            <BrokerAvatar
              avatarUrl={user.avatarUrl}
              firstName={firstName}
              lastName={lastName}
              sizeClassName={compact ? 'size-7' : 'size-9'}
              showBrokerBadge={isProfessionalBroker}
              fallbackClassName='text-xs'
            />
            {userName && (
              <Typography
                variant='small'
                className='font-medium truncate block leading-tight'
              >
                {userName}
              </Typography>
            )}
          </div>
        )}

        {bottomContent}
      </div>
    </div>
  )
}

// Memoized: the same `listing` object reference is kept in the map cache, so a
// row's card skips re-rendering when the parent re-renders on pan / loading
// toggles. Only the selected-card overlay (which passes a fresh `bottomContent`)
// re-renders, and that is a single instance.
const MapPropertyCard = React.memo(MapPropertyCardBase)
MapPropertyCard.displayName = 'MapPropertyCard'

export default MapPropertyCard
