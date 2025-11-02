import { useQuery } from '@tanstack/react-query'
import { VipTierService } from '@/api/services'

export const useVipTiers = () => {
  return useQuery({
    queryKey: ['vipTiers', 'active'],
    queryFn: async () => {
      const { data, success } = await VipTierService.getActive()
      if (!success || !data) {
        throw new Error('Failed to fetch VIP tiers')
      }
      // Sort by tier level (NORMAL, SILVER, GOLD, DIAMOND)
      return data.sort((a, b) => a.tierLevel - b.tierLevel)
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  })
}

export const useVipTierByCode = (tierCode: string | undefined) => {
  return useQuery({
    queryKey: ['vipTiers', 'byCode', tierCode],
    queryFn: async () => {
      if (!tierCode) return null
      const { data, success } = await VipTierService.getByCode(tierCode)
      if (!success || !data) {
        throw new Error(`Failed to fetch VIP tier: ${tierCode}`)
      }
      return data
    },
    enabled: !!tierCode, // Only run query if tierCode is provided
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
