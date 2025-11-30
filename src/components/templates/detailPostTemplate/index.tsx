import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  ImageSlider,
  PropertyHeader,
  PropertyFeatures,
  PropertyDescription,
  PriceHistoryChart,
  SellerContact,
  PropertyCarousel,
  PropertyMap,
} from '@/components/organisms/apartmentDetail'
import { Typography } from '@/components/atoms/typography'
import { ListingDetail } from '@/api/types'
import {
  usePricingHistory,
  usePriceStatistics,
} from '@/hooks/useListings/usePricingHistory'
import { mockPricingHistory } from '@/mock'

export interface DetailPostTemplateProps {
  listing: ListingDetail
  similarProperties?: ListingDetail[]
  recentlyViewed?: ListingDetail[]
  onExport?: () => void
  onCall?: () => void
  onChatZalo?: () => void
  onPlayVideo?: () => void
  onSimilarPropertyClick?: (listing: ListingDetail) => void
}

interface Section {
  id: string
  component: React.ReactNode
  containerClassName?: string
  isVisible?: boolean
}

const DetailPostTemplate: React.FC<DetailPostTemplateProps> = ({
  listing,
  similarProperties,
  recentlyViewed,
  onChatZalo,
  onSimilarPropertyClick,
}) => {
  const t = useTranslations()

  const { description, media, user, amenities, address, listingId } =
    listing || {}

  const mediaItems = media || []

  const { longitude, latitude } = address || {}

  const { data: pricingHistoryData, isLoading: isPricingHistoryLoading } =
    usePricingHistory(listingId)
  const { data: priceStatisticsData } = usePriceStatistics(listingId)

  const handleChatZalo = () => {
    onChatZalo?.()
  }

  const handleSimilarPropertyClick = (property: ListingDetail) => {
    onSimilarPropertyClick?.(property)
  }

  const addressNode = useMemo(() => {
    if (!address) return null

    const newAddress = address.fullNewAddress
    const oldAddress = address.fullAddress

    if (!newAddress && !oldAddress) return null

    return (
      <div className='space-y-1'>
        {newAddress && (
          <Typography variant='p' className='text-base'>
            {newAddress}
          </Typography>
        )}
        {oldAddress && (
          <Typography variant='small' className='text-muted-foreground'>
            {oldAddress}
          </Typography>
        )}
      </div>
    )
  }, [address])

  const sections: Section[] = useMemo(
    () => [
      {
        id: 'gallery',
        component: <ImageSlider media={mediaItems} />,
        containerClassName: 'mb-8',
        isVisible: true,
      },
      {
        id: 'header',
        component: <PropertyHeader listing={listing} />,
        containerClassName: 'mb-6',
        isVisible: true,
      },
      {
        id: 'features',
        component: (
          <PropertyFeatures
            features={amenities}
            title={t('apartmentDetail.sections.features')}
          />
        ),
        containerClassName: 'mb-8',
        isVisible: amenities && amenities.length > 0,
      },
      {
        id: 'description',
        component: (
          <PropertyDescription
            description={description}
            title={t('apartmentDetail.sections.description')}
          />
        ),
        containerClassName: 'mb-8',
        isVisible: true,
      },
      {
        id: 'priceHistory',
        component: (
          <PriceHistoryChart
            priceHistory={
              Array.isArray(pricingHistoryData)
                ? pricingHistoryData
                : mockPricingHistory
            }
            priceStatistics={priceStatisticsData}
            newAddress={address?.fullNewAddress}
            oldAddress={address?.fullAddress}
          />
        ),
        containerClassName: 'mb-8',
        isVisible: mockPricingHistory && mockPricingHistory.length > 0,
      },
      {
        id: 'map',
        component: (
          <PropertyMap
            location={
              longitude && latitude
                ? { coordinates: { latitude, longitude } }
                : undefined
            }
            address={addressNode}
          />
        ),
        containerClassName: 'mb-8',
      },
      {
        id: 'similarProperties',
        component: (
          <PropertyCarousel
            listings={similarProperties || []}
            title={t('apartmentDetail.sections.similarProperties')}
            onPropertyClick={handleSimilarPropertyClick}
          />
        ),
        containerClassName: 'mb-8',
        order: 8,
        isVisible: similarProperties && similarProperties.length > 0,
      },
      {
        id: 'recentlyViewed',
        component: (
          <PropertyCarousel
            listings={recentlyViewed || []}
            title={t('apartmentDetail.sections.recentlyViewed')}
            onPropertyClick={handleSimilarPropertyClick}
          />
        ),
        containerClassName: 'mb-8',
        isVisible: recentlyViewed && recentlyViewed.length > 0,
      },
    ],
    [
      listing,
      similarProperties,
      recentlyViewed,
      t,
      addressNode,
      pricingHistoryData,
      isPricingHistoryLoading,
      address,
      mediaItems,
      amenities,
      description,
    ],
  )

  // Render sections function
  const renderSection = (section: Section) => {
    return (
      <>
        {section.isVisible && (
          <div key={section.id} className={section.containerClassName}>
            {section.component}
          </div>
        )}
      </>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-6 lg:py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start'>
          {/* Main Content - Left Column */}
          <div className='lg:col-span-8 space-y-0'>
            {sections?.map(renderSection)}
          </div>

          {/* Sidebar - Sticky */}
          <div className='lg:col-span-4 lg:sticky lg:top-24 lg:self-start'>
            <SellerContact host={user} onChatZalo={handleChatZalo} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailPostTemplate
