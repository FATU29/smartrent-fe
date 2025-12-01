import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ListingService } from '@/api/services'
import type { DraftListingRequest } from '@/api/types'

/**
 * Hook to update a draft listing (auto-save)
 * POST /v1/listings/draft/:draftId
 */
export const useUpdateDraft = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      draftId,
      data,
    }: {
      draftId: string | number
      data: Partial<DraftListingRequest>
    }) => ListingService.updateDraft(draftId, data),
    onSuccess: (response, variables) => {
      // Invalidate and refetch the specific draft
      queryClient.invalidateQueries({ queryKey: ['draft', variables.draftId] })
      // Also invalidate drafts list
      queryClient.invalidateQueries({ queryKey: ['drafts'] })
    },
  })
}
