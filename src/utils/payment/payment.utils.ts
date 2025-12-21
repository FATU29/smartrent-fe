/**
 * General payment utility functions
 */

import type { PaymentProvider } from '@/api/types/payment.type'

/**
 * Redirect to payment URL
 *
 * @param paymentUrl - Payment URL to redirect to
 * @param newWindow - Whether to open in new window (default: false)
 *
 * @example
 * ```ts
 * redirectToPayment(response.data.paymentUrl)
 * ```
 */
export function redirectToPayment(
  paymentUrl: string,
  newWindow: boolean = false,
): void {
  if (newWindow) {
    window.open(paymentUrl, '_blank', 'noopener,noreferrer')
  } else {
    window.location.href = paymentUrl
  }
}

/**
 * Get payment provider display name
 *
 * @param provider - Payment provider code
 * @returns Display name
 */
export function getPaymentProviderName(provider: string): string {
  const providerNames: Record<string, string> = {
    VNPAY: 'VNPay',
    PAYPAL: 'PayPal',
    MOMO: 'MoMo',
    ZALOPAY: 'ZaloPay',
  }

  return providerNames[provider] || provider
}

/**
 * Format currency amount
 *
 * @param amount - Amount to format
 * @param currency - Currency code (default: VND)
 * @param locale - Locale for formatting (default: vi-VN)
 * @returns Formatted currency string
 *
 * @example
 * ```ts
 * formatCurrency(100000) // "100.000 ₫"
 * formatCurrency(100, 'USD', 'en-US') // "$100.00"
 * ```
 */
export function formatCurrency(
  amount: number,
  currency: string = 'VND',
  locale: string = 'vi-VN',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'VND' ? 0 : 2,
    maximumFractionDigits: currency === 'VND' ? 0 : 2,
  }).format(amount)
}

/**
 * Build payment return URL with custom parameters
 *
 * @param baseUrl - Base return URL
 * @param params - Additional parameters to include
 * @returns Complete return URL
 *
 * @example
 * ```ts
 * const returnUrl = buildReturnUrl('/payment/result', {
 *   source: 'membership',
 *   userId: '123'
 * })
 * ```
 */
export function buildReturnUrl(
  baseUrl: string,
  params?: Record<string, string>,
): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl
  }

  const url = new URL(baseUrl, window.location.origin)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  return url.toString()
}

/**
 * Payment status to color mapping
 */
export const PAYMENT_STATUS_COLORS = {
  COMPLETED: 'green',
  PENDING: 'yellow',
  FAILED: 'red',
  CANCELLED: 'gray',
  REFUNDED: 'blue',
} as const

/**
 * Payment status to icon mapping
 */
export const PAYMENT_STATUS_ICONS = {
  COMPLETED: '✅',
  PENDING: '⏳',
  FAILED: '❌',
  CANCELLED: '🚫',
  REFUNDED: '↩️',
} as const

/**
 * Get color for payment status
 *
 * @param status - Payment status
 * @returns Color name
 */
export function getPaymentStatusColor(
  status: string,
): (typeof PAYMENT_STATUS_COLORS)[keyof typeof PAYMENT_STATUS_COLORS] {
  return (
    PAYMENT_STATUS_COLORS[
      status.toUpperCase() as keyof typeof PAYMENT_STATUS_COLORS
    ] || 'gray'
  )
}

/**
 * Get icon for payment status
 *
 * @param status - Payment status
 * @returns Icon emoji
 */
export function getPaymentStatusIcon(status: string): string {
  return (
    PAYMENT_STATUS_ICONS[
      status.toUpperCase() as keyof typeof PAYMENT_STATUS_ICONS
    ] || '❓'
  )
}

/**
 * Parse query parameters from URL
 *
 * @param search - URL search string (can include '?' prefix)
 * @returns Object with query parameters
 */
export function parseQueryParams(search: string): Record<string, string> {
  const params = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search,
  )
  const result: Record<string, string> = {}

  params.forEach((value, key) => {
    result[key] = value
  })

  return result
}

/**
 * Check if payment provider is supported
 *
 * @param provider - Provider to check
 * @returns true if supported
 */
export function isPaymentProviderSupported(provider: string): boolean {
  const supportedProviders: PaymentProvider[] = ['VNPAY', 'PAYPAL', 'MOMO']
  return supportedProviders.includes(provider as PaymentProvider)
}

/**
 * Get default payment return URL
 *
 * @returns Default return URL for payments
 */
export function getDefaultPaymentReturnUrl(): string {
  if (typeof window === 'undefined') {
    return '/payment/result'
  }

  const baseUrl = window.location.origin
  return `${baseUrl}/payment/result`
}

/**
 * Extract transaction reference from various parameter formats
 *
 * @param params - URLSearchParams or query object
 * @returns Transaction reference or null
 */
export function extractTransactionRef(
  params: URLSearchParams | Record<string, string>,
): string | null {
  if (params instanceof URLSearchParams) {
    return (
      params.get('transactionRef') ||
      params.get('txnRef') ||
      params.get('vnp_TxnRef') ||
      params.get('txRef') ||
      null
    )
  }

  return (
    params.transactionRef ||
    params.txnRef ||
    params.vnp_TxnRef ||
    params.txRef ||
    null
  )
}
