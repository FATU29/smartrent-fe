import type { NextRouter } from 'next/router'
import type { ParsedUrlQuery, ParsedUrlQueryInput } from 'querystring'
import { ListingFilterRequest } from '@/api/types'

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
  const value = parseStringParam(query, key)
  return value ? Number(value) : undefined
}

/**
 * Helper to parse boolean query params
 */
function parseBooleanParam(
  query: ParsedUrlQuery,
  key: string,
): boolean | undefined {
  const value = parseStringParam(query, key)
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

/**
 * Parse URL query params into ListingFilterRequest format
 */
export function getFiltersFromQuery(
  query: ParsedUrlQuery,
): Partial<ListingFilterRequest> {
  const filters: Partial<ListingFilterRequest> = {}

  // Category
  filters.categoryId = parseNumberParam(query, 'categoryId')

  // Property type
  const productTypeParam = parseStringParam(query, 'productType')
  if (productTypeParam) {
    filters.productType =
      productTypeParam as ListingFilterRequest['productType']
  }

  // Search keyword
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

  // Bedrooms and bathrooms
  filters.minBedrooms = parseNumberParam(query, 'minBedrooms')
  filters.maxBedrooms = parseNumberParam(query, 'maxBedrooms')
  filters.bathrooms = parseNumberParam(query, 'bathrooms')

  // Amenities
  const amenityIdsParam = query.amenityIds
  if (amenityIdsParam) {
    const amenityIds =
      typeof amenityIdsParam === 'string'
        ? amenityIdsParam.split(',').map(Number).filter(Boolean)
        : []
    if (amenityIds.length > 0) {
      filters.amenityIds = amenityIds
    }
  }

  // Features
  filters.verified = parseBooleanParam(query, 'verified')

  // Utilities
  const directionParam = parseStringParam(query, 'direction')
  if (directionParam) {
    filters.direction = directionParam as ListingFilterRequest['direction']
  }

  const electricityPriceParam = parseStringParam(query, 'electricityPrice')
  if (electricityPriceParam) {
    filters.electricityPrice =
      electricityPriceParam as ListingFilterRequest['electricityPrice']
  }

  const waterPriceParam = parseStringParam(query, 'waterPrice')
  if (waterPriceParam) {
    filters.waterPrice = waterPriceParam as ListingFilterRequest['waterPrice']
  }

  const internetPriceParam = parseStringParam(query, 'internetPrice')
  if (internetPriceParam) {
    filters.internetPrice =
      internetPriceParam as ListingFilterRequest['internetPrice']
  }

  // Location
  filters.provinceId = parseNumberParam(query, 'provinceId')
  filters.districtId = parseNumberParam(query, 'districtId')
  filters.wardId = parseNumberParam(query, 'wardId')

  // Legacy and coordinates
  filters.isLegacy = parseBooleanParam(query, 'isLegacy')
  filters.latitude = parseNumberParam(query, 'latitude')
  filters.longitude = parseNumberParam(query, 'longitude')

  // Pagination
  filters.page = parseNumberParam(query, 'page')
  filters.size = parseNumberParam(query, 'size')

  // Remove undefined values
  return Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined),
  ) as Partial<ListingFilterRequest>
}
