import React from 'react'
import { useRouter } from 'next/router'
import MainLayout from '@/components/layouts/MainLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import DetailPostTemplate from '@/components/templates/detailPostTemplate'
import {
  ApartmentDetail,
  SimilarProperty,
  mockApartmentDetail,
  mockSimilarProperties,
} from '@/types/apartmentDetail.types'
import SeoHead from '@/components/atoms/seo/SeoHead'

// Auth dialog handled globally by AuthDialogProvider

interface ApartmentDetailPageProps {
  apartment?: ApartmentDetail
  similarProperties?: SimilarProperty[]
  onBack?: () => void
  onSave?: () => void
  onCompare?: () => void
  onShare?: () => void
  onExport?: () => void
  onCall?: () => void
  onMessage?: () => void
  onPlayVideo?: () => void
  onAIPriceEvaluation?: () => void
  onSimilarPropertyClick?: (property: SimilarProperty) => void
}

const ApartmentDetailPage: NextPageWithLayout<ApartmentDetailPageProps> = ({
  apartment = mockApartmentDetail,
  similarProperties = mockSimilarProperties,
  onBack,
  onSave,
  onCompare,
  onShare,
  onExport,
  onCall,
  onMessage,
  onPlayVideo,
  onAIPriceEvaluation,
  onSimilarPropertyClick,
}) => {
  const router = useRouter()

  const handleBack = () => {
    router.back()
    onBack?.()
  }

  const handleSimilarPropertyClick = (property: SimilarProperty) => {
    router.push(`/apartment-detail?id=${property.id}`)
    onSimilarPropertyClick?.(property)
  }

  return (
    <>
      <SeoHead
        title={`${apartment.title} – SmartRent`}
        description={apartment.description || 'Chi tiết căn hộ trên SmartRent'}
        openGraph={{
          type: 'article',
          images: (apartment.images || []).slice(0, 1).map((url) => ({ url })),
        }}
      />
      <DetailPostTemplate
        apartment={apartment}
        similarProperties={similarProperties}
        onBack={handleBack}
        onSave={onSave}
        onCompare={onCompare}
        onShare={onShare}
        onExport={onExport}
        onCall={onCall}
        onMessage={onMessage}
        onPlayVideo={onPlayVideo}
        onAIPriceEvaluation={onAIPriceEvaluation}
        onSimilarPropertyClick={handleSimilarPropertyClick}
      />
    </>
  )
}

export default ApartmentDetailPage

ApartmentDetailPage.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout activeItem='properties'>{page}</MainLayout>
}
