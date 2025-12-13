import { useMemo } from 'react'
import Image from 'next/image'
import { X, Check, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table'
import { ScrollArea } from '@/components/atoms/scroll-area'
import { ListingApi } from '@/api/types/property.type'
import { useCompareStore } from '@/store/compare/useCompareStore'
import { formatByLocale } from '@/utils/currency/convert'
import { useLanguage } from '@/hooks/useLanguage'
import {
  getPriceUnitTranslationKey,
  getFurnishingTranslationKey,
  getDirectionTranslationKey,
  getProductTypeTranslationKey,
} from '@/utils/property'
import { cn } from '@/lib/utils'

interface CompareTableProps {
  listings: ListingApi[]
  className?: string
}

interface PriceDisplayProps {
  price: number
  priceUnit?: string
  isLowest: boolean
  formattedPrice: string
  unitKey: string
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  isLowest,
  formattedPrice,
  unitKey,
}) => {
  return (
    <div className='flex flex-col gap-1'>
      <span className={cn('font-semibold', isLowest && 'text-primary text-lg')}>
        {formattedPrice}
      </span>
      {unitKey && (
        <span className='text-xs text-muted-foreground'>/{unitKey}</span>
      )}
    </div>
  )
}

interface LocationDisplayProps {
  address: string | undefined | null
  formatValue: (value: string | number | undefined | null) => string
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({
  address,
  formatValue,
}) => {
  return (
    <span className='max-w-[200px] truncate block'>{formatValue(address)}</span>
  )
}

interface VipTypeBadgeProps {
  vipType: string
  vipTypeLabel: string
}

const VipTypeBadge: React.FC<VipTypeBadgeProps> = ({
  vipType,
  vipTypeLabel,
}) => {
  const vipGradients: Record<string, string> = {
    DIAMOND:
      'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-600',
    GOLD: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-600',
    SILVER:
      'bg-gradient-to-r from-gray-400 to-gray-600 text-white border-gray-600',
  }
  const gradientClass =
    vipGradients[vipType] ||
    'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
  return (
    <Badge
      variant='default'
      className={cn(
        'backdrop-blur-md font-semibold shadow-lg border',
        gradientClass,
      )}
    >
      {vipTypeLabel}
    </Badge>
  )
}

interface AmenitiesDisplayProps {
  amenities: Array<{ amenityId: number; name?: string }>
  notAvailableText: string
}

const AmenitiesDisplay: React.FC<AmenitiesDisplayProps> = ({
  amenities,
  notAvailableText,
}) => {
  return (
    <div className='flex flex-wrap gap-1 max-w-[200px]'>
      {amenities.slice(0, 3).map((amenity) => (
        <Badge key={amenity.amenityId} variant='outline' className='text-xs'>
          {amenity.name || notAvailableText}
        </Badge>
      ))}
      {amenities.length > 3 && (
        <Badge variant='outline' className='text-xs'>
          +{amenities.length - 3}
        </Badge>
      )}
    </div>
  )
}

const CompareTable: React.FC<CompareTableProps> = ({ listings, className }) => {
  const t = useTranslations('compare')
  const tRoot = useTranslations() // Root translation for apartmentDetail
  const tCreatePost = useTranslations('createPost.sections.propertyInfo')
  const tSeller = useTranslations('seller.listingManagement.card') // For VIP types
  const { removeFromCompare } = useCompareStore()
  const { language } = useLanguage()

  // Get primary image for each listing
  const listingImages = useMemo(() => {
    return listings.map((listing) => {
      const coverImage = listing.media?.find(
        (m) =>
          m.mediaType === 'IMAGE' &&
          m.isPrimary &&
          m.sourceType !== 'YOUTUBE' &&
          !m.url?.includes('youtube.com') &&
          !m.url?.includes('youtu.be'),
      )
      return coverImage?.url || '/images/default-image.jpg'
    })
  }, [listings])

  // Helper to format value or show N/A
  const formatValue = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null || value === '') {
      return t('table.notAvailable')
    }
    return String(value)
  }

  // Helper to format boolean
  const formatBoolean = (value: boolean | undefined): React.ReactNode => {
    if (value === undefined) {
      return (
        <span className='text-muted-foreground'>{t('table.notAvailable')}</span>
      )
    }
    return value ? (
      <Check className='w-4 h-4 text-green-600' />
    ) : (
      <XCircle className='w-4 h-4 text-muted-foreground' />
    )
  }

  // Find lowest price for highlighting
  const lowestPrice = useMemo(() => {
    const prices = listings
      .map((l) => l.price)
      .filter((p): p is number => typeof p === 'number' && p > 0)
    return prices.length > 0 ? Math.min(...prices) : null
  }, [listings])

  // Comparison rows data
  const comparisonRows = useMemo(() => {
    return [
      {
        label: t('table.price'),
        getValue: (listing: ListingApi) => {
          const price = listing.price
          const priceUnit = listing.priceUnit
          if (!price || price <= 0) {
            return t('table.notAvailable')
          }
          const formattedPrice = formatByLocale(price, language)
          const unitKey = priceUnit
            ? tRoot(getPriceUnitTranslationKey(priceUnit))
            : ''
          const isLowest = lowestPrice === price
          return (
            <PriceDisplay
              price={price}
              priceUnit={priceUnit}
              isLowest={isLowest}
              formattedPrice={formattedPrice}
              unitKey={unitKey}
            />
          )
        },
      },
      {
        label: t('table.location'),
        getValue: (listing: ListingApi) => {
          const address =
            listing.address?.fullNewAddress || listing.address?.fullAddress
          return <LocationDisplay address={address} formatValue={formatValue} />
        },
      },
      {
        label: t('table.area'),
        getValue: (listing: ListingApi) => {
          const area = listing.area
          return area ? `${formatValue(area)} m²` : t('table.notAvailable')
        },
      },
      {
        label: t('table.bedrooms'),
        getValue: (listing: ListingApi) => formatValue(listing.bedrooms),
      },
      {
        label: t('table.bathrooms'),
        getValue: (listing: ListingApi) => formatValue(listing.bathrooms),
      },
      {
        label: t('table.furnishing'),
        getValue: (listing: ListingApi) => {
          if (!listing.furnishing) {
            return t('table.notAvailable')
          }
          return tRoot(getFurnishingTranslationKey(listing.furnishing))
        },
      },
      {
        label: t('table.direction'),
        getValue: (listing: ListingApi) => {
          if (!listing.direction) {
            return t('table.notAvailable')
          }
          return tRoot(getDirectionTranslationKey(listing.direction))
        },
      },
      {
        label: t('table.propertyType'),
        getValue: (listing: ListingApi) => {
          if (!listing.productType) {
            return t('table.notAvailable')
          }
          return tRoot(getProductTypeTranslationKey(listing.productType))
        },
      },
      {
        label: t('table.verified'),
        getValue: (listing: ListingApi) => formatBoolean(listing.verified),
      },
      {
        label: t('table.vipType'),
        getValue: (listing: ListingApi) => {
          if (!listing.vipType || listing.vipType === 'NORMAL') {
            return t('table.notAvailable')
          }
          return (
            <VipTypeBadge
              vipType={listing.vipType}
              vipTypeLabel={tSeller(`vipTypes.${listing.vipType}`)}
            />
          )
        },
      },
      {
        label: t('table.amenities'),
        getValue: (listing: ListingApi) => {
          const amenities = listing.amenities
          if (!amenities || amenities.length === 0) {
            return t('table.notAvailable')
          }
          return (
            <AmenitiesDisplay
              amenities={amenities}
              notAvailableText={t('table.notAvailable')}
            />
          )
        },
      },
    ]
  }, [t, tRoot, tCreatePost, tSeller, language, lowestPrice])

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop: Full table with horizontal scroll */}
      <div className='hidden md:block'>
        <ScrollArea className='w-full'>
          <div className='min-w-[800px]'>
            <Table>
              <TableHeader>
                <TableRow className='bg-gradient-to-r from-muted/80 to-muted/60 backdrop-blur-md border-b-2 border-border'>
                  <TableHead className='sticky left-0 z-20 bg-gradient-to-r from-muted/95 to-muted/90 backdrop-blur-md min-w-[150px] font-bold text-base'>
                    {t('table.features')}
                  </TableHead>
                  {listings.map((listing, index) => (
                    <TableHead
                      key={listing.listingId}
                      className='min-w-[250px] relative bg-gradient-to-b from-muted/40 to-transparent'
                    >
                      <div className='flex flex-col gap-3 pb-2'>
                        {/* Image */}
                        <div className='relative w-full h-40 rounded-lg overflow-hidden bg-muted shadow-md group'>
                          <Image
                            src={listingImages[index]}
                            alt={listing.title}
                            fill
                            className='object-cover transition-transform duration-300 group-hover:scale-105'
                            unoptimized={listingImages[index].includes(
                              'default',
                            )}
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent' />
                        </div>

                        {/* Title */}
                        <Link
                          href={`/listing-detail/${listing.listingId}`}
                          className='font-semibold text-sm hover:text-primary transition-colors line-clamp-2 group'
                        >
                          <span className='group-hover:underline'>
                            {listing.title}
                          </span>
                        </Link>

                        {/* Remove button */}
                        <Button
                          variant='ghost'
                          size='icon'
                          className='absolute top-2 right-2 h-7 w-7 bg-background/90 backdrop-blur-sm hover:bg-destructive/10 hover:text-destructive transition-colors z-10'
                          onClick={() => removeFromCompare(listing.listingId)}
                        >
                          <X className='w-4 h-4' />
                        </Button>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonRows.map((row, rowIndex) => (
                  <TableRow
                    key={row.label}
                    className={cn(
                      rowIndex % 2 === 0 && 'bg-muted/10',
                      'hover:bg-muted/30 transition-colors border-b border-border/50',
                    )}
                  >
                    <TableCell className='font-semibold sticky left-0 z-10 bg-background/98 backdrop-blur-md border-r border-border/50 pr-4'>
                      {row.label}
                    </TableCell>
                    {listings.map((listing) => (
                      <TableCell key={listing.listingId}>
                        {row.getValue(listing)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>

      {/* Mobile: Stacked cards */}
      <div className='md:hidden space-y-4'>
        {listings.map((listing, index) => (
          <div
            key={listing.listingId}
            className='border rounded-lg p-4 space-y-3 bg-card'
          >
            {/* Header with image and title */}
            <div className='flex gap-3 pb-3 border-b border-border'>
              <div className='relative w-28 h-28 rounded-lg overflow-hidden bg-muted shrink-0 shadow-md'>
                <Image
                  src={listingImages[index]}
                  alt={listing.title}
                  fill
                  className='object-cover'
                  unoptimized={listingImages[index].includes('default')}
                />
              </div>
              <div className='flex-1 min-w-0'>
                <Link
                  href={`/listing-detail/${listing.listingId}`}
                  className='font-semibold text-sm hover:text-primary transition-colors line-clamp-2 block mb-2 group'
                >
                  <span className='group-hover:underline'>{listing.title}</span>
                </Link>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => removeFromCompare(listing.listingId)}
                  className='h-7 text-destructive hover:text-destructive hover:bg-destructive/10'
                >
                  <X className='w-4 h-4 mr-1' />
                  {t('actions.removeFromCompare')}
                </Button>
              </div>
            </div>

            {/* Comparison details */}
            <div className='grid grid-cols-2 gap-3 text-sm pt-2'>
              {comparisonRows.map((row) => (
                <div
                  key={row.label}
                  className='space-y-1 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors'
                >
                  <div className='text-muted-foreground text-xs font-medium'>
                    {row.label}
                  </div>
                  <div className='font-semibold text-foreground'>
                    {row.getValue(listing)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CompareTable
