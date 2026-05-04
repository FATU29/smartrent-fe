/**
 * Repost (đăng lại) — re-publish an expired listing.
 * Mirrors the Push types — user picks between using the matching membership
 * post-quota for their listing's vipType or paying the per-day fee via VNPay.
 */

export interface RepostListingRequest {
  listingId: number
  useMembershipQuota: boolean
  paymentProvider?: 'VNPAY' | 'ZALOPAY' | 'PAYPAL' | 'MOMO'
  /** New active duration in days. Valid: 10, 15, 30. */
  durationDays?: number
}

export interface RepostListingResponse {
  listingId?: number
  userId?: string
  /** 'MEMBERSHIP_QUOTA' | 'DIRECT_PAYMENT' | 'PAYMENT_REQUIRED' */
  repostSource?: string
  repostedAt?: string
  expiryDate?: string
  durationDays?: number
  message?: string

  // Only populated when payment is required
  paymentUrl?: string
  transactionRef?: string
  transactionId?: string
}
