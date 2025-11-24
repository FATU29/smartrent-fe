import { useQuery } from '@tanstack/react-query'
import { AddressService } from '@/api/services/address.service'

// Query keys
export const addressKeys = {
  all: ['address'] as const,
  legacy: {
    all: ['address', 'legacy'] as const,
    provinces: () => [...addressKeys.legacy.all, 'provinces'] as const,
    districts: (provinceId?: number) =>
      [...addressKeys.legacy.all, 'districts', provinceId] as const,
    wards: (districtId?: number) =>
      [...addressKeys.legacy.all, 'wards', districtId] as const,
    streets: (wardId?: number, districtId?: number, provinceId?: number) =>
      [
        ...addressKeys.legacy.all,
        'streets',
        wardId ?? 'no-ward',
        districtId ?? 'no-district',
        provinceId ?? 'no-province',
      ] as const,
    projects: (provinceId?: number, districtId?: number) =>
      [
        ...addressKeys.legacy.all,
        'projects',
        provinceId ?? 'no-province',
        districtId ?? 'no-district',
      ] as const,
    streetsSearch: (query?: string, provinceId?: number, districtId?: number) =>
      [
        ...addressKeys.legacy.all,
        'streetsSearch',
        query || '',
        provinceId ?? 'no-province',
        districtId ?? 'no-district',
      ] as const,
  },
  new: {
    all: ['address', 'new'] as const,
    provinces: () => [...addressKeys.new.all, 'provinces'] as const,
    wards: (provinceCode?: string) =>
      [...addressKeys.new.all, 'wards', provinceCode] as const,
    mergeHistory: (provinceCode?: string, wardCode?: string) =>
      [...addressKeys.new.all, 'mergeHistory', provinceCode, wardCode] as const,
  },
}

/**
 * Query hook for legacy provinces (63 provinces)
 */
export const useLegacyProvinces = () => {
  return useQuery({
    queryKey: addressKeys.legacy.provinces(),
    queryFn: async () => {
      const response = await AddressService.getProvinces()
      return response?.data || []
    },
    enabled: true, // Explicitly enable the query
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (cache time)
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for legacy districts by province
 */
export const useLegacyDistricts = (provinceId?: number) => {
  return useQuery({
    queryKey: addressKeys.legacy.districts(provinceId),
    queryFn: async () => {
      if (!provinceId) return []
      const response = await AddressService.getDistrictsByProvince(provinceId)
      return response?.data || []
    },
    enabled: !!provinceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (cache time)
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for legacy wards by district
 */
export const useLegacyWards = (districtId?: number) => {
  return useQuery({
    queryKey: addressKeys.legacy.wards(districtId),
    queryFn: async () => {
      if (!districtId) return []
      const response = await AddressService.getWardsByDistrict(districtId)
      return response?.data || []
    },
    enabled: !!districtId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (cache time)
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for legacy streets by ward or district
 */
export const useLegacyStreets = (
  wardId?: number,
  districtId?: number,
  provinceId?: number,
) => {
  return useQuery({
    queryKey: addressKeys.legacy.streets(wardId, districtId, provinceId),
    queryFn: async () => {
      if (wardId) {
        const response = await AddressService.getStreetsByWard(wardId)
        return response?.data || []
      }
      if (districtId) {
        const response = await AddressService.getStreetsByDistrict(districtId)
        return response?.data || []
      }
      if (provinceId) {
        const response = await AddressService.getStreetsByProvince(provinceId)
        return response?.data || []
      }
      return []
    },
    enabled: !!wardId || !!districtId || !!provinceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (cache time)
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}

/**
 * Search streets (legacy structure) by query and optional province/district
 */
export const useSearchStreets = (
  query?: string,
  provinceId?: number,
  districtId?: number,
) => {
  return useQuery({
    queryKey: addressKeys.legacy.streetsSearch(query, provinceId, districtId),
    queryFn: async () => {
      if (!query || query.trim() === '') return []
      const response = await AddressService.searchStreets(
        query,
        provinceId,
        districtId,
      )
      return response?.data || []
    },
    enabled: !!query && query.trim().length > 0,
    staleTime: 1000 * 30, // 30s
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for legacy projects by province or district
 */
export const useLegacyProjects = (provinceId?: number, districtId?: number) => {
  return useQuery({
    queryKey: addressKeys.legacy.projects(provinceId, districtId),
    queryFn: async () => {
      if (districtId) {
        const response = await AddressService.getProjectsByDistrict(districtId)
        return response?.data || []
      }
      if (provinceId) {
        const response = await AddressService.getProjectsByProvince(provinceId)
        return response?.data || []
      }
      return []
    },
    enabled: !!provinceId || !!districtId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (cache time)
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for new provinces (34 provinces)
 */
export const useNewProvinces = (keyword?: string) => {
  return useQuery({
    queryKey: [...addressKeys.new.provinces(), keyword],
    queryFn: async () => {
      const response = await AddressService.getNewProvinces(keyword)
      return response?.data || []
    },
    enabled: true, // Explicitly enable the query
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (cache time)
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for new wards by province code
 */
export const useNewWards = (provinceCode?: string, keyword?: string) => {
  return useQuery({
    queryKey: [...addressKeys.new.wards(provinceCode), keyword],
    queryFn: async () => {
      if (!provinceCode) return []
      const response = await AddressService.getNewProvinceWards(
        provinceCode,
        keyword,
      )
      return response?.data || []
    },
    enabled: !!provinceCode,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (cache time)
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for merge history showing legacy addresses merged into new address
 */
export const useMergeHistory = (provinceCode?: string, wardCode?: string) => {
  return useQuery({
    queryKey: addressKeys.new.mergeHistory(provinceCode, wardCode),
    queryFn: async () => {
      if (!provinceCode || !wardCode) return null
      const response = await AddressService.getMergeHistory(
        provinceCode,
        wardCode,
      )
      return response?.data || null
    },
    enabled: !!provinceCode && !!wardCode,
    staleTime: 1000 * 60 * 10, // 10 minutes (more stable data)
    gcTime: 1000 * 60 * 30, // 30 minutes (cache time)
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}
