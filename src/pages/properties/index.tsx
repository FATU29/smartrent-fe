import React, { useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { AxiosError } from 'axios'
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
  ListingSearchResponse,
} from '@/api/types/property.type'
import type { ApiResponse } from '@/configs/axios/types'
import { DEFAULT_PAGE } from '@/contexts/list/index.type'
import { PUBLIC_ROUTES } from '@/constants/route'
import { ListingService } from '@/api/services/listing.service'
import {
  mapFrontendToBackendRequest,
  mapBackendToFrontendResponse,
} from '@/utils/property/mapListingResponse'
import { createServerAxiosInstance } from '@/configs/axios/axiosServer'

interface ResidentialPropertiesPageProps {
  initialData: ListingDetail[]
  initialPagination: {
    totalCount: number
    currentPage: number
    pageSize: number
    totalPages: number
  }
  initialFilters: Partial<ListingFilterRequest>
}

const ResidentialPropertiesPage: NextPageWithLayout<
  ResidentialPropertiesPageProps
> = ({ initialData, initialPagination, initialFilters }) => {
  const t = useTranslations('navigation')
  const router = useRouter()
  const lastPushedFiltersRef = useRef<string>('')

  const pushFiltersToQuery = useCallback(
    (filters: ListingFilterRequest) => {
      const filtersKey = JSON.stringify(filters)
      if (lastPushedFiltersRef.current === filtersKey) return
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
    },
    [router],
  )

  // Fetcher function for ListProvider - calls real API
  const fetcher = useCallback(
    async (
      filters: ListingFilterRequest,
    ): Promise<ApiResponse<ListingSearchResponse<ListingDetail>>> => {
      // Map frontend filters to backend request
      const backendRequest = mapFrontendToBackendRequest(filters)

      // Call backend API
      const backendResponse = await ListingService.search(backendRequest)

      // Push filters to URL
      pushFiltersToQuery(filters)

      // Handle error case
      if (!backendResponse.success || !backendResponse.data) {
        return {
          code: backendResponse.code,
          message: backendResponse.message,
          success: false,
          data: {
            listings: [],
            pagination: {
              totalCount: 0,
              currentPage: filters.page || 0,
              pageSize: filters.size || 20,
              totalPages: 0,
            },
          },
        }
      }

      // Map backend response to frontend format
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

  return (
    <>
      <SeoHead title={t('properties')} description='Property search' />
      <div className='container mx-auto py-6 px-4 md:px-0'>
        <ListProvider
          fetcher={fetcher}
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

// Server-Side Props - Fetch initial data from API
export const getServerSideProps: GetServerSideProps<
  ResidentialPropertiesPageProps
> = async (context) => {
  try {
    // Create server-side axios instance (no cookies needed - public API)
    const serverInstance = createServerAxiosInstance()

    // Parse filters from query params
    const parsedFilters = getFiltersFromQuery(context.query)
    const filters: Partial<ListingFilterRequest> = {
      ...parsedFilters,
      page: parsedFilters.page ?? DEFAULT_PAGE,
      size: parsedFilters.size ?? 20,
    }

    console.log('[SSR Properties] Filters:', JSON.stringify(filters, null, 2))

    // Map to backend request
    const backendRequest = mapFrontendToBackendRequest(filters)
    console.log(
      '[SSR Properties] Backend Request:',
      JSON.stringify(backendRequest, null, 2),
    )

    // Fetch from API (public endpoint - no auth required)
    const response = await ListingService.search(backendRequest, serverInstance)

    console.log('[SSR Properties] API Response:', {
      success: response.success,
      code: response.code,
      dataExists: !!response?.data,
      listingsCount: response.data?.listings?.length || 0,
    })

    // Handle error or empty response
    if (!response.success || !response.data) {
      console.warn('[SSR Properties] API call failed or no data:', {
        success: response.success,
        code: response.code,
        message: response.message,
      })

      return {
        props: {
          initialData: [],
          initialPagination: {
            totalCount: 0,
            currentPage: 0,
            pageSize: 20,
            totalPages: 0,
          },
          initialFilters: filters,
        },
      }
    }

    // Map backend response to frontend format
    const frontendData = mapBackendToFrontendResponse(response.data)

    console.log('[SSR Properties] Success:', {
      listingsCount: frontendData.listings.length,
      totalCount: frontendData.pagination.totalCount,
      currentPage: frontendData.pagination.currentPage,
      totalPages: frontendData.pagination.totalPages,
    })

    return {
      props: {
        initialData: frontendData.listings,
        initialPagination: frontendData.pagination,
        initialFilters: filters,
      },
    }
  } catch (error) {
    console.error('[SSR Properties] Error fetching listings:', error)

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as AxiosError
      console.error('[SSR Properties] API Error Details:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        url: axiosError.config?.url,
        method: axiosError.config?.method,
      })
    }

    // Return empty data on error
    return {
      props: {
        initialData: [],
        initialPagination: {
          totalCount: 0,
          currentPage: 0,
          pageSize: 20,
          totalPages: 0,
        },
        initialFilters: {},
      },
    }
  }
}

export default ResidentialPropertiesPage
