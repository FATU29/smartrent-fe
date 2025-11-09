import React from 'react'
import HomepageTemplate from '@/components/templates/homepage'
import { getInitial, fetchListings } from '@/api/services/listing.service'
import { MembershipService } from '@/api/services/membership.service'
import { VipTierService } from '@/api/services/vip-tier.service'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { PropertyCard } from '@/api/types/property.type'
import { ListProvider } from '@/contexts/list/index.context'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import SeoHead from '@/components/atoms/seo/SeoHead'
import LocationProvider from '@/contexts/location'
import type { VipTier } from '@/api/types/vip-tier.type'
import type { GetPackagesResponse } from '@/api/types/memembership.type'
import { getFiltersFromQuery } from '@/utils/queryParams'
import type { ListFilters } from '@/contexts/list/index.type'

interface HomeProps {
  initialProperties: PropertyCard[]
  vipTiers: VipTier[]
  membershipPackages: GetPackagesResponse
  initialFilters?: Partial<ListFilters>
}

const Home: NextPageWithLayout<HomeProps> = ({
  initialProperties,
  vipTiers,
  membershipPackages,
  initialFilters,
}) => {
  const router = useRouter()

  const handlePropertyClick = (property: PropertyCard) => {
    console.log('Property clicked:', property)
    router.push(`/apartment-detail/123`)
  }

  return (
    <>
      <SeoHead
        title='SmartRent – Thuê nhà dễ dàng'
        description='Khám phá căn hộ phù hợp nhất với bạn. Tìm kiếm nhanh, lọc thông minh, liên hệ chủ nhà chỉ với một cú nhấp.'
      />
      <LocationProvider>
        <ListProvider
          fetcher={fetchListings}
          initialData={initialProperties}
          initialFilters={initialFilters}
        >
          <div className='container mx-auto space-y-6'>
            <HomepageTemplate
              onPropertyClick={handlePropertyClick}
              vipTiers={vipTiers}
              membershipPackages={membershipPackages}
            />
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Parse filters from URL query (already cleaned inside getFiltersFromQuery)
    const initialFiltersFromQuery = getFiltersFromQuery(context.query)

    const [initialProperties, vipTiersResponse, membershipPackagesResponse] =
      await Promise.all([
        getInitial(),
        VipTierService.getActive(),
        MembershipService.getAllPackages(),
      ])

    return {
      props: {
        initialProperties,
        vipTiers: vipTiersResponse.data || [],
        membershipPackages: membershipPackagesResponse.data || {
          packages: [],
        },
        initialFilters: initialFiltersFromQuery,
      },
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)

    return {
      notFound: true,
    }
  }
}
