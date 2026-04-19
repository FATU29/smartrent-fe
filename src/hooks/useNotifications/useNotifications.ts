import { useCallback } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query'
import { NotificationService } from '@/api/services'
import type {
  NotificationItem,
  NotificationListResponse,
} from '@/api/types/notification.type'
import { useAuth } from '@/hooks/useAuth'
import { useNotificationWebSocket } from './useNotificationWebSocket'

const NOTIFICATIONS_KEY = ['notifications'] as const
const UNREAD_COUNT_KEY = ['notifications', 'unread-count'] as const
const PAGE_SIZE = 20

type NotificationInfiniteData = {
  pages: NotificationListResponse[]
  pageParams: number[]
}

const getRealtimeSeenIdsKey = (userId?: string) =>
  ['notifications', 'realtime-seen-ids', userId ?? 'anonymous'] as const

/**
 * Main notification hook combining REST queries + WebSocket realtime.
 * Returns notifications, unreadCount, markAsRead, markAllAsRead.
 */
export function useNotifications() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const realtimeSeenIdsKey = getRealtimeSeenIdsKey(user?.userId)

  // ── REST: Paginated notifications (infinite scroll) ──────────
  const {
    data: notificationsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingNotifications,
  } = useInfiniteQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: async ({ pageParam = 0 }) => {
      const response = await NotificationService.getNotifications(
        pageParam,
        PAGE_SIZE,
      )
      if (!response.success) {
        throw new Error(response.message ?? 'Failed to fetch notifications')
      }
      // Backend returns raw Spring Page (not wrapped in ApiResponse.data),
      // so page fields are spread at root level by apiRequest
      const page = (response.data ??
        response) as unknown as NotificationListResponse
      return {
        content: page.content ?? [],
        totalElements: page.totalElements ?? 0,
        totalPages: page.totalPages ?? 0,
        number: page.number ?? pageParam,
        size: page.size ?? PAGE_SIZE,
      } satisfies NotificationListResponse
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.totalPages <= 0) return undefined
      const nextPage = (lastPage.number ?? 0) + 1
      return nextPage < lastPage.totalPages ? nextPage : undefined
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30s
  })

  // Flatten pages into a single array and deduplicate by id
  const notifications: NotificationItem[] = (() => {
    const all = notificationsData?.pages.flatMap((page) => page.content) ?? []
    const seen = new Set<number>()
    return all.filter((n) => {
      if (seen.has(n.id)) return false
      seen.add(n.id)
      return true
    })
  })()

  // ── REST: Unread count ───────────────────────────────────────
  const { data: unreadCount = 0 } = useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: async () => {
      const response = await NotificationService.getUnreadCount()
      if (!response.success) throw new Error(response.message ?? 'Failed')
      // Backend returns raw { unreadCount: N } (not wrapped in ApiResponse.data)
      const data = (response.data ?? response) as unknown as {
        unreadCount: number
      }
      return data.unreadCount ?? 0
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Poll every 60s as backup
  })

  // ── Mutations: mark-as-read ──────────────────────────────────
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await NotificationService.markAsRead(id)
      if (!response.success) {
        throw new Error(
          response.message ?? 'Failed to mark notification as read',
        )
      }
      return response
    },
    onMutate: async (id: number) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY })
      await queryClient.cancelQueries({ queryKey: UNREAD_COUNT_KEY })

      const previousUnreadCount =
        queryClient.getQueryData<number>(UNREAD_COUNT_KEY)
      const previousNotifications =
        queryClient.getQueryData<NotificationInfiniteData>(NOTIFICATIONS_KEY)

      const shouldDecrementUnread =
        previousNotifications?.pages.some((page) =>
          page.content.some((n) => n.id === id && !n.isRead),
        ) ?? false

      if (shouldDecrementUnread) {
        queryClient.setQueryData<number>(UNREAD_COUNT_KEY, (prev) =>
          Math.max(0, (prev ?? 0) - 1),
        )
      }

      queryClient.setQueryData<NotificationInfiniteData>(
        NOTIFICATIONS_KEY,
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.map((n) =>
                n.id === id ? { ...n, isRead: true } : n,
              ),
            })),
          }
        },
      )

      return {
        previousUnreadCount,
        previousNotifications,
      }
    },
    onError: (_error, _id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData<NotificationInfiniteData>(
          NOTIFICATIONS_KEY,
          context.previousNotifications,
        )
      }
      if (typeof context?.previousUnreadCount !== 'undefined') {
        queryClient.setQueryData<number>(
          UNREAD_COUNT_KEY,
          context.previousUnreadCount,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await NotificationService.markAllAsRead()
      if (!response.success) {
        throw new Error(
          response.message ?? 'Failed to mark all notifications as read',
        )
      }
      return response
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY })
      await queryClient.cancelQueries({ queryKey: UNREAD_COUNT_KEY })

      const previousUnreadCount =
        queryClient.getQueryData<number>(UNREAD_COUNT_KEY)
      const previousNotifications =
        queryClient.getQueryData<NotificationInfiniteData>(NOTIFICATIONS_KEY)

      queryClient.setQueryData<number>(UNREAD_COUNT_KEY, 0)

      queryClient.setQueryData<NotificationInfiniteData>(
        NOTIFICATIONS_KEY,
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.map((n) => ({ ...n, isRead: true })),
            })),
          }
        },
      )

      return {
        previousUnreadCount,
        previousNotifications,
      }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData<NotificationInfiniteData>(
          NOTIFICATIONS_KEY,
          context.previousNotifications,
        )
      }
      if (typeof context?.previousUnreadCount !== 'undefined') {
        queryClient.setQueryData<number>(
          UNREAD_COUNT_KEY,
          context.previousUnreadCount,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY })
    },
  })

  // ── WebSocket: Realtime push ─────────────────────────────────
  const handleRealtimeNotification = useCallback(
    (notification: NotificationItem) => {
      let isDuplicateRealtimeEvent = false

      // Ignore duplicate websocket payloads for the same notification id.
      queryClient.setQueryData<number[]>(realtimeSeenIdsKey, (prev) => {
        const seenIds = prev ?? []
        if (seenIds.includes(notification.id)) {
          isDuplicateRealtimeEvent = true
          return seenIds
        }
        return [...seenIds, notification.id].slice(-300)
      })

      if (isDuplicateRealtimeEvent) return

      let shouldIncrementUnread = true

      // Prepend to the first page of cached data
      queryClient.setQueriesData<{
        pages: NotificationListResponse[]
        pageParams: number[]
      }>({ queryKey: NOTIFICATIONS_KEY }, (old) => {
        if (!old?.pages) return old

        const alreadyExists = old.pages.some((page) =>
          page.content.some((n) => n.id === notification.id),
        )
        if (alreadyExists) {
          shouldIncrementUnread = false
          return old
        }

        const firstPage = old.pages[0]
        if (!firstPage) return old

        return {
          ...old,
          pages: [
            {
              ...firstPage,
              content: [notification, ...firstPage.content],
              totalElements: firstPage.totalElements + 1,
            },
            ...old.pages.slice(1),
          ],
        }
      })

      // Increment unread count
      if (shouldIncrementUnread) {
        queryClient.setQueryData<number>(
          UNREAD_COUNT_KEY,
          (prev) => (prev ?? 0) + 1,
        )
      }
    },
    [queryClient, realtimeSeenIdsKey],
  )

  useNotificationWebSocket(
    isAuthenticated ? user?.userId : undefined,
    handleRealtimeNotification,
  )

  return {
    notifications,
    unreadCount,
    isLoading: isLoadingNotifications,
    // Actions
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    // Pagination
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  }
}
