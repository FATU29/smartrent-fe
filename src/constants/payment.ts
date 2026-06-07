/**
 * Payment-related constants
 */

/**
 * Payment providers supported by the application
 */
export const PAYMENT_PROVIDERS = {
  SEPAY: 'SEPAY',
  PAYPAL: 'PAYPAL',
  MOMO: 'MOMO',
  ZALOPAY: 'ZALOPAY',
} as const

export type PaymentProviderKey = keyof typeof PAYMENT_PROVIDERS

/**
 * Payment status values
 */
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const

export type PaymentStatusKey = keyof typeof PAYMENT_STATUS

/**
 * Terminal payment statuses (no further updates expected)
 */
export const TERMINAL_PAYMENT_STATUSES: PaymentStatusKey[] = [
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
]

/**
 * Default payment configuration
 */
export const PAYMENT_CONFIG = {
  DEFAULT_CURRENCY: 'VND',
  DEFAULT_PROVIDER: 'SEPAY',
  DEFAULT_RETURN_URL: '/payment/result',
  DEFAULT_CANCEL_URL: '/payment/cancelled',
  POLL_INTERVAL: 2000, // 2 seconds
  MAX_POLL_COUNT: 10,
  STALE_TIME: 1000, // 1 second
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes
} as const

/**
 * SePay Payment Gateway constants. SePay redirects back to /payment/result and
 * the IPN settles the payment on the backend, so the result page polls the
 * transaction status until it leaves PENDING.
 */
export const SEPAY_CONFIG = {
  // How often /payment/result re-checks the transaction status (ms).
  POLL_INTERVAL: 3000,
} as const

/**
 * Payment error codes
 */
export const PAYMENT_ERROR_CODES = {
  INVALID_SIGNATURE: 'PAYMENT_001',
  MISSING_PARAMETERS: 'PAYMENT_002',
  TRANSACTION_NOT_FOUND: 'PAYMENT_003',
  PAYMENT_FAILED: 'PAYMENT_004',
  PAYMENT_CANCELLED: 'PAYMENT_005',
  INSUFFICIENT_BALANCE: 'PAYMENT_006',
  PROVIDER_ERROR: 'PAYMENT_007',
  NETWORK_ERROR: 'PAYMENT_008',
  UNKNOWN_ERROR: 'PAYMENT_999',
} as const

/**
 * Payment error messages
 */
export const PAYMENT_ERROR_MESSAGES: Record<
  keyof typeof PAYMENT_ERROR_CODES,
  string
> = {
  INVALID_SIGNATURE: 'Payment signature verification failed',
  MISSING_PARAMETERS: 'Required payment parameters are missing',
  TRANSACTION_NOT_FOUND: 'Transaction not found',
  PAYMENT_FAILED: 'Payment processing failed',
  PAYMENT_CANCELLED: 'Payment was cancelled',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  PROVIDER_ERROR: 'Payment provider error',
  NETWORK_ERROR: 'Network error occurred',
  UNKNOWN_ERROR: 'An unknown error occurred',
}

/**
 * Transaction types
 */
export const TRANSACTION_TYPES = {
  MEMBERSHIP_PURCHASE: 'MEMBERSHIP_PURCHASE',
  LISTING_DEPOSIT: 'LISTING_DEPOSIT',
  PUSH_LISTING: 'PUSH_LISTING',
  OTHER: 'OTHER',
} as const

export type TransactionTypeKey = keyof typeof TRANSACTION_TYPES

/**
 * Payment method display names
 */
export const PAYMENT_METHOD_NAMES: Record<string, string> = {
  SEPAY: 'SePay',
  PAYPAL: 'PayPal',
  MOMO: 'MoMo',
  ZALOPAY: 'ZaloPay',
  ATM: 'ATM Card',
  VISA: 'Visa/Mastercard',
  QRCODE: 'QR Code',
}

/**
 * Currency configurations
 */
export const CURRENCY_CONFIG = {
  VND: {
    code: 'VND',
    symbol: '₫',
    locale: 'vi-VN',
    decimals: 0,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    decimals: 2,
  },
} as const

/**
 * Payment notification messages
 */
export const PAYMENT_NOTIFICATIONS = {
  SUCCESS: {
    title: 'Payment Successful',
    message: 'Your payment has been processed successfully',
  },
  FAILED: {
    title: 'Payment Failed',
    message: 'Your payment could not be processed',
  },
  CANCELLED: {
    title: 'Payment Cancelled',
    message: 'You have cancelled the payment',
  },
  PROCESSING: {
    title: 'Processing Payment',
    message: 'Please wait while we process your payment',
  },
} as const

/**
 * sessionStorage key holding a marker for a seller push/repost payment in
 * flight. Set before redirecting to the gateway so /payment/result knows to
 * send the user back to their listings on success.
 */
export const PENDING_SELLER_LISTING_ACTION_KEY = 'pendingSellerListingAction'

/**
 * Payment routes
 */
export const PAYMENT_ROUTES = {
  RESULT: '/payment/result',
  STATUS: '/payment/status',
  HISTORY: '/payment/history',
  CANCELLED: '/payment/cancelled',
} as const
