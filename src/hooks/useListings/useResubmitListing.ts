import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ListingService } from '@/api/services/listing.service'
import {
  LISTING_ERROR_CODES,
  ResubmitNotAllowedError,
} from '@/api/types/property.type'

interface ResubmitParams {
  listingId: string | number
  notes?: string
}

export const useResubmitListing = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ listingId, notes }: ResubmitParams) => {
      const response = await ListingService.resubmitForReview(listingId, notes)
      if (!response.success) {
        if (response.code === LISTING_ERROR_CODES.RESUBMIT_NOT_ALLOWED) {
          throw new ResubmitNotAllowedError(
            response.message || 'Listing cannot be resubmitted',
          )
        }
        throw new Error(response.message || 'Failed to resubmit listing')
      }
      return response
    },
    onSuccess: () => {
      // Invalidate listing queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
    },
  })
}
