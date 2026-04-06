import React from 'react'
import HomepageTemplate from '@/components/templates/homepage'
import { ListingService } from '@/api/services/listing.service'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import SeoHead from '@/components/atoms/seo/SeoHead'
import LocationProvider from '@/contexts/location'
import type { ProvinceStatsItem, CategoryStatsItem } from '@/api/types'
import { List } from '@/contexts/list'
import { PROVINCE_CODE } from '@/utils/mapper'
import { fetchNewestNews } from '@/api/services/news.service'
import type { NewsItem } from '@/api/types/news.type'
import { useQuery } from '@tanstack/react-query'

const HOMEPAGE_QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
}

const TOP_PROVINCE_IDS = [
  PROVINCE_CODE.HANOI,
  PROVINCE_CODE.HO_CHI_MINH,
  PROVINCE_CODE.DA_NANG,
  PROVINCE_CODE.BINH_DUONG,
  PROVINCE_CODE.DONG_NAI,
]

const HOMEPAGE_VI_KEYWORDS = [
  'thuê nhà',
  'thuê căn hộ',
  'thuê chung cư',
  'phòng trọ',
  'nhà trọ giá rẻ',
  'cho thuê nhà nguyên căn',
  'bất động sản cho thuê',
  'tìm nhà cho thuê',
  'tìm phòng trọ',
  'SmartRent',
  'Smartrent tìm nhà trọ',
]

const Home: NextPageWithLayout = () => {
  const isClientSide = typeof window !== 'undefined'

  const { data: provinceCities } = useQuery<ProvinceStatsItem[]>({
    queryKey: ['homepage', 'province-stats'],
    queryFn: async () => {
      const response = await ListingService.getProvinceStats({
        provinceIds: TOP_PROVINCE_IDS,
        provinceCodes: TOP_PROVINCE_IDS.map((provinceCode) =>
          provinceCode.toString(),
        ),
        addressType: 'NEW',
        verifiedOnly: true,
      })
      return response?.data || []
    },
    enabled: isClientSide,
    ...HOMEPAGE_QUERY_CONFIG,
  })

  const { data: categoryStats } = useQuery<CategoryStatsItem[]>({
    queryKey: ['homepage', 'category-stats'],
    queryFn: async () => {
      const response = await ListingService.getCategoryStats({
        categoryIds: [1, 2, 3, 4, 5],
        verifiedOnly: true,
      })
      return response?.data || []
    },
    enabled: isClientSide,
    ...HOMEPAGE_QUERY_CONFIG,
  })

  const { data: latestNews } = useQuery<NewsItem[]>({
    queryKey: ['homepage', 'latest-news'],
    queryFn: async () => {
      const response = await fetchNewestNews(5)
      return response?.success && response?.data ? response.data : []
    },
    enabled: isClientSide,
    ...HOMEPAGE_QUERY_CONFIG,
  })

  return (
    <>
      <SeoHead
        title='SmartRent – Thuê nhà dễ dàng'
        description='Khám phá căn hộ phù hợp nhất với bạn. Tìm kiếm nhanh, lọc thông minh, liên hệ chủ nhà chỉ với một cú nhấp.'
        keywords={HOMEPAGE_VI_KEYWORDS}
      />
      <LocationProvider>
        <List.Provider>
          <div className='container mx-auto space-y-6'>
            <HomepageTemplate
              cities={provinceCities}
              categoryStats={categoryStats}
              latestNews={latestNews}
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
