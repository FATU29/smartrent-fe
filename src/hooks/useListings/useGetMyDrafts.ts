import { useQuery } from '@tanstack/react-query'
import { ListingService } from '@/api/services'
import {
  mapDraftsArrayBackendToFrontend,
  type DraftDetail,
} from '@/utils/property/mapDraftResponse'
import type { DraftListingResponse } from '@/api/types/draft.type'

export const useGetMyDrafts = () => {
  return useQuery({
    queryKey: ['my-drafts'],
    queryFn: async (): Promise<DraftDetail[]> => {
      const response = await ListingService.getMyDrafts({})

      if (!response.success || !response.data) {
        return []
      }

      // Backend returns array of draft items directly
      const drafts = response.data as unknown as DraftListingResponse[]
      return mapDraftsArrayBackendToFrontend(drafts)
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
