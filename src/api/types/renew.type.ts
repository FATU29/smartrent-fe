/**
 * Renew (gia hạn) — extend an active listing's expiry by +30 days,
 * cumulatively. Quota-only: consumes one credit of the listing's existing
 * VIP-tier benefit (POST_SILVER / POST_GOLD / POST_DIAMOND). NORMAL listings
 * cannot be renewed via this endpoint.
 */

export interface RenewListingRequest {
  listingId: number
}

export interface RenewListingResponse {
  listingId?: number
  userId?: string
  renewedAt?: string
  /** Previous expiry — the anchor the new expiry was extended from. */
  previousExpiryDate?: string
  /** New expiry = max(previousExpiry, now) + daysAdded. */
  expiryDate?: string
  daysAdded?: number
  vipType?: string
  message?: string
}
