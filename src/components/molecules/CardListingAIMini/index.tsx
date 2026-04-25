import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { MapPin, Maximize2, Bed, ExternalLink, Heart, Plus } from 'lucide-react'

import { Card, CardContent } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import { formatByLocale } from '@/utils/currency/convert'
import { useLanguage } from '@/hooks/useLanguage'
import { DEFAULT_IMAGE } from '@/constants/common'
import { useToggleSaveListing } from '@/hooks/useSavedListings'
import { useCompareStore } from '@/store/compare/useCompareStore'
import type { ChatListing } from '@/api/types/ai.type'
import type { ListingApi } from '@/api/types/property.type'
import { toast } from 'sonner'

export interface CardListingAIMiniProps {
  listing: ChatListing
  ranking?: { score: number; reason: string }
  className?: string
}

export const CardListingAIMini: React.FC<CardListingAIMiniProps> = ({
  listing,
  ranking,
  className,
}) => {
  const t = useTranslations('chat.listing')
  const tHome = useTranslations('homePage')
  const tCompare = useTranslations('compare')
  const tSaved = useTranslations('savedListings')
  const { language } = useLanguage()

  const {
    listingId,
    title,
    price,
    area,
    bedrooms,
    address,
    media,
    vipType,
    verified,
  } = listing

  const primaryImage =
    media?.find((m) => m.isPrimary)?.url || media?.[0]?.url || DEFAULT_IMAGE

  const formattedPrice = formatByLocale(price, language)

  const {
    isSaved,
    isLoading: isSaveLoading,
    toggleSave,
  } = useToggleSaveListing(listingId)
  const compareList = useCompareStore((state) => state.compareList)
  const { addToCompare, removeFromCompare } = useCompareStore()
  const isInCompareList = compareList.some((l) => l.listingId === listingId)

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleSave()
  }

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInCompareList) {
      removeFromCompare(listingId)
      toast.success(tCompare('messages.removed'))
    } else {
      const listingForCompare = {
        ...listing,
        description: '',
        postDate: new Date().toISOString(),
        expiryDate: new Date().toISOString(),
        status: 'DISPLAYING',
        category: { categoryId: 1, name: '' },
        user: { userId: 0, firstName: '', lastName: '' },
      } as unknown as ListingApi
      const success = addToCompare(listingForCompare)
      if (success) toast.success(tCompare('messages.added'))
      else toast.warning(tCompare('messages.limitReached'))
    }
  }

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]',
        'border border-border/40 bg-card',
        className,
      )}
    >
      <CardContent className='p-0'>
        <div className='flex flex-col sm:flex-row gap-3 p-3'>
          <div className='relative rounded-lg overflow-hidden flex-shrink-0 w-full sm:w-32 h-40 sm:h-24'>
            <Image
              src={primaryImage}
              alt={title}
              fill
              className='object-cover transition-transform duration-300 group-hover:scale-110'
              sizes='(max-width: 640px) 100vw, 128px'
            />
            {vipType && (vipType === 'DIAMOND' || vipType === 'GOLD') && (
              <div className='absolute top-2 left-2'>
                <Badge className='rounded-full shadow-md font-medium backdrop-blur-sm bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs px-2.5 py-1'>
                  {tHome('priorityBadge')}
                </Badge>
              </div>
            )}
            {verified && (
              <div className='absolute top-2 right-2'>
                <Badge variant='secondary' className='text-xs'>
                  ✓
                </Badge>
              </div>
            )}
            {ranking && (
              <div className='absolute bottom-2 right-2'>
                <Badge
                  variant='secondary'
                  className='font-semibold bg-black/70 text-white text-xs'
                >
                  {ranking.score}
                </Badge>
              </div>
            )}
            <div className='absolute flex gap-1 bottom-2 left-2'>
              <button
                onClick={handleSaveClick}
                disabled={isSaveLoading}
                className='flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 h-7 w-7'
                aria-label={
                  isSaved ? tSaved('actions.saved') : tSaved('actions.save')
                }
              >
                <Heart
                  className={cn(
                    'w-4 h-4 transition-all duration-200',
                    isSaved
                      ? 'fill-red-500 stroke-red-500'
                      : 'fill-none stroke-muted-foreground hover:stroke-red-500',
                    isSaveLoading && 'animate-pulse',
                  )}
                />
              </button>
              <button
                onClick={handleCompareClick}
                className='flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all duration-200 hover:scale-110 active:scale-95 h-7 w-7'
                aria-label={
                  isInCompareList
                    ? tCompare('actions.removeFromCompare')
                    : tCompare('actions.addToCompare')
                }
              >
                <Plus
                  className={cn(
                    'w-4 h-4 transition-all duration-200',
                    isInCompareList
                      ? 'rotate-45 stroke-primary'
                      : 'stroke-muted-foreground hover:stroke-primary',
                  )}
                />
              </button>
            </div>
          </div>

          <div className='flex-1 min-w-0 flex flex-col justify-between'>
            <div className='space-y-1'>
              <Typography
                variant='p'
                className='font-semibold line-clamp-1 text-foreground group-hover:text-primary transition-colors text-sm'
              >
                {title}
              </Typography>
              <Typography
                variant='p'
                className='font-bold text-primary text-sm'
              >
                {formattedPrice}
              </Typography>
            </div>
            <div className='flex flex-wrap items-center text-muted-foreground gap-3 text-xs'>
              {bedrooms && (
                <div className='flex items-center gap-1'>
                  <Bed className='w-3 h-3' />
                  <span>{bedrooms}</span>
                </div>
              )}
              {area && (
                <div className='flex items-center gap-1'>
                  <Maximize2 className='w-3 h-3' />
                  <span>
                    {area}m<sup>2</sup>
                  </span>
                </div>
              )}
              {address?.fullAddress && (
                <div className='flex items-center gap-1 flex-1 min-w-0'>
                  <MapPin className='flex-shrink-0 w-3 h-3' />
                  <span className='truncate text-xs'>
                    {address.fullAddress.split(',').slice(-2).join(',')}
                  </span>
                </div>
              )}
            </div>
            {ranking?.reason && (
              <Typography
                variant='small'
                className='text-muted-foreground italic line-clamp-1 mt-1'
              >
                {ranking.reason}
              </Typography>
            )}
          </div>

          <div className='flex items-center sm:items-start'>
            <Link
              href={`/listing-detail/${listingId}`}
              target='_blank'
              rel='noopener noreferrer'
              className='w-full'
            >
              <Button
                size='sm'
                variant='outline'
                className='w-full whitespace-nowrap rounded-lg text-sm h-9 px-4 py-2'
              >
                {t('viewDetails')}
                <ExternalLink className='ml-1.5 w-3.5 h-3.5' />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
