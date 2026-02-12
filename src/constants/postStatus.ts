import { POST_STATUS, PostStatus, ModerationStatus } from '@/api/types'

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

// ── Unified Listing Filter Status ──
// Combines PostStatus and ModerationStatus for the seller's listing filter tabs.
// Prefixed moderation values avoid collision with PostStatus values (e.g. both have REJECTED).
export type ListingFilterStatus = PostStatus | `MOD_${ModerationStatus}`

// Helper to create prefixed moderation filter value
export const toModerationFilterStatus = (
  ms: ModerationStatus,
): ListingFilterStatus => `MOD_${ms}` as ListingFilterStatus

// Moderation statuses exposed as filter tabs
export const MODERATION_FILTER_STATUSES: ListingFilterStatus[] = [
  toModerationFilterStatus(ModerationStatus.REJECTED),
  toModerationFilterStatus(ModerationStatus.REVISION_REQUIRED),
  toModerationFilterStatus(ModerationStatus.RESUBMITTED),
  toModerationFilterStatus(ModerationStatus.SUSPENDED),
]

// i18n key mapping for moderation filter statuses
export const MODERATION_FILTER_I18N_KEY: Record<string, string> = {
  [`MOD_${ModerationStatus.REJECTED}`]: 'MOD_REJECTED',
  [`MOD_${ModerationStatus.REVISION_REQUIRED}`]: 'MOD_REVISION_REQUIRED',
  [`MOD_${ModerationStatus.RESUBMITTED}`]: 'MOD_RESUBMITTED',
  [`MOD_${ModerationStatus.SUSPENDED}`]: 'MOD_SUSPENDED',
}

// Full ordered list including moderation tabs (appended after listing statuses)
export const STATUS_FILTER_WITH_MODERATION: ListingFilterStatus[] = [
  POST_STATUS.ALL as ListingFilterStatus,
  ...(ORDERED_POST_STATUSES as ListingFilterStatus[]),
  ...MODERATION_FILTER_STATUSES,
]

// Resolve i18n key for any ListingFilterStatus value
export const getFilterStatusI18nKey = (status: ListingFilterStatus): string => {
  if (typeof status === 'string' && status.startsWith('MOD_')) {
    return MODERATION_FILTER_I18N_KEY[status] ?? 'UNKNOWN_STATUS'
  }
  return POST_STATUS_I18N_KEY[status as PostStatus] ?? 'UNKNOWN_STATUS'
}

// Check if a filter status is a moderation status
export const isModerationFilterStatus = (
  status: ListingFilterStatus,
): boolean => {
  return typeof status === 'string' && status.startsWith('MOD_')
}

// Extract the raw ModerationStatus from a prefixed filter value
export const extractModerationStatus = (
  status: ListingFilterStatus,
): ModerationStatus | null => {
  if (typeof status === 'string' && status.startsWith('MOD_')) {
    return status.replace('MOD_', '') as ModerationStatus
  }
  return null
}
