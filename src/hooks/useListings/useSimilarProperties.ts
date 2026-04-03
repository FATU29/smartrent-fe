import { useQuery } from '@tanstack/react-query'
import { ListingService } from '@/api/services/listing.service'
import { ListingDetail, VipType } from '@/api/types'

interface UseSimilarPropertiesOptions {
  listingId?: number | string
  vipType?: VipType
  provinceId?: number | string
  wardId?: number | string
  districtId?: number
  isLegacy?: boolean
  enabled?: boolean
  limit?: number
}

/**
 * Hook to fetch similar properties based on VIP type and location
 * Uses the listing search API with filters for same VIP type and address
 */
export const useSimilarProperties = (options: UseSimilarPropertiesOptions) => {
  const {
    listingId,
    vipType,
    provinceId,
    wardId,
    districtId,
    isLegacy = false,
    enabled = true,
    limit = 10,
  } = options

  return useQuery({
    queryKey: [
      'listings',
      'similar',
      listingId,
      vipType,
      provinceId,
      wardId,
      districtId,
      isLegacy,
      limit,
    ],
    queryFn: async (): Promise<ListingDetail[]> => {
      // Build search request with same VIP type and location
      const searchRequest = {
        vipType,
        provinceId,
        wardId,
        districtId,
        isLegacy,
        verified: true,
        page: 1,
        size: limit,
      }

      const response = await ListingService.search(searchRequest)

      if (response.code !== '999999' || !response.data) {
        throw new Error(
          response.message || 'Failed to fetch similar properties',
        )
      }

      // Filter out the current listing from results
      const filteredListings = response.data.listings.filter(
        (listing) => listing.listingId !== Number(listingId),
      )

      return filteredListings.slice(0, limit)
    },
    enabled:
      enabled &&
      !!vipType &&
      (!!provinceId || !!wardId || !!districtId) &&
      !!listingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
