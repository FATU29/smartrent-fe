/**
 * VNPay utility functions for payment integration
 * Based on VNPay API documentation and payment flow guide
 */

/**
 * Filter VNPay parameters from URLSearchParams
 * Only keeps parameters starting with 'vnp_'
 *
 * @param searchParams - URLSearchParams or URL search string
 * @returns URLSearchParams containing only VNPay parameters
 *
 * @example
 * ```ts
 * const params = new URLSearchParams(window.location.search)
 * const vnpParams = filterVNPayParams(params)
 * // Only vnp_* parameters are included
 * ```
 */
export function filterVNPayParams(
  searchParams: URLSearchParams | string,
): URLSearchParams {
  const params =
    typeof searchParams === 'string'
      ? new URLSearchParams(searchParams)
      : searchParams

  const vnpParams = new URLSearchParams()

  params.forEach((value, key) => {
    if (key.startsWith('vnp_')) {
      vnpParams.append(key, value)
    }
  })

  return vnpParams
}

/**
 * Extract all VNPay parameters from URL query string
 *
 * @param queryString - URL query string (can include '?' prefix)
 * @returns Object containing VNPay parameters
 *
 * @example
 * ```ts
 * const params = extractVNPayParams('?vnp_Amount=10000&auth=token')
 * // { vnp_Amount: '10000' } - non-VNPay params filtered out
 * ```
 */
export function extractVNPayParams(
  queryString: string,
): Record<string, string> {
  const cleanQuery = queryString.startsWith('?')
    ? queryString.slice(1)
    : queryString

  const params = new URLSearchParams(cleanQuery)
  const vnpParams: Record<string, string> = {}

  params.forEach((value, key) => {
    if (key.startsWith('vnp_')) {
      vnpParams[key] = value
    }
  })

  return vnpParams
}

/**
 * VNPay response codes and their meanings
 * @see https://sandbox.vnpayment.vn/apis/docs/bang-ma-loi/
 */
export const VNPAY_RESPONSE_CODES = {
  '00': 'Success',
  '07': 'Deducted but suspected fraud',
  '09': 'Card not registered for Internet Banking',
  '10': 'Incorrect card info 3+ times',
  '11': 'Payment timeout',
  '12': 'Card locked',
  '13': 'Incorrect OTP',
  '24': 'Cancelled by user',
  '51': 'Insufficient balance',
  '65': 'Daily limit exceeded',
  '75': 'Bank under maintenance',
  '79': 'Incorrect payment password',
  '99': 'Other errors',
} as const

export type VNPayResponseCode = keyof typeof VNPAY_RESPONSE_CODES

/**
 * Get human-readable message for VNPay response code
 *
 * @param code - VNPay response code
 * @returns Human-readable message
 *
 * @example
 * ```ts
 * const message = getVNPayResponseMessage('00') // "Success"
 * const message = getVNPayResponseMessage('24') // "Cancelled by user"
 * ```
 */
export function getVNPayResponseMessage(code: string): string {
  return (
    VNPAY_RESPONSE_CODES[code as VNPayResponseCode] ||
    `Unknown error code: ${code}`
  )
}

/**
 * Check if VNPay response code indicates success
 *
 * @param code - VNPay response code
 * @returns true if payment was successful
 */
export function isVNPaySuccess(code: string): boolean {
  return code === '00'
}

/**
 * Check if VNPay response code indicates user cancellation
 *
 * @param code - VNPay response code
 * @returns true if payment was cancelled by user
 */
export function isVNPayCancelled(code: string): boolean {
  return code === '24'
}

/**
 * Parse VNPay amount (VNPay sends amount * 100)
 *
 * @param amount - Amount from VNPay (in VND * 100)
 * @returns Actual amount in VND
 *
 * @example
 * ```ts
 * const actualAmount = parseVNPayAmount('10000000') // 100,000 VND
 * ```
 */
export function parseVNPayAmount(amount: string | number): number {
  const numAmount = typeof amount === 'string' ? parseInt(amount, 10) : amount
  return numAmount / 100
}

/**
 * Format amount for VNPay (multiply by 100)
 *
 * @param amount - Amount in VND
 * @returns Amount formatted for VNPay (VND * 100)
 *
 * @example
 * ```ts
 * const vnpayAmount = formatVNPayAmount(100000) // 10000000
 * ```
 */
export function formatVNPayAmount(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Validate VNPay callback parameters
 *
 * @param params - URLSearchParams to validate
 * @returns Object with validation result and errors
 */
export function validateVNPayCallback(params: URLSearchParams): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Required parameters
  const requiredParams = [
    'vnp_TxnRef',
    'vnp_Amount',
    'vnp_ResponseCode',
    'vnp_TransactionStatus',
    'vnp_SecureHash',
  ]

  requiredParams.forEach((param) => {
    if (!params.has(param)) {
      errors.push(`Missing required parameter: ${param}`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Extract transaction info from VNPay callback
 *
 * @param params - URLSearchParams from VNPay callback
 * @returns Transaction information object
 */
export function extractVNPayTransactionInfo(params: URLSearchParams): {
  transactionRef: string
  amount: number
  responseCode: string
  transactionStatus: string
  transactionNo: string
  bankCode: string
  payDate: string
  orderInfo: string
} {
  return {
    transactionRef: params.get('vnp_TxnRef') || '',
    amount: parseVNPayAmount(params.get('vnp_Amount') || '0'),
    responseCode: params.get('vnp_ResponseCode') || '',
    transactionStatus: params.get('vnp_TransactionStatus') || '',
    transactionNo: params.get('vnp_TransactionNo') || '',
    bankCode: params.get('vnp_BankCode') || '',
    payDate: params.get('vnp_PayDate') || '',
    orderInfo: params.get('vnp_OrderInfo') || '',
  }
}
