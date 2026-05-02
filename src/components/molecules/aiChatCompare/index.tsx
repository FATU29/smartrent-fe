import React, { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Maximize2 } from 'lucide-react'

import { Card, CardContent } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import { formatByLocale } from '@/utils/currency/convert'
import { useLanguage } from '@/hooks/useLanguage'
import { DEFAULT_IMAGE } from '@/constants/common'
import AiChatCompareDialog from '@/components/molecules/aiChatCompareDialog'
import type { ChatListing } from '@/api/types/ai.type'

interface AiChatCompareProps {
  listings: ChatListing[]
  className?: string
}

const AiChatCompare: React.FC<AiChatCompareProps> = ({
  listings,
  className,
}) => {
  const t = useTranslations('chat.compare')
  const { language } = useLanguage()
  const [showDialog, setShowDialog] = useState(false)

  const items = listings.slice(0, 2)

  return (
    <>
      <Card
        className={cn(
          'overflow-hidden border border-border bg-card py-0',
          className,
        )}
      >
        <CardContent className='p-0'>
          {/* Images row */}
          <div className='grid grid-cols-2 gap-px bg-border/40'>
            {items.map((listing) => {
              const img =
                listing.media?.find((m) => m.isPrimary)?.url ||
                listing.media?.[0]?.url ||
                DEFAULT_IMAGE
              return (
                <div
                  key={listing.listingId}
                  className='relative aspect-[4/3] bg-muted'
                >
                  <Image
                    src={img}
                    alt={listing.title}
                    fill
                    className='object-cover'
                    sizes='50vw'
                  />
                </div>
              )
            })}
          </div>

          {/* Per-listing summary */}
          <div className='grid grid-cols-2 gap-px bg-border/40'>
            {items.map((listing) => (
              <div
                key={listing.listingId}
                className='p-3 bg-card flex flex-col gap-2'
              >
                <Typography
                  variant='p'
                  className='font-semibold text-sm line-clamp-2 text-foreground leading-snug'
                >
                  {listing.title}
                </Typography>

                <span className='text-sm font-bold text-red-500 tabular-nums'>
                  {formatByLocale(listing.price, language)}
                </span>

                <div className='flex flex-wrap gap-1.5'>
                  {listing.area !== null && listing.area !== undefined && (
                    <Badge
                      variant='outline'
                      className='text-xs font-normal px-2 py-0.5 tabular-nums'
                    >
                      {listing.area} m²
                    </Badge>
                  )}
                  {listing.bedrooms !== null &&
                    listing.bedrooms !== undefined && (
                      <Badge
                        variant='outline'
                        className='text-xs font-normal px-2 py-0.5 tabular-nums'
                      >
                        {listing.bedrooms} {t('bedrooms')}
                      </Badge>
                    )}
                </div>
              </div>
            ))}
          </div>

          {/* View full comparison button */}
          <div className='p-3 pt-2'>
            <Button
              size='sm'
              variant='outline'
              className='w-full h-9 text-sm font-medium rounded-lg gap-1.5'
              onClick={() => setShowDialog(true)}
            >
              <Maximize2 className='w-4 h-4' aria-hidden='true' />
              {t('viewFullComparison')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AiChatCompareDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        listings={listings}
      />
    </>
  )
}

export default AiChatCompare
