import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  ImageSlider,
  PropertyHeader,
  PropertyFeatures,
  PropertyDescription,
  PriceHistoryChart,
  SellerContact,
  PropertyMap,
  RecentlyViewedSection,
  SimilarPropertiesSection,
} from '@/components/organisms/apartmentDetail'
import { Typography } from '@/components/atoms/typography'
import { ListingDetail } from '@/api/types'
import {
  usePricingHistory,
  usePriceStatistics,
} from '@/hooks/useListings/usePricingHistory'
import { useSimilarProperties } from '@/hooks/useListings/useSimilarProperties'
import { mockPricingHistory } from '@/mock'
import { PhoneClickDetailService } from '@/api/services'

export interface DetailPostTemplateProps {
  listing: ListingDetail
  similarProperties?: ListingDetail[]
  onExport?: () => void
  onCall?: () => void
  onChatZalo?: () => void
  onPlayVideo?: () => void
  onSimilarPropertyClick?: (listing: ListingDetail) => void
}

interface Section {
  id: string
  component: React.ReactNode
  isVisible?: boolean
  order?: number
}

const DetailPostTemplate: React.FC<DetailPostTemplateProps> = ({
  listing,
  onChatZalo,
  onSimilarPropertyClick,
}) => {
  const t = useTranslations()

  const {
    description,
    media,
    user,
    amenities,
    address,
    listingId,
    vipType,
    locationPricing,
  } = listing || {}

  const mediaItems = media || []

  const { longitude, latitude } = address || {}

  const { data: pricingHistoryData, isLoading: isPricingHistoryLoading } =
    usePricingHistory(listingId)
  const { data: priceStatisticsData } = usePriceStatistics(listingId)

  // Fetch similar properties based on VIP type and location
  const {
    data: fetchedSimilarProperties,
    isLoading: isLoadingSimilar,
    isError: isErrorSimilar,
  } = useSimilarProperties({
    listingId,
    vipType,
    wardId: locationPricing?.wardPricing?.locationId,
    districtId: locationPricing?.districtPricing?.locationId,
    provinceId: locationPricing?.provincePricing?.locationId,
    isLegacy: true, // Based on location pricing structure
    enabled: !!listingId && !!vipType,
    limit: 10,
  })

  // Use fetched similar properties if available, otherwise fallback to props
  const similarPropertiesData = fetchedSimilarProperties || []
  const shouldShowSimilarProperties =
    isLoadingSimilar ||
    (similarPropertiesData && similarPropertiesData.length > 0) ||
    isErrorSimilar

  const handleChatZalo = () => {
    onChatZalo?.()
  }

  const handlePhoneClick = async () => {
    if (!listingId) return

    try {
      await PhoneClickDetailService.trackClick({ listingId })
    } catch (error) {
      console.error('Failed to track phone click:', error)
    }
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
        isVisible: true,
      },
      {
        id: 'header',
        component: <PropertyHeader listing={listing} />,
        isVisible: true,
      },
      {
        id: 'sellerContactMobile',
        component: (
          <div className='lg:hidden'>
            <SellerContact
              host={user}
              onChatZalo={handleChatZalo}
              onPhoneClick={handlePhoneClick}
            />
          </div>
        ),
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
        isVisible: true,
      },
      {
        id: 'similarProperties',
        component: (
          <SimilarPropertiesSection
            listings={similarPropertiesData}
            onPropertyClick={handleSimilarPropertyClick}
            isLoading={isLoadingSimilar}
            showEmptyState={!isLoadingSimilar && !isErrorSimilar}
          />
        ),
        order: 8,
        isVisible: shouldShowSimilarProperties,
      },
      {
        id: 'recentlyViewed',
        component: (
          <RecentlyViewedSection currentListingId={listing.listingId} />
        ),
        isVisible: true,
      },
    ],
    [
      listing,
      similarPropertiesData,
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
    if (!section.isVisible) return null

    return (
      <div key={section.id} className='w-full'>
        {section.component}
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-8 lg:py-10'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start'>
          {/* Main Content */}
          <div className='lg:col-span-8 flex flex-col gap-8 lg:gap-10'>
            {sections?.map(renderSection)}
          </div>

          {/* Sidebar - Desktop Only */}
          <div className='hidden lg:block lg:col-span-4 lg:sticky lg:top-24 lg:self-start'>
            <SellerContact
              host={user}
              onChatZalo={handleChatZalo}
              onPhoneClick={handlePhoneClick}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailPostTemplate
