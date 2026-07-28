import React from 'react'
import classNames from 'classnames'
import { Card, CardContent } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Typography } from '@/components/atoms/typography'
import ImageAtom from '@/components/atoms/imageAtom'
import SaveListingButton from '@/components/molecules/saveListingButton'
import CompareToggleBtn from '@/components/molecules/compareToggleBtn'
import { basePath, DEFAULT_IMAGE } from '@/constants'
import { useTranslations } from 'next-intl'
import { Camera, Sparkles, MapPin } from 'lucide-react'
import { ListingDetail } from '@/api/types'
import { formatByLocale } from '@/utils/currency/convert'

interface SimplePropertyCardProps {
  listing: ListingDetail
  onClick?: (listing: ListingDetail) => void
  className?: string
}

const SimplePropertyCard: React.FC<SimplePropertyCardProps> = ({
  listing,
  onClick,
  className,
}) => {
  const t = useTranslations()
  const { title, price, priceUnit, address, vipType, media } = listing

  const images = media?.filter((m) => m.mediaType === 'IMAGE')
  const mainImage = images?.[0]?.url
  const totalImages = images?.length || 0

  const { fullNewAddress: newAddress, fullAddress: legacyAddress } =
    address || {}
  const displayAddress = newAddress || legacyAddress

  const showVipBadge = !!vipType && vipType !== 'NORMAL' && vipType !== 'SILVER'

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation()
      onClick(listing)
    }
  }

  return (
    <Card
      className={classNames(
        'group/card cursor-pointer overflow-hidden transition-all duration-300 py-0',
        'hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5',
        'border-border/60 hover:border-primary/30 flex flex-col h-full',
        className,
      )}
      onClick={onClick ? handleClick : undefined}
    >
      <div className='relative overflow-hidden aspect-[4/3] flex-shrink-0'>
        <ImageAtom
          src={mainImage || `${basePath}/images/default-image.jpg`}
          defaultImage={DEFAULT_IMAGE}
          alt={title}
          className='w-full h-full object-cover object-center transition-transform duration-500 group-hover/card:scale-105'
        />

        <div className='absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent pointer-events-none' />

        <div className='absolute top-2 right-2 z-10 flex gap-1'>
          <CompareToggleBtn
            listing={listing}
            variant='ghost'
            size='icon'
            className='bg-card/80 backdrop-blur-md rounded-full shadow-sm transition-all w-7 h-7'
          />
          <SaveListingButton
            listingId={listing.listingId}
            variant='icon'
            className='bg-card/80 backdrop-blur-md rounded-full shadow-sm transition-all w-7 h-7'
            iconClassName='w-3 h-3'
          />
        </div>

        {showVipBadge && (
          <div className='absolute top-2 left-2 z-10'>
            <Badge className='bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm rounded-full text-2xs px-2 py-0.5 flex items-center gap-0.5 backdrop-blur-sm'>
              <Sparkles className='w-2.5 h-2.5' />
              {t('homePage.priorityBadge')}
            </Badge>
          </div>
        )}

        {totalImages > 0 && (
          <div className='absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/60 text-white rounded-full backdrop-blur-md text-2xs px-1.5 py-0.5'>
            <Camera className='w-2.5 h-2.5' />
            <span className='font-medium'>{totalImages}</span>
          </div>
        )}
      </div>

      <CardContent className='flex-1 flex flex-col p-3 space-y-1.5'>
        <Typography
          variant='h6'
          className='text-foreground group-hover/card:text-primary transition-colors duration-200 leading-tight font-semibold line-clamp-2'
        >
          {title}
        </Typography>

        {displayAddress && (
          <div className='flex items-start gap-1.5 min-w-0'>
            <MapPin className='flex-shrink-0 text-muted-foreground mt-0.5 w-3 h-3' />
            <Typography
              variant='small'
              className='text-muted-foreground leading-snug'
            >
              {displayAddress}
            </Typography>
          </div>
        )}

        <Typography
          variant='h5'
          className='text-primary font-bold tracking-tight mt-auto pt-1'
        >
          {formatByLocale(price, priceUnit)}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default SimplePropertyCard
