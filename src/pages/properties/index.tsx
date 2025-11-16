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
  initialPagination?: {
    total: number
    page: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

const ResidentialPropertiesPage: NextPageWithLayout<
  ResidentialPropertiesPageProps
> = ({ initialData, initialFilters, initialPagination }) => {
  const t = useTranslations('navigation')

  return (
    <>
      <SeoHead title={t('properties')} description='Property search' />
      <div className='container mx-auto py-6 px-4 md:px-0'>
        <ListProvider
          fetcher={fetchListings}
          initialData={initialData}
          initialFilters={initialFilters}
          initialPagination={initialPagination}
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
  // Only parse query params, don't fetch data
  // Data will be fetched client-side with skeleton loading
  const parsed = getFiltersFromQuery(ctx.query)

  // When page is not in query (null/undefined), it means filters were just applied
  // In that case, reset to page 1
  // When page is in query, use it (for pagination navigation)
  const page = parsed.page !== undefined ? parsed.page : 1

  return {
    props: {
      initialData: [], // Empty array - will be fetched client-side
      initialFilters: {
        ...parsed,
        page, // Ensure page is set correctly
      },
      initialPagination: {
        total: 0,
        page,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    },
  }
}
