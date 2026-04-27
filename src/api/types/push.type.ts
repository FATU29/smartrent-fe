export enum PushDetailCode {
  SINGLE_PUSH = 'SINGLE_PUSH',
  PUSH_PACKAGE_3 = 'PUSH_PACKAGE_3',
  PUSH_PACKAGE_5 = 'PUSH_PACKAGE_5',
  PUSH_PACKAGE_10 = 'PUSH_PACKAGE_10',
}

export interface PushDetail {
  readonly pushDetailId: number
  readonly detailCode: PushDetailCode
  readonly detailName: string
  readonly detailNameEn: string
  readonly pricePerPush: number
  readonly quantity: number
  readonly totalPrice: number
  readonly discountPercentage: number
  readonly savings: number
  readonly description?: string
  readonly features?: readonly string[]
  readonly isActive: boolean
  readonly displayOrder?: number
}

export interface GetActivePushDetailsResponse {
  readonly code: string
  readonly message: string | null
  readonly data: readonly PushDetail[]
}

export interface GetPushDetailByCodeResponse {
  readonly code: string
  readonly message: string
  readonly data: PushDetail
}

export type GetAllPushDetailsResponse = readonly PushDetail[]

export interface TransformedPushDetail {
  readonly id: number
  readonly code: PushDetailCode
  readonly name: string
  readonly nameEn: string
  readonly pricePerPush: number
  readonly quantity: number
  readonly totalPrice: number
  readonly discountPercent: number
  readonly savings: number
  readonly description?: string
  readonly features?: readonly string[]
  readonly isBestSeller?: boolean
}

// Push listing with payment types
export interface PushListingRequest {
  listingId: number
  useMembershipQuota: boolean // true = use quota, false = direct payment
  paymentProvider?: 'VNPAY' | 'PAYPAL' | 'MOMO' // Required if useMembershipQuota is false
}

export interface PushListingResponse {
  paymentUrl?: string // Present if payment is required
  transactionRef?: string // Present if payment is required
  amount?: number // Present if payment is required
  currency?: string // Present if payment is required
  provider?: string // Present if payment is required
  message?: string // Confirmation message if quota is used
  success?: boolean // true if quota used successfully
  pushId?: number // ID of the push record
  listingId?: number
  userId?: string
  pushSource?: string // 'MEMBERSHIP_QUOTA' | 'DIRECT_PAYMENT' | 'DIRECT_PURCHASE' | 'SCHEDULED' | 'ADMIN'
  pushedAt?: string // ISO 8601 timestamp
}

// Push limit error
export const PUSH_LIMIT_ERROR_CODE = '18001'

/**
 * Thrown when the global push slot window is full (HTTP 429 + code 18001).
 * Carries the dynamic wait time so the UI can render a precise countdown.
 */
export class PushLimitError extends Error {
  readonly code = PUSH_LIMIT_ERROR_CODE
  readonly waitMinutes: number

  constructor(message: string, waitMinutes: number) {
    super(message)
    this.name = 'PushLimitError'
    this.waitMinutes = waitMinutes
  }
}

/**
 * Pull the wait-minute count out of the localized backend message.
 * Falls back to 1 if the format ever drifts.
 *
 * Backend template:
 *   "Hệ thống đang quá tải yêu cầu đẩy tin. Vui lòng chờ %d phút nữa..."
 */
export const parsePushLimitWaitMinutes = (
  message: string | null | undefined,
): number => {
  if (!message) return 1
  const match = message.match(/(\d+)\s*phút|(\d+)\s*minutes?/i)
  const raw = match?.[1] ?? match?.[2]
  const parsed = raw ? parseInt(raw, 10) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

// Quota response types
export interface QuotaStatusResponse {
  benefitType: string // 'POST_SILVER' | 'POST_GOLD' | 'POST_DIAMOND' | 'PUSH'
  totalAvailable: number // Remaining quota
  totalUsed: number // Already used
  totalGranted: number // Total granted
  hasActiveMembership: boolean
  message?: string
}
