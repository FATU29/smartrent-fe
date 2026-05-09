import { useQuery } from '@tanstack/react-query'
import { UserFollowService } from '@/api/services'
import { USER_FOLLOW_QUERY_KEYS } from '@/api/types'
import { useAuth } from '@/hooks/useAuth'

/**
 * Paginated list of users that the current viewer is following.
 * Used by the "Đang theo dõi" tab on the /following page.
 */
export const useFollowingPeople = (page = 0, size = 20) => {
  const { user, isAuthenticated } = useAuth()
  const userId = user?.userId ?? ''

  return useQuery({
    queryKey: USER_FOLLOW_QUERY_KEYS.following(userId, page, size),
    queryFn: async () => {
      if (!userId) return null
      const response = await UserFollowService.getFollowing(userId, page, size)
      return response?.data ?? null
    },
    enabled: isAuthenticated && Boolean(userId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
