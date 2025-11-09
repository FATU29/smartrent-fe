import React from 'react'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import ResidentialPropertiesTemplate from '@/components/templates/residentialProperties'
import { ListProvider } from '@/contexts/list/index.context'
import { fetchListings } from '@/api/services/listing.service'
import { PropertyCard } from '@/api/types/property.type'
import type { GetServerSideProps } from 'next'
import LocationProvider from '@/contexts/location'
import { getFiltersFromQuery } from '@/utils/queryParams'
import { ListFilters } from '@/contexts/list/index.type'

interface ResidentialPropertiesPageProps {
  initialData: PropertyCard[]
  initialFilters: Partial<ListFilters>
}

const ResidentialPropertiesPage: NextPageWithLayout<
  ResidentialPropertiesPageProps
> = ({ initialData, initialFilters }) => {
  const t = useTranslations('navigation')

  return (
    <>
      <SeoHead
        title={t('residential')}
        description='Residential property search'
      />
      <div className='container mx-auto py-6 px-4 md:px-0'>
        <ListProvider
          fetcher={fetchListings}
          initialData={initialData}
          initialFilters={initialFilters}
        >
          <LocationProvider>
            <ResidentialPropertiesTemplate />
          </LocationProvider>
        </ListProvider>
      </div>
    </>
  )
}

ResidentialPropertiesPage.getLayout = function getLayout(
  page: React.ReactNode,
) {
  return <MainLayout activeItem='properties'>{page}</MainLayout>
}

export default ResidentialPropertiesPage

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const parsed = getFiltersFromQuery(ctx.query)
    const filters: ListFilters = {
      search: '',
      perPage: 10,
      page: 1,
      ...parsed,
    }

    const list = await fetchListings(filters)
    return {
      props: {
        initialData: list.data as PropertyCard[],
        initialFilters: parsed,
      },
    }
  } catch {
    // If something goes wrong, still render page without data
    return { props: { initialData: [], initialFilters: {} } }
  }
}
