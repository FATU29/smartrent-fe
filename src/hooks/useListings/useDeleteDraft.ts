import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ListingService } from '@/api/services'

export const useDeleteDraft = () => {
  const queryClient = useQueryClient()

  return useMutation({
    // string | number, matching ListingService.deleteDraft — draft ids come from
    // the router as strings but straight off the API as numbers.
    mutationFn: (draftId: string | number) =>
      ListingService.deleteDraft(draftId),
    onSuccess: () => {
      // Invalidate drafts query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['my-drafts'] })
    },
  })
}
