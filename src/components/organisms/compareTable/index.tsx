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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/atoms/tooltip'
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
  compareColumns: number
  notAvailableText: string
  formatValue: (value: string | number | undefined | null) => string
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({
  address,
  compareColumns,
  notAvailableText,
  formatValue,
}) => {
  const formattedAddress = formatValue(address)
  const shouldTruncate =
    compareColumns >= 3 && formattedAddress !== notAvailableText

  if (!shouldTruncate) {
    return (
      <span className='max-w-[360px] break-words block'>
        {formattedAddress}
      </span>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span title={formattedAddress} className='inline-block max-w-full'>
          <span className='md:max-w-[220px] md:truncate block'>
            {formattedAddress}
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent side='top' className='max-w-sm break-words'>
        {formattedAddress}
      </TooltipContent>
    </Tooltip>
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
    NORMAL: 'bg-muted text-foreground border-border',
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
  compareColumns: number
  notAvailableText: string
}

const AmenitiesDisplay: React.FC<AmenitiesDisplayProps> = ({
  amenities,
  compareColumns,
  notAvailableText,
}) => {
  const shouldCollapse = compareColumns >= 3 && amenities.length > 3
  const visibleAmenities = shouldCollapse ? amenities.slice(0, 3) : amenities
  const hiddenCount = amenities.length - visibleAmenities.length
  const fullAmenitiesText = amenities
    .map((amenity) => amenity.name || notAvailableText)
    .join(', ')

  const amenityContent = (
    <div
      className={cn(
        'flex flex-wrap gap-1.5',
        compareColumns >= 3 ? 'md:max-w-[220px]' : 'max-w-none',
      )}
    >
      {visibleAmenities.map((amenity) => (
        <Badge key={amenity.amenityId} variant='outline' className='text-xs'>
          {amenity.name || notAvailableText}
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <Badge variant='secondary' className='text-xs font-semibold'>
          +{hiddenCount}
        </Badge>
      )}
    </div>
  )

  if (!shouldCollapse) {
    return amenityContent
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div title={fullAmenitiesText}>{amenityContent}</div>
      </TooltipTrigger>
      <TooltipContent side='top' className='max-w-sm'>
        <div className='flex flex-wrap gap-1.5'>
          {amenities.map((amenity) => (
            <Badge
              key={`${amenity.amenityId}-full`}
              variant='secondary'
              className='text-xs'
            >
              {amenity.name || notAvailableText}
            </Badge>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

const CompareTable: React.FC<CompareTableProps> = ({ listings, className }) => {
  const t = useTranslations('compare')
  const tRoot = useTranslations()
  const { removeFromCompare } = useCompareStore()
  const { language } = useLanguage()
  const locale = language === 'vi' ? 'vi-VN' : 'en-US'

  const utilityPriceTranslationKeys = {
    NEGOTIABLE: 'residentialFilter.utilitiesPrice.electricity.negotiable',
    SET_BY_OWNER: 'residentialFilter.utilitiesPrice.electricity.owner',
    PROVIDER_RATE: 'residentialFilter.utilitiesPrice.electricity.provider',
  } as const

  const listingTypeTranslationKeys = {
    RENT: 'apartmentDetail.property.listingTypes.RENT',
    SHARE: 'apartmentDetail.property.listingTypes.SHARE',
    SALE: 'apartmentDetail.property.listingTypes.SALE',
  } as const

  const vipTypeTranslationKeys = {
    NORMAL: 'apartmentDetail.property.vipTypes.NORMAL',
    SILVER: 'apartmentDetail.property.vipTypes.SILVER',
    GOLD: 'apartmentDetail.property.vipTypes.GOLD',
    DIAMOND: 'apartmentDetail.property.vipTypes.DIAMOND',
  } as const

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

  const formatBoolean = (value: boolean | undefined): React.ReactNode => {
    if (value === undefined || value === null) {
      return (
        <span className='text-muted-foreground'>{t('table.notAvailable')}</span>
      )
    }

    return value ? (
      <span className='inline-flex items-center gap-1.5'>
        <Check className='w-4 h-4 text-green-600' />
        <span>{t('table.yes')}</span>
      </span>
    ) : (
      <span className='inline-flex items-center gap-1.5'>
        <XCircle className='w-4 h-4 text-muted-foreground' />
        <span>{t('table.no')}</span>
      </span>
    )
  }

  const formatDateValue = (value: string | Date | undefined | null): string => {
    if (!value) return t('table.notAvailable')

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return t('table.notAvailable')
    }

    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
    }).format(date)
  }

  const formatUtilityValue = (
    utilityValue?: string | number | null,
  ): string => {
    if (utilityValue === undefined || utilityValue === null) {
      return t('table.notAvailable')
    }

    if (typeof utilityValue === 'number') {
      if (!Number.isFinite(utilityValue)) {
        return t('table.notAvailable')
      }
      return formatByLocale(utilityValue, language)
    }

    const rawValue = utilityValue.toString().trim()
    if (!rawValue) {
      return t('table.notAvailable')
    }

    const enumTranslationKey =
      utilityPriceTranslationKeys[
        rawValue as keyof typeof utilityPriceTranslationKeys
      ]

    if (enumTranslationKey) {
      return tRoot(enumTranslationKey)
    }

    if (/^[\d.,\s]+$/.test(rawValue)) {
      const parsedValue = Number(rawValue.replace(/[\s.,]/g, ''))
      if (Number.isFinite(parsedValue)) {
        return formatByLocale(parsedValue, language)
      }
    }

    return rawValue
  }

  const formatListingType = (listingType?: string): string => {
    if (!listingType) {
      return t('table.notAvailable')
    }

    const translationKey =
      listingTypeTranslationKeys[
        listingType as keyof typeof listingTypeTranslationKeys
      ]

    return translationKey ? tRoot(translationKey) : listingType
  }

  const formatVipType = (vipType?: string): string => {
    if (!vipType) {
      return t('table.notAvailable')
    }

    const translationKey =
      vipTypeTranslationKeys[vipType as keyof typeof vipTypeTranslationKeys]
    return translationKey ? tRoot(translationKey) : vipType
  }

  const formatArea = (area: number | undefined): string => {
    if (!area || area <= 0) {
      return t('table.notAvailable')
    }

    return `${new Intl.NumberFormat(locale).format(area)} m²`
  }

  const formatPricePerSqm = (listing: ListingApi): string => {
    if (!listing.price || !listing.area || listing.area <= 0) {
      return t('table.notAvailable')
    }

    return `${formatByLocale(listing.price / listing.area, language)} /m²`
  }

  const formatCategory = (listing: ListingApi): string => {
    return formatValue(listing.category?.name)
  }

  const formatRoomCapacity = (listing: ListingApi): string => {
    if (listing.roomCapacity === undefined || listing.roomCapacity === null) {
      return t('table.notAvailable')
    }

    return String(listing.roomCapacity)
  }

  const formatAmenities = (listing: ListingApi): React.ReactNode => {
    const amenities = listing.amenities
    if (!amenities || amenities.length === 0) {
      return t('table.notAvailable')
    }

    return (
      <AmenitiesDisplay
        amenities={amenities}
        compareColumns={listings.length}
        notAvailableText={t('table.notAvailable')}
      />
    )
  }

  const formatVipDisplay = (listing: ListingApi): React.ReactNode => {
    if (!listing.vipType) {
      return t('table.notAvailable')
    }

    return (
      <VipTypeBadge
        vipType={listing.vipType}
        vipTypeLabel={formatVipType(listing.vipType)}
      />
    )
  }

  const formatLocation = (listing: ListingApi): React.ReactNode => {
    const address =
      listing.address?.fullNewAddress || listing.address?.fullAddress
    return (
      <LocationDisplay
        address={address}
        compareColumns={listings.length}
        notAvailableText={t('table.notAvailable')}
        formatValue={formatValue}
      />
    )
  }

  const formatPriceValue = (listing: ListingApi): React.ReactNode => {
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
        isLowest={isLowest}
        formattedPrice={formattedPrice}
        unitKey={unitKey}
      />
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
        key: 'price',
        label: t('table.price'),
        getValue: (listing: ListingApi) => formatPriceValue(listing),
      },
      {
        key: 'pricePerSqm',
        label: t('table.pricePerSqm'),
        getValue: (listing: ListingApi) => formatPricePerSqm(listing),
      },
      {
        key: 'location',
        label: t('table.location'),
        getValue: (listing: ListingApi) => formatLocation(listing),
      },
      {
        key: 'area',
        label: t('table.area'),
        getValue: (listing: ListingApi) => formatArea(listing.area),
      },
      {
        key: 'propertyType',
        label: t('table.propertyType'),
        getValue: (listing: ListingApi) => {
          if (!listing.productType) {
            return t('table.notAvailable')
          }
          return tRoot(getProductTypeTranslationKey(listing.productType))
        },
      },
      {
        key: 'listingType',
        label: t('table.listingType'),
        getValue: (listing: ListingApi) =>
          formatListingType(listing.listingType),
      },
      {
        key: 'category',
        label: t('table.category'),
        getValue: (listing: ListingApi) => formatCategory(listing),
      },
      {
        key: 'bedrooms',
        label: t('table.bedrooms'),
        getValue: (listing: ListingApi) => formatValue(listing.bedrooms),
      },
      {
        key: 'bathrooms',
        label: t('table.bathrooms'),
        getValue: (listing: ListingApi) => formatValue(listing.bathrooms),
      },
      {
        key: 'roomCapacity',
        label: t('table.roomCapacity'),
        getValue: (listing: ListingApi) => formatRoomCapacity(listing),
      },
      {
        key: 'furnishing',
        label: t('table.furnishing'),
        getValue: (listing: ListingApi) => {
          if (!listing.furnishing) {
            return t('table.notAvailable')
          }
          return tRoot(getFurnishingTranslationKey(listing.furnishing))
        },
      },
      {
        key: 'direction',
        label: t('table.direction'),
        getValue: (listing: ListingApi) => {
          if (!listing.direction) {
            return t('table.notAvailable')
          }
          return tRoot(getDirectionTranslationKey(listing.direction))
        },
      },
      {
        key: 'verified',
        label: t('table.verified'),
        getValue: (listing: ListingApi) => formatBoolean(listing.verified),
      },
      {
        key: 'contactAvailable',
        label: t('table.contactAvailable'),
        getValue: (listing: ListingApi) =>
          formatBoolean(listing.contactAvailable),
      },
      {
        key: 'ownerPhoneVerified',
        label: t('table.ownerPhoneVerified'),
        getValue: (listing: ListingApi) =>
          formatBoolean(listing.ownerContactPhoneVerified),
      },
      {
        key: 'vipType',
        label: t('table.vipType'),
        getValue: (listing: ListingApi) => formatVipDisplay(listing),
      },
      {
        key: 'waterPrice',
        label: t('table.waterPrice'),
        getValue: (listing: ListingApi) =>
          formatUtilityValue(listing.waterPrice),
      },
      {
        key: 'electricityPrice',
        label: t('table.electricityPrice'),
        getValue: (listing: ListingApi) =>
          formatUtilityValue(listing.electricityPrice),
      },
      {
        key: 'internetPrice',
        label: t('table.internetPrice'),
        getValue: (listing: ListingApi) =>
          formatUtilityValue(listing.internetPrice),
      },
      {
        key: 'serviceFee',
        label: t('table.serviceFee'),
        getValue: (listing: ListingApi) =>
          formatUtilityValue(listing.serviceFee),
      },
      {
        key: 'amenities',
        label: t('table.amenities'),
        getValue: (listing: ListingApi) => formatAmenities(listing),
      },
      {
        key: 'postDate',
        label: t('table.postDate'),
        getValue: (listing: ListingApi) => formatDateValue(listing.postDate),
      },
      {
        key: 'expiryDate',
        label: t('table.expiryDate'),
        getValue: (listing: ListingApi) => formatDateValue(listing.expiryDate),
      },
      {
        key: 'updatedAt',
        label: t('table.updatedAt'),
        getValue: (listing: ListingApi) => formatDateValue(listing.updatedAt),
      },
      {
        key: 'listingId',
        label: t('table.listingId'),
        getValue: (listing: ListingApi) => formatValue(listing.listingId),
      },
    ]
  }, [t, tRoot, language, listings.length, locale, lowestPrice])

  return (
    <TooltipProvider delayDuration={150}>
      <div className={cn('w-full', className)}>
        {/* Desktop: Full table with horizontal scroll */}
        <div className='hidden md:block'>
          <ScrollArea className='w-full'>
            <div className='min-w-[800px]'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-gradient-to-r from-muted/80 to-muted/60 backdrop-blur-md border-b-2 border-border'>
                    <TableHead className='sticky left-0 z-20 bg-gradient-to-r from-muted/95 to-muted/90 backdrop-blur-md min-w-[160px] font-bold text-base'>
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
                      key={row.key}
                      className={cn(
                        rowIndex % 2 === 0 && 'bg-muted/10',
                        'hover:bg-muted/30 transition-colors border-b border-border/50',
                      )}
                    >
                      <TableCell className='font-semibold sticky left-0 z-10 bg-background/98 backdrop-blur-md border-r border-border/50 pr-4'>
                        {row.label}
                      </TableCell>
                      {listings.map((listing) => (
                        <TableCell key={`${row.key}-${listing.listingId}`}>
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
                    <span className='group-hover:underline'>
                      {listing.title}
                    </span>
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
                    key={`${row.key}-mobile-${listing.listingId}`}
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
    </TooltipProvider>
  )
}

export default CompareTable
