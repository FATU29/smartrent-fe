import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import type {
  ListingFilterRequest,
  ListingSearchApiResponse,
  Pagination,
} from '@/api/types'
import { countActiveFilters } from '@/utils/filters/countActiveFilters'

import {
  DEFAULT_FILTERS,
  DEFAULT_PAGE,
  DEFAULT_PAGINATION,
  ListContextType,
} from './index.type'

export const ListContext = createContext<ListContextType | undefined>(undefined)

export interface ListProviderProps<T = unknown> {
  children: React.ReactNode
  fetcher?: (
    filters: ListingFilterRequest,
  ) => Promise<ListingSearchApiResponse<T>>
  initialData?: T[]
  initialFilters?: Partial<ListingFilterRequest>
  initialPagination?: Pagination
}

// Helper functions
const mergeFilters = (
  overrides: Partial<ListingFilterRequest> = {},
): ListingFilterRequest => ({
  ...DEFAULT_FILTERS,
  ...overrides,
  page: overrides.page ?? DEFAULT_PAGE,
})

const areFiltersEqual = (
  prev: ListingFilterRequest,
  next: ListingFilterRequest,
): boolean => {
  return JSON.stringify(prev) === JSON.stringify(next)
}

// Custom hooks
const useListState = <T,>(initialData: T[], initialPagination?: Pagination) => {
  const [items, setItems] = useState<T[]>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState<Pagination>(
    initialPagination || DEFAULT_PAGINATION,
  )

  const hasInitialData = initialData.length > 0
  const hasInitializedRef = useRef(false)
  const initialDataRef = useRef(initialData)
  const initialPaginationRef = useRef(initialPagination)

  // Sync initial data (only once)
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
    setPagination(initialPaginationRef.current || DEFAULT_PAGINATION)
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

const useListFilters = (
  initialFilters: Partial<ListingFilterRequest>,
  shouldAppendRef: React.MutableRefObject<boolean>,
) => {
  const [filters, setFilters] = useState<ListingFilterRequest>(() =>
    mergeFilters(initialFilters),
  )

  const updateFilters = useCallback(
    (newFilters: Partial<ListingFilterRequest>) => {
      shouldAppendRef.current = false
      setFilters((prev) => {
        const updated = {
          ...prev,
          ...newFilters,
          page: newFilters.page ?? DEFAULT_PAGE,
        }
        return areFiltersEqual(prev, updated) ? prev : updated
      })
    },
    [shouldAppendRef],
  )

  const resetFilters = useCallback(() => {
    shouldAppendRef.current = false
    setFilters(DEFAULT_FILTERS)
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
      updateFilters({ keyword })
    },
    [updateFilters],
  )

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters),
    [filters],
  )

  return {
    filters,
    updateFilters,
    resetFilters,
    loadMore,
    goToPage,
    setKeyword,
    activeFilterCount,
  }
}

const useListFetch = <T,>(
  fetcher:
    | ((filters: ListingFilterRequest) => Promise<ListingSearchApiResponse<T>>)
    | undefined,
  filters: ListingFilterRequest,
  hasInitialData: boolean,
  setItems: React.Dispatch<React.SetStateAction<T[]>>,
  setPagination: React.Dispatch<React.SetStateAction<Pagination>>,
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
      setIsLoading(true)
      try {
        const response = await fetcherRef.current!(filters)
        if (isCancelled || !response?.data) {
          return
        }

        const { listings, pagination: paginationData } = response.data
        setItems((prev) =>
          shouldAppendRef.current
            ? ([...prev, ...listings] as T[])
            : (listings as T[]),
        )
        setPagination(paginationData)
      } catch (error) {
        console.error('List fetch error:', error)
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

export const ListProvider = <T,>({
  children,
  fetcher,
  initialData = [],
  initialFilters = {},
  initialPagination,
}: ListProviderProps<T>) => {
  // Shared ref for append mode
  const shouldAppendRef = useRef(false)

  // State management
  const {
    items,
    setItems,
    isLoading,
    setIsLoading,
    pagination,
    setPagination,
    hasInitialData,
  } = useListState<T>(initialData, initialPagination)

  // Filters management
  const {
    filters,
    updateFilters,
    resetFilters,
    loadMore,
    goToPage,
    setKeyword,
    activeFilterCount,
  } = useListFilters(initialFilters, shouldAppendRef)

  // Fetch management
  useListFetch(
    fetcher,
    filters,
    hasInitialData,
    setItems,
    setPagination,
    setIsLoading,
    shouldAppendRef,
  )

  // Context value
  const value: ListContextType<T> = useMemo(
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
    ],
  )

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>
}
