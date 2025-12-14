import type { CreateListingRequest } from '@/api/types/property.type'

export const getFormDefaultValues = (
  propertyInfo: Partial<CreateListingRequest> | undefined,
): Partial<CreateListingRequest> => {
  return {
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
    // Package config fields
    vipType: propertyInfo?.vipType,
    postDate: propertyInfo?.postDate,
    expiryDate: propertyInfo?.expiryDate,
    durationDays: propertyInfo?.durationDays,
  }
}
