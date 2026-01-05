import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MembershipService } from '@/api/services'
import type { UpgradeRequest } from '@/api/types/membership.type'
import { redirectToPayment } from '@/utils/payment'

//==================== AVAILABLE UPGRADES ====================
/**
 * Hook to fetch all available upgrade options for the current user
 */
export const useAvailableUpgrades = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['memberships', 'upgrades', 'available', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, success } =
        await MembershipService.getAvailableUpgrades(userId)
      if (!success) {
        throw new Error('Failed to fetch available upgrades')
      }
      return data || []
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // Consider data fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}

//==================== UPGRADE PREVIEW ====================
/**
 * Hook to fetch upgrade preview for a specific target membership
 */
export const useUpgradePreview = (
  targetMembershipId: number | null,
  userId: string | undefined,
) => {
  return useQuery({
    queryKey: [
      'memberships',
      'upgrades',
      'preview',
      targetMembershipId,
      userId,
    ],
    queryFn: async () => {
      if (!userId || !targetMembershipId) return null
      const { data, success } = await MembershipService.getUpgradePreview(
        targetMembershipId,
        userId,
      )
      if (!success) {
        throw new Error('Failed to fetch upgrade preview')
      }
      return data || null
    },
    enabled: !!userId && !!targetMembershipId,
    staleTime: 0, // No cache - always fresh
    gcTime: 1 * 60 * 1000, // Keep in cache for 1 minute
  })
}

//==================== INITIATE UPGRADE ====================
/**
 * Hook to initiate membership upgrade with payment
 */
export const useInitiateUpgrade = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      request,
      userId,
    }: {
      request: UpgradeRequest
      userId: string
    }) => {
      const response = await MembershipService.initiateUpgrade(request, userId)
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to initiate upgrade')
      }
      return response.data
    },
    onSuccess: (data, variables) => {
      // Redirect to payment URL if present and payment is required
      if (data.paymentUrl && data.status === 'PENDING_PAYMENT') {
        redirectToPayment(data.paymentUrl)
      }

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['memberships', 'my', variables.userId],
      })
      queryClient.invalidateQueries({
        queryKey: ['memberships', 'history', variables.userId],
      })
      queryClient.invalidateQueries({
        queryKey: ['memberships', 'upgrades', 'available', variables.userId],
      })
    },
  })
}
