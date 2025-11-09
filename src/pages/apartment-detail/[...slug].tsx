import React from 'react'
import { useRouter } from 'next/router'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import DetailPostTemplate from '@/components/templates/detailPostTemplate'
import {
  ApartmentDetail,
  SimilarProperty,
  mockApartmentDetail,
  mockSimilarProperties,
  mockRecentlyViewed,
} from '@/types/apartmentDetail.types'
import SeoHead from '@/components/atoms/seo/SeoHead'

// Auth dialog handled globally by AuthDialogProvider

interface ApartmentDetailPageProps {
  apartment?: ApartmentDetail
  similarProperties?: SimilarProperty[]
  recentlyViewed?: SimilarProperty[]
  onExport?: () => void
  onCall?: () => void
  onChatZalo?: () => void
  onPlayVideo?: () => void
  onSimilarPropertyClick?: (property: SimilarProperty) => void
}

const ApartmentDetailPage: NextPageWithLayout<ApartmentDetailPageProps> = ({
  apartment = mockApartmentDetail,
  similarProperties = mockSimilarProperties,
  recentlyViewed = mockRecentlyViewed,
  onExport,
  onCall,
  onChatZalo,
  onPlayVideo,
  onSimilarPropertyClick,
}) => {
  const router = useRouter()

  const handleSimilarPropertyClick = (property: SimilarProperty) => {
    router.push(`/apartment-detail/${property.id}`)
    onSimilarPropertyClick?.(property)
  }

  const handleCall = () => {
    // Show full phone number logic
    onCall?.()
  }

  const handleChatZalo = () => {
    // Open Zalo chat
    onChatZalo?.()
  }

  return (
    <>
      <SeoHead
        title={`${apartment.title} – SmartRent`}
        description={
          apartment.description || 'Chi tiết bất động sản trên SmartRent'
        }
        openGraph={{
          type: 'article',
          images: (apartment.images || []).slice(0, 1).map((url) => ({ url })),
        }}
      />
      <DetailPostTemplate
        apartment={apartment}
        similarProperties={similarProperties}
        recentlyViewed={recentlyViewed}
        onExport={onExport}
        onCall={handleCall}
        onChatZalo={handleChatZalo}
        onPlayVideo={onPlayVideo}
        onSimilarPropertyClick={handleSimilarPropertyClick}
      />
    </>
  )
}

export default ApartmentDetailPage

ApartmentDetailPage.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout activeItem='properties'>{page}</MainLayout>
}
