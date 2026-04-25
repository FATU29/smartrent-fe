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
 *
 * Address fields differ by structure:
 * - Legacy mode (isLegacy=true): backend matches on legacy_province_id /
 *   legacy_district_id / legacy_ward_id, so send numeric provinceId,
 *   districtId, wardId.
 * - New mode (isLegacy=false): backend matches on new_province_code /
 *   new_ward_code, so send provinceCodes (list) and newWardCode. The FE
 *   address filter stores the chosen new codes under provinceId/wardId
 *   (string), so promote them here.
 */
export function mapFrontendToBackendRequest(
  frontendFilter: Partial<ListingFilterRequest>,
): ListingSearchApiRequest {
  const isLegacy = frontendFilter?.isLegacy
  const addressPayload: Pick<
    ListingSearchApiRequest,
    | 'provinceId'
    | 'provinceCodes'
    | 'districtId'
    | 'wardId'
    | 'newWardCode'
    | 'isLegacy'
  > =
    isLegacy === false
      ? {
          provinceCodes:
            frontendFilter?.provinceCodes &&
            frontendFilter.provinceCodes.length > 0
              ? frontendFilter.provinceCodes
              : frontendFilter?.provinceId !== undefined &&
                  frontendFilter.provinceId !== null
                ? [String(frontendFilter.provinceId)]
                : undefined,
          newWardCode:
            frontendFilter?.wardId !== undefined &&
            frontendFilter.wardId !== null
              ? String(frontendFilter.wardId)
              : undefined,
          isLegacy: false,
        }
      : {
          provinceId: frontendFilter?.provinceId,
          provinceCodes: frontendFilter?.provinceCodes,
          districtId: frontendFilter?.districtId,
          wardId: frontendFilter?.wardId,
          isLegacy,
        }

  const payload = {
    ...addressPayload,
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
    // verified: frontendFilter?.verified,
    waterPrice: frontendFilter?.waterPrice,
    electricityPrice: frontendFilter?.electricityPrice,
    internetPrice: frontendFilter?.internetPrice,
    serviceFee: frontendFilter?.serviceFee,
    amenityIds: frontendFilter?.amenityIds,
    keyword: frontendFilter?.keyword,
    page: frontendFilter?.page ?? 0,
    size: frontendFilter?.size ?? 10,
    status: frontendFilter?.status,
    userId: frontendFilter?.userId,
    isBroker: frontendFilter?.isBroker,
    sortBy: frontendFilter?.sortBy,
    latitude: frontendFilter?.latitude,
    longitude: frontendFilter?.longitude,
    userLatitude: frontendFilter?.userLatitude,
    userLongitude: frontendFilter?.userLongitude,
  }

  return payload
}
