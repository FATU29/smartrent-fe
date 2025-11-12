import HomepageTemplate from '@/components/templates/homepage'
import {
  getInitialProperties,
  propertyFetcher,
} from '@/api/services/property.service'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { PropertyCard } from '@/api/types/property.type'
import { ListProvider } from '@/contexts/list/index.context'
import MainLayout from '@/components/layouts/MainLayout'
import React from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import SeoHead from '@/components/atoms/seo/SeoHead'
import LocationProvider from '@/contexts/location'

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
      <h1>Hello World 123</h1>
      <LocationProvider>
        <ListProvider fetcher={propertyFetcher} initialData={initialProperties}>
          <div className='container mx-auto space-y-6'>
            <HomepageTemplate onPropertyClick={handlePropertyClick} />
          </div>
        </ListProvider>
      </LocationProvider>
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
