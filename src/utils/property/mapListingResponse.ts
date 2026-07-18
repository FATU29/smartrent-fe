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

// Backend accepts range filters as a single `from..to` string (either side
// optional), not as separate min/max fields. Returning undefined keeps the
// field out of the payload entirely when neither bound is set.
function toRangeString(
  min: number | undefined | null,
  max: number | undefined | null,
): string | undefined {
  const hasMin = min !== undefined && min !== null
  const hasMax = max !== undefined && max !== null
  if (!hasMin && !hasMax) return undefined
  return `${hasMin ? min : ''}..${hasMax ? max : ''}`
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
    listingType: frontendFilter?.listingType,
    price: toRangeString(frontendFilter?.minPrice, frontendFilter?.maxPrice),
    area: toRangeString(frontendFilter?.minArea, frontendFilter?.maxArea),
    bedroomsRange: toRangeString(
      frontendFilter?.minBedrooms,
      frontendFilter?.maxBedrooms,
    ),
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
    id: frontendFilter?.id,
    // Public browse (no userId) must exclude expired listings so the
    // listing-page total matches the homepage category/location counts,
    // which always exclude expired. For owner "my listings" (userId set)
    // leave it unset so the owner still sees their expired posts.
    excludeExpired: frontendFilter?.userId ? undefined : true,
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
