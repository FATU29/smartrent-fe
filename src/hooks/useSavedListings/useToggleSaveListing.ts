import { useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSaveListing } from './useSaveListing'
import { useUnsaveListing } from './useUnsaveListing'
import { useCheckSavedListing } from './useCheckSavedListing'
import { SAVED_LISTING_QUERY_KEYS } from '@/api/types'

/**
 * Combined hook for save/unsave toggle functionality
 * Uses API to check initial saved status and optimistic UI updates
 * The saved state is synced with the server via check API
 */
export const useToggleSaveListing = (listingId: number | null | undefined) => {
  const queryClient = useQueryClient()
  const { data: isSaved = false, isLoading: isChecking } =
    useCheckSavedListing(listingId)
  const saveMutation = useSaveListing()
  const unsaveMutation = useUnsaveListing()

  const isLoading =
    isChecking || saveMutation.isPending || unsaveMutation.isPending

  // Invalidate check query when mutations succeed to sync with server
  useEffect(() => {
    if (saveMutation.isSuccess && listingId) {
      queryClient.setQueryData(SAVED_LISTING_QUERY_KEYS.check(listingId), true)
      queryClient.invalidateQueries({
        queryKey: SAVED_LISTING_QUERY_KEYS.check(listingId),
      })
    }
  }, [saveMutation.isSuccess, listingId, queryClient])

  useEffect(() => {
    if (unsaveMutation.isSuccess && listingId) {
      queryClient.setQueryData(SAVED_LISTING_QUERY_KEYS.check(listingId), false)
      queryClient.invalidateQueries({
        queryKey: SAVED_LISTING_QUERY_KEYS.check(listingId),
      })
    }
  }, [unsaveMutation.isSuccess, listingId, queryClient])

  const toggleSave = useCallback(async () => {
    if (!listingId || isLoading) return

    // Optimistic update
    const previousState = isSaved
    queryClient.setQueryData(
      SAVED_LISTING_QUERY_KEYS.check(listingId),
      !previousState,
    )

    try {
      if (previousState) {
        await unsaveMutation.mutateAsync(listingId)
      } else {
        await saveMutation.mutateAsync(listingId)
      }
    } catch (error) {
      // Revert optimistic update on error
      queryClient.setQueryData(
        SAVED_LISTING_QUERY_KEYS.check(listingId),
        previousState,
      )
      // Error handling is done in the mutation hooks
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error toggling save:', error)
      }
    }
  }, [listingId, isSaved, isLoading, saveMutation, unsaveMutation, queryClient])

  const saveListing = useCallback(() => {
    if (!listingId || isLoading) return
    queryClient.setQueryData(SAVED_LISTING_QUERY_KEYS.check(listingId), true)
    saveMutation.mutate(listingId, {
      onError: () => {
        queryClient.setQueryData(
          SAVED_LISTING_QUERY_KEYS.check(listingId),
          false,
        )
      },
    })
  }, [listingId, isLoading, saveMutation, queryClient])

  const unsaveListing = useCallback(() => {
    if (!listingId || isLoading) return
    queryClient.setQueryData(SAVED_LISTING_QUERY_KEYS.check(listingId), false)
    unsaveMutation.mutate(listingId, {
      onError: () => {
        queryClient.setQueryData(
          SAVED_LISTING_QUERY_KEYS.check(listingId),
          true,
        )
      },
    })
  }, [listingId, isLoading, unsaveMutation, queryClient])

  return {
    isSaved,
    isLoading,
    toggleSave,
    saveListing,
    unsaveListing,
  }
}
