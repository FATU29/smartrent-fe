import type { HousingPredictorRequest } from '@/api/types/ai.type'

import { CreateListingRequest } from '@/api/types'

export const buildHousingPredictorRequest = (
  propertyInfo: Partial<CreateListingRequest>,
  addressNames: { city: string; district: string; ward: string },
): HousingPredictorRequest | null => {
  if (
    !propertyInfo?.area ||
    propertyInfo.area <= 0 ||
    !propertyInfo?.address?.latitude ||
    !propertyInfo?.address?.longitude ||
    !propertyInfo?.productType
  ) {
    return null
  }

  if (!addressNames.city || !addressNames.district || !addressNames.ward) {
    return null
  }

  return {
    city: addressNames?.city,
    district: addressNames?.district,
    ward: addressNames?.ward,
    property_type: propertyInfo?.productType,
    area: Math.round(propertyInfo?.area),
    latitude: propertyInfo?.address?.latitude,
    longitude: propertyInfo?.address?.longitude,
  }
}

export const getAveragePrice = (min: number, max: number): number => {
  return Math.round((min + max) / 2)
}
