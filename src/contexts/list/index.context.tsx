import { createContext, useState, useEffect, useMemo } from 'react'
import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  DEFAULT_SEARCH,
  ListContextType,
  ListFetcherResponse,
  ListFilters,
} from './index.type'
import { countActiveFilters } from '@/utils/filters/countActiveFilters'

export const ListContext = createContext<ListContextType | undefined>(undefined)

export interface ListProviderProps<T = unknown> {
  children: React.ReactNode
  fetcher: (filters: ListFilters) => Promise<ListFetcherResponse<T>>
  initialData?: T[]
  initialFilters?: Partial<ListFilters>
  defaultFilters?: Partial<ListFilters> // alias for initialFilters (compat)
  defaultSearch?: string
  defaultPerPage?: number
  defaultPage?: number
}

export const ListProvider = <T,>({
  children,
  fetcher,
  initialData = [],
  initialFilters,
  defaultFilters,
  defaultSearch = DEFAULT_SEARCH,
  defaultPerPage = DEFAULT_PER_PAGE,
  defaultPage = DEFAULT_PAGE,
}: ListProviderProps<T>) => {
  const resolvedInitialFilters = {
    ...(defaultFilters || {}),
    ...(initialFilters || {}),
  }
  const [filters, setFilters] = useState<ListFilters>({
    search: defaultSearch,
    perPage: defaultPerPage,
    page: defaultPage,
    ...resolvedInitialFilters,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [itemsData, setItemsData] = useState<T[]>(initialData)
  const [pagination, setPagination] = useState({
    total: 0,
    page: defaultPage,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  })

  // Load initial data if not provided or if we need to get pagination data
  useEffect(() => {
    if (initialData.length === 0) {
      handleLoadNewPage(defaultPage)
    } else {
      // If we have initial data, we need to fetch the full pagination info
      handleLoadNewPage(defaultPage)
    }
  }, [])

  interface PaginationMeta {
    total: number
    page: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }

  const executeApiCall = async (
    operation: () => Promise<ListFetcherResponse<T>>,
    onSuccess: (data: T[], paginationData: PaginationMeta) => void,
    errorMessage: string,
  ) => {
    try {
      setIsLoading(true)
      const response = await operation()
      const data = response?.data || []
      const paginationData = {
        total: response?.total || 0,
        page: response?.page || 1,
        totalPages: response?.totalPages || 0,
        hasNext: response?.hasNext || false,
        hasPrevious: response?.hasPrevious || false,
      }
      onSuccess(data, paginationData)
    } catch (error) {
      console.error(errorMessage, error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateFilter = async (newFilter: Partial<ListFilters>) => {
    const updatedFilters: ListFilters = {
      ...filters,
      ...newFilter,
      page: DEFAULT_PAGE,
    }

    await executeApiCall(
      () => fetcher(updatedFilters),
      (data, paginationData) => {
        setItemsData(data)
        setFilters(updatedFilters)
        setPagination(paginationData)
      },
      'Error updating filter items:',
    )
  }

  const handleLoadMore = async () => {
    const nextPage = filters.page + 1
    const updatedFilters: ListFilters = { ...filters, page: nextPage }

    await executeApiCall(
      () => fetcher(updatedFilters),
      (data, paginationData) => {
        setItemsData((prev) => [...prev, ...data])
        setFilters(updatedFilters)
        setPagination(paginationData)
      },
      'Error loading more items:',
    )
  }

  const handleLoadNewPage = async (newPage: number) => {
    const updatedFilters: ListFilters = { ...filters, page: newPage }

    await executeApiCall(
      () => fetcher(updatedFilters),
      (data, paginationData) => {
        setItemsData(data)
        setFilters(updatedFilters)
        setPagination(paginationData)
      },
      'Error loading new page items:',
    )
  }

  const handleResetFilter = async () => {
    const resetFilters: ListFilters = {
      search: defaultSearch,
      perPage: defaultPerPage,
      page: defaultPage,
    }

    await executeApiCall(
      () => fetcher(resetFilters),
      (data, paginationData) => {
        setItemsData(data)
        setFilters(resetFilters)
        setPagination(paginationData)
      },
      'Error resetting filter items:',
    )
  }

  const activeCount = useMemo(() => {
    return countActiveFilters(filters)
  }, [filters])

  const value: ListContextType<T> = useMemo(
    () => ({
      filters,
      pagination,
      handleUpdateFilter,
      handleResetFilter,
      handleLoadMore,
      handleLoadNewPage,
      itemsData,
      isLoading,
      activeCount,
    }),
    [
      filters,
      pagination,
      handleUpdateFilter,
      handleResetFilter,
      handleLoadMore,
      handleLoadNewPage,
      itemsData,
      isLoading,
      activeCount,
    ],
  )

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>
}
