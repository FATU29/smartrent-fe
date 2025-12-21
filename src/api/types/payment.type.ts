// Payment domain types

export enum PaymentProviderCode {
  VNPAY = 'VNPAY',
  PAYPAL = 'PAYPAL',
  MOMO = 'MOMO',
}

export type PaymentProvider =
  | keyof typeof PaymentProviderCode
  | PaymentProviderCode

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum TransactionType {
  MEMBERSHIP_PURCHASE = 'MEMBERSHIP_PURCHASE',
  LISTING_DEPOSIT = 'LISTING_DEPOSIT',
  OTHER = 'OTHER',
}

export interface PaymentTransactionProviderData {
  [key: string]: string | number | boolean | null | undefined
}

export interface PaymentTransaction {
  paymentId: number
  provider: PaymentProviderCode | string
  transactionRef: string
  providerTransactionId?: string
  status: PaymentStatus | string
  amount: number
  currency: string
  orderInfo?: string
  paymentMethod?: string
  bankCode?: string
  bankTransactionId?: string
  paymentDate?: string
  responseCode?: string
  responseMessage?: string
  success?: boolean
  signatureValid?: boolean
  message?: string
  providerData?: PaymentTransactionProviderData
  transactionType?: TransactionType | string
  listingId?: number
  userId?: number
  createdAt?: string
  updatedAt?: string
  notes?: string
}

// Create payment request body
export interface CreatePaymentRequest {
  provider: PaymentProviderCode | string
  amount: number
  currency: string
  orderInfo: string
  listingId?: number
  returnUrl?: string
  cancelUrl?: string
  notes?: string
  metadata?: Record<string, string>
  providerParams?: Record<string, string>
}

export interface CreatePaymentResponseData {
  paymentUrl?: string
  transactionId?: string
  orderInfo?: string
  amount?: string | number
}

export type CreatePaymentResponse = CreatePaymentResponseData

// Refund payment
export interface RefundPaymentResponse extends PaymentTransaction {}

// Cancel payment response
export type CancelPaymentResponse = boolean

// Providers list
export type PaymentProvidersResponse = string[]

// Exists response
export type PaymentExistsResponse = boolean

// Payment history paginated (structure modeled after spec)
export interface PaymentHistoryPage {
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  size: number
  content: PaymentTransaction[]
  number: number
  numberOfElements: number
  empty: boolean
  // The spec shows sort & pageable details; include optional
  sort?: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  pageable?: {
    offset: number
    paged: boolean
    pageNumber: number
    pageSize: number
    unpaged: boolean
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
  }
}

// Generic map params for IPN / callback endpoints
export type ProviderParams = Record<string, string>

// Payment callback response
export interface PaymentCallbackResponse {
  transactionRef: string
  providerTransactionId?: string
  status: PaymentStatus | string
  success: boolean
  signatureValid: boolean
  message?: string
}
