import React from 'react'
import HomepageTemplate from '@/components/templates/homepage'
import { ListingService } from '@/api/services/listing.service'
import { GetServerSideProps } from 'next'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import SeoHead from '@/components/atoms/seo/SeoHead'
import LocationProvider from '@/contexts/location'
import { createServerAxiosInstance } from '@/configs/axios/axiosServer'
import type { ProvinceStatsItem, CategoryStatsItem } from '@/api/types'
import { List } from '@/contexts/list'
import { PROVINCE_CODE } from '@/utils/mapper'
import AiChatWidget from '@/components/organisms/aiChatWidget'

interface HomeProps {
  provinceCities?: ProvinceStatsItem[]
  categoryStats?: CategoryStatsItem[]
}

const Home: NextPageWithLayout<HomeProps> = ({
  provinceCities,
  categoryStats,
}) => {
  return (
    <>
      <SeoHead
        title='SmartRent – Thuê nhà dễ dàng'
        description='Khám phá căn hộ phù hợp nhất với bạn. Tìm kiếm nhanh, lọc thông minh, liên hệ chủ nhà chỉ với một cú nhấp.'
      />
      <LocationProvider>
        <List.Provider>
          <div className='container mx-auto space-y-6'>
            <HomepageTemplate
              cities={provinceCities}
              categoryStats={categoryStats}
            />
          </div>
          <AiChatWidget position='bottom-right' />
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
    const { req } = context
    const cookieStore = req.headers.cookie
    const serverInstance = createServerAxiosInstance(cookieStore)

    const topProvinceIds = [
      PROVINCE_CODE.HANOI,
      PROVINCE_CODE.HO_CHI_MINH,
      PROVINCE_CODE.DA_NANG,
      PROVINCE_CODE.BINH_DUONG,
      PROVINCE_CODE.DONG_NAI,
    ]

    const [provinceStatsResponse, categoryStatsResponse] = await Promise.all([
      ListingService.getProvinceStats(
        {
          provinceIds: topProvinceIds,
          provinceCodes: [
            PROVINCE_CODE.HANOI.toString(),
            PROVINCE_CODE.HO_CHI_MINH.toString(),
            PROVINCE_CODE.DA_NANG.toString(),
            PROVINCE_CODE.BINH_DUONG.toString(),
            PROVINCE_CODE.DONG_NAI.toString(),
          ],
          addressType: 'NEW',
          verifiedOnly: true,
        },
        serverInstance,
      ),
      ListingService.getCategoryStats(
        {
          categoryIds: [1, 2, 3, 4, 5],
          verifiedOnly: true,
        },
        serverInstance,
      ),
    ])

    const provinceCities = provinceStatsResponse?.data || []
    const categoryStats = categoryStatsResponse?.data || []

    return {
      props: {
        provinceCities,
        categoryStats,
      },
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)

    return {
      notFound: true,
    }
  }
}
