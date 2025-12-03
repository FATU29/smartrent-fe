import {
  ListingSearchBackendResponse,
  ListingSearchResponse,
  ListingSearchApiRequest,
  ListingFilterRequest,
  ListingDetail,
} from '@/api/types/property.type'

/**
 * Map backend API response to frontend internal format
 */
export function mapBackendToFrontendResponse(
  backendResponse: ListingSearchBackendResponse,
): ListingSearchResponse<ListingDetail> {
  return {
    listings: backendResponse?.listings,
    pagination: {
      totalCount: backendResponse?.totalCount || 0,
      currentPage: backendResponse?.currentPage || 0,
      pageSize: backendResponse?.pageSize || 0,
      totalPages: backendResponse?.totalPages || 0,
    },
    recommendations: backendResponse?.recommendations,
    filterCriteria: backendResponse?.filterCriteria,
  }
}

/**
 * Map frontend filter request to backend API request
 */
export function mapFrontendToBackendRequest(
  frontendFilter: Partial<ListingFilterRequest>,
): ListingSearchApiRequest {
  return {
    provinceId: frontendFilter?.provinceId,
    districtId: frontendFilter?.districtId,
    wardId: frontendFilter?.wardId,
    isLegacy: frontendFilter?.isLegacy,
    categoryId: frontendFilter?.categoryId,
    vipType: frontendFilter?.vipType,
    productType: frontendFilter?.productType,
    minPrice: frontendFilter?.minPrice,
    maxPrice: frontendFilter?.maxPrice,
    minArea: frontendFilter?.minArea,
    maxArea: frontendFilter?.maxArea,
    minBedrooms: frontendFilter?.minBedrooms,
    maxBedrooms: frontendFilter?.maxBedrooms,
    bathrooms: frontendFilter?.bathrooms,
    furnishing: frontendFilter?.furnishing,
    direction: frontendFilter?.direction,
    verified: frontendFilter?.verified,
    waterPrice: frontendFilter?.waterPrice,
    electricityPrice: frontendFilter?.electricityPrice,
    internetPrice: frontendFilter?.internetPrice,
    serviceFee: frontendFilter?.serviceFee,
    amenityIds: frontendFilter?.amenityIds,
    keyword: frontendFilter?.keyword,
    page: frontendFilter?.page,
    size: frontendFilter?.size,
    status: frontendFilter?.status,
    userId: frontendFilter?.userId,
    sortBy: frontendFilter?.sortBy,
    latitude: frontendFilter?.latitude,
    longitude: frontendFilter?.longitude,
    userLatitude: frontendFilter?.userLatitude,
    userLongitude: frontendFilter?.userLongitude,
  }
}
