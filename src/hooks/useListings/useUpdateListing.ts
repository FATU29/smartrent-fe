import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ListingService } from '@/api/services'
import type { CreateListingRequest } from '@/api/types'

/**
 * Hook to update an existing listing
 * PUT /v1/listings/:id
 */
export const useUpdateListing = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      listingId,
      data,
    }: {
      listingId: string | number
      data: CreateListingRequest
    }) => ListingService.update(listingId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['listing', variables.listingId],
      })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
    },
  })
}
