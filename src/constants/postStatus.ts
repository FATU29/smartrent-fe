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

// ── Listing Status → Moderation Status Mapping ──
// Based on the business rules:
//   EXPIRED         → N/A
//   EXPIRING_SOON   → APPROVED
//   DISPLAYING      → APPROVED
//   IN_REVIEW       → PENDING_REVIEW | RESUBMITTED
//   PENDING_PAYMENT → N/A
//   REJECTED        → REVISION_REQUIRED | SUSPENDED
//   VERIFIED        → APPROVED
//
// When a listing status maps to exactly 1 moderation status → pass it directly.
// When it maps to >1 → show sub-filter tabs, default to the first entry.
export const LISTING_STATUS_MODERATION_MAP: Partial<
  Record<PostStatus, ModerationStatus[]>
> = {
  [POST_STATUS.EXPIRING_SOON]: [ModerationStatus.APPROVED],
  [POST_STATUS.DISPLAYING]: [ModerationStatus.APPROVED],
  [POST_STATUS.IN_REVIEW]: [
    ModerationStatus.PENDING_REVIEW,
    ModerationStatus.RESUBMITTED,
  ],
  [POST_STATUS.REJECTED]: [
    ModerationStatus.REVISION_REQUIRED,
    ModerationStatus.SUSPENDED,
  ],
  [POST_STATUS.VERIFIED]: [ModerationStatus.APPROVED],
}

// Get the moderation statuses associated with a listing status (empty if N/A)
export const getModerationStatuses = (
  status: PostStatus,
): ModerationStatus[] => {
  return LISTING_STATUS_MODERATION_MAP[status] ?? []
}

// Check if a listing status has sub-filter tabs (>1 moderation status)
export const hasSubFilters = (status: PostStatus): boolean => {
  return (LISTING_STATUS_MODERATION_MAP[status]?.length ?? 0) > 1
}

// ── Unified Listing Filter Status ──
// Combines PostStatus and ModerationStatus for the seller's listing filter tabs.
// Prefixed moderation values avoid collision with PostStatus values (e.g. both have REJECTED).
export type ListingFilterStatus = PostStatus | `MOD_${ModerationStatus}`

// Helper to create prefixed moderation filter value
export const toModerationFilterStatus = (
  ms: ModerationStatus,
): ListingFilterStatus => `MOD_${ms}` as ListingFilterStatus

// i18n key mapping for moderation filter statuses
export const MODERATION_FILTER_I18N_KEY: Record<string, string> = {
  [`MOD_${ModerationStatus.PENDING_REVIEW}`]: 'MOD_PENDING_REVIEW',
  [`MOD_${ModerationStatus.RESUBMITTED}`]: 'MOD_RESUBMITTED',
  [`MOD_${ModerationStatus.REVISION_REQUIRED}`]: 'MOD_REVISION_REQUIRED',
  [`MOD_${ModerationStatus.SUSPENDED}`]: 'MOD_SUSPENDED',
  [`MOD_${ModerationStatus.APPROVED}`]: 'MOD_APPROVED',
  [`MOD_${ModerationStatus.REJECTED}`]: 'MOD_REJECTED',
}

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
