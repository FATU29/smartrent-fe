/**
 * Custom hooks for listing push payment
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PushService } from '@/api/services'
import type { PushListingRequest } from '@/api/types/push.type'
import { redirectToPayment } from '@/utils/payment'

/**
 * Hook to push a listing (with payment or membership quota)
 * Automatically redirects to payment URL if payment is required
 *
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * // With direct payment
 * const pushListing = usePushListing()
 *
 * pushListing.mutate({
 *   listingId: 123,
 *   useMembershipQuota: false,
 *   paymentProvider: 'VNPAY'
 * })
 *
 * // With membership quota
 * pushListing.mutate({
 *   listingId: 123,
 *   useMembershipQuota: true
 * })
 * ```
 */
export function usePushListing(options?: {
  onSuccess?: (data: {
    paymentUrl?: string
    transactionRef?: string
    message?: string
    success?: boolean
  }) => void
  onError?: (error: Error) => void
  autoRedirect?: boolean
}) {
  const queryClient = useQueryClient()
  const { autoRedirect = true, onSuccess, onError } = options || {}

  return useMutation({
    mutationFn: async (request: PushListingRequest) => {
      const response = await PushService.pushListing(request)

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to push listing')
      }

      return response.data
    },
    onSuccess: (data, variables) => {
      // Redirect to payment URL if payment is required and auto-redirect is enabled
      if (data.paymentUrl && autoRedirect) {
        redirectToPayment(data.paymentUrl)
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['listings', variables.listingId],
      })

      queryClient.invalidateQueries({
        queryKey: ['memberships'],
      })

      // Call custom success handler
      onSuccess?.(data)
    },
    onError: (error: Error) => {
      onError?.(error)
    },
  })
}

/**
 * Hook to push listing with direct payment only
 * Ensures useMembershipQuota is false
 *
 * @example
 * ```tsx
 * const pushWithPayment = usePushListingWithPayment()
 *
 * pushWithPayment.mutate({
 *   listingId: 123,
 *   paymentProvider: 'VNPAY'
 * })
 * ```
 */
export function usePushListingWithPayment(options?: {
  onSuccess?: (data: { paymentUrl?: string; transactionRef?: string }) => void
  onError?: (error: Error) => void
  autoRedirect?: boolean
}) {
  const pushListing = usePushListing(options)

  return {
    ...pushListing,
    mutate: (params: {
      listingId: number
      paymentProvider: 'VNPAY' | 'PAYPAL' | 'MOMO'
    }) => {
      pushListing.mutate({
        ...params,
        useMembershipQuota: false,
      })
    },
    mutateAsync: async (params: {
      listingId: number
      paymentProvider: 'VNPAY' | 'PAYPAL' | 'MOMO'
    }) => {
      return pushListing.mutateAsync({
        ...params,
        useMembershipQuota: false,
      })
    },
  }
}

/**
 * Hook to push listing with membership quota only
 * Ensures useMembershipQuota is true
 *
 * @example
 * ```tsx
 * const pushWithQuota = usePushListingWithQuota()
 *
 * pushWithQuota.mutate({ listingId: 123 })
 * ```
 */
export function usePushListingWithQuota(options?: {
  onSuccess?: (data: { message?: string; success?: boolean }) => void
  onError?: (error: Error) => void
}) {
  const pushListing = usePushListing({ ...options, autoRedirect: false })

  return {
    ...pushListing,
    mutate: (params: { listingId: number }) => {
      pushListing.mutate({
        ...params,
        useMembershipQuota: true,
      })
    },
    mutateAsync: async (params: { listingId: number }) => {
      return pushListing.mutateAsync({
        ...params,
        useMembershipQuota: true,
      })
    },
  }
}
