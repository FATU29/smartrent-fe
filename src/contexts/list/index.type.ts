export const DEFAULT_PER_PAGE = 10
export const DEFAULT_PAGE = 1
export const DEFAULT_SEARCH = ''

export interface ListFilters {
  search: string
  perPage: number
  page: number
  // Property-specific filters
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  propertyType?: string
  city?: string
  amenities?: string[]
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
}
