import { POST_STATUS, PostStatus } from '@/api/types'

// Mapping from enum string values (and empty string for ALL) to translation keys.
// We use UPPER_CASE keys directly to avoid needing duplicate lowercase entries in i18n files.
export const POST_STATUS_I18N_KEY: Record<PostStatus, string> = {
  [POST_STATUS.ALL]: 'ALL',
  [POST_STATUS.EXPIRED]: 'EXPIRED',
  [POST_STATUS.EXPIRING_SOON]: 'EXPIRING_SOON',
  [POST_STATUS.DISPLAYING]: 'DISPLAYING',
  [POST_STATUS.IN_REVIEW]: 'IN_REVIEW',
  [POST_STATUS.PENDING_PAYMENT]: 'PENDING_PAYMENT',
  [POST_STATUS.REJECTED]: 'REJECTED',
  [POST_STATUS.VERIFIED]: 'VERIFIED',
}

// Helper to safely resolve translation key; falls back to a generic key if not mapped
export const getPostStatusI18nKey = (status: PostStatus): string => {
  return POST_STATUS_I18N_KEY[status] ?? 'UNKNOWN_STATUS'
}

// Ordered list of statuses following the sequence (skip ALL at start for filtering UIs)
export const ORDERED_POST_STATUSES: PostStatus[] = [
  POST_STATUS.EXPIRED,
  POST_STATUS.EXPIRING_SOON,
  POST_STATUS.DISPLAYING,
  POST_STATUS.IN_REVIEW,
  POST_STATUS.PENDING_PAYMENT,
  POST_STATUS.REJECTED,
  POST_STATUS.VERIFIED,
]

// Including ALL at the beginning for tab/filter components
export const STATUS_FILTER_WITH_ALL: PostStatus[] = [
  POST_STATUS.ALL,
  ...ORDERED_POST_STATUSES,
]

export interface PostStatusOption {
  value: PostStatus
  key: string // translation key suffix
}

export const POST_STATUS_OPTIONS: PostStatusOption[] =
  STATUS_FILTER_WITH_ALL.map((s) => ({
    value: s,
    key: getPostStatusI18nKey(s),
  }))
