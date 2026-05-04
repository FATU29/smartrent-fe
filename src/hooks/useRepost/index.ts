import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RepostService } from '@/api/services/repost.service'
import type {
  RepostListingRequest,
  RepostListingResponse,
} from '@/api/types/repost.type'
import { redirectToPayment, setPendingTransactionRef } from '@/utils/payment'

/**
 * Repost (đăng lại) an expired listing. On success either reactivates the
 * listing immediately (quota path) or returns a paymentUrl + transactionRef
 * which we follow to redirect the user to the payment provider (direct path).
 */
export function useRepostListing() {
  const queryClient = useQueryClient()

  return useMutation<
    { data: RepostListingResponse; success: boolean },
    Error,
    RepostListingRequest
  >({
    mutationFn: async (request) => {
      const response = await RepostService.repostListing(request)
      if (!response.success) {
        throw new Error(response.message || 'Failed to repost listing')
      }
      return response
    },
    onSuccess: (data) => {
      // Quota balances may have changed — invalidate every post-quota cache
      queryClient.invalidateQueries({ queryKey: ['quota', 'POST_SILVER'] })
      queryClient.invalidateQueries({ queryKey: ['quota', 'POST_GOLD'] })
      queryClient.invalidateQueries({ queryKey: ['quota', 'POST_DIAMOND'] })
      queryClient.invalidateQueries({ queryKey: ['quota', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['memberships', 'my'] })

      const paymentUrl = data.data?.paymentUrl
      if (paymentUrl) {
        const ref = data.data?.transactionRef ?? data.data?.transactionId
        setPendingTransactionRef(ref)
        redirectToPayment(paymentUrl)
      }
    },
  })
}
