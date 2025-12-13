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
    }) => {
      return ListingService.updateDraft(draftId, data)
    },
    onSuccess: (response, variables) => {
      console.log('✅ [UPDATE DRAFT] Success:', {
        draftId: variables.draftId,
        response,
      })
      queryClient.invalidateQueries({ queryKey: ['draft', variables.draftId] })
      queryClient.invalidateQueries({ queryKey: ['drafts'] })
    },
    onError: (error, variables) => {
      console.error('❌ [UPDATE DRAFT] Error:', {
        draftId: variables.draftId,
        error,
      })
    },
  })
}
