import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ListingService } from '@/api/services'
import type { CreateListingRequest } from '@/api/types/property.type'

export const useCreateDraft = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateListingRequest) => {
      console.log('📝 [CREATE DRAFT] Request Data:', {
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
        fullRequest: data,
      })
      return ListingService.createDraft(data)
    },
    onSuccess: (response) => {
      console.log('✅ [CREATE DRAFT] Success:', response)
      queryClient.invalidateQueries({ queryKey: ['my-drafts'] })
    },
    onError: (error) => {
      console.error('❌ [CREATE DRAFT] Error:', error)
    },
  })
}
