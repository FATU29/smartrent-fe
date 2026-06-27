import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import ResidentialPropertiesCursorTemplate from '@/components/templates/residentialPropertiesCursor'
import { ListProvider } from '@/contexts/list/index.context'
import { useListContext } from '@/contexts/list/useListContext'
import LocationProvider from '@/contexts/location'
import { getFiltersFromQuery, pushQueryParams } from '@/utils/queryParams'
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/contexts/list/index.type'
import { ListingFilterRequest } from '@/api/types/property.type'
import { PUBLIC_ROUTES } from '@/constants/route'

const parseNumberFromRouterQuery = (
  queryValue: string | string[] | undefined,
): number | undefined => {
  const raw = Array.isArray(queryValue) ? queryValue[0] : queryValue
  if (!raw) {
    return undefined
  }

  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : undefined
}

// Sync URL → filter ONLY when the URL's categoryId changes externally
// (e.g. the navigation menu pushes a new categoryId while already on
// /properties). We deliberately do NOT depend on `filters.categoryId`,
// otherwise this effect re-fires every time the user picks a category in the
// dropdown — at that point the URL hasn't been pushed yet, so it would clobber
// the user's selection back to the stale URL value.
const CategoryQuerySync: React.FC<{ categoryFromQuery?: number }> = ({
  categoryFromQuery,
}) => {
  const { filters, updateFilters } = useListContext<ListingFilterRequest>()
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  useEffect(() => {
    if (filtersRef.current.categoryId === categoryFromQuery) {
      return
    }

    updateFilters({
      categoryId: categoryFromQuery,
      page: DEFAULT_PAGE,
      size: DEFAULT_PER_PAGE,
    })
  }, [categoryFromQuery, updateFilters])

  return null
}

// Mirror context filters into the URL so any change inside the filter bar
// (CategoryDropdown, price/area, isBroker, sort, etc.) shows up as query
// params and is shareable / restorable. Lives inside ListProvider so it can
// observe filter state directly via useListContext.
const FiltersUrlSync: React.FC<{
  pushFiltersToQuery: (filters: ListingFilterRequest) => void
}> = ({ pushFiltersToQuery }) => {
  const { filters } = useListContext<ListingFilterRequest>()

  useEffect(() => {
    pushFiltersToQuery(filters)
  }, [filters, pushFiltersToQuery])

  return null
}

const parseBooleanQueryParam = (
  query: Record<string, unknown>,
  key: string,
): boolean | undefined => {
  const raw = query[key]
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value === 'true' || value === true) {
    return true
  }
  if (value === 'false' || value === false) {
    return false
  }
  return undefined
}

const buildInitialFilters = (
  query: Record<string, unknown>,
): Partial<ListingFilterRequest> => {
  const parsedFilters = getFiltersFromQuery(query)
  const isBroker = parseBooleanQueryParam(query, 'isBroker')
  if (isBroker === true) {
    parsedFilters.isBroker = true
  }
  return parsedFilters
}

const ResidentialPropertiesPage: NextPageWithLayout = () => {
  const t = useTranslations('navigation')
  const router = useRouter()
  const categoryFromQuery = parseNumberFromRouterQuery(router.query.categoryId)
  const lastPushedFiltersRef = useRef<string>('')
  const [initialFilters, setInitialFilters] =
    useState<Partial<ListingFilterRequest> | null>(null)

  useEffect(() => {
    if (!router.isReady || initialFilters) {
      return
    }

    setInitialFilters(buildInitialFilters(router.query))
  }, [router.isReady, router.query, initialFilters])

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
          isBroker: filters.isBroker === true ? true : null,
          sortBy: filters.sortBy ?? null,
          // Cursor paging doesn't use page/size — the window is a fixed
          // server-side size, so we deliberately keep them out of the URL.
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

  if (!initialFilters) {
    return (
      <>
        <SeoHead title={t('properties')} description='Property search' />
        <div className='container max-w-6xl mx-auto px-4 py-6 lg:py-8'>
          <div className='min-h-[320px]' aria-busy='true' />
        </div>
      </>
    )
  }

  return (
    <>
      <SeoHead title={t('properties')} description='Property search' />
      <div className='container max-w-6xl mx-auto px-4 py-6 lg:py-8'>
        {/* No `fetcher` → the offset /search flow never runs. This provider
            only holds the filter state for the shared filter bar/sidebar; the
            listing column pages through the keyset cursor endpoint. */}
        <ListProvider initialData={[]} initialFilters={initialFilters}>
          <CategoryQuerySync categoryFromQuery={categoryFromQuery} />
          <FiltersUrlSync pushFiltersToQuery={pushFiltersToQuery} />
          <LocationProvider>
            <ResidentialPropertiesCursorTemplate />
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
