import { useQuery } from '@tanstack/react-query'
import { ListingService } from '@/api/services'

/**
 * Hook to fetch a specific listing by ID for editing
 * GET /v1/listings/:id
 */
export const useGetListing = (listingId: string | number | null) => {
  return useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => {
      if (!listingId) throw new Error('Listing ID is required')
      return ListingService.getById(listingId)
    },
    enabled: !!listingId,
  })
}
