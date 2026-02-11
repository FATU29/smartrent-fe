import {
  NewsFilterRequest,
  NewsPagination,
  NewsItem,
} from '@/api/types/news.type'

// Default values
export const DEFAULT_NEWS_PAGE = 1
export const DEFAULT_NEWS_PER_PAGE = 20

export const DEFAULT_NEWS_PAGINATION: NewsPagination = {
  totalItems: 0,
  currentPage: DEFAULT_NEWS_PAGE,
  totalPages: 0,
  pageSize: DEFAULT_NEWS_PER_PAGE,
}

export const DEFAULT_NEWS_FILTERS: NewsFilterRequest = {
  size: DEFAULT_NEWS_PER_PAGE,
  page: DEFAULT_NEWS_PAGE,
}

// Context type
export interface NewsContextType {
  // Data
  items: NewsItem[]
  filters: NewsFilterRequest
  pagination: NewsPagination
  isLoading: boolean
  activeFilterCount: number

  // Actions
  updateFilters: (newFilters: Partial<NewsFilterRequest>) => void
  resetFilters: () => void
  loadMore: () => void
  goToPage: (page: number) => void
  setKeyword: (keyword: string) => void
  setCategory: (category: string | undefined) => void
}
