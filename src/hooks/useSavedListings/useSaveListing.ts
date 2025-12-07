import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SavedListingService } from '@/api/services'
import { SAVED_LISTING_QUERY_KEYS } from '@/api/types'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'

/**
 * Hook to save a listing to favorites
 * POST /v1/saved-listings
 */
export const useSaveListing = () => {
  const queryClient = useQueryClient()
  const t = useTranslations('savedListings.messages')
  const { isAuthenticated } = useAuth()

  return useMutation({
    mutationFn: async (listingId: number) => {
      // Check authentication before making API call
      if (!isAuthenticated) {
        toast.error(t('loginRequired'))
        throw new Error('Authentication required')
      }
      return SavedListingService.save({ listingId })
    },
    onSuccess: (response, listingId) => {
      // Check if the API request was actually successful
      if (!response?.success) {
        // Handle as error if success is false
        const code = response?.code
        const message = response?.message

        switch (code) {
          case '1005':
            toast.error(t('notFound'))
            break
          case '2001':
            toast.info(t('alreadySaved'))
            break
          case '1002':
            toast.error(t('loginRequired'))
            break
          default:
            toast.error(message || t('saveFailed'))
        }
        return
      }

      // Show success toast only if truly successful
      toast.success(t('savedSuccess'))

      // Invalidate check query for this listing
      queryClient.invalidateQueries({
        queryKey: SAVED_LISTING_QUERY_KEYS.check(listingId),
      })
      // Invalidate saved listings list
      queryClient.invalidateQueries({
        queryKey: SAVED_LISTING_QUERY_KEYS.lists(),
      })
      // Invalidate count
      queryClient.invalidateQueries({
        queryKey: SAVED_LISTING_QUERY_KEYS.count(),
      })
    },
    onError: (error: unknown) => {
      // Skip error toast if authentication error (already shown)
      if (
        error instanceof Error &&
        error.message === 'Authentication required'
      ) {
        return
      }

      // Let errors bubble up for better debugging
      console.error('Save listing error:', error)

      if (!isAxiosError(error)) {
        toast.error(t('saveFailed'))
        throw error // Re-throw for debugging
      }

      const code = error.response?.data?.code
      const message = error.response?.data?.message

      switch (code) {
        case '1005':
          toast.error(t('notFound'))
          break
        case '2001':
          toast.info(t('alreadySaved'))
          break
        case '1002':
          toast.error(t('loginRequired'))
          break
        default:
          toast.error(message || t('saveFailed'))
      }
    },
  })
}
