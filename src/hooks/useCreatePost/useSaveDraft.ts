import { useMutation } from '@tanstack/react-query'
import { ListingService } from '@/api/services/listing.service'
import type { CreateListingRequest } from '@/api/types/property.type'

interface SaveDraftParams {
  data: Partial<CreateListingRequest>
}

interface SaveDraftResponse {
  listingId: number
  status: string
}

/**
 * Hook to save listing as draft
 * Uses React Query mutation for API call
 */
export const useSaveDraft = () => {
  return useMutation<SaveDraftResponse, Error, SaveDraftParams>({
    mutationFn: async ({ data }: SaveDraftParams) => {
      const response = await ListingService.saveDraft(data)

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to save draft')
      }

      return response.data
    },
  })
}
