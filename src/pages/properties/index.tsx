import React, { useCallback, useMemo, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import ResidentialPropertiesTemplate from '@/components/templates/residentialProperties'
import { ListProvider } from '@/contexts/list/index.context'
import LocationProvider from '@/contexts/location'
import { getFiltersFromQuery, pushQueryParams } from '@/utils/queryParams'
import {
  ListingDetail,
  ListingFilterRequest,
  ListingSearchApiResponse,
} from '@/api/types/property.type'
import { generateMockProperties } from '@/mock/properties'
import { DEFAULT_PAGE } from '@/contexts/list/index.type'
import { PUBLIC_ROUTES } from '@/constants/route'

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
  const lastPushedFiltersRef = useRef<string>('')

  const fetcher = useCallback(
    async (
      filters: ListingFilterRequest,
    ): Promise<ListingSearchApiResponse<ListingDetail>> => {
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

      const filtersKey = JSON.stringify(filters)
      if (lastPushedFiltersRef.current !== filtersKey) {
        lastPushedFiltersRef.current = filtersKey
        const amenityIds = filters.amenityIds
        pushQueryParams(
          router,
          {
            categoryId: filters.categoryId ?? null,
            productType: filters.productType ?? null,
            keyword: filters.keyword || null,
            minPrice: filters.minPrice ?? null,
            maxPrice: filters.maxPrice ?? null,
            minArea: filters.minArea ?? null,
            maxArea: filters.maxArea ?? null,
            minBedrooms: filters.minBedrooms ?? null,
            maxBedrooms: filters.maxBedrooms ?? null,
            bathrooms: filters.bathrooms ?? null,
            verified: filters.verified || null,
            direction: filters.direction ?? null,
            electricityPrice: filters.electricityPrice ?? null,
            waterPrice: filters.waterPrice ?? null,
            internetPrice: filters.internetPrice ?? null,
            serviceFee: filters.serviceFee ?? null,
            amenityIds:
              amenityIds && amenityIds.length > 0 ? amenityIds.join(',') : null,
            provinceId: filters.provinceId ?? null,
            districtId: filters.districtId ?? null,
            wardId: filters.wardId ?? null,
            isLegacy: filters.isLegacy ?? null,
            latitude: filters.latitude ?? null,
            longitude: filters.longitude ?? null,
            sortBy: filters.sortBy ?? null,
            page: null,
          },
          {
            pathname: PUBLIC_ROUTES.PROPERTIES_PREFIX,
            shallow: false,
            scroll: true,
          },
        )
      }

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
    [allMockData, router],
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
