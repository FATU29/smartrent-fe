import { ListingFilterRequest, Pagination } from '@/api/types'

// Default values
export const DEFAULT_PAGE = 1
export const DEFAULT_PER_PAGE = 10
export const DEFAULT_KEYWORD = ''

export const DEFAULT_PAGINATION: Pagination = {
  totalCount: 0,
  currentPage: DEFAULT_PAGE,
  totalPages: 0,
  pageSize: DEFAULT_PER_PAGE,
}

export const DEFAULT_FILTERS: ListingFilterRequest = {
  keyword: DEFAULT_KEYWORD,
  size: DEFAULT_PER_PAGE,
  page: DEFAULT_PAGE,
}

// Context type
export interface ListContextType<T = unknown> {
  // Data
  items: T[]
  filters: ListingFilterRequest
  pagination: Pagination
  isLoading: boolean
  activeFilterCount: number

  // Actions
  updateFilters: (newFilters: Partial<ListingFilterRequest>) => void
  resetFilters: () => void
  loadMore: () => void
  goToPage: (page: number) => void
  setKeyword: (keyword: string) => void
}
