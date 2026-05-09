import { useQuery } from '@tanstack/react-query'
import { UserFollowService } from '@/api/services'
import { USER_FOLLOW_QUERY_KEYS } from '@/api/types'

/**
 * Read follow-status for a target user. Public endpoint, so this works for
 * anonymous users too — `isFollowing` will simply be `false`.
 */
export const useFollowStatus = (
  targetUserId: string | null | undefined,
  options: { enabled?: boolean } = {},
) => {
  const enabled =
    Boolean(targetUserId) && (options.enabled === undefined || options.enabled)

  return useQuery({
    queryKey: USER_FOLLOW_QUERY_KEYS.status(targetUserId ?? ''),
    queryFn: async () => {
      if (!targetUserId) return null
      const response = await UserFollowService.getStatus(targetUserId)
      return response?.data ?? null
    },
    enabled,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
