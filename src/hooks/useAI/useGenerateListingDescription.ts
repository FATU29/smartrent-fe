import { useMutation } from '@tanstack/react-query'
import { AiService } from '@/api/services'
import type { ListingDescriptionRequest } from '@/api/types/ai.type'

export const useGenerateListingDescription = () => {
  return useMutation({
    mutationFn: (request: ListingDescriptionRequest) =>
      AiService.generateListingDescription(request),
  })
}
