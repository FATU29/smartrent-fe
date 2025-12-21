/**
 * Custom hooks for payment operations
 * Provides React Query hooks for payment-related API calls
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PaymentService } from '@/api/services'
import type {
  CreatePaymentRequest,
  PaymentStatus,
  ProviderParams,
} from '@/api/types/payment.type'
import { redirectToPayment } from '@/utils/payment'

/**
 * Hook to create a payment
 * Returns mutation for initiating a payment
 *
 * @example
 * ```tsx
 * const createPayment = useCreatePayment()
 *
 * const handlePayment = async () => {
 *   const result = await createPayment.mutateAsync({
 *     provider: 'VNPAY',
 *     amount: 100000,
 *     currency: 'VND',
 *     orderInfo: 'Membership purchase'
 *   })
 *
 *   if (result.paymentUrl) {
 *     window.location.href = result.paymentUrl
 *   }
 * }
 * ```
 */
export function useCreatePayment() {
  return useMutation({
    mutationFn: async (request: CreatePaymentRequest) => {
      const response = await PaymentService.create(request)

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create payment')
      }

      return response.data
    },
  })
}

/**
 * Hook to fetch transaction details by transaction reference
 *
 * @param txnRef - Transaction reference
 * @param options - Query options
 *
 * @example
 * ```tsx
 * const { data: transaction, isLoading } = useTransaction('txn-123')
 * ```
 */
export function useTransaction(
  txnRef: string | undefined,
  options?: {
    enabled?: boolean
    refetchInterval?: number | false
  },
) {
  return useQuery({
    queryKey: ['payment', 'transaction', txnRef],
    queryFn: async () => {
      if (!txnRef) return null

      const response = await PaymentService.getTransaction(txnRef)

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch transaction')
      }

      return response.data
    },
    enabled: !!txnRef && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
    staleTime: 1000, // 1 second
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch payment history
 *
 * @param userId - User ID
 * @param options - Pagination options
 *
 * @example
 * ```tsx
 * const { data: history } = usePaymentHistory('user-123', { page: 0, size: 20 })
 * ```
 */
export function usePaymentHistory(
  userId: string | undefined,
  options?: {
    page?: number
    size?: number
    status?: PaymentStatus | string
    enabled?: boolean
  },
) {
  const { page = 0, size = 20, status, enabled = true } = options || {}

  return useQuery({
    queryKey: ['payment', 'history', userId, page, size, status],
    queryFn: async () => {
      if (!userId) return null

      const response = status
        ? await PaymentService.historyByStatus(userId, status, page, size)
        : await PaymentService.history(userId, page, size)

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch payment history')
      }

      return response.data
    },
    enabled: !!userId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to check if transaction exists
 *
 * @param transactionRef - Transaction reference
 *
 * @example
 * ```tsx
 * const { data: exists } = useTransactionExists('txn-123')
 * ```
 */
export function useTransactionExists(transactionRef: string | undefined) {
  return useQuery({
    queryKey: ['payment', 'exists', transactionRef],
    queryFn: async () => {
      if (!transactionRef) return false

      const response = await PaymentService.exists(transactionRef)

      if (!response.success) {
        return false
      }

      return response.data ?? false
    },
    enabled: !!transactionRef,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to handle payment callback
 * Returns mutation for processing payment callbacks
 *
 * @example
 * ```tsx
 * const handleCallback = usePaymentCallback()
 *
 * useEffect(() => {
 *   const params = new URLSearchParams(window.location.search)
 *   handleCallback.mutate({ provider: 'VNPAY', params })
 * }, [])
 * ```
 */
export function usePaymentCallback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      provider,
      params,
    }: {
      provider: string
      params: ProviderParams
    }) => {
      const response = await PaymentService.callback(provider, params)

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Payment callback failed')
      }

      return response.data
    },
    onSuccess: (data) => {
      // Invalidate transaction cache
      queryClient.invalidateQueries({
        queryKey: ['payment', 'transaction', data.transactionRef],
      })

      // Invalidate payment history
      queryClient.invalidateQueries({
        queryKey: ['payment', 'history'],
      })
    },
  })
}

/**
 * Hook to refund a payment
 *
 * @example
 * ```tsx
 * const refundPayment = useRefundPayment()
 *
 * const handleRefund = () => {
 *   refundPayment.mutate({
 *     transactionRef: 'txn-123',
 *     amount: 100000,
 *     reason: 'Customer request'
 *   })
 * }
 * ```
 */
export function useRefundPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      transactionRef,
      amount,
      reason,
    }: {
      transactionRef: string
      amount: number
      reason: string
    }) => {
      const response = await PaymentService.refund(
        transactionRef,
        amount,
        reason,
      )

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to refund payment')
      }

      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate transaction cache
      queryClient.invalidateQueries({
        queryKey: ['payment', 'transaction', variables.transactionRef],
      })

      // Invalidate payment history
      queryClient.invalidateQueries({
        queryKey: ['payment', 'history'],
      })
    },
  })
}

/**
 * Hook to cancel a payment
 *
 * @example
 * ```tsx
 * const cancelPayment = useCancelPayment()
 *
 * const handleCancel = () => {
 *   cancelPayment.mutate({
 *     transactionRef: 'txn-123',
 *     reason: 'User cancelled'
 *   })
 * }
 * ```
 */
export function useCancelPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      transactionRef,
      reason,
    }: {
      transactionRef: string
      reason: string
    }) => {
      const response = await PaymentService.cancel(transactionRef, reason)

      if (!response.success) {
        throw new Error(response.message || 'Failed to cancel payment')
      }

      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate transaction cache
      queryClient.invalidateQueries({
        queryKey: ['payment', 'transaction', variables.transactionRef],
      })

      // Invalidate payment history
      queryClient.invalidateQueries({
        queryKey: ['payment', 'history'],
      })
    },
  })
}

/**
 * Hook to fetch supported payment providers
 *
 * @example
 * ```tsx
 * const { data: providers } = usePaymentProviders()
 * ```
 */
export function usePaymentProviders() {
  return useQuery({
    queryKey: ['payment', 'providers'],
    queryFn: async () => {
      const response = await PaymentService.listProviders()

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch providers')
      }

      return response.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to initiate payment and redirect
 * Convenience hook that combines payment creation and redirect
 *
 * @example
 * ```tsx
 * const initiatePayment = useInitiatePayment()
 *
 * const handlePayment = () => {
 *   initiatePayment.mutate({
 *     provider: 'VNPAY',
 *     amount: 100000,
 *     currency: 'VND',
 *     orderInfo: 'Purchase'
 *   })
 * }
 * ```
 */
export function useInitiatePayment(options?: {
  onSuccess?: () => void
  onError?: (error: Error) => void
  autoRedirect?: boolean
}) {
  const { autoRedirect = true, onSuccess, onError } = options || {}

  return useMutation({
    mutationFn: async (request: CreatePaymentRequest) => {
      const response = await PaymentService.create(request)

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create payment')
      }

      return response.data
    },
    onSuccess: (data) => {
      if (data.paymentUrl && autoRedirect) {
        redirectToPayment(data.paymentUrl)
      }
      onSuccess?.()
    },
    onError: (error: Error) => {
      onError?.(error)
    },
  })
}
