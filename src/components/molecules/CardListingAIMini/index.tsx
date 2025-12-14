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
  ranking?: {
    score: number
    reason: string
  }
  className?: string
  variant?: 'default' | 'compact' // compact for chat popups
}

export const CardListingAIMini: React.FC<CardListingAIMiniProps> = ({
  listing,
  ranking,
  className,
  variant = 'default',
}) => {
  const t = useTranslations('chat.listing')
  const tCompare = useTranslations('compare')
  const tSaved = useTranslations('savedListings')
  const { language } = useLanguage()
  const isCompact = variant === 'compact'

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
  // Subscribe to compareList to trigger re-renders when it changes
  const compareList = useCompareStore((state) => state.compareList)
  const { addToCompare, removeFromCompare } = useCompareStore()
  const isInCompareList = compareList.some(
    (listing) => listing.listingId === listingId,
  )

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
      if (success) {
        toast.success(tCompare('messages.added'))
      } else {
        toast.warning(tCompare('messages.limitReached'))
      }
    }
  }

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-300 hover:shadow-lg',
        isCompact ? 'hover:scale-[1.01]' : 'hover:scale-[1.02]',
        'border border-border/40 bg-card',
        className,
      )}
    >
      <CardContent className={cn('p-0', isCompact && 'text-xs')}>
        <div
          className={cn(
            'flex gap-2',
            isCompact ? 'flex-col p-2' : 'flex-col sm:flex-row gap-3 p-3',
          )}
        >
          {/* Image Section */}
          <div
            className={cn(
              'relative rounded-lg overflow-hidden flex-shrink-0',
              isCompact ? 'w-full h-32' : 'w-full sm:w-32 h-32 sm:h-24',
            )}
          >
            <Image
              src={primaryImage}
              alt={title}
              fill
              className='object-cover transition-transform duration-300 group-hover:scale-110'
              sizes={isCompact ? '100vw' : '(max-width: 640px) 100vw, 128px'}
            />

            {/* VIP Badge */}
            {vipType && vipType !== 'NORMAL' && (
              <div
                className={cn(
                  'absolute',
                  isCompact ? 'top-1 left-1' : 'top-2 left-2',
                )}
              >
                <Badge
                  variant={
                    vipType === 'DIAMOND' || vipType === 'GOLD'
                      ? 'destructive'
                      : 'default'
                  }
                  className={cn(
                    isCompact ? 'text-[10px] px-1 py-0' : 'text-xs',
                  )}
                >
                  {vipType}
                </Badge>
              </div>
            )}

            {/* Verified Badge */}
            {verified && (
              <div
                className={cn(
                  'absolute',
                  isCompact ? 'top-1 right-1' : 'top-2 right-2',
                )}
              >
                <Badge
                  variant='secondary'
                  className={cn(
                    isCompact ? 'text-[10px] px-1 py-0' : 'text-xs',
                  )}
                >
                  ✓
                </Badge>
              </div>
            )}

            {/* AI Score */}
            {ranking && (
              <div
                className={cn(
                  'absolute',
                  isCompact ? 'bottom-1 right-1' : 'bottom-2 right-2',
                )}
              >
                <Badge
                  variant='secondary'
                  className={cn(
                    'font-semibold bg-black/70 text-white',
                    isCompact ? 'text-[10px] px-1 py-0' : 'text-xs',
                  )}
                >
                  {ranking.score}
                </Badge>
              </div>
            )}

            {/* Action buttons overlay */}
            <div
              className={cn(
                'absolute flex gap-1',
                isCompact ? 'bottom-1 left-1' : 'bottom-2 left-2',
              )}
            >
              {/* Save button */}
              <button
                onClick={handleSaveClick}
                disabled={isSaveLoading}
                className={cn(
                  'flex items-center justify-center',
                  'rounded-full bg-background/80 backdrop-blur-sm',
                  'hover:bg-background transition-all duration-200',
                  'hover:scale-110 active:scale-95',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  isCompact ? 'h-6 w-6' : 'h-7 w-7',
                )}
                aria-label={
                  isSaved ? tSaved('actions.saved') : tSaved('actions.save')
                }
              >
                <Heart
                  className={cn(
                    'transition-all duration-200',
                    isSaved
                      ? 'fill-red-500 stroke-red-500'
                      : 'fill-none stroke-muted-foreground hover:stroke-red-500',
                    isSaveLoading && 'animate-pulse',
                    isCompact ? 'w-3 h-3' : 'w-4 h-4',
                  )}
                />
              </button>

              {/* Compare button */}
              <button
                onClick={handleCompareClick}
                className={cn(
                  'flex items-center justify-center',
                  'rounded-full bg-background/80 backdrop-blur-sm',
                  'hover:bg-background transition-all duration-200',
                  'hover:scale-110 active:scale-95',
                  isCompact ? 'h-6 w-6' : 'h-7 w-7',
                )}
                aria-label={
                  isInCompareList
                    ? tCompare('actions.removeFromCompare')
                    : tCompare('actions.addToCompare')
                }
              >
                <Plus
                  className={cn(
                    'transition-all duration-200',
                    isInCompareList
                      ? 'rotate-45 stroke-primary'
                      : 'stroke-muted-foreground hover:stroke-primary',
                    isCompact ? 'w-3 h-3' : 'w-4 h-4',
                  )}
                />
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div
            className={cn(
              'flex-1 min-w-0 flex flex-col',
              isCompact ? 'gap-1.5' : 'justify-between',
            )}
          >
            {/* Title */}
            <div className={cn(isCompact ? 'space-y-0.5' : 'space-y-1')}>
              <Typography
                variant='p'
                className={cn(
                  'font-semibold line-clamp-1 text-foreground group-hover:text-primary transition-colors',
                  isCompact ? 'text-xs' : 'text-sm',
                )}
              >
                {title}
              </Typography>

              {/* Price */}
              <div className='flex items-center gap-1'>
                <Typography
                  variant='p'
                  className={cn(
                    'font-bold text-primary',
                    isCompact ? 'text-xs' : 'text-sm',
                  )}
                >
                  {formattedPrice}
                </Typography>
              </div>
            </div>

            {/* Details */}
            <div
              className={cn(
                'flex flex-wrap items-center text-muted-foreground',
                isCompact ? 'gap-2 text-[10px]' : 'gap-3 text-xs',
              )}
            >
              {bedrooms && (
                <div className='flex items-center gap-1'>
                  <Bed className={cn(isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
                  <span>{bedrooms}</span>
                </div>
              )}

              {area && (
                <div className='flex items-center gap-1'>
                  <Maximize2
                    className={cn(isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3')}
                  />
                  <span>
                    {area}m<sup>2</sup>
                  </span>
                </div>
              )}

              {address?.fullAddress && (
                <div className='flex items-center gap-1 flex-1 min-w-0'>
                  <MapPin
                    className={cn(
                      'flex-shrink-0',
                      isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3',
                    )}
                  />
                  <span
                    className={cn(
                      'truncate',
                      isCompact ? 'text-[10px]' : 'text-xs',
                    )}
                  >
                    {address.fullAddress.split(',').slice(-2).join(',')}
                  </span>
                </div>
              )}
            </div>

            {/* AI Ranking Reason */}
            {ranking?.reason && !isCompact && (
              <Typography
                variant='small'
                className='text-muted-foreground italic line-clamp-1 mt-1'
              >
                {ranking.reason}
              </Typography>
            )}
          </div>

          {/* View Details Button */}
          <div
            className={cn(
              'flex',
              isCompact ? 'items-center' : 'items-center sm:items-start',
            )}
          >
            <Link
              href={`/listing-detail/${listingId}`}
              target='_blank'
              rel='noopener noreferrer'
              className='w-full'
            >
              <Button
                size='sm'
                variant='outline'
                className={cn(
                  'w-full whitespace-nowrap',
                  isCompact && 'text-[10px] h-6 px-2 py-1',
                )}
              >
                {t('viewDetails')}
                <ExternalLink
                  className={cn('ml-1', isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3')}
                />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
