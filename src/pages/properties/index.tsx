import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import ResidentialPropertiesTemplate from '@/components/templates/residentialProperties'
import { ListProvider } from '@/contexts/list/index.context'
import LocationProvider from '@/contexts/location'
import { getFiltersFromQuery, pushQueryParams } from '@/utils/queryParams'
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/contexts/list/index.type'
import {
  ListingDetail,
  ListingFilterRequest,
  ListingSearchResponse,
} from '@/api/types/property.type'
import type { ApiResponse } from '@/configs/axios/types'
import { PUBLIC_ROUTES } from '@/constants/route'
import { ListingService } from '@/api/services/listing.service'
import {
  mapFrontendToBackendRequest,
  mapBackendToFrontendResponse,
} from '@/utils/property/mapListingResponse'

type ResidentialPropertiesClientInit = {
  initialFilters: Partial<ListingFilterRequest>
  initialPagination: {
    totalCount: number
    currentPage: number
    pageSize: number
    totalPages: number
  }
}

const buildClientInit = (
  query: Record<string, unknown>,
): ResidentialPropertiesClientInit => {
  const parsedFilters = getFiltersFromQuery(query)
  const page = parsedFilters.page ?? DEFAULT_PAGE
  const size = parsedFilters.size ?? DEFAULT_PER_PAGE

  return {
    initialFilters: parsedFilters,
    initialPagination: {
      totalCount: 0,
      currentPage: page,
      pageSize: size,
      totalPages: 0,
    },
  }
}

const ResidentialPropertiesPage: NextPageWithLayout = () => {
  const t = useTranslations('navigation')
  const router = useRouter()
  const lastPushedFiltersRef = useRef<string>('')
  const [clientInit, setClientInit] =
    useState<ResidentialPropertiesClientInit | null>(null)

  useEffect(() => {
    if (!router.isReady || clientInit) {
      return
    }

    setClientInit(buildClientInit(router.query))
  }, [router.isReady, router.query, clientInit])

  const pushFiltersToQuery = useCallback(
    (filters: ListingFilterRequest) => {
      const filtersKey = JSON.stringify(filters)
      if (lastPushedFiltersRef.current === filtersKey) {
        return
      }
      lastPushedFiltersRef.current = filtersKey
      const amenityIds = filters.amenityIds
      pushQueryParams(
        router,
        {
          userId: filters.userId ?? null,
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
          // verified: filters.verified || null,
          direction: filters.direction ?? null,
          electricityPrice: filters.electricityPrice ?? null,
          waterPrice: filters.waterPrice ?? null,
          internetPrice: filters.internetPrice ?? null,
          serviceFee: filters.serviceFee ?? null,
          amenityIds:
            amenityIds && amenityIds.length > 0 ? amenityIds.join(',') : null,
          provinceId: filters.provinceId ?? null,
          provinceCode: filters.provinceCodes
            ? filters.provinceCodes.join(',')
            : null,
          districtId: filters.districtId ?? null,
          wardId: filters.wardId ?? null,
          isLegacy: filters.isLegacy ?? null,
          userLongitude: filters.userLongitude ?? null,
          userLatitude: filters.userLatitude ?? null,
          sortBy: filters.sortBy ?? null,
          page: filters.page ?? DEFAULT_PAGE,
          size: filters.size ?? DEFAULT_PER_PAGE,
        },
        {
          pathname: PUBLIC_ROUTES.PROPERTIES_PREFIX,
          shallow: true,
          scroll: false,
        },
      )
    },
    [router],
  )

  const fetcher = useCallback(
    async (
      filters: ListingFilterRequest,
    ): Promise<ApiResponse<ListingSearchResponse<ListingDetail>>> => {
      const backendRequest = mapFrontendToBackendRequest(filters)
      pushFiltersToQuery(filters)

      const backendResponse = await ListingService.search(backendRequest)

      if (!backendResponse.success || !backendResponse.data) {
        return {
          code: backendResponse.code,
          message: backendResponse.message,
          success: false,
          data: {
            listings: [],
            pagination: {
              totalCount: 0,
              currentPage: filters.page ?? DEFAULT_PAGE,
              pageSize: filters.size ?? DEFAULT_PER_PAGE,
              totalPages: 0,
            },
          },
        }
      }

      const frontendData = mapBackendToFrontendResponse(backendResponse.data)

      return {
        code: backendResponse.code,
        message: backendResponse.message,
        success: true,
        data: frontendData,
      }
    },
    [pushFiltersToQuery],
  )

  if (!clientInit) {
    return (
      <>
        <SeoHead title={t('properties')} description='Property search' />
        <div className='container mx-auto py-6 px-4 md:px-0'>
          <div className='min-h-[320px]' aria-busy='true' />
        </div>
      </>
    )
  }

  return (
    <>
      <SeoHead title={t('properties')} description='Property search' />
      <div className='container mx-auto py-6 px-4 md:px-0'>
        <ListProvider
          fetcher={fetcher}
          initialData={[]}
          initialFilters={clientInit.initialFilters}
          initialPagination={clientInit.initialPagination}
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
