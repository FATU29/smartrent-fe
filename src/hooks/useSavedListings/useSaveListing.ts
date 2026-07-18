import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SavedListingService } from '@/api/services'
import { MAX_SAVED_LISTINGS, SAVED_LISTING_QUERY_KEYS } from '@/api/types'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'

const SAVED_LISTINGS_LIMIT_REACHED = 'Saved listings limit reached'

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

      // Fetch (or reuse a fresh cached) count so the cap is enforced even
      // when nothing else on the page has mounted the count query yet.
      const countResponse = await queryClient.fetchQuery({
        queryKey: SAVED_LISTING_QUERY_KEYS.count(),
        queryFn: () => SavedListingService.getCount(),
        staleTime: 60000,
      })
      const currentCount = countResponse?.data ?? 0
      if (currentCount >= MAX_SAVED_LISTINGS) {
        toast.warning(t('limitReached', { max: MAX_SAVED_LISTINGS }))
        throw new Error(SAVED_LISTINGS_LIMIT_REACHED)
      }

      return SavedListingService.save({ listingId })
    },
    onSuccess: (response) => {
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
      // Skip error toast if authentication or limit error (already shown)
      if (
        error instanceof Error &&
        (error.message === 'Authentication required' ||
          error.message === SAVED_LISTINGS_LIMIT_REACHED)
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
