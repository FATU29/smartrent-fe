import { useCallback } from 'react'
import { useSaveListing } from './useSaveListing'
import { useUnsaveListing } from './useUnsaveListing'
import { useCheckSavedListing } from './useCheckSavedListing'

/**
 * Combined hook for save/unsave toggle functionality
 * Provides optimistic UI updates and error handling
 */
export const useToggleSaveListing = (listingId: number | null | undefined) => {
  const { data: checkData, isLoading: isChecking } =
    useCheckSavedListing(listingId)
  const saveMutation = useSaveListing()
  const unsaveMutation = useUnsaveListing()

  const isSaved = checkData?.data ?? false
  const isLoading =
    isChecking || saveMutation.isPending || unsaveMutation.isPending

  const toggleSave = useCallback(async () => {
    if (!listingId || isLoading) return

    try {
      if (isSaved) {
        await unsaveMutation.mutateAsync(listingId)
      } else {
        await saveMutation.mutateAsync(listingId)
      }
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Error toggling save:', error)
    }
  }, [listingId, isSaved, isLoading, saveMutation, unsaveMutation])

  return {
    isSaved,
    isLoading,
    toggleSave,
    saveListing: () => listingId && saveMutation.mutate(listingId),
    unsaveListing: () => listingId && unsaveMutation.mutate(listingId),
  }
}
