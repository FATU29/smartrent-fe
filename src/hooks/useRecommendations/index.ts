import { useQuery } from '@tanstack/react-query'
import { RecommendationService } from '@/api/services/recommendation.service'

export const useSimilarRecommendations = (
  listingId?: number,
  topN = 10,
  enabled = true,
) => {
  return useQuery({
    queryKey: ['recommendations', 'similar', listingId, topN],
    queryFn: async () => {
      if (!listingId) {
        return null
      }
      const response = await RecommendationService.getSimilar(listingId, topN)
      return response.data
    },
    enabled: enabled && !!listingId,
    staleTime: 60 * 1000,
  })
}

export const usePersonalizedRecommendations = (topN = 5, enabled = true) => {
  return useQuery({
    queryKey: ['recommendations', 'personalized', topN],
    queryFn: async () => {
      const response = await RecommendationService.getPersonalized(topN)
      return response.data
    },
    enabled,
    retry: (failureCount, error: unknown) => {
      const maybeAxiosError = error as { response?: { status?: number } }
      if (maybeAxiosError.response?.status === 401) return false
      return failureCount < 2
    },
    staleTime: 2 * 60 * 1000,
  })
}
