import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import {
  FILTER_DEFAULTS,
  type TransactionFilterState,
} from '@/components/molecules/transactionHistory'

type QueryValue = string | string[] | undefined

const first = (v: QueryValue): string => (Array.isArray(v) ? v[0] : v) ?? ''

const toPositiveInt = (v: QueryValue, fallback: number): number => {
  const n = Number(first(v))
  return Number.isInteger(n) && n > 0 ? n : fallback
}

/**
 * Transaction-history filter/pagination state, synchronized with the URL query
 * so filters survive refresh, deep-link and browser back/forward. Only
 * non-default values are written to the URL to keep it clean.
 */
export function useTransactionFilters() {
  const router = useRouter()
  const query = router.query

  const filters: TransactionFilterState = useMemo(
    () => ({
      q: first(query.q),
      status: first(query.status) || FILTER_DEFAULTS.status,
      type: first(query.type) || FILTER_DEFAULTS.type,
      fromDate: first(query.fromDate) || undefined,
      toDate: first(query.toDate) || undefined,
      page: toPositiveInt(query.page, FILTER_DEFAULTS.page),
      size: toPositiveInt(query.size, FILTER_DEFAULTS.size),
    }),
    [query],
  )

  const hasActiveFilters =
    !!filters.q ||
    filters.status !== FILTER_DEFAULTS.status ||
    filters.type !== FILTER_DEFAULTS.type ||
    !!filters.fromDate ||
    !!filters.toDate

  const writeQuery = useCallback(
    (next: TransactionFilterState) => {
      const q: Record<string, string> = {}
      if (next.q) q.q = next.q
      if (next.status !== FILTER_DEFAULTS.status) q.status = next.status
      if (next.type !== FILTER_DEFAULTS.type) q.type = next.type
      if (next.fromDate) q.fromDate = next.fromDate
      if (next.toDate) q.toDate = next.toDate
      if (next.page !== FILTER_DEFAULTS.page) q.page = String(next.page)
      if (next.size !== FILTER_DEFAULTS.size) q.size = String(next.size)
      router.replace({ pathname: router.pathname, query: q }, undefined, {
        shallow: true,
        scroll: false,
      })
    },
    [router],
  )

  // Any change resets to page 1 unless an explicit page is supplied — a new
  // filter or page size invalidates the current page offset.
  const patch = useCallback(
    (next: Partial<TransactionFilterState>) => {
      writeQuery({
        ...filters,
        ...next,
        page: next.page ?? FILTER_DEFAULTS.page,
      })
    },
    [filters, writeQuery],
  )

  const reset = useCallback(() => {
    router.replace({ pathname: router.pathname, query: {} }, undefined, {
      shallow: true,
      scroll: false,
    })
  }, [router])

  return { filters, hasActiveFilters, patch, reset }
}
