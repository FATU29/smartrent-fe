import type { NextRouter } from 'next/router'
import type { ParsedUrlQuery, ParsedUrlQueryInput } from 'querystring'
import type { ListFilters } from '@/contexts/list/index.type'
import type { ListingSearchRequest } from '@/api/types/property.type'
import {
  toApiPropertyType,
  getPropertyTypeBySlug,
} from '@/constants/common/propertyTypes'

export type PushQueryOptions = {
  shallow?: boolean
  scroll?: boolean
  pathname?: string
  replace?: boolean
  removeNullish?: boolean
  removeEmptyString?: boolean
}

type Primitive = string | number | boolean

function toQueryValue(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  if (Array.isArray(value)) return value.map(String).join(',')
  if (typeof value === 'object') return undefined
  return String(value as Primitive)
}

/**
 * Helper to parse string query params
 */
function parseStringParam(
  query: ParsedUrlQuery,
  key: string,
): string | undefined {
  return query[key] ? (query[key] as string) : undefined
}

/**
 * Helper to parse number query params
 */
function parseNumberParam(
  query: ParsedUrlQuery,
  key: string,
): number | undefined {
  return query[key] ? Number(query[key]) : undefined
}

/**
 * Helper to parse boolean query params
 */
function parseBooleanParam(
  query: ParsedUrlQuery,
  key: string,
): boolean | undefined {
  return query[key] === 'true' ? true : undefined
}

/**
 * Parse basic property filters
 * Uses API keys directly (keyword, productType, amenityIds, etc.)
 */
function parseBasicFilters(query: ParsedUrlQuery): Partial<ListFilters> {
  const filters: Partial<ListFilters> = {}

  // Property type - map 'category' (slug) to 'productType' (API key)
  const categoryParam = parseStringParam(query, 'category')
  const productTypeParam = parseStringParam(query, 'productType')
  if (productTypeParam) {
    filters.productType = productTypeParam
  } else if (categoryParam) {
    filters.productType = categoryParam
  }

  // Search - use API key 'keyword'
  const keywordParam = parseStringParam(query, 'keyword')
  if (keywordParam) {
    filters.keyword = keywordParam
  }

  // Price range
  filters.minPrice = parseNumberParam(query, 'minPrice')
  filters.maxPrice = parseNumberParam(query, 'maxPrice')

  // Area range
  filters.minArea = parseNumberParam(query, 'minArea')
  filters.maxArea = parseNumberParam(query, 'maxArea')

  // Rooms
  filters.bedrooms = parseNumberParam(query, 'bedrooms')
  filters.bathrooms = parseNumberParam(query, 'bathrooms')

  // Amenities - use API key 'amenityIds'
  const amenityIdsParam = query.amenityIds
  if (amenityIdsParam) {
    const ids = (amenityIdsParam as string)
      .split(',')
      .map((id) => Number(id))
      .filter((id) => !isNaN(id))
    if (ids.length > 0) {
      filters.amenityIds = ids
    }
  }

  // Pagination
  filters.page = parseNumberParam(query, 'page')

  return filters
}

/**
 * Parse boolean feature filters
 * Uses API keys directly (hasMedia, verified, etc.)
 */
function parseFeatureFilters(query: ParsedUrlQuery): Partial<ListFilters> {
  return {
    verified: parseBooleanParam(query, 'verified'),
    hasMedia: parseBooleanParam(query, 'hasMedia'),
  }
}

/**
 * Parse utility price filters
 * Uses API keys directly (direction, etc.)
 */
function parseUtilityFilters(query: ParsedUrlQuery): Partial<ListFilters> {
  return {
    direction: parseStringParam(query, 'direction'),
    electricityPrice: parseStringParam(query, 'electricityPrice'),
    waterPrice: parseStringParam(query, 'waterPrice'),
    internetPrice: parseStringParam(query, 'internetPrice'),
  }
}

/**
 * Parse address filters
 * Uses API keys directly (provinceId, districtId, wardId, provinceCode, etc.)
 */
function parseAddressFilters(query: ParsedUrlQuery): Partial<ListFilters> {
  const filters: Partial<ListFilters> = {}

  // Location IDs (numbers)
  filters.provinceId = parseNumberParam(query, 'provinceId')
  filters.districtId = parseNumberParam(query, 'districtId')
  filters.wardId = parseNumberParam(query, 'wardId')
  filters.streetId = parseNumberParam(query, 'streetId')

  // Location codes (strings)
  filters.provinceCode = parseStringParam(query, 'provinceCode')
  filters.newWardCode = parseStringParam(query, 'newWardCode')

  // Structure type flag
  if (query.addressType === 'legacy' || query.addressType === 'new') {
    filters.addressStructureType = query.addressType as 'legacy' | 'new'
  }

  return filters
}

/**
 * Parse URL query params into ListFilters format
 * Split into smaller functions to reduce complexity
 */
export function getFiltersFromQuery(
  query: ParsedUrlQuery,
): Partial<ListFilters> {
  const merged: Partial<ListFilters> = {
    ...parseBasicFilters(query),
    ...parseFeatureFilters(query),
    ...parseUtilityFilters(query),
    ...parseAddressFilters(query),
  }

  // Remove undefined values so callers get a clean, serializable object
  return Object.fromEntries(
    Object.entries(merged).filter(([, v]) => v !== undefined),
  ) as Partial<ListFilters>
}

/**
 * Push or replace URL query params using Next.js router
 * - Merges with current router.query
 * - Removes keys when value is null/undefined (and removeNullish=true)
 * - Removes keys when value is '' (and removeEmptyString=true)
 * - Joins arrays by comma
 */
export function pushQueryParams(
  router: NextRouter,
  params: Record<string, unknown>,
  options?: PushQueryOptions,
): Promise<boolean> {
  const {
    shallow = true,
    scroll = true,
    pathname = router.pathname,
    replace = false,
    removeNullish = true,
    removeEmptyString = true,
  } = options || {}

  const nextQuery: ParsedUrlQueryInput = { ...router.query }

  for (const [key, raw] of Object.entries(params)) {
    const value = toQueryValue(raw)

    if ((raw === null || raw === undefined) && removeNullish) {
      delete nextQuery[key]
      continue
    }

    if (value === '' && removeEmptyString) {
      delete nextQuery[key]
      continue
    }

    if (value !== undefined) {
      nextQuery[key] = value
    }
  }

  const method = replace ? router.replace : router.push
  return method({ pathname, query: nextQuery }, undefined, { shallow, scroll })
}

/**
 * Convert ListFilters to ListingSearchRequest (API format)
 * Maps frontend filter format to backend API request format
 *
 * NOTE: Some filters from ListFilters are NOT supported by the API:
 * - electricityPrice, waterPrice, internetPrice -> NOT supported (property fields, not search filters)
 */
export function listFiltersToSearchRequest(
  filters: Partial<ListFilters>,
): ListingSearchRequest {
  const request: ListingSearchRequest = {}

  // User & Ownership Filters
  if (filters.verified !== undefined) {
    request.verified = filters.verified
  }

  // Location Filters - API keys
  if (filters.provinceId !== undefined) {
    request.provinceId = filters.provinceId
  }

  if (filters.districtId !== undefined) {
    request.districtId = filters.districtId
  }

  if (filters.wardId !== undefined) {
    request.wardId = filters.wardId
  }

  if (filters.provinceCode) {
    request.provinceCode = filters.provinceCode
  }

  if (filters.newWardCode) {
    request.newWardCode = filters.newWardCode
  }

  if (filters.streetId !== undefined) {
    request.streetId = filters.streetId
  }

  // Category & Type Filters
  if (filters.productType) {
    // Check if it's a slug first
    const typeBySlug = getPropertyTypeBySlug(filters.productType)
    if (typeBySlug) {
      // Skip "ALL" option - don't filter by productType
      if (typeBySlug.value !== 'ALL') {
        request.productType = typeBySlug.apiValue
      }
    } else {
      // Otherwise, convert value to API format
      // Skip "ALL" or "all" values
      if (
        filters.productType.toLowerCase() !== 'all' &&
        filters.productType.toLowerCase() !== 'tat-ca'
      ) {
        request.productType = toApiPropertyType(filters.productType)
      }
    }
  }

  // Property Specs Filters
  if (filters.minPrice !== undefined) {
    request.minPrice = filters.minPrice
  }

  if (filters.maxPrice !== undefined) {
    request.maxPrice = filters.maxPrice
  }

  if (filters.minArea !== undefined) {
    request.minArea = filters.minArea
  }

  if (filters.maxArea !== undefined) {
    request.maxArea = filters.maxArea
  }

  if (filters.bedrooms !== undefined) {
    request.bedrooms = filters.bedrooms
  }

  if (filters.bathrooms !== undefined) {
    request.bathrooms = filters.bathrooms
  }

  // Direction
  if (filters.direction) {
    const upperDirection = filters.direction.toUpperCase()
    const validDirections = [
      'NORTH',
      'SOUTH',
      'EAST',
      'WEST',
      'NORTHEAST',
      'NORTHWEST',
      'SOUTHEAST',
      'SOUTHWEST',
    ]
    if (validDirections.includes(upperDirection)) {
      request.direction = upperDirection as
        | 'NORTH'
        | 'SOUTH'
        | 'EAST'
        | 'WEST'
        | 'NORTHEAST'
        | 'NORTHWEST'
        | 'SOUTHEAST'
        | 'SOUTHWEST'
    }
  }

  // Furnishing (if available in filters)
  const filtersWithFurnishing = filters as Partial<ListFilters> & {
    furnishing?: string
  }
  if (filtersWithFurnishing.furnishing) {
    const upperFurnishing = filtersWithFurnishing.furnishing.toUpperCase()
    if (
      ['FULLY_FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED'].includes(
        upperFurnishing,
      )
    ) {
      request.furnishing = upperFurnishing as
        | 'FULLY_FURNISHED'
        | 'SEMI_FURNISHED'
        | 'UNFURNISHED'
    }
  }

  // Listing Type (if available in filters)
  const filtersWithListingType = filters as Partial<ListFilters> & {
    listingType?: string
  }
  if (filtersWithListingType.listingType) {
    const upperListingType = filtersWithListingType.listingType.toUpperCase()
    if (['RENT', 'SALE', 'SHARE'].includes(upperListingType)) {
      request.listingType = upperListingType as 'RENT' | 'SALE' | 'SHARE'
    }
  }

  // Amenities & Media Filters
  if (filters.amenityIds && filters.amenityIds.length > 0) {
    request.amenityIds = filters.amenityIds
    request.amenityMatchMode = 'ALL'
  }

  if (filters.hasMedia !== undefined) {
    request.hasMedia = filters.hasMedia
  }

  // Content Search
  if (filters.keyword) {
    request.keyword = filters.keyword
  }

  // Pagination & Sorting
  if (filters.page !== undefined) {
    // Convert 1-based page to 0-based for API
    request.page = filters.page > 0 ? filters.page - 1 : 0
  }

  if (filters.perPage !== undefined) {
    request.size = filters.perPage
  }

  // Default sorting
  request.sortBy = 'postDate'
  request.sortDirection = 'DESC'

  // Default exclude expired for public search
  request.excludeExpired = true

  return request
}
