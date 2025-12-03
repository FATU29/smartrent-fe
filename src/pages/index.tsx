import React from 'react'
import HomepageTemplate from '@/components/templates/homepage'
import { ListingService } from '@/api/services/listing.service'
import { GetServerSideProps } from 'next'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import SeoHead from '@/components/atoms/seo/SeoHead'
import LocationProvider from '@/contexts/location'
import { createServerAxiosInstance } from '@/configs/axios/axiosServer'
import type { ProvinceStatsItem } from '@/api/types'
import { List } from '@/contexts/list'

interface HomeProps {
  provinceCities?: ProvinceStatsItem[]
}

const Home: NextPageWithLayout<HomeProps> = ({ provinceCities }) => {
  return (
    <>
      <SeoHead
        title='SmartRent – Thuê nhà dễ dàng'
        description='Khám phá căn hộ phù hợp nhất với bạn. Tìm kiếm nhanh, lọc thông minh, liên hệ chủ nhà chỉ với một cú nhấp.'
      />
      <LocationProvider>
        <List.Provider>
          <div className='container mx-auto space-y-6'>
            <HomepageTemplate cities={provinceCities} />
          </div>
        </List.Provider>
      </LocationProvider>
    </>
  )
}

Home.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout activeItem='home'>{page}</MainLayout>
}

export default Home

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Create server axios instance for server-side API calls
    const { req } = context
    const cookieStore = req.headers.cookie
    const serverInstance = createServerAxiosInstance(cookieStore)

    // Top 5 provinces: Hà Nội (1), TP.HCM (79), Đà Nẵng (48), Hải Phòng (31), Cần Thơ (92)
    const topProvinceIds = [1, 79, 48, 31, 92]

    const provinceStatsResponse = await ListingService.getProvinceStats(
      {
        provinceIds: topProvinceIds,
        provinceCodes: ['1', '79', '48', '31', '92'],
        addressType: 'NEW',
      },
      serverInstance,
    )

    const provinceCities = provinceStatsResponse?.data || []

    return {
      props: {
        provinceCities,
      },
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)

    return {
      notFound: true,
    }
  }
}
