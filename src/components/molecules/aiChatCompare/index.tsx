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
          'overflow-hidden border border-border/40 bg-card py-0',
          className,
        )}
      >
        <CardContent className='p-0'>
          {/* Images row */}
          <div className='grid grid-cols-2 gap-px bg-border/30'>
            {items.map((listing) => {
              const img =
                listing.media?.find((m) => m.isPrimary)?.url ||
                listing.media?.[0]?.url ||
                DEFAULT_IMAGE
              return (
                <div key={listing.listingId} className='relative h-28 bg-muted'>
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

          {/* Titles */}
          <div className='grid grid-cols-2 gap-px bg-border/30'>
            {items.map((listing) => (
              <div key={listing.listingId} className='p-2 bg-card'>
                <Typography
                  variant='p'
                  className='font-semibold text-xs line-clamp-2 text-foreground'
                >
                  {listing.title}
                </Typography>
              </div>
            ))}
          </div>

          {/* Compact key metrics per listing */}
          <div className='grid grid-cols-2 gap-px bg-border/30'>
            {items.map((listing) => (
              <div key={listing.listingId} className='p-2 bg-card space-y-1.5'>
                <Badge
                  variant='secondary'
                  className='text-[10px] px-1.5 py-0.5 font-semibold text-primary'
                >
                  {formatByLocale(listing.price, language)}
                </Badge>
                <div className='flex flex-wrap gap-1'>
                  {listing.area !== null && listing.area !== undefined && (
                    <Badge
                      variant='outline'
                      className='text-[10px] px-1.5 py-0.5'
                    >
                      {listing.area}m²
                    </Badge>
                  )}
                  {listing.bedrooms !== null &&
                    listing.bedrooms !== undefined && (
                      <Badge
                        variant='outline'
                        className='text-[10px] px-1.5 py-0.5'
                      >
                        {listing.bedrooms} {t('bedrooms')}
                      </Badge>
                    )}
                </div>
              </div>
            ))}
          </div>

          {/* View full comparison button */}
          <div className='p-2'>
            <Button
              size='sm'
              variant='outline'
              className='w-full text-xs h-8 rounded-lg'
              onClick={() => setShowDialog(true)}
            >
              <Maximize2 className='mr-1.5 w-3 h-3' />
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
