import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { UserFollowService } from '@/api/services'
import { FollowStatusResponse, USER_FOLLOW_QUERY_KEYS } from '@/api/types'
import { useAuth } from '@/hooks/useAuth'

/**
 * Paginated list of users that the current viewer is following.
 * Used by the "Đang theo dõi" tab on the /following page.
 */
export const useFollowingPeople = (page = 0, size = 20) => {
  const { user, isAuthenticated } = useAuth()
  const userId = user?.userId ?? ''
  const queryClient = useQueryClient()

  const query = useQuery({
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

  // Seed the per-user follow-status cache so every FollowButton in the list
  // renders with the correct toggle state immediately, without firing one
  // /follow-status request per row. Backend sets isFollowing on each row; on
  // the viewer's own "following" tab this is always true.
  useEffect(() => {
    const rows = query.data?.content
    if (!rows || rows.length === 0) return
    for (const row of rows) {
      if (!row.userId) continue
      const key = USER_FOLLOW_QUERY_KEYS.status(row.userId)
      const existing = queryClient.getQueryData<FollowStatusResponse | null>(
        key,
      )
      if (existing) continue
      queryClient.setQueryData<FollowStatusResponse>(key, {
        userId: row.userId,
        isFollowing: row.isFollowing ?? true,
        followerCount: 0,
      })
    }
  }, [query.data, queryClient])

  return query
}
