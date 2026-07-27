import React, { useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Card, CardContent } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { ListingDetail } from '@/api/types'
import { formatByLocale } from '@/utils/currency/convert'
import {
  getDirectionTranslationKey,
  getFurnishingTranslationKey,
  getPriceUnitTranslationKey,
  getProductTypeTranslationKey,
} from '@/utils/property'
import { Button } from '@/components/atoms/button'
import SaveListingButton from '@/components/molecules/saveListingButton'
import CompareToggleBtn from '@/components/molecules/compareToggleBtn'
import {
  Bath,
  BedDouble,
  Building2,
  ChevronDown,
  ChevronUp,
  Copy,
  Droplet,
  Flag,
  Receipt,
  Ruler,
  Sofa,
  Users,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { ReportListingDialog } from '@/components/molecules/reportListingDialog'
import { ListingApi } from '@/api/types/property.type'

interface PropertyHeaderProps {
  listing: ListingDetail
}

const PropertyHeader: React.FC<PropertyHeaderProps> = (props) => {
  const t = useTranslations()
  const locale = useLocale()
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [isTitleExpanded, setIsTitleExpanded] = useState(false)
  const [isTitleTruncated, setIsTitleTruncated] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)

  const { listing } = props

  const {
    title,
    address,
    price,
    priceUnit,
    area,
    bedrooms,
    bathrooms,
    roomCapacity,
    vipType,
    productType,
    direction,
    furnishing,
    waterPrice,
    electricityPrice,
    internetPrice,
    serviceFee,
    listingId,
  } = listing || {}

  const { fullNewAddress: newAddress, fullAddress: oldAddress } = address || {}

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success(t('common.copied') || 'Link copied!')
  }

  const handleReport = () => {
    setReportDialogOpen(true)
  }

  useEffect(() => {
    const titleEl = titleRef.current
    if (!titleEl) return

    setIsTitleTruncated(titleEl.scrollHeight > titleEl.clientHeight + 1)
  }, [title])

  const utilityPriceTranslationKeys = {
    NEGOTIABLE: 'residentialFilter.utilitiesPrice.electricity.negotiable',
    SET_BY_OWNER: 'residentialFilter.utilitiesPrice.electricity.owner',
    PROVIDER_RATE: 'residentialFilter.utilitiesPrice.electricity.provider',
  } as const

  const getVipBadge = () => {
    if (!vipType || vipType === 'NORMAL' || vipType === 'SILVER') return null
    return {
      className:
        'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-transparent',
      text: t('homePage.priorityBadge'),
      variant: 'default' as const,
    }
  }
  const vipBadge = getVipBadge()

  const normalizeUtilityValue = (
    utilityValue?: string | number | null,
  ): string | null => {
    if (utilityValue === undefined || utilityValue === null) return null

    if (typeof utilityValue === 'number') {
      if (!Number.isFinite(utilityValue)) return null
      return formatByLocale(utilityValue, locale)
    }

    const rawValue = utilityValue.toString().trim()
    if (!rawValue) return null

    const enumTranslationKey =
      utilityPriceTranslationKeys[
        rawValue as keyof typeof utilityPriceTranslationKeys
      ]

    if (enumTranslationKey) {
      return t(enumTranslationKey)
    }

    if (/^[\d.,\s]+$/.test(rawValue)) {
      const parsedValue = Number(rawValue.replace(/[\s.,]/g, ''))
      if (Number.isFinite(parsedValue)) {
        return formatByLocale(parsedValue, locale)
      }
    }

    return rawValue
  }

  const topMeta = [
    {
      key: 'productType',
      label: t('apartmentDetail.property.productType'),
      value: productType ? t(getProductTypeTranslationKey(productType)) : null,
    },
    {
      key: 'direction',
      label: t('apartmentDetail.property.direction'),
      value: direction ? t(getDirectionTranslationKey(direction)) : null,
    },
    {
      key: 'furnishing',
      label: t('apartmentDetail.property.furnishing'),
      value: furnishing ? t(getFurnishingTranslationKey(furnishing)) : null,
    },
  ].filter((item) => item.value)

  const characteristics: {
    key: string
    icon: LucideIcon
    label: string
    value: string | null
  }[] = [
    {
      key: 'productType',
      icon: Building2,
      label: t('apartmentDetail.property.productType'),
      value: productType ? t(getProductTypeTranslationKey(productType)) : null,
    },
    {
      key: 'area',
      icon: Ruler,
      label: t('apartmentDetail.property.area'),
      value:
        area !== undefined && area !== null ? `${area.toString()} m²` : null,
    },
    {
      key: 'bedrooms',
      icon: BedDouble,
      label: t('apartmentDetail.property.bedrooms'),
      value:
        bedrooms !== undefined && bedrooms !== null
          ? bedrooms.toString()
          : null,
    },
    {
      key: 'bathrooms',
      icon: Bath,
      label: t('apartmentDetail.property.bathrooms'),
      value:
        bathrooms !== undefined && bathrooms !== null
          ? bathrooms.toString()
          : null,
    },
    {
      key: 'roomCapacity',
      icon: Users,
      label: t('apartmentDetail.property.roomCapacity'),
      value:
        roomCapacity !== undefined && roomCapacity !== null
          ? roomCapacity.toString()
          : null,
    },
    {
      key: 'furnishing',
      icon: Sofa,
      label: t('apartmentDetail.property.furnishing'),
      value: furnishing ? t(getFurnishingTranslationKey(furnishing)) : null,
    },
  ].filter((item) => item.value)

  const utilityFees: {
    key: string
    icon: LucideIcon
    label: string
    value: string | null
  }[] = [
    {
      key: 'electricityPrice',
      icon: Zap,
      label: t('apartmentDetail.property.electricityPrice'),
      value: normalizeUtilityValue(electricityPrice),
    },
    {
      key: 'waterPrice',
      icon: Droplet,
      label: t('apartmentDetail.property.waterPrice'),
      value: normalizeUtilityValue(waterPrice),
    },
    {
      key: 'internetPrice',
      icon: Wifi,
      label: t('apartmentDetail.property.internetPrice'),
      value: normalizeUtilityValue(internetPrice),
    },
    {
      key: 'serviceFee',
      icon: Receipt,
      label: t('apartmentDetail.property.serviceFee'),
      value: normalizeUtilityValue(serviceFee),
    },
  ].filter((item) => item.value)

  const listingForCompare: ListingApi = {
    listingId: listing.listingId,
    title: listing.title || '',
    price: listing.price || 0,
    priceUnit: listing.priceUnit,
    area: listing.area || 0,
    bedrooms: listing.bedrooms || 0,
    bathrooms: listing.bathrooms || 0,
    roomCapacity: listing.roomCapacity,
    address: listing.address,
    media: listing.media || [],
    vipType: listing.vipType,
    verified: listing.verified || false,
    description: listing.description || '',
    postDate: listing.postDate || new Date().toISOString(),
    expiryDate: listing.expiryDate || new Date().toISOString(),
    category: listing.category || { categoryId: 0, name: '' },
    user: listing.user || { userId: 0, firstName: '', lastName: '' },
    productType: listing.productType,
    furnishing: listing.furnishing,
    direction: listing.direction,
    amenities: listing.amenities || [],
    createdAt: listing.createdAt || new Date().toISOString(),
    updatedAt: listing.updatedAt || new Date().toISOString(),
  }

  return (
    <div className='space-y-4 listing-section w-full'>
      {/* Title block — extends naturally to fill the left container, no max-width */}
      <div className='w-full'>
        {/* Title */}
        <Typography
          ref={titleRef}
          variant='pageTitle'
          className={`listing-title text-foreground ${
            isTitleExpanded ? '' : 'line-clamp-2'
          }`}
        >
          {title}
        </Typography>

        {isTitleTruncated && (
          <button
            type='button'
            onClick={() => setIsTitleExpanded((prev) => !prev)}
            className='mt-1 inline-flex items-center gap-1 text-xs md:text-sm font-medium text-primary hover:underline'
          >
            {isTitleExpanded
              ? t('apartmentDetail.actions.collapseTitle')
              : t('apartmentDetail.actions.expandTitle')}
            {isTitleExpanded ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>
        )}

        {/* Badges */}
        <div className='flex flex-wrap items-center gap-1.5 mt-3'>
          {vipBadge && (
            <Badge
              variant={vipBadge.variant}
              className={`${vipBadge.className} text-2xs px-2 py-0.5`}
            >
              {vipBadge.text}
            </Badge>
          )}

          {topMeta.map((meta) => (
            <Badge
              key={meta.key}
              variant='outline'
              className='text-2xs px-2 py-0.5'
            >
              {meta.label}: {meta.value}
            </Badge>
          ))}
        </div>

        {/* Address */}
        <div className='space-y-1.5 mt-3'>
          {newAddress && (
            <Typography
              variant='p'
              className='text-xs md:text-sm text-muted-foreground flex items-start gap-2'
            >
              <span className='font-semibold text-foreground shrink-0'>
                {t('apartmentDetail.property.newAddress')}:
              </span>
              <span className='flex-1'>{newAddress}</span>
            </Typography>
          )}
          {oldAddress && (
            <Typography
              variant='p'
              className='text-xs md:text-sm text-muted-foreground flex items-start gap-2'
            >
              <span className='font-semibold text-foreground shrink-0'>
                {t('apartmentDetail.property.legacyAddress')}:
              </span>
              <span className='flex-1'>{oldAddress}</span>
            </Typography>
          )}
        </div>

        {/* Action buttons */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-2 mt-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleCopyLink}
            className='flex items-center gap-2'
          >
            <Copy size={16} />
            <span>{t('apartmentDetail.actions.share')}</span>
          </Button>

          <CompareToggleBtn
            listing={listingForCompare}
            variant='outline'
            size='sm'
            showLabel={true}
          />

          <SaveListingButton
            listingId={listingId}
            variant='default'
            size='sm'
            showLabel={true}
          />

          <Button
            variant='outline'
            size='sm'
            onClick={handleReport}
            className='flex items-center gap-2'
          >
            <Flag size={16} />
            <span>{t('common.report') || 'Report'}</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className='space-y-3'>
        {/* Price - Prominent Display */}
        <div className='price-gradient bg-gradient-to-r from-primary/10 to-transparent p-4 md:p-5 rounded-xl border border-primary/20'>
          <Typography
            variant='small'
            className='text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider text-2xs'
          >
            {t('apartmentDetail.property.price')}
          </Typography>
          {price !== undefined && price !== null && (
            <div className='flex items-baseline gap-2 flex-wrap'>
              <Typography
                variant='h2'
                className='text-xl md:text-2xl lg:text-3xl font-bold text-primary'
              >
                {formatByLocale(price, locale)}
              </Typography>
              <Typography
                variant='h5'
                className='text-sm md:text-base text-muted-foreground font-medium'
              >
                / {t(getPriceUnitTranslationKey(priceUnit))}
              </Typography>
            </div>
          )}
        </div>

        {/* Property Characteristics */}
        {characteristics.length > 0 && (
          <Card className='py-0'>
            <CardContent className='p-3.5 md:p-4'>
              <Typography variant='h4' className='text-base font-bold mb-3'>
                {t('apartmentDetail.sections.characteristics')}
              </Typography>
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5'>
                {characteristics.map((item) => (
                  <div
                    key={item.key}
                    className='flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3 text-center'
                  >
                    <div className='flex items-center gap-1.5 text-muted-foreground'>
                      <item.icon size={14} className='shrink-0' />
                      <Typography variant='p' className='text-xs truncate'>
                        {item.label}
                      </Typography>
                    </div>
                    <Typography
                      variant='p'
                      className='text-sm font-semibold text-foreground'
                    >
                      {item.value}
                    </Typography>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Utility Fees */}
        {utilityFees.length > 0 && (
          <Card className='py-0'>
            <CardContent className='p-3.5 md:p-4'>
              <Typography variant='h4' className='text-base font-bold mb-3'>
                {t('apartmentDetail.sections.utilityFees')}
              </Typography>
              <div className='flex flex-col gap-2'>
                {utilityFees.map((item) => (
                  <div
                    key={item.key}
                    className='flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2'
                  >
                    <div className='flex items-center gap-2 text-muted-foreground min-w-0'>
                      <item.icon size={16} className='shrink-0' />
                      <Typography
                        variant='p'
                        className='text-xs sm:text-sm truncate'
                      >
                        {item.label}
                      </Typography>
                    </div>
                    <Typography
                      variant='p'
                      className='text-xs sm:text-sm font-semibold text-foreground shrink-0'
                    >
                      {item.value}
                    </Typography>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Report Dialog */}
      <ReportListingDialog
        listingId={listingId || ''}
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        onSuccess={() => {
          // Handle success if needed
        }}
      />
    </div>
  )
}

export default PropertyHeader
