import { NextRouter } from 'next/router'
import { ListingFilterRequest } from '@/api/types/property.type'
import { pushQueryParams } from '@/utils/queryParams'
import { PUBLIC_ROUTES } from '@/constants/route'
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/contexts/list/index.type'

/**
 * Navigate to /properties page with current filter state as query params
 * Used when applying filters from Homepage or other pages
 *
 * @param router - Next.js router instance
 * @param filters - Current filter state from ListContext
 */
export const navigateToPropertiesWithFilters = (
  router: NextRouter,
  filters: ListingFilterRequest,
) => {
  const amenityIds = filters.amenityIds

  pushQueryParams(
    router,
    {
      categoryId: filters?.categoryId ?? null,
      productType: filters?.productType ?? null,
      keyword: filters?.keyword || null,
      minPrice: filters?.minPrice ?? null,
      maxPrice: filters?.maxPrice ?? null,
      minArea: filters?.minArea ?? null,
      maxArea: filters?.maxArea ?? null,
      minBedrooms: filters?.minBedrooms ?? null,
      maxBedrooms: filters?.maxBedrooms ?? null,
      bathrooms: filters?.bathrooms ?? null,
      verified: filters?.verified || null,
      direction: filters?.direction ?? null,
      electricityPrice: filters?.electricityPrice ?? null,
      waterPrice: filters?.waterPrice ?? null,
      internetPrice: filters?.internetPrice ?? null,
      serviceFee: filters?.serviceFee ?? null,
      amenityIds:
        amenityIds && amenityIds.length > 0 ? amenityIds.join(',') : null,
      provinceId: filters?.provinceId ?? null,
      districtId: filters?.districtId ?? null,
      wardId: filters?.wardId ?? null,
      isLegacy: filters?.isLegacy ?? null,
      userLatitude: filters?.latitude ?? filters?.userLatitude ?? null,
      userLongitude: filters?.longitude ?? filters?.userLongitude ?? null,
      sortBy: filters?.sortBy ?? null,
      userId: filters?.userId ?? null,
      // Reflect pagination in URL
      page: filters?.page ?? DEFAULT_PAGE,
      size: filters?.size ?? DEFAULT_PER_PAGE,
    },
    {
      pathname: PUBLIC_ROUTES.PROPERTIES_PREFIX,
      shallow: false,
      scroll: true,
    },
  )
}

/**
 * Navigate to /properties page with all filters cleared
 * Used when resetting filters from any page
 *
 * @param router - Next.js router instance
 */
export const navigateToPropertiesWithClearedFilters = (router: NextRouter) => {
  pushQueryParams(
    router,
    {
      categoryId: null,
      productType: null,
      keyword: null,
      minPrice: null,
      maxPrice: null,
      minArea: null,
      maxArea: null,
      minBedrooms: null,
      maxBedrooms: null,
      bathrooms: null,
      verified: null,
      direction: null,
      electricityPrice: null,
      waterPrice: null,
      internetPrice: null,
      serviceFee: null,
      amenityIds: null,
      provinceId: null,
      districtId: null,
      wardId: null,
      isLegacy: null,
      latitude: null,
      longitude: null,
      sortBy: null,
      // Reset pagination to defaults
      page: DEFAULT_PAGE,
      size: DEFAULT_PER_PAGE,
      userId: null,
      userLatitude: null,
      userLongitude: null,
    },
    {
      pathname: PUBLIC_ROUTES.PROPERTIES_PREFIX,
      shallow: false,
      scroll: true,
    },
  )
}
