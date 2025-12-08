import React from 'react'
import { useTranslations } from 'next-intl'
import PropertyCarousel from '@/components/organisms/apartmentDetail/PropertyCarousel'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { useRouter } from 'next/router'
import type { ListingDetail } from '@/api/types'
import { mapRecentlyViewedToListing } from '@/utils/recentlyViewed/mapper'

interface RecentlyViewedSectionProps {
  currentListingId?: string | number
}

const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  currentListingId,
}) => {
  const t = useTranslations()
  const router = useRouter()
  const { recentlyViewed } = useRecentlyViewed()

  // Filter out current listing
  const filteredListings = currentListingId
    ? recentlyViewed.filter(
        (item) => String(item.listingId) !== String(currentListingId),
      )
    : recentlyViewed

  // If no recently viewed items, don't render
  if (filteredListings.length === 0) {
    return null
  }

  // Convert to ListingDetail format
  const listingsData: ListingDetail[] = filteredListings.map((listing) =>
    mapRecentlyViewedToListing(listing),
  ) as ListingDetail[]

  const handlePropertyClick = (listing: ListingDetail) => {
    router.push(`/listing-detail/${listing.listingId}`)
  }

  return (
    <PropertyCarousel
      listings={listingsData}
      title={t('apartmentDetail.recentlyViewed.title') || 'Tin đăng đã xem'}
      onPropertyClick={handlePropertyClick}
    />
  )
}

export default RecentlyViewedSection
