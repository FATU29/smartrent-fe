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
