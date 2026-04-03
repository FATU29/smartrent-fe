import React, { useState } from 'react'
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
import { Copy, Flag } from 'lucide-react'
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
    listingType,
    listingStatus,
    direction,
    furnishing,
    waterPrice,
    electricityPrice,
    internetPrice,
    serviceFee,
    verified,
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

  const utilityPriceTranslationKeys = {
    NEGOTIABLE: 'residentialFilter.utilitiesPrice.electricity.negotiable',
    SET_BY_OWNER: 'residentialFilter.utilitiesPrice.electricity.owner',
    PROVIDER_RATE: 'residentialFilter.utilitiesPrice.electricity.provider',
  } as const

  const vipBadgeConfig: Record<
    string,
    { className: string; text: string; variant: 'default' | 'secondary' }
  > = {
    DIAMOND: {
      className:
        'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent',
      text: t('listingManagement.card.vipTypes.DIAMOND'),
      variant: 'default',
    },
    GOLD: {
      className:
        'bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-transparent',
      text: t('listingManagement.card.vipTypes.GOLD'),
      variant: 'default',
    },
    SILVER: {
      className:
        'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-transparent',
      text: t('listingManagement.card.vipTypes.SILVER'),
      variant: 'default',
    },
    NORMAL: {
      className: '',
      text: t('listingManagement.card.vipTypes.NORMAL'),
      variant: 'secondary',
    },
  }

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
      key: 'listingType',
      label: t('apartmentDetail.property.listingType'),
      value: listingType
        ? t(`apartmentDetail.property.listingTypes.${listingType}`)
        : null,
    },
    {
      key: 'status',
      label: t('apartmentDetail.property.status'),
      value: listingStatus ? t(`common.status.${listingStatus}`) : null,
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
    {
      key: 'verified',
      label: t('common.status.VERIFIED'),
      value: verified ? t('compare.table.yes') : null,
    },
  ].filter((item) => item.value)

  const metrics = [
    {
      key: 'area',
      label: t('apartmentDetail.property.area'),
      value:
        area !== undefined && area !== null ? `${area.toString()} m²` : null,
    },
    {
      key: 'bedrooms',
      label: t('apartmentDetail.property.bedrooms'),
      value:
        bedrooms !== undefined && bedrooms !== null
          ? bedrooms.toString()
          : null,
    },
    {
      key: 'bathrooms',
      label: t('apartmentDetail.property.bathrooms'),
      value:
        bathrooms !== undefined && bathrooms !== null
          ? bathrooms.toString()
          : null,
    },
    {
      key: 'roomCapacity',
      label: t('apartmentDetail.property.roomCapacity'),
      value:
        roomCapacity !== undefined && roomCapacity !== null
          ? roomCapacity.toString()
          : null,
    },
    {
      key: 'waterPrice',
      label: t('apartmentDetail.property.waterPrice'),
      value: normalizeUtilityValue(waterPrice),
    },
    {
      key: 'electricityPrice',
      label: t('apartmentDetail.property.electricityPrice'),
      value: normalizeUtilityValue(electricityPrice),
    },
    {
      key: 'internetPrice',
      label: t('apartmentDetail.property.internetPrice'),
      value: normalizeUtilityValue(internetPrice),
    },
    {
      key: 'serviceFee',
      label: t('apartmentDetail.property.serviceFee'),
      value: normalizeUtilityValue(serviceFee),
    },
  ].filter((metric) => metric.value)

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
    <div className='space-y-5 listing-section'>
      {/* Title and Actions */}
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-4'>
          <div className='flex-1 min-w-0'>
            {/* Title */}
            <Typography
              variant='h1'
              className='listing-title text-xl md:text-2xl lg:text-3xl font-bold leading-tight mb-4 line-clamp-3'
            >
              {title}
            </Typography>

            <div className='flex flex-wrap items-center gap-2 mb-3'>
              <Badge
                variant={
                  vipBadgeConfig[vipType || 'NORMAL']?.variant || 'secondary'
                }
                className={vipBadgeConfig[vipType || 'NORMAL']?.className}
              >
                {t('apartmentDetail.property.vipType')}:&nbsp;
                {vipBadgeConfig[vipType || 'NORMAL']?.text ||
                  t('listingManagement.card.vipTypes.NORMAL')}
              </Badge>

              {topMeta.map((meta) => (
                <Badge key={meta.key} variant='outline' className='px-2.5 py-1'>
                  {meta.label}: {meta.value}
                </Badge>
              ))}
            </div>

            {/* Address */}
            <div className='space-y-2'>
              {newAddress && (
                <Typography
                  variant='p'
                  className='text-sm md:text-base text-muted-foreground flex items-start gap-2'
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
                  className='text-sm md:text-base text-muted-foreground flex items-start gap-2'
                >
                  <span className='font-semibold text-foreground shrink-0'>
                    {t('apartmentDetail.property.legacyAddress')}:
                  </span>
                  <span className='flex-1'>{oldAddress}</span>
                </Typography>
              )}
            </div>
          </div>

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
      </div>

      {/* Key Metrics */}
      <div className='space-y-4'>
        {/* Price - Prominent Display */}
        <div className='price-gradient bg-gradient-to-r from-primary/10 to-transparent p-5 md:p-6 rounded-xl md:rounded-2xl border border-primary/20'>
          <Typography
            variant='small'
            className='text-muted-foreground mb-2 font-semibold uppercase tracking-wider text-xs'
          >
            {t('apartmentDetail.property.price')}
          </Typography>
          {price !== undefined && price !== null && (
            <div className='flex items-baseline gap-2 flex-wrap'>
              <Typography
                variant='h2'
                className='text-3xl md:text-4xl lg:text-5xl font-bold text-primary'
              >
                {formatByLocale(price, locale)}
              </Typography>
              <Typography
                variant='h5'
                className='text-lg md:text-xl text-muted-foreground font-medium'
              >
                / {t(getPriceUnitTranslationKey(priceUnit))}
              </Typography>
            </div>
          )}
        </div>

        {/* Other Metrics in Grid */}
        {metrics.length > 0 && (
          <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
            {metrics.map((metric) => (
              <Card
                key={metric.key}
                className='hover:shadow-md hover:border-primary/30 transition-all'
              >
                <CardContent className='p-4 md:p-5'>
                  <Typography
                    variant='small'
                    className='text-muted-foreground mb-1.5 font-semibold text-xs uppercase tracking-wider'
                  >
                    {metric.label}
                  </Typography>
                  <Typography
                    variant='h4'
                    className='text-xl md:text-2xl font-bold break-words'
                  >
                    {metric.value}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </div>
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
