import React from 'react'

export interface Option {
  value: string
  label: string
}

export interface PagedListResult {
  visible: Option[]
  hasMore: boolean
  loadMore: () => void
  isLoadingMore: boolean
}

/**
 * Hook to paginate a list of options
 * Extracted to reduce nesting depth in AddressInput
 */
export function usePagedList(
  options: Option[],
  pageSize: number = 50,
): PagedListResult {
  const [page, setPage] = React.useState(1)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)

  React.useEffect(() => {
    setPage(1)
  }, [options])

  const visible = React.useMemo(() => {
    return options.slice(0, page * pageSize)
  }, [options, page, pageSize])

  const hasMore = visible.length < options.length

  const loadMore = React.useCallback(() => {
    if (!hasMore || isLoadingMore) return
    setIsLoadingMore(true)
    setTimeout(() => {
      setPage((p) => p + 1)
      setIsLoadingMore(false)
    }, 0)
  }, [hasMore, isLoadingMore])

  return { visible, hasMore, loadMore, isLoadingMore }
}
