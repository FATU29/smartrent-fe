import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { RecentlyViewedService } from '@/api/services'
import {
  getRecentlyViewed,
  addToRecentlyViewed,
  removeFromRecentlyViewed,
  clearRecentlyViewed,
  type RecentlyViewedListing,
  updateRecentlyViewedFromServer,
} from '@/utils/localstorage/recentlyViewed'
import {
  RECENTLY_VIEWED_QUERY_KEYS,
  type RecentlyViewedItemResponse,
} from '@/api/types/recently-viewed.type'

export const useRecentlyViewed = () => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const hasSyncedRef = useRef(false)
  const [updateTrigger, setUpdateTrigger] = useState(0)

  // GET query - fetch from server when authenticated
  const {
    data: apiData,
    isLoading: isLoadingFromApi,
    refetch: refetchFromApi,
  } = useQuery({
    queryKey: RECENTLY_VIEWED_QUERY_KEYS.list(),
    queryFn: async () => {
      const response = await RecentlyViewedService.get()
      if (response.success && response.data) {
        updateRecentlyViewedFromServer(response.data)
        return response.data
      }
      return []
    },
    enabled: isAuthenticated,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Sync mutation - sync localStorage with server
  const syncMutation = useMutation({
    mutationFn: async (localData: RecentlyViewedListing[]) => {
      const localApiData = localData.map((item) => ({
        listingId: Number(item.listingId),
        viewedAt: item.viewedAt,
      }))

      const response = await RecentlyViewedService.sync({
        listings: localApiData,
      })

      if (response.success && response.data) {
        updateRecentlyViewedFromServer(response.data)
        queryClient.setQueryData(
          RECENTLY_VIEWED_QUERY_KEYS.list(),
          response.data,
        )
        return response.data
      }
      return []
    },
  })

  // Store mutation.mutate in a ref to avoid dependency issues
  const syncMutateRef = useRef(syncMutation.mutate)
  useEffect(() => {
    syncMutateRef.current = syncMutation.mutate
  }, [syncMutation.mutate])

  // Auto-sync on login: merge localStorage with server data
  useEffect(() => {
    if (!isAuthenticated) {
      hasSyncedRef.current = false
      return
    }

    if (hasSyncedRef.current || isLoadingFromApi || apiData === undefined) {
      return
    }

    const localData = getRecentlyViewed()

    if (localData.length === 0) {
      hasSyncedRef.current = true
      return
    }

    const serverListingIds = new Set(
      apiData.map((item: RecentlyViewedItemResponse) =>
        String(item.listing.listingId),
      ),
    )
    const hasNewLocalData = localData.some(
      (item) => !serverListingIds.has(String(item.listingId)),
    )

    if (!hasNewLocalData) {
      hasSyncedRef.current = true
      return
    }

    hasSyncedRef.current = true
    const localApiData = localData.map((item) => ({
      listingId: Number(item.listingId),
      viewedAt: item.viewedAt,
    }))

    RecentlyViewedService.sync({ listings: localApiData })
      .then(
        (response: {
          success: boolean
          data?: RecentlyViewedItemResponse[]
        }) => {
          if (response.success && response.data) {
            updateRecentlyViewedFromServer(response.data)
            queryClient.setQueryData(
              RECENTLY_VIEWED_QUERY_KEYS.list(),
              response.data,
            )
            setUpdateTrigger((prev) => prev + 1)
          }
        },
      )
      .catch((error: unknown) => {
        console.error('Error syncing recently viewed on login:', error)
      })
  }, [isAuthenticated, isLoadingFromApi, apiData, queryClient])

  // Get recently viewed from localStorage (reactive to updateTrigger)
  const recentlyViewed = useMemo(() => {
    return getRecentlyViewed()
  }, [updateTrigger])

  // Add listing to recently viewed
  const addListing = useCallback(
    (listing: Omit<RecentlyViewedListing, 'viewedAt'>) => {
      // Always add to localStorage first (works for both authenticated and unauthenticated)
      addToRecentlyViewed(listing)
      setUpdateTrigger((prev) => prev + 1)

      // If authenticated, sync with server in background (don't await)
      if (isAuthenticated) {
        const localData = getRecentlyViewed()
        syncMutateRef.current(localData, {
          onError: (error) => {
            console.error('Error syncing listing:', error)
          },
        })
      }
    },
    [isAuthenticated],
  )

  // Remove listing from recently viewed
  const removeListing = useCallback(
    (listingId: string | number) => {
      removeFromRecentlyViewed(listingId)
      setUpdateTrigger((prev) => prev + 1)

      // If authenticated, sync with server in background
      if (isAuthenticated) {
        const localData = getRecentlyViewed()
        syncMutateRef.current(localData, {
          onError: (error) => {
            console.error('Error syncing remove listing:', error)
          },
        })
      }
    },
    [isAuthenticated],
  )

  // Clear all recently viewed
  const clearAll = useCallback(() => {
    clearRecentlyViewed()
    setUpdateTrigger((prev) => prev + 1)

    // If authenticated, sync with server in background
    if (isAuthenticated) {
      syncMutateRef.current([], {
        onError: (error) => {
          console.error('Error syncing clear all:', error)
        },
      })
    }
  }, [isAuthenticated])

  // Check if listing is viewed
  const isViewed = useCallback(
    (listingId: string | number) => {
      return recentlyViewed.some(
        (item) => String(item.listingId) === String(listingId),
      )
    },
    [recentlyViewed],
  )

  // Refresh from server or localStorage
  const refresh = useCallback(async () => {
    if (isAuthenticated) {
      await refetchFromApi()
      setUpdateTrigger((prev) => prev + 1)
    } else {
      setUpdateTrigger((prev) => prev + 1)
    }
  }, [isAuthenticated, refetchFromApi])

  // Manual sync with server
  const sync = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const localData = getRecentlyViewed()
      await syncMutation.mutateAsync(localData)
      setUpdateTrigger((prev) => prev + 1)
    } catch (error) {
      console.error('Error manual sync:', error)
    }
  }, [isAuthenticated, syncMutation.mutateAsync])

  return {
    recentlyViewed,
    addListing,
    removeListing,
    clearAll,
    isViewed,
    refresh,
    sync,
    isLoading: isLoadingFromApi || syncMutation.isPending,
    isSyncing: syncMutation.isPending,
  }
}
