import React from 'react'
import HomepageTemplate from '@/components/templates/homepage'
import { ListingService } from '@/api/services/listing.service'
import { GetServerSideProps } from 'next'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import SeoHead from '@/components/atoms/seo/SeoHead'
import LocationProvider from '@/contexts/location'
import { createServerAxiosInstance } from '@/configs/axios/axiosServer'
import type {
  ProvinceStatsItem,
  CategoryStatsItem,
  ListingDetail,
} from '@/api/types'
import { List } from '@/contexts/list'
import { PROVINCE_CODE } from '@/utils/mapper'

interface HomeProps {
  provinceCities?: ProvinceStatsItem[]
  categoryStats?: CategoryStatsItem[]
  diamondListings?: ListingDetail[]
  goldListings?: ListingDetail[]
  silverListings?: ListingDetail[]
}

const Home: NextPageWithLayout<HomeProps> = ({
  provinceCities,
  categoryStats,
  diamondListings,
  goldListings,
  silverListings,
}) => {
  return (
    <>
      <SeoHead
        title='SmartRent – Thuê nhà dễ dàng'
        description='Khám phá căn hộ phù hợp nhất với bạn. Tìm kiếm nhanh, lọc thông minh, liên hệ chủ nhà chỉ với một cú nhấp.'
        preloadImages={[
          {
            href: '/images/thue-phong-tro.jpg',
            as: 'image',
            type: 'image/jpeg',
            fetchPriority: 'high',
            imageSrcSet: '/images/thue-phong-tro.jpg 1920w',
            imageSizes: '100vw',
          },
          {
            href: '/images/banner-default.jpg',
            as: 'image',
            type: 'image/jpeg',
            fetchPriority: 'high',
            imageSrcSet: '/images/banner-default.jpg 1920w',
            imageSizes:
              '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px',
          },
        ]}
      />
      <LocationProvider>
        <List.Provider>
          <div className='container mx-auto space-y-6'>
            <HomepageTemplate
              cities={provinceCities}
              categoryStats={categoryStats}
              diamondListings={diamondListings}
              goldListings={goldListings}
              silverListings={silverListings}
            />
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

    const [
      provinceStatsResponse,
      categoryStatsResponse,
      diamondListingsResponse,
      goldListingsResponse,
      silverListingsResponse,
    ] = await Promise.all([
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
      ListingService.search(
        {
          vipType: 'DIAMOND',
          verified: true,
          page: 1,
          size: 10,
        },
        serverInstance,
      ),
      ListingService.search(
        {
          vipType: 'GOLD',
          verified: true,
          page: 1,
          size: 10,
        },
        serverInstance,
      ),
      ListingService.search(
        {
          vipType: 'SILVER',
          verified: true,
          page: 1,
          size: 10,
        },
        serverInstance,
      ),
    ])

    const provinceCities = provinceStatsResponse?.data || []
    const categoryStats = categoryStatsResponse?.data || []
    const diamondListings = diamondListingsResponse?.data?.listings || []
    const goldListings = goldListingsResponse?.data?.listings || []
    const silverListings = silverListingsResponse?.data?.listings || []

    return {
      props: {
        provinceCities,
        categoryStats,
        diamondListings,
        goldListings,
        silverListings,
      },
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)

    return {
      notFound: true,
    }
  }
}
