import HomepageTemplate from '@/components/templates/homepage'
import {
  getInitialProperties,
  propertyFetcher,
} from '@/api/services/property.service'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { PropertyCard } from '@/api/types/property.type'
import ResidentialFilterResponsive from '@/components/molecules/residentialFilterResponsive'
import { ListProvider } from '@/contexts/list/index.context'
import FeaturedCarousel from '@/components/molecules/featuredCarousel'
import MainLayout from '@/components/layouts/MainLayout'
import React from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import SeoHead from '@/components/atoms/seo/SeoHead'

const Home: NextPageWithLayout<{
  initialProperties: PropertyCard[]
}> = ({ initialProperties }) => {
  const router = useRouter()

  const handlePropertyClick = (property: PropertyCard) => {
    console.log('Property clicked:', property)
    // Navigate to apartment detail page with property ID
    router.push(`/apartment-detail/123`)
  }

  return (
    <>
      <SeoHead
        title='SmartRent – Thuê nhà dễ dàng'
        description='Khám phá căn hộ phù hợp nhất với bạn. Tìm kiếm nhanh, lọc thông minh, liên hệ chủ nhà chỉ với một cú nhấp.'
      />
      <ListProvider fetcher={propertyFetcher} initialData={initialProperties}>
        <div className='container mx-auto space-y-6'>
          <HomepageTemplate
            onPropertyClick={handlePropertyClick}
            filterSlot={<ResidentialFilterResponsive />}
            carouselSlot={
              <FeaturedCarousel
                items={[
                  {
                    id: 'c1',
                    title: 'Căn hộ trung tâm Quận 1',
                    subtitle: 'View thành phố • 75m²',
                    image: '/images/example.png',
                  },
                  {
                    id: 'c2',
                    title: 'Studio tiện nghi gần Metro',
                    subtitle: 'Full nội thất • 40m²',
                    image: '/images/default-image.jpg',
                  },
                  {
                    id: 'c3',
                    title: 'Penthouse sang trọng',
                    subtitle: 'Hồ bơi riêng • 180m²',
                    image: '/images/rental-auth-bg.jpg',
                  },
                ]}
              />
            }
          />
        </div>
      </ListProvider>
    </>
  )
}

Home.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout activeItem='home'>{page}</MainLayout>
}

export default Home

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const initialProperties = await getInitialProperties()

    return {
      props: {
        initialProperties,
      },
    }
  } catch (error) {
    console.error('Error fetching initial properties:', error)

    return {
      props: {
        initialProperties: [],
      },
    }
  }
}
