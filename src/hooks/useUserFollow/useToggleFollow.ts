import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import { useTranslations } from 'next-intl'
import { UserFollowService } from '@/api/services'
import { FollowStatusResponse, USER_FOLLOW_QUERY_KEYS } from '@/api/types'
import { useAuth } from '@/hooks/useAuth'
import { useAuthDialog } from '@/contexts/authDialog'
import { useFollowStatus } from './useFollowStatus'

interface UseToggleFollowOptions {
  /** When the user clicks follow while logged out, return them here after auth. */
  returnUrlAfterAuth?: string
}

/**
 * Combined follow/unfollow hook with optimistic UI.
 * Mirrors useToggleSaveListing's shape so consumers can pick whichever feels native.
 */
export const useToggleFollow = (
  targetUserId: string | null | undefined,
  options: UseToggleFollowOptions = {},
) => {
  const t = useTranslations('userFollow.messages')
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuth()
  const { openAuth } = useAuthDialog()

  const { data: status, isLoading: isStatusLoading } =
    useFollowStatus(targetUserId)

  const isFollowing = Boolean(status?.isFollowing)
  const followerCount = status?.followerCount ?? 0

  const isSelf = Boolean(
    targetUserId && user?.userId && targetUserId === user.userId,
  )

  const writeStatus = useCallback(
    (next: FollowStatusResponse | null) => {
      if (!targetUserId) return
      queryClient.setQueryData(
        USER_FOLLOW_QUERY_KEYS.status(targetUserId),
        next,
      )
    },
    [queryClient, targetUserId],
  )

  const invalidateLists = useCallback(() => {
    // The following / feed pages cache list data — refresh both so UI matches server.
    queryClient.invalidateQueries({
      queryKey: [...USER_FOLLOW_QUERY_KEYS.all, 'following'],
    })
    queryClient.invalidateQueries({ queryKey: ['user-follow', 'feed'] })
  }, [queryClient])

  const followMutation = useMutation({
    mutationFn: () => UserFollowService.follow(targetUserId as string),
    onSuccess: (response) => {
      if (response?.success) {
        writeStatus(response.data)
        invalidateLists()
        toast.success(t('followed'))
      } else {
        toast.error(response?.message || t('followFailed'))
      }
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        const message = error.response?.data?.message
        toast.error(message || t('followFailed'))
      } else {
        toast.error(t('followFailed'))
      }
    },
  })

  const unfollowMutation = useMutation({
    mutationFn: () => UserFollowService.unfollow(targetUserId as string),
    onSuccess: (response) => {
      if (response?.success) {
        writeStatus(response.data)
        invalidateLists()
        toast.success(t('unfollowed'))
      } else {
        toast.error(response?.message || t('unfollowFailed'))
      }
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        const message = error.response?.data?.message
        toast.error(message || t('unfollowFailed'))
      } else {
        toast.error(t('unfollowFailed'))
      }
    },
  })

  const isLoading =
    isStatusLoading || followMutation.isPending || unfollowMutation.isPending

  const toggleFollow = useCallback(async () => {
    if (!targetUserId || isLoading) return
    if (isSelf) return

    if (!isAuthenticated) {
      openAuth('login', options.returnUrlAfterAuth)
      return
    }

    const previous = status
    const optimistic: FollowStatusResponse = {
      userId: targetUserId,
      isFollowing: !isFollowing,
      followerCount: Math.max(0, followerCount + (isFollowing ? -1 : 1)),
    }
    writeStatus(optimistic)

    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync()
      } else {
        await followMutation.mutateAsync()
      }
    } catch {
      // Mutation onError already toasts. Revert optimistic state.
      writeStatus(previous ?? null)
    }
  }, [
    targetUserId,
    isLoading,
    isSelf,
    isAuthenticated,
    openAuth,
    options.returnUrlAfterAuth,
    status,
    isFollowing,
    followerCount,
    writeStatus,
    unfollowMutation,
    followMutation,
  ])

  return {
    isFollowing,
    followerCount,
    isLoading,
    isSelf,
    toggleFollow,
  }
}
