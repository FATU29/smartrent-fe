/**
 * General payment utility functions
 */

import type {
  PaymentProvider,
  SePayInitiationData,
  SePayProviderData,
} from '@/api/types/payment.type'

export const PENDING_TRANSACTION_REF_KEY = 'pendingTransactionRef'

/**
 * Loose shape of an initiate-purchase response across all flows (membership,
 * upgrade, push, repost, listing). Field names vary slightly between endpoints
 * (`transactionRef` vs `transactionId`), so this accepts both.
 */
export interface SePayResultLike {
  provider?: string | null
  transactionRef?: string | null
  transactionId?: string | null
  amount?: number | null
  currency?: string | null
  // Some endpoints type this as `string | null` (e.g. a free upgrade).
  paymentUrl?: string | null
  qrCodeData?: string | null
  providerData?: SePayProviderData
  expiresAt?: string | null
}

/**
 * Whether an initiate-purchase response should be handled as a SePay bank
 * transfer (render the QR + poll) rather than a redirect to a hosted checkout.
 */
export function isSePayResult(result?: SePayResultLike | null): boolean {
  if (!result) return false
  if (
    typeof result.provider === 'string' &&
    result.provider.toUpperCase() === 'SEPAY'
  ) {
    return true
  }
  return !!result.qrCodeData || !!result.providerData
}

/**
 * Normalise any initiate-purchase response into the shape the SePay checkout
 * dialog consumes, reconciling the `transactionRef` / `transactionId` and
 * `paymentUrl` / `qrCodeData` / `providerData.qrUrl` aliases.
 */
export function toSePayInitData(result: SePayResultLike): SePayInitiationData {
  const qr =
    result.qrCodeData ||
    result.paymentUrl ||
    result.providerData?.qrUrl ||
    undefined
  return {
    transactionRef: result.transactionRef || result.transactionId || '',
    provider: result.provider ?? undefined,
    amount: result.amount ?? result.providerData?.amount,
    currency: result.currency ?? undefined,
    paymentUrl: qr,
    qrCodeData: qr,
    providerData: result.providerData,
    expiresAt: result.expiresAt ?? undefined,
  }
}

/**
 * Redirect to a hosted-checkout payment URL preserving exact URL encoding.
 *
 * Used for redirect providers (e.g. ZaloPay) whose signed URLs must not be
 * re-encoded. SePay does NOT use this — it renders a VietQR and polls instead.
 *
 * @param paymentUrl - Payment URL to redirect to (must be the exact URL from backend)
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
  if (!paymentUrl) {
    console.error('[Payment Redirect] Payment URL is empty or undefined')
    return
  }

  // Debug logging
  console.log('[Payment] Redirecting to:', paymentUrl)

  if (newWindow) {
    window.open(paymentUrl, '_blank', 'noopener,noreferrer')
    return
  }

  // Simple redirect - the URL should work as-is if backend generates correct signature
  window.location.href = paymentUrl
}

/**
 * Persist a pending transaction reference before redirecting to gateway.
 */
export function setPendingTransactionRef(transactionRef?: string | null): void {
  if (typeof window === 'undefined') return
  if (!transactionRef) return

  window.localStorage.setItem(PENDING_TRANSACTION_REF_KEY, transactionRef)
}

/**
 * Read pending transaction reference from localStorage.
 */
export function getPendingTransactionRef(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(PENDING_TRANSACTION_REF_KEY)
}

/**
 * Clear pending transaction reference after callback processing.
 */
export function clearPendingTransactionRef(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(PENDING_TRANSACTION_REF_KEY)
}

/**
 * Redirect using anchor element click.
 * Note: This may not preserve exact URL encoding in all browsers.
 *
 * @param url - The URL to redirect to
 */
export function redirectViaAnchor(url: string): void {
  try {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.style.display = 'none'
    document.body.appendChild(anchor)
    anchor.click()

    setTimeout(() => {
      if (anchor.parentNode) {
        anchor.parentNode.removeChild(anchor)
      }
    }, 100)
  } catch (error) {
    console.error('[Payment Redirect] Anchor redirect failed:', error)
    window.location.assign(url)
  }
}

/**
 * Alternative: Redirect using location.assign
 *
 * @param url - The URL to redirect to
 */
export function redirectViaAssign(url: string): void {
  window.location.assign(url)
}

/**
 * Debug utility: Compare two URLs to find encoding differences.
 * Use this to debug signature issues.
 *
 * @param url1 - First URL (e.g., from backend response)
 * @param url2 - Second URL (e.g., from browser location after redirect)
 * @returns Object with comparison results
 */
export function comparePaymentUrls(
  url1: string,
  url2: string,
): { identical: boolean; differences: string[] } {
  const differences: string[] = []

  if (url1 === url2) {
    return { identical: true, differences: [] }
  }

  // Compare character by character
  const maxLen = Math.max(url1.length, url2.length)
  for (let i = 0; i < maxLen; i++) {
    const char1 = url1[i] || '(missing)'
    const char2 = url2[i] || '(missing)'
    if (char1 !== char2) {
      differences.push(`Position ${i}: '${char1}' vs '${char2}'`)
      // Only show first 10 differences
      if (differences.length >= 10) {
        differences.push('... (more differences)')
        break
      }
    }
  }

  return { identical: false, differences }
}

/**
 * Get payment provider display name
 *
 * @param provider - Payment provider code
 * @returns Display name
 */
export function getPaymentProviderName(provider: string): string {
  const providerNames: Record<string, string> = {
    SEPAY: 'SePay',
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
  const supportedProviders: PaymentProvider[] = [
    'SEPAY',
    'PAYPAL',
    'MOMO',
    'ZALOPAY',
  ]
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
      params.get('txRef') ||
      null
    )
  }

  return params.transactionRef || params.txnRef || params.txRef || null
}
