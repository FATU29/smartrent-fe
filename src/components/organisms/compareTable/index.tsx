import { Fragment, useMemo } from 'react'
import Image from 'next/image'
import { X, Check, Minus, Crown } from 'lucide-react'
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
  lowestLabel: string
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  isLowest,
  formattedPrice,
  unitKey,
  lowestLabel,
}) => (
  <div className='flex flex-col gap-1'>
    <div className='flex items-center gap-2 flex-wrap'>
      <span
        className={cn(
          'font-semibold text-primary tabular-nums',
          isLowest ? 'text-base md:text-lg' : 'text-sm md:text-base',
        )}
      >
        {formattedPrice}
      </span>
      {isLowest && (
        <Badge
          variant='secondary'
          className='bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-semibold px-1.5 py-0 h-5'
        >
          {lowestLabel}
        </Badge>
      )}
    </div>
    {unitKey && (
      <span className='text-xs text-muted-foreground'>/{unitKey}</span>
    )}
  </div>
)

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
      <span className='text-sm leading-relaxed block break-words'>
        {formattedAddress}
      </span>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className='text-sm leading-relaxed block line-clamp-2 cursor-help'>
          {formattedAddress}
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
  const vipStyles: Record<string, string> = {
    DIAMOND:
      'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-300 border-blue-500/40',
    GOLD: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40',
    SILVER: 'bg-muted text-muted-foreground border-border',
    NORMAL: 'bg-muted text-muted-foreground border-border',
  }
  const cls = vipStyles[vipType] || vipStyles.NORMAL
  return (
    <Badge variant='outline' className={cn('font-medium gap-1 text-xs', cls)}>
      {vipType !== 'NORMAL' && vipType !== 'SILVER' && (
        <Crown className='w-3 h-3' />
      )}
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
  const shouldCollapse = compareColumns >= 3 && amenities.length > 4
  const visibleAmenities = shouldCollapse ? amenities.slice(0, 4) : amenities
  const hiddenCount = amenities.length - visibleAmenities.length

  const content = (
    <div className='flex flex-wrap gap-1.5'>
      {visibleAmenities.map((amenity) => (
        <Badge
          key={amenity.amenityId}
          variant='secondary'
          className='text-xs font-normal bg-muted/60'
        >
          {amenity.name || notAvailableText}
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <Badge
          variant='outline'
          className='text-xs font-semibold text-muted-foreground'
        >
          +{hiddenCount}
        </Badge>
      )}
    </div>
  )

  if (!shouldCollapse) return content

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>{content}</div>
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

interface ComparisonRow {
  key: string
  label: string
  getValue: (listing: ListingApi) => React.ReactNode
}

interface ComparisonSection {
  key: string
  label: string
  rows: ComparisonRow[]
}

const CompareTable: React.FC<CompareTableProps> = ({ listings, className }) => {
  const t = useTranslations('compare')
  const tRoot = useTranslations()
  const { removeFromCompare } = useCompareStore()
  const { language } = useLanguage()
  const locale = language === 'vi' ? 'vi-VN' : 'en-US'
  const count = listings.length

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
        <span className='inline-flex items-center gap-1.5 text-muted-foreground text-sm'>
          <Minus className='w-3.5 h-3.5' />
          {t('table.notAvailable')}
        </span>
      )
    }

    return value ? (
      <span className='inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-medium'>
        <Check className='w-4 h-4' />
        {t('table.yes')}
      </span>
    ) : (
      <span className='inline-flex items-center gap-1.5 text-muted-foreground text-sm'>
        <Minus className='w-3.5 h-3.5' />
        {t('table.no')}
      </span>
    )
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

  const formatAmenities = (listing: ListingApi): React.ReactNode => {
    const amenities = listing.amenities
    if (!amenities || amenities.length === 0) {
      return (
        <span className='text-muted-foreground text-sm'>
          {t('table.notAvailable')}
        </span>
      )
    }

    return (
      <AmenitiesDisplay
        amenities={amenities}
        compareColumns={count}
        notAvailableText={t('table.notAvailable')}
      />
    )
  }

  const formatVipDisplay = (listing: ListingApi): React.ReactNode => {
    if (!listing.vipType) {
      return (
        <span className='text-muted-foreground text-sm'>
          {t('table.notAvailable')}
        </span>
      )
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
        compareColumns={count}
        notAvailableText={t('table.notAvailable')}
        formatValue={formatValue}
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

  const formatPriceValue = (listing: ListingApi): React.ReactNode => {
    const price = listing.price
    const priceUnit = listing.priceUnit

    if (!price || price <= 0) {
      return (
        <span className='text-muted-foreground text-sm'>
          {t('table.notAvailable')}
        </span>
      )
    }

    const formattedPrice = formatByLocale(price, language)
    const unitKey = priceUnit
      ? tRoot(getPriceUnitTranslationKey(priceUnit))
      : ''
    const isLowest = count > 1 && lowestPrice === price

    return (
      <PriceDisplay
        isLowest={isLowest}
        formattedPrice={formattedPrice}
        unitKey={unitKey}
        lowestLabel={t('table.lowestPrice')}
      />
    )
  }

  // Comparison sections
  const sections: ComparisonSection[] = useMemo(
    () => [
      {
        key: 'essentials',
        label: t('sections.essentials'),
        rows: [
          {
            key: 'price',
            label: t('table.price'),
            getValue: (l) => formatPriceValue(l),
          },
          {
            key: 'location',
            label: t('table.location'),
            getValue: (l) => formatLocation(l),
          },
          {
            key: 'area',
            label: t('table.area'),
            getValue: (l) => (
              <span className='text-sm font-medium tabular-nums'>
                {formatArea(l.area)}
              </span>
            ),
          },
        ],
      },
      {
        key: 'property',
        label: t('sections.property'),
        rows: [
          {
            key: 'propertyType',
            label: t('table.propertyType'),
            getValue: (l) =>
              l.productType
                ? tRoot(getProductTypeTranslationKey(l.productType))
                : t('table.notAvailable'),
          },
          {
            key: 'listingType',
            label: t('table.listingType'),
            getValue: (l) => formatListingType(l.listingType),
          },
          {
            key: 'category',
            label: t('table.category'),
            getValue: (l) => formatValue(l.category?.name),
          },
        ],
      },
      {
        key: 'rooms',
        label: t('sections.rooms'),
        rows: [
          {
            key: 'bedrooms',
            label: t('table.bedrooms'),
            getValue: (l) => formatValue(l.bedrooms),
          },
          {
            key: 'bathrooms',
            label: t('table.bathrooms'),
            getValue: (l) => formatValue(l.bathrooms),
          },
          {
            key: 'roomCapacity',
            label: t('table.roomCapacity'),
            getValue: (l) =>
              l.roomCapacity === undefined || l.roomCapacity === null
                ? t('table.notAvailable')
                : String(l.roomCapacity),
          },
          {
            key: 'furnishing',
            label: t('table.furnishing'),
            getValue: (l) =>
              l.furnishing
                ? tRoot(getFurnishingTranslationKey(l.furnishing))
                : t('table.notAvailable'),
          },
          {
            key: 'direction',
            label: t('table.direction'),
            getValue: (l) =>
              l.direction
                ? tRoot(getDirectionTranslationKey(l.direction))
                : t('table.notAvailable'),
          },
        ],
      },
      {
        key: 'utilities',
        label: t('sections.utilities'),
        rows: [
          {
            key: 'waterPrice',
            label: t('table.waterPrice'),
            getValue: (l) => formatUtilityValue(l.waterPrice),
          },
          {
            key: 'electricityPrice',
            label: t('table.electricityPrice'),
            getValue: (l) => formatUtilityValue(l.electricityPrice),
          },
          {
            key: 'internetPrice',
            label: t('table.internetPrice'),
            getValue: (l) => formatUtilityValue(l.internetPrice),
          },
          {
            key: 'serviceFee',
            label: t('table.serviceFee'),
            getValue: (l) => formatUtilityValue(l.serviceFee),
          },
        ],
      },
      {
        key: 'features',
        label: t('sections.features'),
        rows: [
          {
            key: 'verified',
            label: t('table.verified'),
            getValue: (l) => formatBoolean(l.verified),
          },
          {
            key: 'contactAvailable',
            label: t('table.contactAvailable'),
            getValue: (l) => formatBoolean(l.contactAvailable),
          },
          {
            key: 'ownerPhoneVerified',
            label: t('table.ownerPhoneVerified'),
            getValue: (l) => formatBoolean(l.ownerContactPhoneVerified),
          },
          {
            key: 'vipType',
            label: t('table.vipType'),
            getValue: (l) => formatVipDisplay(l),
          },
          {
            key: 'amenities',
            label: t('table.amenities'),
            getValue: (l) => formatAmenities(l),
          },
        ],
      },
    ],
    [t, tRoot, language, count, locale, lowestPrice],
  )

  // Distribute column widths equally: feature column fixed, listings share the rest
  const featureColWidth = '200px'
  const listingColWidth = `calc((100% - 200px) / ${count})`
  const minTableWidth = 200 + count * 240

  return (
    <TooltipProvider delayDuration={150}>
      <div className={cn('w-full', className)}>
        {/* Desktop: Full table */}
        <div className='hidden md:block rounded-xl border border-border bg-card overflow-hidden'>
          <ScrollArea className='w-full'>
            <div style={{ minWidth: `${minTableWidth}px` }}>
              <Table className='table-fixed w-full'>
                <colgroup>
                  <col style={{ width: featureColWidth }} />
                  {listings.map((l) => (
                    <col
                      key={`col-${l.listingId}`}
                      style={{ width: listingColWidth }}
                    />
                  ))}
                </colgroup>
                <TableHeader>
                  <TableRow className='bg-muted/40 hover:bg-muted/40 border-b border-border'>
                    <TableHead className='sticky left-0 z-20 bg-muted/80 backdrop-blur-sm font-semibold text-sm text-muted-foreground uppercase tracking-wide align-bottom pb-4'>
                      {t('table.features')}
                    </TableHead>
                    {listings.map((listing, index) => (
                      <TableHead
                        key={listing.listingId}
                        className='relative align-top p-3'
                      >
                        <div className='flex flex-col gap-3'>
                          {/* Image */}
                          <div className='relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-muted group'>
                            <Image
                              src={listingImages[index]}
                              alt={listing.title}
                              fill
                              className='object-cover transition-transform duration-300 group-hover:scale-105'
                              unoptimized={listingImages[index].includes(
                                'default',
                              )}
                            />
                            <Button
                              variant='ghost'
                              size='icon'
                              className='absolute top-1.5 right-1.5 h-7 w-7 bg-background/90 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground'
                              onClick={() =>
                                removeFromCompare(listing.listingId)
                              }
                              aria-label={t('actions.removeFromCompare')}
                            >
                              <X className='w-4 h-4' />
                            </Button>
                          </div>

                          {/* Title */}
                          <Link
                            href={`/listing-detail/${listing.listingId}`}
                            className='font-semibold text-sm leading-snug text-foreground hover:text-primary transition-colors line-clamp-2'
                          >
                            {listing.title}
                          </Link>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((section, sectionIdx) => (
                    <Fragment key={section.key}>
                      {/* Section header row */}
                      <TableRow
                        className={cn(
                          'bg-muted/30 hover:bg-muted/30 border-b border-border/60',
                          sectionIdx > 0 && 'border-t border-border/60',
                        )}
                      >
                        <TableCell
                          colSpan={count + 1}
                          className='sticky left-0 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'
                        >
                          {section.label}
                        </TableCell>
                      </TableRow>
                      {/* Section rows */}
                      {section.rows.map((row, rowIndex) => (
                        <TableRow
                          key={row.key}
                          className={cn(
                            rowIndex % 2 === 1 && 'bg-muted/15',
                            'hover:bg-accent/40 transition-colors border-b border-border/40',
                          )}
                        >
                          <TableCell className='sticky left-0 z-10 bg-card/98 backdrop-blur-sm border-r border-border/40 font-medium text-sm text-muted-foreground align-top py-3'>
                            {row.label}
                          </TableCell>
                          {listings.map((listing) => (
                            <TableCell
                              key={`${row.key}-${listing.listingId}`}
                              className='align-top py-3 text-sm'
                            >
                              {row.getValue(listing)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>

        {/* Mobile: Stacked cards per listing */}
        <div className='md:hidden space-y-4'>
          {listings.map((listing, index) => (
            <div
              key={listing.listingId}
              className='rounded-xl border border-border bg-card overflow-hidden'
            >
              {/* Header with image and title */}
              <div className='relative'>
                <div className='relative w-full aspect-[16/9] bg-muted'>
                  <Image
                    src={listingImages[index]}
                    alt={listing.title}
                    fill
                    className='object-cover'
                    unoptimized={listingImages[index].includes('default')}
                  />
                  <Button
                    variant='ghost'
                    size='icon'
                    className='absolute top-2 right-2 h-8 w-8 bg-background/90 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground'
                    onClick={() => removeFromCompare(listing.listingId)}
                    aria-label={t('actions.removeFromCompare')}
                  >
                    <X className='w-4 h-4' />
                  </Button>
                </div>
                <div className='p-4 border-b border-border'>
                  <Link
                    href={`/listing-detail/${listing.listingId}`}
                    className='font-semibold text-base leading-snug hover:text-primary transition-colors line-clamp-2 block'
                  >
                    {listing.title}
                  </Link>
                </div>
              </div>

              {/* Sections */}
              <div className='divide-y divide-border/60'>
                {sections.map((section) => (
                  <div key={section.key} className='p-4'>
                    <h4 className='text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3'>
                      {section.label}
                    </h4>
                    <dl className='space-y-2.5'>
                      {section.rows.map((row) => (
                        <div
                          key={row.key}
                          className='flex items-start gap-3 text-sm'
                        >
                          <dt className='min-w-[110px] text-muted-foreground shrink-0'>
                            {row.label}
                          </dt>
                          <dd className='flex-1 min-w-0 font-medium text-foreground'>
                            {row.getValue(listing)}
                          </dd>
                        </div>
                      ))}
                    </dl>
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
