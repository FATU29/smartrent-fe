import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ListingService } from '@/api/services'
import type { CreateListingRequest } from '@/api/types/property.type'

export const useCreateDraft = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateListingRequest) =>
      ListingService.createDraft(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-drafts'] })
    },
  })
}
