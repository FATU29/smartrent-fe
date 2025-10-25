import React, { useEffect, useState, useMemo } from 'react'
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
  PropertyMetadata,
} from '@/components/organisms/apartmentDetail'
import {
  ApartmentDetail,
  SimilarProperty,
  mockApartmentDetail,
  mockSimilarProperties,
  mockRecentlyViewed,
} from '@/types/apartmentDetail.types'

export interface DetailPostTemplateProps {
  apartment?: ApartmentDetail
  similarProperties?: SimilarProperty[]
  recentlyViewed?: SimilarProperty[]
  onExport?: () => void
  onCall?: () => void
  onChatZalo?: () => void
  onPlayVideo?: () => void
  onSimilarPropertyClick?: (property: SimilarProperty) => void
}

interface Section {
  id: string
  component: React.ReactNode
  containerClassName?: string
  order: number
}

const DetailPostTemplate: React.FC<DetailPostTemplateProps> = ({
  apartment = mockApartmentDetail,
  similarProperties = mockSimilarProperties,
  recentlyViewed = mockRecentlyViewed,
  onCall,
  onChatZalo,
  onSimilarPropertyClick,
}) => {
  const t = useTranslations('apartmentDetail')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCall = () => {
    onCall?.()
  }

  const handleChatZalo = () => {
    onChatZalo?.()
  }

  const handleSimilarPropertyClick = (property: SimilarProperty) => {
    onSimilarPropertyClick?.(property)
  }

  // Debug: Log apartment data
  console.log('🏠 DetailPostTemplate - apartment:', apartment)
  console.log(
    '💰 DetailPostTemplate - priceHistoryData:',
    apartment.priceHistoryData,
  )

  // Define sections using renderSection array pattern
  const sections: Section[] = useMemo(
    () => [
      {
        id: 'gallery',
        component: <ImageSlider images={apartment.images || []} />,
        containerClassName: 'mb-8',
        order: 1,
      },
      {
        id: 'header',
        component: <PropertyHeader apartment={apartment} />,
        containerClassName: 'mb-6',
        order: 2,
      },
      {
        id: 'features',
        component: (
          <PropertyFeatures
            features={apartment.features}
            title={t('sections.features')}
          />
        ),
        containerClassName: 'mb-8',
        order: 3,
      },
      {
        id: 'description',
        component: (
          <PropertyDescription
            description={apartment.fullDescription}
            title={t('sections.description')}
          />
        ),
        containerClassName: 'mb-8',
        order: 4,
      },
      {
        id: 'priceHistory',
        component: (
          <PriceHistoryChart
            priceHistory={apartment.priceHistoryData}
            district={apartment.breadcrumb?.district}
          />
        ),
        containerClassName: 'mb-8',
        order: 5,
      },
      {
        id: 'map',
        component: (
          <PropertyMap
            location={apartment.location}
            address={apartment.address}
          />
        ),
        containerClassName: 'mb-8',
        order: 6,
      },
      {
        id: 'metadata',
        component: <PropertyMetadata metadata={apartment.metadata} />,
        containerClassName: 'mb-12',
        order: 7,
      },
      {
        id: 'similarProperties',
        component: (
          <PropertyCarousel
            properties={similarProperties}
            title={t('sections.similarProperties')}
            onPropertyClick={handleSimilarPropertyClick}
          />
        ),
        containerClassName: 'mb-8',
        order: 8,
      },
      {
        id: 'recentlyViewed',
        component: (
          <PropertyCarousel
            properties={recentlyViewed}
            title={t('sections.recentlyViewed')}
            onPropertyClick={handleSimilarPropertyClick}
          />
        ),
        containerClassName: 'mb-8',
        order: 9,
      },
    ],
    [apartment, similarProperties, recentlyViewed, t],
  )

  // Render sections function
  const renderSection = (section: Section) => {
    return (
      <div key={section.id} className={section.containerClassName}>
        {section.component}
      </div>
    )
  }

  if (!mounted) {
    return null
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-6 lg:py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start'>
          {/* Main Content - Left Column */}
          <div className='lg:col-span-8 space-y-0'>
            {sections.sort((a, b) => a.order - b.order).map(renderSection)}
          </div>

          {/* Sidebar - Sticky */}
          <div className='lg:col-span-4'>
            <div className='sticky top-4'>
              <SellerContact
                host={apartment.host}
                onCall={handleCall}
                onChatZalo={handleChatZalo}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailPostTemplate
