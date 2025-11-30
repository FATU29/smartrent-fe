import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MembershipService } from '@/api/services'
import type { PurchaseMembershipRequest } from '@/api/types/membership.type'

export const useMembershipPackages = () => {
  return useQuery({
    queryKey: ['memberships'],
    queryFn: async () => {
      const { data, success } = await MembershipService.getAllPackages()
      if (!success || !data) {
        throw new Error('Failed to fetch membership packages')
      }

      return data?.data || []
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  })
}

export const useMembershipPackage = (membershipId: number | undefined) => {
  return useQuery({
    queryKey: ['memberships', 'package', membershipId],
    queryFn: async () => {
      if (!membershipId) return null
      const { data, success } =
        await MembershipService.getPackageById(membershipId)
      if (!success || !data) {
        throw new Error(`Failed to fetch membership package: ${membershipId}`)
      }
      return data
    },
    enabled: !!membershipId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useMyMembership = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['memberships', 'my', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data, success } = await MembershipService.getMyMembership(userId)
      if (!success) {
        throw new Error('Failed to fetch user membership')
      }
      return data || null
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on component mount if data exists
    refetchOnReconnect: false, // Prevent refetch on reconnect
    retry: 1, // Limit retry attempts
  })
}

export const useMembershipHistory = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['memberships', 'history', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, success } =
        await MembershipService.getMembershipHistory(userId)
      if (!success || !data) {
        throw new Error('Failed to fetch membership history')
      }
      return data
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export const usePurchaseMembership = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      request,
      userId,
    }: {
      request: PurchaseMembershipRequest
      userId: string
    }) => {
      const response = await MembershipService.purchaseMembership(
        request,
        userId,
      )
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to purchase membership')
      }
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['memberships', 'my', variables.userId],
      })
      queryClient.invalidateQueries({
        queryKey: ['memberships', 'history', variables.userId],
      })
    },
  })
}

/**
 * Hook to cancel a membership
 */
export const useCancelMembership = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userMembershipId,
      userId,
    }: {
      userMembershipId: number
      userId: string
    }) => {
      const response = await MembershipService.cancelMembership(
        userMembershipId,
        userId,
      )
      if (!response.success) {
        throw new Error(response.message || 'Failed to cancel membership')
      }
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['memberships', 'my', variables.userId],
      })
      queryClient.invalidateQueries({
        queryKey: ['memberships', 'history', variables.userId],
      })
    },
  })
}
