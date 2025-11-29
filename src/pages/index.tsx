import React from 'react'
import HomepageTemplate from '@/components/templates/homepage'
import { ListingService } from '@/api/services/listing.service'
import { GetServerSideProps } from 'next'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import SeoHead from '@/components/atoms/seo/SeoHead'
import LocationProvider from '@/contexts/location'
import { createServerAxiosInstance } from '@/configs/axios/axiosServer'
import type { CityItem } from '@/components/organisms/locationBrowseSection/types'
import { ListingDetail } from '@/api/types'
import { List } from '@/contexts/list'

interface HomeProps {
  initialProperties: ListingDetail[]
  provinceCities?: CityItem[]
}

const Home: NextPageWithLayout<HomeProps> = ({
  initialProperties,
  provinceCities,
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
              initialProperties={initialProperties}
              cities={provinceCities}
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

// Mapping province names to image paths
const getProvinceImage = (provinceName: string): string => {
  const imageMap: Record<string, string> = {
    'Hà Nội': '/images/example.png',
    'Thành phố Hồ Chí Minh': '/images/rental-auth-bg.jpg',
    'TP. Hồ Chí Minh': '/images/rental-auth-bg.jpg',
    'Đà Nẵng': '/images/default-image.jpg',
    'Hải Phòng': '/images/default-image.jpg',
    'Cần Thơ': '/images/default-image.jpg',
  }

  return (
    imageMap[provinceName] ||
    imageMap[provinceName.replace('Thành phố ', 'TP. ')] ||
    '/images/default-image.jpg'
  )
}

const mapProvinceStatsToCityItem = (
  stats: Array<{
    provinceId: number | null
    provinceCode: string | null
    provinceName: string
    totalListings: number
  }>,
): CityItem[] => {
  return stats.map((stat) => ({
    id: stat.provinceId?.toString() || stat.provinceCode || '',
    name: stat.provinceName,
    image: getProvinceImage(stat.provinceName),
    listings: stat.totalListings,
  }))
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Create server axios instance for server-side API calls
    const { req } = context
    const cookieStore = req.headers.cookie
    const serverInstance = createServerAxiosInstance(cookieStore)

    // Top 5 provinces: Hà Nội (1), TP.HCM (79), Đà Nẵng (48), Hải Phòng (31), Cần Thơ (92)
    const topProvinceIds = [1, 79, 48, 31, 92]

    const [initialProperties, provinceStatsResponse] = await Promise.all([
      ListingService.search({}),
      ListingService.getProvinceStats(
        {
          provinceIds: topProvinceIds,
          verifiedOnly: false,
          addressType: 'OLD',
        },
        serverInstance,
      ),
    ])

    const provinceCities =
      provinceStatsResponse.data && provinceStatsResponse.code === '999999'
        ? mapProvinceStatsToCityItem(provinceStatsResponse.data)
        : []

    return {
      props: {
        initialProperties,
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
