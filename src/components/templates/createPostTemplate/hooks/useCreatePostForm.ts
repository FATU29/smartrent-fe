import { useForm, type Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useCreatePost } from '@/contexts/createPost'
import { getCreatePostSchema } from '@/utils/createPost/validationSchemas'
import type { CreateListingRequest } from '@/api/types/property.type'

export const useCreatePostForm = () => {
  const { propertyInfo } = useCreatePost()

  const validationSchema = getCreatePostSchema()
  const form = useForm<Partial<CreateListingRequest>>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<
      Partial<CreateListingRequest>
    >,
    defaultValues: {
      categoryId: propertyInfo?.categoryId,
      title: propertyInfo?.title || '',
      description: propertyInfo?.description || '',
      address: propertyInfo?.address,
      area: propertyInfo?.area || 0,
      price: propertyInfo?.price || 0,
      priceUnit: propertyInfo?.priceUnit,
      productType: propertyInfo?.productType,
      furnishing: propertyInfo?.furnishing,
      bedrooms: propertyInfo?.bedrooms || 0,
      bathrooms: propertyInfo?.bathrooms || 0,
      roomCapacity: propertyInfo?.roomCapacity || 0,
      direction: propertyInfo?.direction,
      amenityIds: propertyInfo?.amenityIds || [],
      waterPrice: propertyInfo?.waterPrice,
      electricityPrice: propertyInfo?.electricityPrice,
      internetPrice: propertyInfo?.internetPrice,
      serviceFee: propertyInfo?.serviceFee,
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  return form
}
