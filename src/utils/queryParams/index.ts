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
 * Parse URL query params into ListFilters format
 * Maps 'category' to 'propertyType', handles numbers/arrays/booleans
 */
export function getFiltersFromQuery(
  query: ParsedUrlQuery,
): Partial<ListFilters> {
  const filters: Partial<ListFilters> = {}

  // Map category → propertyType (homepage uses 'category', list pages might use 'type')
  if (query.category) filters.propertyType = query.category as string
  if (query.type) filters.propertyType = query.type as string

  if (query.search) filters.search = query.search as string

  if (query.minPrice) filters.minPrice = Number(query.minPrice)
  if (query.maxPrice) filters.maxPrice = Number(query.maxPrice)

  if (query.minArea) filters.minArea = Number(query.minArea)
  if (query.maxArea) filters.maxArea = Number(query.maxArea)

  if (query.bedrooms) filters.bedrooms = Number(query.bedrooms)
  if (query.bathrooms) filters.bathrooms = Number(query.bathrooms)

  if (query.city) filters.city = query.city as string

  if (query.amenities) {
    filters.amenities = (query.amenities as string).split(',')
  }

  if (query.verified === 'true') filters.verified = true
  if (query.professionalBroker === 'true') filters.professionalBroker = true

  if (query.page) filters.page = Number(query.page)

  return filters
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
