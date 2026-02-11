import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
} from 'react'

import type {
  NewsFilterRequest,
  NewsPagination,
  NewsListResponse,
  NewsItem,
} from '@/api/types/news.type'
import type { ApiResponse } from '@/configs/axios/types'

import {
  DEFAULT_NEWS_FILTERS,
  DEFAULT_NEWS_PAGE,
  DEFAULT_NEWS_PAGINATION,
  NewsContextType,
} from './index.type'

export const NewsContext = createContext<NewsContextType | undefined>(undefined)

export interface NewsProviderProps {
  children: React.ReactNode
  fetcher?: (
    filters: NewsFilterRequest,
  ) => Promise<ApiResponse<NewsListResponse>>
  initialData?: NewsItem[]
  initialFilters?: Partial<NewsFilterRequest>
  initialPagination?: NewsPagination
}

const mergeFilters = (
  overrides: Partial<NewsFilterRequest> = {},
): NewsFilterRequest => ({
  ...DEFAULT_NEWS_FILTERS,
  ...overrides,
  page: overrides.page ?? DEFAULT_NEWS_PAGE,
})

const areFiltersEqual = (
  prev: NewsFilterRequest,
  next: NewsFilterRequest,
): boolean => {
  return JSON.stringify(prev) === JSON.stringify(next)
}

// Custom hooks
const useNewsState = (
  initialData: NewsItem[],
  initialPagination?: NewsPagination,
) => {
  const [items, setItems] = useState<NewsItem[]>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState<NewsPagination>(
    initialPagination || DEFAULT_NEWS_PAGINATION,
  )

  const hasInitialData = initialData.length > 0
  const hasInitializedRef = useRef(false)
  const initialDataRef = useRef(initialData)
  const initialPaginationRef = useRef(initialPagination)

  useEffect(() => {
    initialDataRef.current = initialData
    initialPaginationRef.current = initialPagination
  }, [initialData, initialPagination])

  useEffect(() => {
    if (hasInitializedRef.current || !hasInitialData) {
      return
    }
    hasInitializedRef.current = true
    setItems(initialDataRef.current)
    setPagination(initialPaginationRef.current || DEFAULT_NEWS_PAGINATION)
  }, [hasInitialData])

  return {
    items,
    setItems,
    isLoading,
    setIsLoading,
    pagination,
    setPagination,
    hasInitialData,
  }
}

const useNewsFilters = (
  initialFilters: Partial<NewsFilterRequest>,
  shouldAppendRef: React.MutableRefObject<boolean>,
) => {
  const [filters, setFilters] = useState<NewsFilterRequest>(() => {
    const merged = mergeFilters(initialFilters)
    return merged
  })

  const updateFilters = useCallback(
    (newFilters: Partial<NewsFilterRequest>) => {
      shouldAppendRef.current = false
      setFilters((prev) => {
        const updated = {
          ...prev,
          ...newFilters,
          page: newFilters.page ?? 1,
        }
        return areFiltersEqual(prev, updated) ? prev : updated
      })
    },
    [shouldAppendRef],
  )

  const resetFilters = useCallback(() => {
    shouldAppendRef.current = false
    setFilters(DEFAULT_NEWS_FILTERS)
  }, [shouldAppendRef])

  const loadMore = useCallback(() => {
    shouldAppendRef.current = true
    setFilters((prev) => ({
      ...prev,
      page: (prev.page || 1) + 1,
    }))
  }, [shouldAppendRef])

  const goToPage = useCallback(
    (page: number) => {
      shouldAppendRef.current = false
      setFilters((prev) => ({
        ...prev,
        page,
      }))
    },
    [shouldAppendRef],
  )

  const setKeyword = useCallback(
    (keyword: string) => {
      updateFilters({ keyword, page: 1 })
    },
    [updateFilters],
  )

  const setCategory = useCallback(
    (category: string | undefined) => {
      updateFilters({ category, page: 1 })
    },
    [updateFilters],
  )

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.category) count++
    if (filters.tag) count++
    if (filters.keyword) count++
    return count
  }, [filters])

  return {
    filters,
    updateFilters,
    resetFilters,
    loadMore,
    goToPage,
    setKeyword,
    setCategory,
    activeFilterCount,
  }
}

const useNewsFetch = (
  fetcher:
    | ((filters: NewsFilterRequest) => Promise<ApiResponse<NewsListResponse>>)
    | undefined,
  filters: NewsFilterRequest,
  hasInitialData: boolean,
  setItems: React.Dispatch<React.SetStateAction<NewsItem[]>>,
  setPagination: React.Dispatch<React.SetStateAction<NewsPagination>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  shouldAppendRef: React.MutableRefObject<boolean>,
) => {
  const fetcherRef = useRef(fetcher)
  const prevFiltersKeyRef = useRef<string | null>(null)
  const skipFirstFetchRef = useRef(hasInitialData)

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters])

  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  useEffect(() => {
    if (!fetcherRef.current) {
      return
    }

    if (skipFirstFetchRef.current) {
      skipFirstFetchRef.current = false
      prevFiltersKeyRef.current = filtersKey
      return
    }

    if (prevFiltersKeyRef.current === filtersKey) {
      return
    }

    prevFiltersKeyRef.current = filtersKey

    let isCancelled = false

    const fetchData = async () => {
      if (!shouldAppendRef.current) {
        setItems([])
      }

      setIsLoading(true)
      try {
        const response = await fetcherRef.current!(filters)
        if (isCancelled || !response?.data) {
          return
        }

        const { news, totalItems, currentPage, pageSize, totalPages } =
          response.data
        setItems((prev) =>
          shouldAppendRef.current ? [...prev, ...news] : news,
        )
        setPagination({
          totalItems,
          currentPage,
          pageSize,
          totalPages,
        })
      } catch (error) {
        console.error('News fetch error:', error)
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
          shouldAppendRef.current = false
        }
      }
    }

    fetchData()

    return () => {
      isCancelled = true
    }
  }, [filtersKey, filters, setItems, setPagination, setIsLoading])

  return { shouldAppendRef }
}

export const NewsProvider: React.FC<NewsProviderProps> = ({
  children,
  fetcher,
  initialData = [],
  initialFilters = {},
  initialPagination,
}) => {
  const shouldAppendRef = useRef(false)

  const {
    items,
    setItems,
    isLoading,
    setIsLoading,
    pagination,
    setPagination,
    hasInitialData,
  } = useNewsState(initialData, initialPagination)

  const {
    filters,
    updateFilters,
    resetFilters,
    loadMore,
    goToPage,
    setKeyword,
    setCategory,
    activeFilterCount,
  } = useNewsFilters(initialFilters, shouldAppendRef)

  useNewsFetch(
    fetcher,
    filters,
    hasInitialData,
    setItems,
    setPagination,
    setIsLoading,
    shouldAppendRef,
  )

  const value: NewsContextType = useMemo(
    () => ({
      items,
      filters,
      pagination,
      isLoading,
      activeFilterCount,
      updateFilters,
      resetFilters,
      loadMore,
      goToPage,
      setKeyword,
      setCategory,
    }),
    [
      items,
      filters,
      pagination,
      isLoading,
      activeFilterCount,
      updateFilters,
      resetFilters,
      loadMore,
      goToPage,
      setKeyword,
      setCategory,
    ],
  )

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>
}

export const useNewsContext = (): NewsContextType => {
  const context = useContext(NewsContext)
  if (!context) {
    throw new Error('useNewsContext must be used within a NewsProvider')
  }
  return context
}
