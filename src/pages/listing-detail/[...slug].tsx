import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import DetailPostTemplate from '@/components/templates/detailPostTemplate'
import SeoHead from '@/components/atoms/seo/SeoHead'
import type { ListingDetail } from '@/api/types'
import { ListingService } from '@/api/services'
import {
  mockListingDetail,
  mockRecentlyViewed,
  mockSimilarProperties,
} from '@/mock'
import { PUBLIC_ROUTES } from '@/constants'

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

  const listingData = listing || mockListingDetail
  const similarPropertiesData = similarProperties || mockSimilarProperties
  const recentlyViewedData = recentlyViewed || mockRecentlyViewed

  const { title, description, media } = listingData || {}
  const images =
    media
      ?.filter((item) => item.mediaType === 'IMAGE')
      .map((item) => item.url) || []

  const handleSimilarPropertyClick = useCallback(
    (property: ListingDetail) => {
      router.push(
        `${PUBLIC_ROUTES.APARTMENT_DETAIL_PREFIX}/${property?.listingId}`,
      )
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

// Server-side render: fetch listing detail
export async function getServerSideProps(context: {
  params?: { slug?: string[] }
}) {
  const slugParts = context.params?.slug || []
  // Expect URL like /listing-detail/123 or /listing-detail/123/some-title
  const idPart = slugParts[0]
  const listingId = idPart && /^\d+$/.test(idPart) ? Number(idPart) : null

  if (!listingId) {
    return {
      notFound: true,
    }
  }

  const res = await ListingService.getById(listingId)

  // If API fails, fall back to mock to keep page functional in dev
  const listing = res?.data || null

  if (!listing) {
    return { notFound: true }
  }

  return {
    props: {
      listing,
    },
  }
}
