import type { SePayGatewayData } from './payment.type'

export enum MembershipPackageLevel {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  ADVANCED = 'ADVANCED',
}

export enum BenefitType {
  POST_STANDARD = 'POST_STANDARD',
  POST_NORMAL = 'POST_NORMAL',
  POST_SILVER = 'POST_SILVER',
  POST_GOLD = 'POST_GOLD',
  POST_DIAMOND = 'POST_DIAMOND',
  PUSH = 'PUSH',
  PUSH_STANDARD = 'PUSH_STANDARD',
  SCHEDULED_PUSH = 'SCHEDULED_PUSH',
  IMAGE_COPYRIGHT = 'IMAGE_COPYRIGHT',
  SCHEDULED_POSTING = 'SCHEDULED_POSTING',
  PERFORMANCE_REPORT = 'PERFORMANCE_REPORT',
}

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
}

export enum BenefitStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  USED_UP = 'USED_UP',
}

export enum PaymentProvider {
  SEPAY = 'SEPAY',
  MOMO = 'MOMO',
  PAYPAL = 'PAYPAL',
  ZALOPAY = 'ZALOPAY',
}

export interface PurchaseMembershipRequest {
  readonly membershipId: number
  readonly paymentProvider: PaymentProvider
}

export interface PurchaseMembershipResponse {
  readonly paymentUrl: string
  readonly transactionRef: string
  readonly amount: number
  readonly provider: string
  // SePay Payment Gateway: hosted-checkout form data ({ method, checkoutUrl, fields })
  readonly currency?: string
  readonly providerData?: SePayGatewayData
  readonly createdAt?: string
  readonly expiresAt?: string
}

export interface MembershipBenefit {
  readonly benefitId: number
  readonly benefitType: BenefitType
  readonly benefitNameDisplay: string
  readonly quantityPerMonth: number
  readonly createdAt: string
}

export interface Membership {
  readonly membershipId: number
  readonly packageCode: string
  readonly packageName: string
  readonly packageLevel: MembershipPackageLevel
  readonly durationMonths: number
  readonly originalPrice: number
  readonly salePrice: number
  readonly discountPercentage: number
  readonly isActive: boolean
  readonly description: string
  readonly benefits: MembershipBenefit[]
  readonly createdAt: string
  readonly updatedAt: string
}

export interface UserBenefit {
  readonly userBenefitId: number
  readonly benefitType: BenefitType
  readonly benefitNameDisplay: string
  readonly grantedAt: string
  readonly expiresAt: string
  readonly totalQuantity: number
  readonly quantityUsed: number
  readonly quantityRemaining: number
  readonly status: BenefitStatus
  // The VIP tier a listing created with this benefit runs under, plus that
  // tier's media caps. BE sends these on UserMembershipBenefitResponse; they
  // are null for non-post benefits (e.g. PUSH).
  readonly vipTierCode?: string | null
  readonly maxImages?: number | null
  readonly maxVideos?: number | null
  readonly createdAt: string
  readonly updatedAt: string
}

export interface UserMembership {
  readonly userMembershipId: number
  readonly userId: string
  readonly membershipId: number
  readonly packageName: string
  readonly packageLevel: MembershipPackageLevel
  readonly startDate: string
  readonly endDate: string
  readonly durationDays: number
  readonly daysRemaining: number
  readonly status: MembershipStatus
  readonly totalPaid: number
  readonly packageSalePrice: number
  readonly benefits: UserBenefit[]
  readonly createdAt: string
  readonly updatedAt: string
}

export type GetPackagesResponse = Membership[]

export interface GetPackageByIdResponse extends Membership {}

// A user can hold at most two ACTIVE membership records at once:
//   - current: startDate <= NOW() < endDate  (in use right now, benefits granted)
//   - queued:  startDate > NOW()             (waiting to start when current expires, no benefits yet)
// Both may be null. Renewal creates a queued slot instead of replacing current.
export interface MyMembershipResponse {
  readonly current: UserMembership | null
  readonly queued: UserMembership | null
}

export interface GetMyMembershipResponse extends MyMembershipResponse {}

export type GetMembershipHistoryResponse = UserMembership[]

export interface CancelMembershipResponse {
  readonly message: string
}

export interface TransformedMembershipPlan {
  readonly id: number
  readonly name: string
  readonly description: string
  readonly price: number
  readonly discountPercent: number
  readonly packageLevel?: MembershipPackageLevel
  readonly icon?: React.ReactNode
  readonly featureGroups: Array<{
    readonly title?: string
    readonly features: Array<{
      readonly label: string
      readonly active: boolean
      readonly hint?: string
    }>
  }>
  readonly isBestSeller: boolean
}

// Upgrade types
export interface ForfeitedBenefit {
  readonly benefitType: string
  readonly benefitName: string
  readonly totalQuantity: number
  readonly usedQuantity: number
  readonly remainingQuantity: number
  readonly estimatedValue: number
}

// Mirrors BE MembershipPackageBenefitResponse — the upgrade preview returns the
// target package's benefits using these exact field names (benefitNameDisplay,
// not benefitName). Reading the wrong field is why "Quyền lợi mới" rendered blank.
export interface NewBenefit {
  readonly benefitId: number
  readonly benefitType: string
  readonly benefitNameDisplay: string
  readonly quantityPerMonth: number
  readonly vipTierCode?: string | null
  readonly maxImages?: number | null
  readonly maxVideos?: number | null
  readonly createdAt?: string
}

// "CURRENT" = upgrading the active slot immediately (no queued slot exists)
// "QUEUED"  = upgrading the queued slot, active slot stays untouched
export type UpgradeContext = 'CURRENT' | 'QUEUED'

export interface UpgradePreview {
  readonly currentMembershipId?: number
  readonly currentPackageName?: string
  readonly currentPackageLevel?: string
  readonly daysRemaining?: number | null
  readonly targetMembershipId?: number
  readonly targetPackageName?: string
  readonly targetPackageLevel?: string
  readonly targetDurationDays?: number
  readonly targetPackagePrice?: number
  readonly discountAmount?: number
  readonly finalPrice?: number
  readonly discountPercentage?: number
  readonly forfeitedBenefits?: ForfeitedBenefit[]
  readonly newBenefits?: NewBenefit[]
  readonly upgradeContext?: UpgradeContext
  readonly eligible: boolean
  readonly ineligibilityReason: string | null
}

export interface UpgradeRequest {
  readonly targetMembershipId: number
  readonly paymentProvider: PaymentProvider
}

export interface UpgradeResponse {
  readonly upgradeContext?: UpgradeContext
  // When the upgraded tier will activate — non-null only when upgradeContext is "QUEUED"
  readonly activationDate?: string | null
  readonly transactionRef: string
  readonly paymentUrl: string | null
  readonly paymentProvider: string
  readonly previousMembershipId: number
  readonly newMembershipPackageId: number
  readonly newPackageName: string
  readonly newPackageLevel: string
  readonly originalPrice: number
  readonly discountAmount: number
  readonly finalAmount: number
  readonly status: 'PENDING_PAYMENT' | 'COMPLETED'
  readonly message: string
  // SePay Payment Gateway: hosted-checkout form data ({ method, checkoutUrl, fields })
  readonly providerData?: SePayGatewayData
  readonly expiresAt?: string
}

export type GetAvailableUpgradesResponse = UpgradePreview[]
export type GetUpgradePreviewResponse = UpgradePreview

// Renewal types
export interface RenewalRequest {
  readonly paymentProvider?: PaymentProvider
}

// PaymentResponse is reused for renewal (same shape as purchase/upgrade payment)
export type InitiateRenewalResponse = PurchaseMembershipResponse

// BE DomainCode QUEUED_MEMBERSHIP_EXISTS ("14009") — thrown by initiate-renewal
// when the user already has a queued slot waiting to activate.
export const QUEUED_MEMBERSHIP_EXISTS_CODE = '14009'

export class QueuedMembershipExistsError extends Error {
  readonly code = QUEUED_MEMBERSHIP_EXISTS_CODE

  constructor(message: string) {
    super(message)
    this.name = 'QueuedMembershipExistsError'
  }
}

export type ExpiryUrgency = 'none' | 'warning' | 'danger' | 'critical'

export function getExpiryUrgency(
  daysRemaining: number,
  status: string,
): ExpiryUrgency {
  if (status !== MembershipStatus.ACTIVE) return 'none'
  if (daysRemaining > 7) return 'none'
  if (daysRemaining > 3) return 'warning'
  if (daysRemaining > 0) return 'danger'
  return 'critical'
}

export function canRenewMembership(
  membership: UserMembership | null | undefined,
  queued?: UserMembership | null,
): boolean {
  if (queued) return false // queued slot already taken — only one allowed
  if (!membership) return false
  if (
    membership.status === MembershipStatus.ACTIVE &&
    membership.daysRemaining <= 7
  )
    return true
  if (membership.status === MembershipStatus.EXPIRED) {
    const expiredAgoMs = Date.now() - new Date(membership.endDate).getTime()
    return expiredAgoMs <= 7 * 24 * 60 * 60 * 1000
  }
  return false
}
