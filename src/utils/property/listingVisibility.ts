import { POST_STATUS, PostStatus } from '@/api/types'

export const PUBLICLY_VISIBLE_STATUSES = new Set<PostStatus>([
  POST_STATUS.DISPLAYING,
  POST_STATUS.EXPIRING_SOON,
  POST_STATUS.VERIFIED,
])

export interface ListingVisibilityFields {
  expired?: boolean
  listingStatus?: PostStatus
}

/**
 * Mirrors the visibility gate the listing-detail page applies server-side
 * (getListingById in the backend), so lists built from data that skips that
 * gate (e.g. saved listings) can filter out expired/unpublished listings too.
 */
export const isListingPubliclyVisible = (
  listing?: ListingVisibilityFields | null,
): boolean => {
  if (!listing) return false
  if (listing.expired) return false
  return (
    !listing.listingStatus ||
    PUBLICLY_VISIBLE_STATUSES.has(listing.listingStatus)
  )
}
