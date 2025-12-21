import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Card, CardContent } from '@/components/atoms/card'
import { ListingDetail } from '@/api/types'
import { formatByLocale } from '@/utils/currency/convert'
import { useSwitchLanguage } from '@/contexts/switchLanguage/index.context'
import { getPriceUnitTranslationKey } from '@/utils/property'
import { Button } from '@/components/atoms/button'
import SaveListingButton from '@/components/molecules/saveListingButton'
import CompareToggleBtn from '@/components/molecules/compareToggleBtn'
import { Copy, Flag } from 'lucide-react'
import { toast } from 'sonner'
import { ReportListingDialog } from '@/components/molecules/reportListingDialog'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { useMediaThumbnail } from '@/hooks/useMediaThumbnail'
import { mapListingToRecentlyViewed } from '@/utils/recentlyViewed/mapper'
import { ListingApi } from '@/api/types/property.type'

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
    roomCapacity,
    listingId,
  } = listing || {}

  const { fullNewAddress: newAddress, fullAddress: oldAddress } = address || {}

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

  // Convert ListingDetail to ListingApi for CompareToggleBtn
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
        <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4'>
          <div className='flex-1 min-w-0'>
            {/* Title */}
            <Typography
              variant='h1'
              className='listing-title text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-4'
            >
              {title}
            </Typography>

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

          {/* Action Buttons - Desktop */}
          <div className='hidden lg:flex items-center gap-2 flex-shrink-0'>
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

        {/* Action Buttons - Mobile/Tablet */}
        <div className='flex lg:hidden items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleCopyLink}
            className='flex-1 flex items-center justify-center gap-2'
          >
            <Copy size={16} />
            <span>{t('apartmentDetail.actions.share')}</span>
          </Button>

          <CompareToggleBtn
            listing={listingForCompare}
            variant='outline'
            size='sm'
            showLabel={true}
            className='flex-1'
          />

          <SaveListingButton
            listingId={listingId}
            variant='default'
            showLabel={true}
            className='flex-1'
          />

          <Button
            variant='outline'
            size='sm'
            onClick={handleReport}
            className='flex items-center gap-2'
          >
            <Flag size={16} />
          </Button>
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
          <div className='flex items-baseline gap-2 flex-wrap'>
            <Typography
              variant='h2'
              className='text-3xl md:text-4xl lg:text-5xl font-bold text-primary'
            >
              {formatByLocale(price || 0, locale)}
            </Typography>
            <Typography
              variant='h5'
              className='text-lg md:text-xl text-muted-foreground font-medium'
            >
              / {t(getPriceUnitTranslationKey(priceUnit))}
            </Typography>
          </div>
        </div>

        {/* Other Metrics in Grid */}
        <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
          {/* Area */}
          <Card className='hover:shadow-md hover:border-primary/30 transition-all'>
            <CardContent className='p-4 md:p-5'>
              <Typography
                variant='small'
                className='text-muted-foreground mb-1.5 font-semibold text-xs uppercase tracking-wider'
              >
                {t('apartmentDetail.property.area')}
              </Typography>
              <Typography
                variant='h4'
                className='text-xl md:text-2xl font-bold'
              >
                {area} m²
              </Typography>
            </CardContent>
          </Card>

          {/* Bedrooms */}
          <Card className='hover:shadow-md hover:border-primary/30 transition-all'>
            <CardContent className='p-4 md:p-5'>
              <Typography
                variant='small'
                className='text-muted-foreground mb-1.5 font-semibold text-xs uppercase tracking-wider'
              >
                {t('apartmentDetail.property.bedrooms')}
              </Typography>
              <Typography
                variant='h4'
                className='text-xl md:text-2xl font-bold'
              >
                {bedrooms}
              </Typography>
            </CardContent>
          </Card>

          {/* Bathrooms */}
          {bathrooms && (
            <Card className='hover:shadow-md hover:border-primary/30 transition-all'>
              <CardContent className='p-4 md:p-5'>
                <Typography
                  variant='small'
                  className='text-muted-foreground mb-1.5 font-semibold text-xs uppercase tracking-wider'
                >
                  {t('apartmentDetail.property.bathrooms')}
                </Typography>
                <Typography
                  variant='h4'
                  className='text-xl md:text-2xl font-bold'
                >
                  {bathrooms}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Room Capacity */}
          {roomCapacity && (
            <Card className='hover:shadow-md hover:border-primary/30 transition-all'>
              <CardContent className='p-4 md:p-5'>
                <Typography
                  variant='small'
                  className='text-muted-foreground mb-1.5 font-semibold text-xs uppercase tracking-wider'
                >
                  {t('apartmentDetail.property.roomCapacity')}
                </Typography>
                <Typography
                  variant='h4'
                  className='text-xl md:text-2xl font-bold'
                >
                  {roomCapacity}
                </Typography>
              </CardContent>
            </Card>
          )}
        </div>
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
