export const DEFAULT_PER_PAGE = 5
export const DEFAULT_PAGE = 1
export const DEFAULT_KEYWORD = ''

export interface ListFilters {
  // Pagination (frontend only)
  perPage: number
  page: number

  // API-supported filters (using API keys directly)
  keyword?: string
  productType?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  bedrooms?: number
  bathrooms?: number
  direction?: string
  amenityIds?: number[]
  verified?: boolean
  hasMedia?: boolean

  // Location Filters - API keys
  provinceId?: number
  provinceCode?: string
  districtId?: number
  wardId?: number
  newWardCode?: string
  streetId?: number

  // UI-only fields (not in API but needed for UI state)
  addressStructureType?: 'legacy' | 'new'
  searchAddress?: string
  addressEdited?: boolean
  electricityPrice?: string // UI only - not supported by API
  waterPrice?: string // UI only - not supported by API
  internetPrice?: string // UI only - not supported by API
  amenities?: Array<{ id: number; name: string }> // UI only - will be mapped to amenityIds when applying

  [key: string]: unknown
}

export interface ListFetcherResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface ListContextType<T = unknown> {
  itemsData: T[]
  filters: ListFilters
  pagination: {
    total: number
    page: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
  handleUpdateFilter: (filterObject: Partial<ListFilters>) => Promise<void>
  handleResetFilter: () => Promise<void>
  handleLoadMore: () => Promise<void>
  handleLoadNewPage: (newPage: number) => Promise<void>
  isLoading: boolean
  activeCount: number
}
