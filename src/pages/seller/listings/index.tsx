import React, { useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import { ListingsManagementTemplate } from '@/components/templates/listingsManagementTemplate'
import { ListProvider } from '@/contexts/list/index.context'
import LocationProvider from '@/contexts/location'
import { ListingFilterRequest, ListingOwnerDetail } from '@/api/types'
import type { ApiResponse } from '@/configs/axios/types'
import { ListingService } from '@/api/services/listing.service'
import { mapMyListingsBackendToFrontend } from '@/utils/property/mapMyListingsResponse'
import { getFiltersFromQuery, pushQueryParams } from '@/utils/queryParams'
import { SELLER_ROUTES } from '@/constants/route'

// Real fetcher using POST /v1/listings/my-listings
const fetchMyListings = async (
  filters: ListingFilterRequest,
): Promise<
  ApiResponse<{
    listings: ListingOwnerDetail[]
    pagination: {
      totalCount: number
      currentPage: number
      pageSize: number
      totalPages: number
    }
  }>
> => {
  const request = {
    ...filters,
  }

  const response = await ListingService.getMyListings(request)

  if (!response.success || !response.data) {
    return {
      code: response.code,
      message: response.message,
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

  const frontend = mapMyListingsBackendToFrontend(response.data)

  return {
    code: response.code,
    message: response.message,
    success: true,
    data: frontend,
  }
}

const ListingsPage: NextPageWithLayout = () => {
  const t = useTranslations()
  const router = useRouter()
  const lastPushedFiltersRef = useRef<string>('')

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
          status: filters.status ?? null,
          listingStatus: filters.listingStatus ?? null,
          moderationStatus: filters.moderationStatus ?? null,
          page: filters.page ?? null,
          size: filters.size ?? null,
        },
        {
          pathname: SELLER_ROUTES.LISTINGS,
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
    ): Promise<
      ApiResponse<{
        listings: ListingOwnerDetail[]
        pagination: {
          totalCount: number
          currentPage: number
          pageSize: number
          totalPages: number
        }
      }>
    > => {
      // Keep URL in sync with current filters
      pushFiltersToQuery(filters)
      return fetchMyListings(filters)
    },
    [pushFiltersToQuery],
  )

  return (
    <>
      <SeoHead title={t('userMenu.listings')} noindex />
      <LocationProvider>
        <ListProvider
          fetcher={fetcher}
          initialData={[]}
          initialFilters={
            router?.query ? getFiltersFromQuery(router.query) : {}
          }
          initialPagination={{
            currentPage: 0,
            pageSize: 20,
            totalCount: 0,
            totalPages: 0,
          }}
        >
          <ListingsManagementTemplate />
        </ListProvider>
      </LocationProvider>
    </>
  )
}

ListingsPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default ListingsPage
