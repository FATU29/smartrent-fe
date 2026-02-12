import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ListingService } from '@/api/services/listing.service'

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
