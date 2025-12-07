import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ListingService } from '@/api/services'
import type { DraftListingRequest } from '@/api/types'

/**
 * Hook to update a draft listing (auto-save)
 * POST /v1/listings/draft/:draftId
 */
export const useUpdateDraft = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      draftId,
      data,
    }: {
      draftId: string | number
      data: Partial<DraftListingRequest>
    }) => {
      console.log('📝 [UPDATE DRAFT] Request:', {
        draftId,
        updates: {
          title: data.title,
          description: data.description,
          listingType: data.listingType,
          categoryId: data.categoryId,
          productType: data.productType,
          price: data.price,
          priceUnit: data.priceUnit,
          address: data.address,
          area: data.area,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          direction: data.direction,
          furnishing: data.furnishing,
          roomCapacity: data.roomCapacity,
          waterPrice: data.waterPrice,
          electricityPrice: data.electricityPrice,
          internetPrice: data.internetPrice,
          serviceFee: data.serviceFee,
          amenityIds: data.amenityIds,
          mediaIds: data.mediaIds,
        },
        fullData: data,
      })
      return ListingService.updateDraft(draftId, data)
    },
    onSuccess: (response, variables) => {
      console.log('✅ [UPDATE DRAFT] Success:', {
        draftId: variables.draftId,
        response,
      })
      // Invalidate and refetch the specific draft
      queryClient.invalidateQueries({ queryKey: ['draft', variables.draftId] })
      // Also invalidate drafts list
      queryClient.invalidateQueries({ queryKey: ['drafts'] })
    },
    onError: (error, variables) => {
      console.error('❌ [UPDATE DRAFT] Error:', {
        draftId: variables.draftId,
        error,
      })
    },
  })
}
