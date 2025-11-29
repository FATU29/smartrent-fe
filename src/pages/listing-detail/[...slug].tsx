import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import DetailPostTemplate from '@/components/templates/detailPostTemplate'
import SeoHead from '@/components/atoms/seo/SeoHead'
import type { ListingDetail } from '@/api/types'
import {
  mockListingDetail,
  mockRecentlyViewed,
  mockSimilarProperties,
} from '@/mock'

// Auth dialog handled globally by AuthDialogProvider

interface ListingDetailProps {
  listing?: ListingDetail
  similarProperties?: ListingDetail[]
  recentlyViewed?: ListingDetail[]
  onExport?: () => void
  onCall?: () => void
  onChatZalo?: () => void
  onPlayVideo?: () => void
  onSimilarPropertyClick?: (listing: ListingDetail) => void
}

const ListingDetail: NextPageWithLayout<ListingDetailProps> = (props) => {
  const router = useRouter()
  const {
    listing,
    similarProperties,
    recentlyViewed,
    onExport,
    onCall,
    onChatZalo,
    onPlayVideo,
    onSimilarPropertyClick,
  } = props

  // Use mock data if props are not provided (for development/testing)
  const listingData = listing || mockListingDetail
  const similarPropertiesData = similarProperties || mockSimilarProperties
  const recentlyViewedData = recentlyViewed || mockRecentlyViewed

  const { title, description, assets } = listingData || {}
  const { images } = assets || {}

  const handleSimilarPropertyClick = useCallback(
    (property: ListingDetail) => {
      router.push(`/listing-detail/${property.listingId}`)
      onSimilarPropertyClick?.(property)
    },
    [router, onSimilarPropertyClick],
  )

  const handleCall = useCallback(() => {
    // Show full phone number logic
    onCall?.()
  }, [onCall])

  const handleChatZalo = useCallback(() => {
    // Open Zalo chat
    onChatZalo?.()
  }, [onChatZalo])

  return (
    <>
      <SeoHead
        title={`${title} – SmartRent`}
        description={description || 'Chi tiết bất động sản trên SmartRent'}
        openGraph={{
          type: 'article',
          images: (images || []).slice(0, 1).map((url: string) => ({ url })),
        }}
      />
      <DetailPostTemplate
        listing={listingData}
        similarProperties={similarPropertiesData}
        recentlyViewed={recentlyViewedData}
        onExport={onExport}
        onCall={handleCall}
        onChatZalo={handleChatZalo}
        onPlayVideo={onPlayVideo}
        onSimilarPropertyClick={handleSimilarPropertyClick}
      />
    </>
  )
}

export default ListingDetail

ListingDetail.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout activeItem='properties'>{page}</MainLayout>
}
