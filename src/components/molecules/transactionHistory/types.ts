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
  size: 20,
} as const

/** Status values offered in the filter, matching backend TransactionStatus. */
export const TRANSACTION_STATUS_FILTERS = [
  'PENDING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
] as const
