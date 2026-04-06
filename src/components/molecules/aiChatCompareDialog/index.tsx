import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ExternalLink } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { cn } from '@/lib/utils'
import { formatByLocale } from '@/utils/currency/convert'
import { useLanguage } from '@/hooks/useLanguage'
import { DEFAULT_IMAGE } from '@/constants/common'
import type { ChatListing } from '@/api/types/ai.type'

interface AiChatCompareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listings: ChatListing[]
}

interface CompareRow {
  label: string
  getValue: (listing: ChatListing) => string | number | null | undefined
  format?: 'price' | 'area'
  wrap?: boolean
}

const AiChatCompareDialog: React.FC<AiChatCompareDialogProps> = ({
  open,
  onOpenChange,
  listings,
}) => {
  const t = useTranslations('chat.compare')
  const tListing = useTranslations('chat.listing')
  // Use correct namespace for furnishing/direction translations
  const tFurnishing = useTranslations(
    'createPost.sections.propertyInfo.furnishing',
  )
  const tDirection = useTranslations(
    'createPost.sections.utilitiesStructure.directions',
  )
  const { language } = useLanguage()

  const items = listings.slice(0, 2)

  const formatFurnishing = (value: string | null | undefined): string => {
    if (!value) return '—'
    try {
      return tFurnishing(value)
    } catch {
      return value
    }
  }

  const formatDirection = (value: string | null | undefined): string => {
    if (!value) return '—'
    try {
      return tDirection(value.toLowerCase())
    } catch {
      return value
    }
  }

  const rows: CompareRow[] = [
    { label: t('price'), getValue: (l) => l.price, format: 'price' },
    { label: t('area'), getValue: (l) => l.area, format: 'area' },
    {
      label: t('pricePerArea'),
      getValue: (l) =>
        l.price && l.area ? Math.round(l.price / l.area) : null,
      format: 'price',
    },
    { label: t('bedrooms'), getValue: (l) => l.bedrooms },
    { label: t('bathrooms'), getValue: (l) => l.bathrooms },
    {
      label: t('furnishing'),
      getValue: (l) => formatFurnishing(l.furnishing),
    },
    {
      label: t('direction'),
      getValue: (l) => formatDirection(l.direction),
    },
    {
      label: t('address'),
      getValue: (l) => l.address?.fullAddress,
      wrap: true,
    },
  ]

  const formatValue = (
    value: string | number | null | undefined,
    format?: CompareRow['format'],
  ) => {
    if (value === null || value === undefined) return '—'
    if (format === 'price') return formatByLocale(Number(value), language)
    if (format === 'area') return `${value}m²`
    return String(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[95vw] max-w-2xl p-0 overflow-hidden'>
        <DialogHeader className='px-5 pt-5 pb-3'>
          <DialogTitle className='text-base font-semibold'>
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <div className='max-h-[80vh] overflow-y-auto'>
          {/* Images */}
          <div className='grid grid-cols-2 gap-px bg-border/30'>
            {items.map((listing) => {
              const img =
                listing.media?.find((m) => m.isPrimary)?.url ||
                listing.media?.[0]?.url ||
                DEFAULT_IMAGE
              return (
                <div key={listing.listingId} className='relative h-44 bg-muted'>
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

          {/* Titles + Price (visible at glance) */}
          <div className='grid grid-cols-2 gap-px bg-border/30'>
            {items.map((listing) => (
              <div key={listing.listingId} className='p-3 bg-card space-y-1'>
                <p className='font-semibold text-sm line-clamp-2 text-foreground'>
                  {listing.title}
                </p>
                <p className='font-bold text-sm text-primary'>
                  {formatByLocale(listing.price, language)}
                </p>
              </div>
            ))}
          </div>

          {/* Comparison table - larger text, more breathing room */}
          <div className='overflow-x-auto'>
            <table className='w-full text-sm border-collapse'>
              <thead className='sr-only'>
                <tr>
                  <th scope='col'>Attribute</th>
                  {items.map((l) => (
                    <th key={l.listingId} scope='col'>
                      {l.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-border/30'>
                {rows.map((row) => (
                  <tr key={row.label} className='hover:bg-muted/20'>
                    <td className='px-4 py-3 bg-muted/30 font-medium text-muted-foreground w-[100px] align-top'>
                      {row.label}
                    </td>
                    {items.map((listing) => (
                      <td
                        key={listing.listingId}
                        className={cn(
                          'px-4 py-3 text-foreground align-top',
                          row.wrap ? 'break-words' : 'whitespace-nowrap',
                        )}
                      >
                        {formatValue(row.getValue(listing), row.format)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* View Details buttons */}
          <div className='grid grid-cols-2 gap-3 p-4'>
            {items.map((listing) => (
              <Link
                key={listing.listingId}
                href={`/listing-detail/${listing.listingId}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Button
                  size='sm'
                  variant='outline'
                  className='w-full text-sm h-9 rounded-lg'
                >
                  {tListing('viewDetails')}
                  <ExternalLink className='ml-1.5 w-3.5 h-3.5' />
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AiChatCompareDialog
