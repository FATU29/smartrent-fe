import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import { PATHS } from '@/api/paths'
import type { AxiosInstance } from 'axios'
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  RefundPaymentResponse,
  CancelPaymentResponse,
  PaymentTransaction,
  PaymentProvidersResponse,
  PaymentHistoryPage,
  PaymentStatus,
  ProviderParams,
  PaymentCallbackResponse,
} from '@/api/types/payment.type'

export class PaymentService {
  /** Create a new payment */
  static async create(
    request: CreatePaymentRequest,
    instance?: AxiosInstance,
  ): Promise<ApiResponse<CreatePaymentResponse>> {
    return apiRequest<CreatePaymentResponse>(
      { method: 'POST', url: PATHS.PAYMENT.CREATE, data: request },
      instance,
    )
  }

  /** Refund a payment by transactionRef */
  static async refund(
    transactionRef: string,
    amount: number,
    reason: string,
  ): Promise<ApiResponse<RefundPaymentResponse>> {
    const url = PATHS.PAYMENT.REFUND.replace(':transactionRef', transactionRef)
    return apiRequest<RefundPaymentResponse>({
      method: 'POST',
      url,
      params: { amount, reason },
    })
  }

  /** Cancel a payment by transactionRef */
  static async cancel(
    transactionRef: string,
    reason: string,
  ): Promise<ApiResponse<CancelPaymentResponse>> {
    const url = PATHS.PAYMENT.CANCEL.replace(':transactionRef', transactionRef)
    return apiRequest<CancelPaymentResponse>({
      method: 'POST',
      url,
      params: { reason },
    })
  }

  /** Get transaction details */
  static async getTransaction(
    txnRef: string,
  ): Promise<ApiResponse<PaymentTransaction>> {
    const url = PATHS.PAYMENT.TRANSACTION.replace(':txnRef', txnRef)
    return apiRequest<PaymentTransaction>({ method: 'GET', url })
  }

  /** List supported providers */
  static async listProviders(): Promise<ApiResponse<PaymentProvidersResponse>> {
    return apiRequest<PaymentProvidersResponse>({
      method: 'GET',
      url: PATHS.PAYMENT.PROVIDERS,
    })
  }

  /** Payment history (pagination) */
  static async history(
    userId: string,
    page: number = 0,
    size: number = 20,
  ): Promise<ApiResponse<PaymentHistoryPage>> {
    return apiRequest<PaymentHistoryPage>({
      method: 'GET',
      url: PATHS.PAYMENT.HISTORY,
      params: { userId, page, size },
    })
  }

  /** Payment history filtered by status */
  static async historyByStatus(
    userId: string | number,
    status: PaymentStatus | string,
    page: number = 0,
    size: number = 20,
  ): Promise<ApiResponse<PaymentHistoryPage>> {
    const url = PATHS.PAYMENT.HISTORY_BY_STATUS.replace(
      ':status',
      String(status),
    )
    return apiRequest<PaymentHistoryPage>({
      method: 'GET',
      url,
      params: { userId, page, size },
    })
  }

  /** Check if transaction exists */
  static async exists(transactionRef: string): Promise<ApiResponse<boolean>> {
    const url = PATHS.PAYMENT.EXISTS.replace(':transactionRef', transactionRef)
    return apiRequest<boolean>({ method: 'GET', url })
  }

  /** Handle IPN from provider */
  static async ipn(
    provider: string,
    params: ProviderParams,
  ): Promise<ApiResponse<PaymentTransaction>> {
    const url = PATHS.PAYMENT.IPN.replace(':provider', provider)
    return apiRequest<PaymentTransaction>({ method: 'POST', url, params })
  }

  /** Handle callback from provider */
  static async callback(
    provider: string,
    params: ProviderParams,
  ): Promise<ApiResponse<PaymentCallbackResponse>> {
    const url = PATHS.PAYMENT.CALLBACK.replace(':provider', provider)
    return apiRequest<PaymentCallbackResponse>({ method: 'GET', url, params })
  }

  /** Handle VNPAY callback with query string */
  static async vnpayCallback(
    queryString: string,
  ): Promise<ApiResponse<PaymentCallbackResponse>> {
    // ✅ CRITICAL: Pass the raw query string directly in the URL
    // DO NOT decode and re-encode as it will break VNPay's signature
    const cleanQuery = queryString.startsWith('?')
      ? queryString.slice(1)
      : queryString

    // Build the URL with the raw query string
    const url = `${PATHS.PAYMENT.CALLBACK.replace(':provider', 'VNPAY')}?${cleanQuery}`

    // Make the request without params to avoid re-encoding
    return apiRequest<PaymentCallbackResponse>({
      method: 'GET',
      url,
    })
  }
}

export const {
  create: createPayment,
  refund: refundPayment,
  cancel: cancelPayment,
  getTransaction: getPaymentTransaction,
  listProviders: getPaymentProviders,
  history: getPaymentHistory,
  historyByStatus: getPaymentHistoryByStatus,
  exists: checkPaymentExists,
  ipn: handlePaymentIpn,
  callback: handlePaymentCallback,
} = PaymentService
