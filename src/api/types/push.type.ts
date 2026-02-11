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

// Quota response types
export interface QuotaStatusResponse {
  benefitType: string // 'POST_SILVER' | 'POST_GOLD' | 'POST_DIAMOND' | 'PUSH'
  totalAvailable: number // Remaining quota
  totalUsed: number // Already used
  totalGranted: number // Total granted
  hasActiveMembership: boolean
  message?: string
}
