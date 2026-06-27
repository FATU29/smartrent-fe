import { NextRouter } from 'next/router'
import { ListingFilterRequest } from '@/api/types/property.type'
import { pushQueryParams } from '@/utils/queryParams'
import { PUBLIC_ROUTES } from '@/constants/route'

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
  /**
   * Original free-text / AI query the user searched. Carried as `?q=` so the
   * destination listing page can keep it visible in the search box even when
   * it parsed into structured filters and the residual `keyword` is empty.
   */
  searchQuery?: string,
) => {
  const amenityIds = filters.amenityIds

  pushQueryParams(
    router,
    {
      q: searchQuery && searchQuery.trim() ? searchQuery.trim() : null,
      categoryId: filters?.categoryId ?? null,
      productType: filters?.productType ?? null,
      listingType: filters?.listingType ?? null,
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
      provinceCode: filters?.provinceCodes
        ? filters.provinceCodes.join(',')
        : null,
      districtId: filters?.districtId ?? null,
      wardId: filters?.wardId ?? null,
      isLegacy: filters?.isLegacy ?? null,
      userLatitude: filters?.latitude ?? filters?.userLatitude ?? null,
      userLongitude: filters?.longitude ?? filters?.userLongitude ?? null,
      sortBy: filters?.sortBy ?? null,
      userId: filters?.userId ?? null,
      isBroker: filters?.isBroker === true ? true : null,
      // /properties pages via cursor (fixed server-side window) — page/size are
      // not part of its URL, so don't pin them when arriving from the homepage.
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
      q: null,
      categoryId: null,
      productType: null,
      listingType: null,
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
      provinceCode: null,
      districtId: null,
      wardId: null,
      isLegacy: null,
      latitude: null,
      longitude: null,
      sortBy: null,
      isBroker: null,
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
