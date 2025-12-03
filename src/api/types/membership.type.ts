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
  VNPAY = 'VNPAY',
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
  readonly benefits: UserBenefit[]
  readonly createdAt: string
  readonly updatedAt: string
}

export type GetPackagesResponse = Membership[]

export interface GetPackageByIdResponse extends Membership {}

export interface GetMyMembershipResponse extends UserMembership {}

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
