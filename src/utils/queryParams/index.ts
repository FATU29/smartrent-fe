import type { NextRouter } from 'next/router'
import type { ParsedUrlQuery, ParsedUrlQueryInput } from 'querystring'
import type { ListFilters } from '@/contexts/list/index.type'

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
