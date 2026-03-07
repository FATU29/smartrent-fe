import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ListingService } from '@/api/services/listing.service'
import type { CreateListingRequest } from '@/api/types/property.type'

interface UpdateAndResubmitParams {
  listingId: string | number
  data: Partial<CreateListingRequest>
  notes?: string
}

/**
 * Hook to update listing and resubmit for review in a single operation
 * PUT /v1/listings/:id/update-and-resubmit
 */
export const useUpdateAndResubmitListing = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ listingId, data, notes }: UpdateAndResubmitParams) => {
      const response = await ListingService.updateAndResubmit(
        listingId,
        data,
        notes,
      )
      if (!response.success) {
        throw new Error(
          response.message || 'Failed to update and resubmit listing',
        )
      }
      return response
    },
    onSuccess: (_, variables) => {
      // Invalidate listing queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['listing', variables.listingId],
      })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
    },
  })
}
