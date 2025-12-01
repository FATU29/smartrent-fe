import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ListingService } from '@/api/services'
import type { PublishDraftRequest } from '@/api/types'

/**
 * Hook to publish a draft listing
 * POST /v1/listings/draft/:draftId/publish
 */
export const usePublishDraft = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      draftId,
      data,
    }: {
      draftId: string | number
      data: PublishDraftRequest
    }) => ListingService.publishDraft(draftId, data),
    onSuccess: () => {
      // Invalidate drafts list since the draft will be deleted after publishing
      queryClient.invalidateQueries({ queryKey: ['drafts'] })
      // Invalidate listings list since a new listing was created
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
  })
}
