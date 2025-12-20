/**
 * Custom hooks for membership purchase with payment
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MembershipService } from '@/api/services'
import type {
  PurchaseMembershipRequest,
  PaymentProvider,
} from '@/api/types/membership.type'
import { redirectToPayment } from '@/utils/payment'

/**
 * Hook to initiate membership purchase with payment
 * Automatically redirects to payment URL if payment is required
 *
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * const purchaseMembership = useMembershipPurchase({
 *   onSuccess: (data) => {
 *     console.log('Payment initiated:', data.transactionRef)
 *   },
 *   onError: (error) => {
 *     toast.error(error.message)
 *   }
 * })
 *
 * const handlePurchase = () => {
 *   purchaseMembership.mutate({
 *     membershipId: 2,
 *     paymentProvider: 'VNPAY',
 *     userId: user.id
 *   })
 * }
 * ```
 */
export function useMembershipPurchase(options?: {
  onSuccess?: (data: {
    paymentUrl: string
    transactionRef: string
    amount: number
    provider: string
  }) => void
  onError?: (error: Error) => void
  autoRedirect?: boolean
}) {
  const queryClient = useQueryClient()
  const { autoRedirect = true, onSuccess, onError } = options || {}

  return useMutation({
    mutationFn: async ({
      membershipId,
      paymentProvider,
      userId,
    }: {
      membershipId: number
      paymentProvider: PaymentProvider
      userId: string
    }) => {
      const request: PurchaseMembershipRequest = {
        membershipId,
        paymentProvider,
      }

      const response = await MembershipService.purchaseMembership(
        request,
        userId,
      )

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to initiate purchase')
      }

      return response.data
    },
    onSuccess: (data, variables) => {
      // Redirect to payment URL if auto-redirect is enabled
      if (data.paymentUrl && autoRedirect) {
        redirectToPayment(data.paymentUrl)
      }

      // Invalidate membership queries to refresh data after payment
      queryClient.invalidateQueries({
        queryKey: ['memberships', 'my', variables.userId],
      })

      queryClient.invalidateQueries({
        queryKey: ['memberships', 'history', variables.userId],
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
 * Hook to initiate membership purchase without auto-redirect
 * Useful when you want to handle the payment URL manually
 *
 * @example
 * ```tsx
 * const initiatePurchase = useMembershipPurchaseNoRedirect()
 *
 * const handlePurchase = async () => {
 *   const result = await initiatePurchase.mutateAsync({
 *     membershipId: 2,
 *     paymentProvider: 'VNPAY',
 *     userId: user.id
 *   })
 *
 *   // Custom handling
 *   setPaymentUrl(result.paymentUrl)
 *   setShowPaymentModal(true)
 * }
 * ```
 */
export function useMembershipPurchaseNoRedirect() {
  return useMembershipPurchase({ autoRedirect: false })
}
