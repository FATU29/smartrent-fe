import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { AddressService } from '@/api/services/address.service'

// ==================== QUERY KEYS ====================

export const addressKeys = {
  all: ['address'] as const,
  legacy: {
    all: ['address', 'legacy'] as const,
    provinces: () => [...addressKeys.legacy.all, 'provinces'] as const,
    province: (provinceId?: number) =>
      [...addressKeys.legacy.all, 'province', provinceId] as const,
    provincesSearch: (query?: string) =>
      [...addressKeys.legacy.all, 'provincesSearch', query] as const,
    districts: (provinceId?: number) =>
      [...addressKeys.legacy.all, 'districts', provinceId] as const,
    district: (districtId?: number) =>
      [...addressKeys.legacy.all, 'district', districtId] as const,
    districtsSearch: (query?: string, provinceId?: number) =>
      [
        ...addressKeys.legacy.all,
        'districtsSearch',
        query,
        provinceId,
      ] as const,
    wards: (districtId?: number) =>
      [...addressKeys.legacy.all, 'wards', districtId] as const,
    ward: (wardId?: number) =>
      [...addressKeys.legacy.all, 'ward', wardId] as const,
    wardsSearch: (query?: string, districtId?: number) =>
      [...addressKeys.legacy.all, 'wardsSearch', query, districtId] as const,
  },
  new: {
    all: ['address', 'new'] as const,
    provinces: (keyword?: string) =>
      [...addressKeys.new.all, 'provinces', keyword] as const,
    wards: (provinceCode?: string, keyword?: string) =>
      [...addressKeys.new.all, 'wards', provinceCode, keyword] as const,
    fullAddress: (provinceCode?: string, wardCode?: string) =>
      [...addressKeys.new.all, 'fullAddress', provinceCode, wardCode] as const,
    search: (keyword?: string) =>
      [...addressKeys.new.all, 'search', keyword] as const,
    mergeHistory: (provinceCode?: string, wardCode?: string) =>
      [...addressKeys.new.all, 'mergeHistory', provinceCode, wardCode] as const,
  },
  geocode: (address?: string) => ['address', 'geocode', address] as const,
  health: () => ['address', 'health'] as const,
}

// ==================== LEGACY STRUCTURE HOOKS ====================

/**
 * Query hook for legacy provinces (63 provinces)
 * GET /v1/addresses/provinces
 */
export const useLegacyProvinces = () => {
  return useQuery({
    queryKey: addressKeys.legacy.provinces(),
    queryFn: async () => {
      const response = await AddressService.getProvinces()
      return response?.data || []
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for single legacy province by ID
 * GET /v1/addresses/provinces/{provinceId}
 */
export const useLegacyProvince = (provinceId?: number) => {
  return useQuery({
    queryKey: addressKeys.legacy.province(provinceId),
    queryFn: async () => {
      if (!provinceId) return null
      const response = await AddressService.getProvinceById(provinceId)
      return response?.data || null
    },
    enabled: !!provinceId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for searching legacy provinces
 * GET /v1/addresses/provinces/search?q={name}
 */
export const useLegacyProvincesSearch = (query?: string) => {
  return useQuery({
    queryKey: addressKeys.legacy.provincesSearch(query),
    queryFn: async () => {
      if (!query || query.trim() === '') return []
      const response = await AddressService.searchProvinces(query)
      return response?.data || []
    },
    enabled: !!query && query.trim().length > 0,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for legacy districts by province
 * GET /v1/addresses/provinces/{provinceId}/districts
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
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}

/**
 * Infinite query hook for legacy districts by province ID with pagination
 * GET /v1/addresses/provinces/{provinceId}/districts?page={page}&limit={limit}
 */
export const useLegacyDistrictsInfinite = (
  provinceId?: number,
  keyword?: string,
  limit: number = 20,
) => {
  return useInfiniteQuery({
    queryKey: [
      ...addressKeys.legacy.districts(provinceId),
      'infinite',
      keyword,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      if (!provinceId) {
        return {
          data: [],
          metadata: { total: 0, page: 1, limit },
        }
      }
      const response = await AddressService.getDistrictsByProvincePaginated(
        provinceId,
        keyword,
        pageParam,
        limit,
      )
      return {
        data: response.data || [],
        metadata: response.metadata || { total: 0, page: pageParam, limit },
      }
    },
    enabled: !!provinceId,
    getNextPageParam: (lastPage, allPages) => {
      const { metadata } = lastPage
      const totalLoaded = allPages.reduce(
        (sum, page) => sum + page.data.length,
        0,
      )
      if (totalLoaded < metadata.total) {
        return metadata.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for single legacy district by ID
 * GET /v1/addresses/districts/{districtId}
 */
export const useLegacyDistrict = (districtId?: number) => {
  return useQuery({
    queryKey: addressKeys.legacy.district(districtId),
    queryFn: async () => {
      if (!districtId) return null
      const response = await AddressService.getDistrictById(districtId)
      return response?.data || null
    },
    enabled: !!districtId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for searching legacy districts
 * GET /v1/addresses/districts/search?q={name}&provinceId={optional}
 */
export const useLegacyDistrictsSearch = (
  query?: string,
  provinceId?: number,
) => {
  return useQuery({
    queryKey: addressKeys.legacy.districtsSearch(query, provinceId),
    queryFn: async () => {
      if (!query || query.trim() === '') return []
      const response = await AddressService.searchDistricts(query, provinceId)
      return response?.data || []
    },
    enabled: !!query && query.trim().length > 0,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for legacy wards by district
 * GET /v1/addresses/districts/{districtId}/wards
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
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}

/**
 * Infinite query hook for legacy wards by district ID with pagination
 * GET /v1/addresses/districts/{districtId}/wards?page={page}&limit={limit}
 */
export const useLegacyWardsInfinite = (
  districtId?: number,
  keyword?: string,
  limit: number = 20,
) => {
  return useInfiniteQuery({
    queryKey: [...addressKeys.legacy.wards(districtId), 'infinite', keyword],
    queryFn: async ({ pageParam = 1 }) => {
      if (!districtId) {
        return {
          data: [],
          metadata: { total: 0, page: 1, limit },
        }
      }
      const response = await AddressService.getWardsByDistrictPaginated(
        districtId,
        keyword,
        pageParam,
        limit,
      )
      return {
        data: response.data || [],
        metadata: response.metadata || { total: 0, page: pageParam, limit },
      }
    },
    enabled: !!districtId,
    getNextPageParam: (lastPage, allPages) => {
      const { metadata } = lastPage
      const totalLoaded = allPages.reduce(
        (sum, page) => sum + page.data.length,
        0,
      )
      if (totalLoaded < metadata.total) {
        return metadata.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for single legacy ward by ID
 * GET /v1/addresses/wards/{wardId}
 */
export const useLegacyWard = (wardId?: number) => {
  return useQuery({
    queryKey: addressKeys.legacy.ward(wardId),
    queryFn: async () => {
      if (!wardId) return null
      const response = await AddressService.getWardById(wardId)
      return response?.data || null
    },
    enabled: !!wardId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for searching legacy wards
 * GET /v1/addresses/wards/search?q={name}&districtId={optional}
 */
export const useLegacyWardsSearch = (query?: string, districtId?: number) => {
  return useQuery({
    queryKey: addressKeys.legacy.wardsSearch(query, districtId),
    queryFn: async () => {
      if (!query || query.trim() === '') return []
      const response = await AddressService.searchWards(query, districtId)
      return response?.data || []
    },
    enabled: !!query && query.trim().length > 0,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

// ==================== NEW STRUCTURE HOOKS ====================

/**
 * Query hook for new provinces (34 provinces)
 * GET /v1/addresses/new-provinces
 */
export const useNewProvinces = () => {
  return useQuery({
    queryKey: addressKeys.new.provinces(),
    queryFn: async () => {
      const response = await AddressService.getNewProvinces()
      return response || []
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnMount: false, // Disable to avoid duplicate calls
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for new wards by province code
 * GET /v1/addresses/new-provinces/{provinceCode}/wards?keyword={optional}&page={optional}&limit={optional}
 */
export const useNewWards = (provinceCode?: string, keyword?: string) => {
  return useQuery({
    queryKey: addressKeys.new.wards(provinceCode, keyword),
    queryFn: async () => {
      if (!provinceCode) return []
      const response = await AddressService.getNewProvinceWards(
        provinceCode,
        keyword,
      )
      return response?.data || []
    },
    enabled: !!provinceCode,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}

/**
 * Infinite query hook for new wards by province code with pagination
 * GET /v1/addresses/new-provinces/{provinceCode}/wards?keyword={optional}&page={optional}&limit={optional}
 */
export const useNewWardsInfinite = (
  provinceCode?: string,
  keyword?: string,
  limit: number = 20,
) => {
  const normalizedKeyword =
    keyword && keyword.trim() ? keyword.trim() : undefined

  return useInfiniteQuery({
    queryKey: [
      ...addressKeys.new.wards(provinceCode, normalizedKeyword),
      'infinite',
    ],
    queryFn: async ({ pageParam = 1 }) => {
      if (!provinceCode) {
        return {
          data: [],
          metadata: { total: 0, page: 1, limit },
        }
      }
      const response = await AddressService.getNewProvinceWards(
        provinceCode,
        normalizedKeyword,
        pageParam,
        limit,
      )

      return {
        data: response.data || [],
        metadata: response.metadata || { total: 0, page: pageParam, limit },
      }
    },
    enabled: !!provinceCode,
    getNextPageParam: (lastPage, allPages) => {
      const { metadata, data } = lastPage

      const totalLoaded = allPages.reduce(
        (sum, page) => sum + (page.data?.length || 0),
        0,
      )

      const firstPage = allPages[0]
      const totalFromFirstPage = firstPage?.metadata?.total
      const total = totalFromFirstPage ?? metadata.total ?? 0

      if (total > 0 && totalLoaded < total) {
        return metadata.page + 1
      }

      if (data.length < metadata.limit) {
        return undefined
      }

      if (data.length === metadata.limit && total === 0) {
        return metadata.page + 1
      }

      return undefined
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnMount: false, // Disable to avoid duplicate calls
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for new full address (province + ward)
 * GET /v1/addresses/new-full-address?provinceCode={code}&wardCode={optional}
 */
export const useNewFullAddress = (provinceCode?: string, wardCode?: string) => {
  return useQuery({
    queryKey: addressKeys.new.fullAddress(provinceCode, wardCode),
    queryFn: async () => {
      if (!provinceCode) return null
      const response = await AddressService.getNewFullAddress(
        provinceCode,
        wardCode,
      )
      return response?.data || null
    },
    enabled: !!provinceCode,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for searching new addresses (autocomplete)
 * GET /v1/addresses/search-new-address?keyword={kw}&page={p}&limit={n}
 */
export const useSearchNewAddress = (
  keyword?: string,
  page: number = 1,
  limit: number = 20,
) => {
  return useQuery({
    queryKey: [...addressKeys.new.search(keyword), page, limit],
    queryFn: async () => {
      if (!keyword || keyword.trim() === '') return []
      const response = await AddressService.searchNewAddress(
        keyword,
        page,
        limit,
      )
      return response?.data || []
    },
    enabled: !!keyword && keyword.trim().length > 0,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

/**
 * Infinite query hook for searching new addresses (autocomplete with pagination)
 * GET /v1/addresses/search-new-address?keyword={kw}&page={p}&limit={n}
 */
export const useSearchNewAddressInfinite = (
  keyword?: string,
  limit: number = 20,
) => {
  return useInfiniteQuery({
    queryKey: [...addressKeys.new.search(keyword), 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      if (!keyword || keyword.trim() === '') {
        return {
          data: [],
          metadata: { total: 0, page: 1, limit },
        }
      }
      const response = await AddressService.searchNewAddress(
        keyword,
        pageParam,
        limit,
      )
      return {
        data: response.data || [],
        metadata: response.metadata || { total: 0, page: pageParam, limit },
      }
    },
    enabled: !!keyword && keyword.trim().length > 0,
    getNextPageParam: (lastPage, allPages) => {
      const { metadata } = lastPage
      const totalLoaded = allPages.reduce(
        (sum, page) => sum + page.data.length,
        0,
      )
      if (totalLoaded < metadata.total) {
        return metadata.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

/**
 * Query hook for merge history showing legacy addresses merged into new address
 * GET /v1/addresses/merge-history?provinceCode={pc}&wardCode={wc}
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
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

// ==================== GEOCODING HOOKS ====================

/**
 * Query hook for geocoding an address
 * GET /v1/addresses/geocode?address={text}
 */
export const useGeocode = (address?: string) => {
  return useQuery({
    queryKey: addressKeys.geocode(address),
    queryFn: async () => {
      if (!address || address.trim() === '') return null
      const response = await AddressService.geocode(address)
      return response?.data || null
    },
    enabled: !!address && address.trim().length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour (geocoding results are stable)
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

// ==================== HEALTH HOOK ====================

/**
 * Query hook for address service health check
 * GET /v1/addresses/health
 */
export const useAddressHealth = () => {
  return useQuery({
    queryKey: addressKeys.health(),
    queryFn: async () => {
      const response = await AddressService.healthCheck()
      return response?.data || null
    },
    enabled: true,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}
