import { useQuery } from '@tanstack/react-query'
import { ListingService } from '@/api/services'

/**
 * Hook to fetch a specific draft by ID
 * GET /v1/listings/draft/:draftId
 */
export const useGetDraft = (draftId: string | number | null) => {
  return useQuery({
    queryKey: ['draft', draftId],
    queryFn: () => {
      if (!draftId) throw new Error('Draft ID is required')
      return ListingService.getDraft(draftId)
    },
    enabled: !!draftId,
  })
}
