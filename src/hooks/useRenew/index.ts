import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RenewService } from '@/api/services/renew.service'
import type {
  RenewListingRequest,
  RenewListingResponse,
} from '@/api/types/renew.type'

/**
 * Renew (gia hạn) an active listing by +30 days. Always quota-only — there is
 * no payment fallback on this hook. After a successful renew the membership/
 * quota caches are invalidated so the seller sees the decremented counter
 * without a manual refresh.
 */
export function useRenewListing() {
  const queryClient = useQueryClient()

  return useMutation<
    { data: RenewListingResponse; success: boolean },
    Error,
    RenewListingRequest
  >({
    mutationFn: async (request) => {
      const response = await RenewService.renewListing(request)
      if (!response.success) {
        throw new Error(response.message || 'Failed to renew listing')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quota', 'POST_SILVER'] })
      queryClient.invalidateQueries({ queryKey: ['quota', 'POST_GOLD'] })
      queryClient.invalidateQueries({ queryKey: ['quota', 'POST_DIAMOND'] })
      queryClient.invalidateQueries({ queryKey: ['quota', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['memberships', 'my'] })
    },
  })
}
