import { useMutation } from '@tanstack/react-query'
import { TakeDownService } from '@/api/services/takeDown.service'
import type { ApiResponse } from '@/configs/axios/types'
import type {
  TakeDownListingRequest,
  TakeDownResponse,
} from '@/api/types/takeDown.type'

export const useTakeDownListing = () => {
  return useMutation<
    ApiResponse<TakeDownResponse>,
    Error,
    TakeDownListingRequest
  >({
    mutationFn: (request) => TakeDownService.takeDownListing(request),
  })
}
