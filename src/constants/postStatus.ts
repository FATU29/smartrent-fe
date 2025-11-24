import { POST_STATUS, PostStatus } from '@/api/types'

// Mapping from API enum values to translation keys inside seller.listingManagement.status
// This lets us decouple backend naming (UPPER_CASE) from i18n resource keys (lowercase, semantically grouped)
export const POST_STATUS_I18N_KEY: Record<PostStatus, string> = {
  [POST_STATUS.ALL]: 'all',
  [POST_STATUS.EXPIRED]: 'expired',
  [POST_STATUS.NEAR_EXPIRED]: 'expiring',
  [POST_STATUS.DISPLAYING]: 'active',
  [POST_STATUS.PENDING_APPROVAL]: 'pending',
  // APPROVED currently reuses the "review" translation. If business later distinguishes Approved vs In Review,
  // add a new i18n key (e.g. approved) and update mapping here.
  [POST_STATUS.APPROVED]: 'review',
  [POST_STATUS.PENDING_PAYMENT]: 'payment',
  [POST_STATUS.REJECTED]: 'rejected',
  [POST_STATUS.VERIFIED]: 'verified',
}

// Helper to safely resolve translation key; falls back to lowercased enum for future-proofing
export const getPostStatusI18nKey = (status: PostStatus): string => {
  return POST_STATUS_I18N_KEY[status] ?? status.toLowerCase()
}
