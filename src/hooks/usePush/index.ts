import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PushService } from '@/api/services/push.service'
import { QuotaService } from '@/api/services/quota.service'
import type {
  PushListingRequest,
  PushListingResponse,
} from '@/api/types/push.type'

/**
 * Hook to check push quota availability
 * @returns Query result with quota data
 * @example
 * ```tsx
 * const { data: quota, isLoading } = usePushQuota()
 * if (quota?.data) {
 *   console.log(`Available pushes: ${quota.data.totalAvailable}`)
 * }
 * ```
 */
export function usePushQuota() {
  return useQuery({
    queryKey: ['quota', 'PUSH'],
    queryFn: () => QuotaService.checkPushQuota(),
    staleTime: 0, // Always fetch fresh data
    gcTime: 1000 * 60, // Cache for 1 minute
  })
}

/**
 * Hook to push a listing
 * Automatically invalidates quota cache after successful push
 * @returns Mutation function and status
 * @example
 * ```tsx
 * const pushMutation = usePushListing()
 *
 * const handlePush = async () => {
 *   try {
 *     const result = await pushMutation.mutateAsync({
 *       listingId: 123,
 *       useMembershipQuota: true
 *     })
 *
 *     if (result.data?.paymentUrl) {
 *       window.location.href = result.data.paymentUrl
 *     } else {
 *       toast.success('Listing pushed successfully!')
 *     }
 *   } catch (error) {
 *     toast.error('Failed to push listing')
 *   }
 * }
 * ```
 */
export function usePushListing() {
  const queryClient = useQueryClient()

  return useMutation<
    { data: PushListingResponse; success: boolean },
    Error,
    PushListingRequest
  >({
    mutationFn: async (request: PushListingRequest) => {
      const response = await PushService.pushListing(request)

      if (!response.success) {
        throw new Error(response.message || 'Failed to push listing')
      }

      return response
    },
    onSuccess: (data) => {
      // Invalidate quota cache to refresh available pushes
      queryClient.invalidateQueries({ queryKey: ['quota', 'PUSH'] })

      // Also invalidate membership data as it might have changed
      queryClient.invalidateQueries({ queryKey: ['memberships', 'my'] })

      // If payment URL is returned, redirect to payment
      if (data.data?.paymentUrl) {
        window.location.href = data.data.paymentUrl
      }
    },
  })
}

/**
 * Hook to check all quotas (Silver, Gold, Diamond, Push)
 * @returns Query result with all quota data
 * @example
 * ```tsx
 * const { data: quotas } = useAllQuotas()
 * console.log(quotas?.data?.pushes?.totalAvailable)
 * ```
 */
export function useAllQuotas() {
  return useQuery({
    queryKey: ['quota', 'all'],
    queryFn: () => QuotaService.checkAllQuotas(),
    staleTime: 0,
    gcTime: 1000 * 60,
  })
}

/**
 * Hook to check specific quota by benefit type
 * @param benefitType - Benefit type (POST_SILVER, POST_GOLD, POST_DIAMOND, PUSH)
 * @returns Query result with quota data
 * @example
 * ```tsx
 * const { data: quota } = useQuota('PUSH')
 * ```
 */
export function useQuota(benefitType: string) {
  return useQuery({
    queryKey: ['quota', benefitType],
    queryFn: () => QuotaService.checkQuota(benefitType),
    staleTime: 0,
    gcTime: 1000 * 60,
    enabled: !!benefitType,
  })
}
