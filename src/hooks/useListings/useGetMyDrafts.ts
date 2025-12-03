import { useQuery } from '@tanstack/react-query'
import { ListingService } from '@/api/services'
import {
  mapDraftsArrayBackendToFrontend,
  type DraftBackendItem,
  type DraftDetail,
} from '@/utils/property/mapDraftResponse'

export const useGetMyDrafts = () => {
  return useQuery({
    queryKey: ['my-drafts'],
    queryFn: async (): Promise<DraftDetail[]> => {
      const response = await ListingService.getMyDrafts({})

      if (!response.success || !response.data) {
        return []
      }

      // Backend returns array of draft items directly
      const drafts = response.data as unknown as DraftBackendItem[]
      return mapDraftsArrayBackendToFrontend(drafts)
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
