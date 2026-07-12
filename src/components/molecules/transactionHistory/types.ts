/** Sentinel select value for "no filter" (Radix Select forbids empty values). */
export const ALL_VALUE = 'ALL'

export interface TransactionFilterState {
  /** Free-text search (transaction / gateway / invoice code). */
  q: string
  /** Status enum value, or {@link ALL_VALUE}. */
  status: string
  /** Payment-type enum value, or {@link ALL_VALUE}. */
  type: string
  /** Inclusive YYYY-MM-DD. */
  fromDate?: string
  /** Inclusive YYYY-MM-DD. */
  toDate?: string
  /** 1-based page. */
  page: number
  size: number
}

export const FILTER_DEFAULTS = {
  q: '',
  status: ALL_VALUE,
  type: ALL_VALUE,
  page: 1,
  size: 10,
} as const

/**
 * Status values offered in the filter dropdown. The badge still renders any
 * status the API returns (incl. CANCELLED/REFUNDED) — this only limits the
 * selectable filters to the ones the product surfaces.
 */
export const TRANSACTION_STATUS_FILTERS = [
  'PENDING',
  'COMPLETED',
  'FAILED',
] as const

/**
 * Payment-type values offered in the filter dropdown. Other types are still
 * labeled correctly when returned by the API; they just aren't filterable.
 */
export const TRANSACTION_TYPE_FILTERS = [
  'MEMBERSHIP_PURCHASE',
  'MEMBERSHIP_UPGRADE',
  'POST_FEE',
  'PUSH_FEE',
  'REPOST_FEE',
] as const
