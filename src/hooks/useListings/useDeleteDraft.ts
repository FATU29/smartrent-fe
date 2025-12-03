import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ListingService } from '@/api/services'

export const useDeleteDraft = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (draftId: string) => ListingService.deleteDraft(draftId),
    onSuccess: () => {
      // Invalidate drafts query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['my-drafts'] })
    },
  })
}
