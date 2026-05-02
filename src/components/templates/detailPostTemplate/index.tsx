import React, { useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  ImageSlider,
  PropertyHeader,
  PropertyFeatures,
  PropertyDescription,
  SellerContact,
} from '@/components/organisms/apartmentDetail'
import { Skeleton } from '@/components/atoms/skeleton'
import dynamic from 'next/dynamic'

// Dynamically import heavy components
const PropertyMap = dynamic(
  () => import('@/components/organisms/apartmentDetail/PropertyMap'),
  {
    ssr: false,
    loading: () => <Skeleton className='w-full h-[400px] rounded-xl' />,
  },
)
const PriceHistoryChart = dynamic(
  () => import('@/components/organisms/apartmentDetail/PriceHistoryChart'),
  {
    ssr: false,
    loading: () => <Skeleton className='w-full h-[300px] rounded-xl' />,
  },
)
const SimilarPropertiesSection = dynamic(
  () =>
    import('@/components/organisms/apartmentDetail/SimilarPropertiesSection'),
  {
    ssr: false,
    loading: () => <Skeleton className='w-full h-[300px] rounded-xl' />,
  },
)
const RecentlyViewedSection = dynamic(
  () => import('@/components/organisms/apartmentDetail/RecentlyViewedSection'),
  {
    ssr: false,
    loading: () => <Skeleton className='w-full h-[150px] rounded-xl' />,
  },
)
import { ListingDetail } from '@/api/types'
import { PhoneClickDetailService } from '@/api/services'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { mapListingToRecentlyViewed } from '@/utils/recentlyViewed/mapper'
import { PageContainer } from '@/components/atoms/pageContainer'

export interface DetailPostTemplateProps {
  listing: ListingDetail
  similarProperties?: ListingDetail[]
  onExport?: () => void
  onCall?: () => void
  onChatZalo?: () => void
  onPlayVideo?: () => void
  onSimilarPropertyClick?: (listing: ListingDetail) => void
  // Render without page chrome (no min-h-screen, no centered container, no
  // sticky-header offset). Sidebar collapses into the main column and the
  // recently-viewed section is dropped. Used when embedding the detail view
  // inside a Dialog (e.g. AI chat).
  embedded?: boolean
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
  embedded = false,
}) => {
  const t = useTranslations()
  const { addListing } = useRecentlyViewed()

  const { description, media, user, amenities, address } = listing || {}

  // Memoize listingId to prevent effect from running on every render
  const listingId = useMemo(() => listing?.listingId, [listing?.listingId])

  const mediaItems = media || []

  // Track listing view - update timestamp every time user views a listing
  useEffect(() => {
    if (!listing || !listingId) return

    try {
      // Get thumbnail from media
      const thumbnail =
        mediaItems?.find((item) => item.mediaType === 'IMAGE' && item.url)
          ?.url || null

      // Map listing to recently viewed format
      const recentlyViewedData = mapListingToRecentlyViewed(listing, thumbnail)

      // Add to recently viewed (will update timestamp and move to top)
      addListing(recentlyViewedData)
    } catch (error) {
      console.error('Failed to track listing view:', error)
    }
  }, [listingId, addListing]) // Only depend on listingId and addListing (addListing is now stable)

  const { longitude, latitude } = address || {}

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
          <div className={embedded ? 'w-full max-w-sm' : 'lg:hidden'}>
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
            listingId={listing.listingId}
            newAddress={address?.fullNewAddress}
            oldAddress={address?.fullAddress}
          />
        ),
        isVisible: true,
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
            newAddress={address?.fullNewAddress}
            legacyAddress={address?.fullAddress}
          />
        ),
        isVisible: true,
      },
      {
        id: 'similarProperties',
        component: <SimilarPropertiesSection listingId={listing.listingId} />,
        order: 8,
        isVisible: true,
      },
      {
        id: 'recentlyViewed',
        component: (
          <RecentlyViewedSection currentListingId={listing.listingId} />
        ),
        isVisible: !embedded,
      },
    ],
    [listing, t, address, mediaItems, amenities, description, embedded],
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

  if (embedded) {
    return (
      <div className='flex flex-col gap-5'>{sections?.map(renderSection)}</div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <PageContainer width='content' className='py-6 lg:py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start'>
          {/* Main Content */}
          <div className='lg:col-span-8 flex flex-col gap-5 lg:gap-7'>
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
      </PageContainer>
    </div>
  )
}

export default DetailPostTemplate
