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
 * Helper to parse amenities array
 */
function parseAmenities(
  query: ParsedUrlQuery,
): Array<{ id: number }> | undefined {
  if (!query.amenities) return undefined

  const ids = (query.amenities as string)
    .split(',')
    .map((id) => Number(id))
    .filter((id) => !isNaN(id))

  return ids.length > 0 ? ids.map((id) => ({ id })) : undefined
}

/**
 * Parse basic property filters
 */
function parseBasicFilters(query: ParsedUrlQuery): Partial<ListFilters> {
  const filters: Partial<ListFilters> = {}

  // Property type - map 'category' to 'propertyType'
  filters.propertyType =
    parseStringParam(query, 'category') || parseStringParam(query, 'type')
  filters.search = parseStringParam(query, 'search')
  filters.city = parseStringParam(query, 'city')

  // Price range
  filters.minPrice = parseNumberParam(query, 'minPrice')
  filters.maxPrice = parseNumberParam(query, 'maxPrice')

  // Area range
  filters.minArea = parseNumberParam(query, 'minArea')
  filters.maxArea = parseNumberParam(query, 'maxArea')

  // Frontage range
  filters.minFrontage = parseNumberParam(query, 'minFrontage')
  filters.maxFrontage = parseNumberParam(query, 'maxFrontage')

  // Rooms
  filters.bedrooms = parseNumberParam(query, 'bedrooms')
  filters.bathrooms = parseNumberParam(query, 'bathrooms')

  // Amenities
  filters.amenities = parseAmenities(query)

  // Pagination
  filters.page = parseNumberParam(query, 'page')

  return filters
}

/**
 * Parse boolean feature filters
 */
function parseFeatureFilters(query: ParsedUrlQuery): Partial<ListFilters> {
  return {
    verified: parseBooleanParam(query, 'verified'),
    professionalBroker: parseBooleanParam(query, 'professionalBroker'),
    hasVideo: parseBooleanParam(query, 'hasVideo'),
    has360: parseBooleanParam(query, 'has360'),
  }
}

/**
 * Parse utility price filters
 */
function parseUtilityFilters(query: ParsedUrlQuery): Partial<ListFilters> {
  return {
    orientation: parseStringParam(query, 'orientation'),
    moveInTime: parseStringParam(query, 'moveInTime'),
    electricityPrice: parseStringParam(query, 'electricityPrice'),
    waterPrice: parseStringParam(query, 'waterPrice'),
    internetPrice: parseStringParam(query, 'internetPrice'),
  }
}

/**
 * Parse address filters
 */
function parseAddressFilters(query: ParsedUrlQuery): Partial<ListFilters> {
  const filters: Partial<ListFilters> = {}

  // Legacy structure (63 provinces)
  filters.province = parseStringParam(query, 'province')
  filters.district = parseStringParam(query, 'district')
  filters.ward = parseStringParam(query, 'ward')

  // New structure (34 provinces)
  filters.newProvinceCode = parseStringParam(query, 'newProvinceCode')
  filters.newWardCode = parseStringParam(query, 'newWardCode')

  // Common fields
  filters.streetId = parseStringParam(query, 'streetId')
  filters.projectId = parseStringParam(query, 'projectId')

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
