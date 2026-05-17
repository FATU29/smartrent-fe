// Customer transaction-history domain types.
// Mirrors the backend CustomerTransactionController DTOs:
//   GET /v1/me/transactions            -> PageResponse<TransactionHistoryItemResponse>
//   GET /v1/me/transactions/{id}       -> TransactionDetailResponse
// The current user is derived from the JWT principal on the backend, so the
// frontend never sends a userId for these endpoints.

import type { PaymentStatus } from './payment.type'

/** Status enum returned by the backend (TransactionStatus). */
export type CustomerTransactionStatus = PaymentStatus | string

/**
 * Payment types supported by the backend TransactionType enum. Used to build
 * the type filter; unknown values from the API are still rendered (title-cased)
 * instead of crashing.
 */
export const CUSTOMER_TRANSACTION_TYPES = [
  'ROOM_RENT',
  'DEPOSIT',
  'MONTHLY_INVOICE',
  'UTILITY_BILL',
  'SERVICE_FEE',
  'MEMBERSHIP_PURCHASE',
  'MEMBERSHIP_UPGRADE',
  'POST_FEE',
  'PUSH_FEE',
  'REPOST_FEE',
  'WALLET_TOPUP',
  'REFUND',
] as const

export type CustomerTransactionType =
  (typeof CUSTOMER_TRANSACTION_TYPES)[number]

export interface TransactionInvoiceRef {
  invoiceId: string
  invoiceCode: string
  description?: string | null
}

export interface TransactionRoomRef {
  roomId: number
  roomCode?: string | null
  roomName?: string | null
  address?: string | null
}

export interface TransactionParty {
  customerId?: string | null
  landlordId?: string | null
  name?: string | null
  email?: string | null
  phone?: string | null
}

export interface CustomerTransactionItem {
  transactionId: string
  transactionCode: string
  amount: number
  currency: string
  paymentGateway?: string | null
  paymentMethod?: string | null
  gatewayTransactionCode?: string | null
  status: CustomerTransactionStatus
  paymentType: CustomerTransactionType | string
  createdAt: string
  completedAt?: string | null
  invoice?: TransactionInvoiceRef | null
  room?: TransactionRoomRef | null
  customer?: TransactionParty | null
  landlord?: TransactionParty | null
  failureReason?: string | null
}

export interface TransactionTimelineEvent {
  status: CustomerTransactionStatus
  at: string
  actorType?: string | null
  actorId?: string | null
  note?: string | null
}

export interface CustomerTransactionDetail extends CustomerTransactionItem {
  idempotencyKey?: string | null
  gatewayResponseCode?: string | null
  expiredAt?: string | null
  orderInfo?: string | null
  providerPayload?: string | null
  timeline?: TransactionTimelineEvent[] | null
}

/** Backend PageResponse<T> wrapper (1-based `page`). */
export interface CustomerTransactionPage {
  page: number
  size: number
  totalElements: number
  totalPages: number
  data: CustomerTransactionItem[]
}

export interface CustomerTransactionQuery {
  page?: number
  size?: number
  status?: CustomerTransactionStatus
  type?: CustomerTransactionType | string
  /** Inclusive, YYYY-MM-DD. */
  fromDate?: string
  /** Inclusive, YYYY-MM-DD. */
  toDate?: string
  /** Free-text search: transaction / gateway / invoice code. */
  q?: string
}
