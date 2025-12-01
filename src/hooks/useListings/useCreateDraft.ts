import { useMutation } from '@tanstack/react-query'
import { ListingService } from '@/api/services'
import type { CreateListingRequest } from '@/api/types/property.type'

export const useCreateDraft = () => {
  return useMutation({
    mutationFn: (data: CreateListingRequest) =>
      ListingService.createDraft(data),
  })
}
