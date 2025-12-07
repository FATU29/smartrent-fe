import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Card, CardContent } from '@/components/atoms/card'
import { Separator } from '@/components/atoms/separator'
import { ListingDetail } from '@/api/types'
import { formatByLocale } from '@/utils/currency/convert'
import { useSwitchLanguage } from '@/contexts/switchLanguage/index.context'
import { getPriceUnitTranslationKey } from '@/utils/property'
import { Button } from '@/components/atoms/button'
import SaveListingButton from '@/components/molecules/saveListingButton'
import { Copy, Flag } from 'lucide-react'
import { toast } from 'sonner'
import { ReportListingDialog } from '@/components/molecules/reportListingDialog'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { useMediaThumbnail } from '@/hooks/useMediaThumbnail'
import { mapListingToRecentlyViewed } from '@/utils/recentlyViewed/mapper'

interface PropertyHeaderProps {
  listing: ListingDetail
}

const PropertyHeader: React.FC<PropertyHeaderProps> = (props) => {
  const t = useTranslations()
  const { language: locale } = useSwitchLanguage()
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const { addListing } = useRecentlyViewed()

  const { listing } = props
  const { thumbnail } = useMediaThumbnail({ media: listing?.media })

  const {
    title,
    address,
    price,
    priceUnit,
    area,
    bedrooms,
    bathrooms,
    listingId,
  } = listing || {}

  const { fullNewAddress: newAddress, fullAddress: oldAddress } = address || {}

  // Add to recently viewed when component mounts
  useEffect(() => {
    if (listing && listingId) {
      const recentlyViewedData = mapListingToRecentlyViewed(listing, thumbnail)
      addListing(recentlyViewedData)
    }
  }, [listingId, thumbnail, listing, addListing]) // Include all dependencies

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success(t('common.copied') || 'Link copied!')
  }

  const handleReport = () => {
    setReportDialogOpen(true)
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col md:flex-row items-center justify-between'>
        <div className='flex flex-col gap-2'>
          {/* Title */}
          <Typography
            variant='h1'
            className='text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight'
          >
            {title}
          </Typography>

          {/* Address */}
          <div className='space-y-1'>
            {newAddress && (
              <Typography
                variant='p'
                className='text-base text-muted-foreground'
              >
                {t('apartmentDetail.property.newAddress')}: {newAddress}
              </Typography>
            )}
            {oldAddress && (
              <Typography
                variant='p'
                className='text-base text-muted-foreground'
              >
                {t('apartmentDetail.property.legacyAddress')}: {oldAddress}
              </Typography>
            )}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {/* Copy Link Button */}
          <Button
            variant='ghost'
            size='sm'
            onClick={handleCopyLink}
            className='flex items-center gap-1'
          >
            <Copy size={16} />
            <span className='text-sm'>
              {t('apartmentDetail.actions.share')}
            </span>
          </Button>

          {/* Save Button */}
          <SaveListingButton
            listingId={listingId}
            variant='default'
            showLabel={true}
          />

          {/* Report Button */}
          <Button
            variant='ghost'
            size='sm'
            onClick={handleReport}
            className='flex items-center gap-1'
          >
            <Flag size={16} />
            <span className='text-sm'>{t('common.report') || 'Report'}</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <Separator className='my-4' />
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4'>
        {/* Price */}
        <Card>
          <CardContent className='p-4'>
            <Typography
              variant='small'
              className='text-muted-foreground mb-1 block'
            >
              {t('apartmentDetail.property.price')}
            </Typography>
            <Typography
              variant='h3'
              className='text-2xl font-bold text-primary'
            >
              {formatByLocale(price || 0, locale)} /{' '}
              {t(getPriceUnitTranslationKey(priceUnit))}
            </Typography>
          </CardContent>
        </Card>

        {/* Area */}
        <Card>
          <CardContent className='p-4'>
            <Typography
              variant='small'
              className='text-muted-foreground mb-1 block'
            >
              {t('apartmentDetail.property.area')}
            </Typography>
            <Typography variant='h3' className='text-2xl font-bold'>
              {area} m²
            </Typography>
          </CardContent>
        </Card>

        {/* Bedrooms */}
        <Card>
          <CardContent className='p-4'>
            <Typography
              variant='small'
              className='text-muted-foreground mb-1 block'
            >
              {t('apartmentDetail.property.bedrooms')}
            </Typography>
            <Typography variant='h3' className='text-2xl font-bold'>
              {bedrooms}
            </Typography>
          </CardContent>
        </Card>

        {/* Bathrooms */}
        {bathrooms && (
          <Card>
            <CardContent className='p-4'>
              <Typography
                variant='small'
                className='text-muted-foreground mb-1 block'
              >
                {t('apartmentDetail.property.bathrooms')}
              </Typography>
              <Typography variant='h3' className='text-2xl font-bold'>
                {bathrooms}
              </Typography>
            </CardContent>
          </Card>
        )}
      </div>
      <Separator className='my-4' />

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
