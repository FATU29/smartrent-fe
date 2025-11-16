import { useMutation } from '@tanstack/react-query'
import { AiService } from '@/api/services'
import type { HousingPredictorRequest } from '@/api/types/ai.type'

export const useHousingPredictor = () => {
  return useMutation({
    mutationFn: (request: HousingPredictorRequest) =>
      AiService.predictHousingPrice(request),
  })
}
