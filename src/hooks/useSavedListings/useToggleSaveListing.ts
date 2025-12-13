import { useCallback, useState, useEffect } from 'react'
import { useSaveListing } from './useSaveListing'
import { useUnsaveListing } from './useUnsaveListing'

/**
 * Combined hook for save/unsave toggle functionality
 * Uses optimistic UI updates - no API call to check saved status
 * The saved state is managed locally and updated on successful save/unsave actions
 */
export const useToggleSaveListing = (listingId: number | null | undefined) => {
  const [isSaved, setIsSaved] = useState(false)
  const saveMutation = useSaveListing()
  const unsaveMutation = useUnsaveListing()

  const isLoading = saveMutation.isPending || unsaveMutation.isPending

  // Update local state when mutations succeed
  useEffect(() => {
    if (saveMutation.isSuccess) {
      setIsSaved(true)
    }
  }, [saveMutation.isSuccess])

  useEffect(() => {
    if (unsaveMutation.isSuccess) {
      setIsSaved(false)
    }
  }, [unsaveMutation.isSuccess])

  // Reset state when listingId changes
  useEffect(() => {
    setIsSaved(false)
  }, [listingId])

  const toggleSave = useCallback(async () => {
    if (!listingId || isLoading) return

    // Optimistic update
    const previousState = isSaved
    setIsSaved(!previousState)

    try {
      if (previousState) {
        await unsaveMutation.mutateAsync(listingId)
      } else {
        await saveMutation.mutateAsync(listingId)
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsSaved(previousState)
      // Error handling is done in the mutation hooks
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error toggling save:', error)
      }
    }
  }, [listingId, isSaved, isLoading, saveMutation, unsaveMutation])

  const saveListing = useCallback(() => {
    if (!listingId || isLoading) return
    setIsSaved(true)
    saveMutation.mutate(listingId, {
      onError: () => {
        setIsSaved(false)
      },
    })
  }, [listingId, isLoading, saveMutation])

  const unsaveListing = useCallback(() => {
    if (!listingId || isLoading) return
    setIsSaved(false)
    unsaveMutation.mutate(listingId, {
      onError: () => {
        setIsSaved(true)
      },
    })
  }, [listingId, isLoading, unsaveMutation])

  return {
    isSaved,
    isLoading,
    toggleSave,
    saveListing,
    unsaveListing,
  }
}
