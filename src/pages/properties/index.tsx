import React, { useCallback, useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import ResidentialPropertiesTemplate from '@/components/templates/residentialProperties'
import { ListProvider } from '@/contexts/list/index.context'
import LocationProvider from '@/contexts/location'
import { getFiltersFromQuery } from '@/utils/queryParams'
import {
  ListingDetail,
  ListingFilterRequest,
  ListingSearchApiResponse,
} from '@/api/types'
import { generateMockProperties } from '@/mock/properties'
import { DEFAULT_PAGE } from '@/contexts/list/index.type'

const ResidentialPropertiesPage: NextPageWithLayout = () => {
  const t = useTranslations('navigation')
  const router = useRouter()
  const [initialFilters, setInitialFilters] = useState<
    Partial<ListingFilterRequest>
  >({})

  useEffect(() => {
    if (router.isReady) {
      const parsed = getFiltersFromQuery(router.query)
      const page = parsed.page !== undefined ? parsed.page : DEFAULT_PAGE
      setInitialFilters({
        ...parsed,
        page,
      })
    }
  }, [router.isReady, router.query])

  const allMockData = useMemo(() => generateMockProperties(100), [])

  const fetcher = useCallback(
    async (
      filters: ListingFilterRequest,
    ): Promise<ListingSearchApiResponse<ListingDetail>> => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      const pageSize = filters?.size || 10
      const currentPage = filters?.page || 1

      const filteredData = allMockData.filter((listing) => {
        if (
          filters?.productType &&
          listing?.productType !== filters?.productType
        ) {
          return false
        }

        // Price filter
        if (filters?.minPrice && listing?.price < filters?.minPrice) {
          return false
        }
        if (filters?.maxPrice && listing?.price > filters?.maxPrice) {
          return false
        }

        // Area filter
        if (filters?.minArea && (listing?.area ?? 0) < filters?.minArea) {
          return false
        }
        if (filters?.maxArea && (listing?.area ?? 0) > filters?.maxArea) {
          return false
        }

        // Bedrooms filter
        if (
          filters?.minBedrooms &&
          (listing?.bedrooms ?? 0) < filters?.minBedrooms
        ) {
          return false
        }
        if (
          filters?.maxBedrooms &&
          (listing?.bedrooms ?? 0) > filters?.maxBedrooms
        ) {
          return false
        }

        // Bathrooms filter
        if (filters?.bathrooms && listing?.bathrooms !== filters?.bathrooms) {
          return false
        }

        // Verified filter
        if (
          filters?.verified !== undefined &&
          listing?.verified !== filters?.verified
        ) {
          return false
        }

        // Keyword search
        if (filters?.keyword) {
          const keyword = filters?.keyword.toLowerCase()
          const searchText =
            `${listing?.title} ${listing?.description}`.toLowerCase()
          if (!searchText.includes(keyword)) {
            return false
          }
        }

        return true
      })

      // Pagination
      const totalCount = filteredData.length
      const totalPages = Math.ceil(totalCount / pageSize)
      const startIndex = (currentPage - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = filteredData.slice(startIndex, endIndex)

      return {
        code: 'SUCCESS',
        message: null,
        data: {
          listings: paginatedData,
          pagination: {
            totalCount,
            currentPage,
            totalPages,
            pageSize,
          },
          filterCriteria: filters,
        },
      }
    },
    [], // Empty dependencies - allMockData is stable (memoized with empty deps)
  )

  return (
    <>
      <SeoHead title={t('properties')} description='Property search' />
      <div className='container mx-auto py-6 px-4 md:px-0'>
        <ListProvider
          fetcher={fetcher}
          initialData={[]}
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
