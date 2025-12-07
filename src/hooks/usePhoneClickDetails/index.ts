/**
 * React Query hooks for Phone Click Details
 * @module hooks/usePhoneClickDetails
 */

import { useQuery } from '@tanstack/react-query'
import { PhoneClickDetailService } from '@/api/services'
import type { PhoneClickDetail } from '@/api/types/phone-click-detail.type'

// Query keys
export const phoneClickDetailKeys = {
  all: ['phoneClickDetails'] as const,
  myListings: () => [...phoneClickDetailKeys.all, 'myListings'] as const,
  myListingsUsers: (page?: number, size?: number) =>
    [...phoneClickDetailKeys.all, 'myListingsUsers', page, size] as const,
  byListing: (listingId: string | number, page?: number, size?: number) =>
    [...phoneClickDetailKeys.all, 'listing', listingId, page, size] as const,
  listingUsers: (listingId: string | number, page?: number, size?: number) =>
    [
      ...phoneClickDetailKeys.all,
      'listingUsers',
      listingId,
      page,
      size,
    ] as const,
  myClicks: () => [...phoneClickDetailKeys.all, 'myClicks'] as const,
  stats: (listingId: string | number) =>
    [...phoneClickDetailKeys.all, 'stats', listingId] as const,
}

interface UsePhoneClicksOptions {
  initialData?: PhoneClickDetail[]
  enabled?: boolean
  searchTitle?: string
  page?: number
  size?: number
}

/**
 * Query hook for fetching phone clicks - returns raw PhoneClickDetail[]
 * Uses getMyListingsClicks for all data, searchMyListingsClicks for search
 */
export const useMyPhoneClicks = (options: UsePhoneClicksOptions = {}) => {
  const {
    initialData,
    enabled = true,
    searchTitle = '',
    page = 1,
    size = 100,
  } = options

  const hasSearch = searchTitle.trim().length > 0

  return useQuery({
    queryKey: [...phoneClickDetailKeys.myListings(), searchTitle, page, size],
    queryFn: async () => {
      let response

      if (hasSearch) {
        // Use search API when there's a search query
        response = await PhoneClickDetailService.searchMyListingsClicks({
          title: searchTitle,
          page,
          size,
        })
      } else {
        // Use regular API for getting all data
        response = await PhoneClickDetailService.getMyListingsClicks(page, size)
      }

      if (!response.data || response.code !== '999999') {
        throw new Error(
          response.message || 'Failed to fetch phone click details',
        )
      }

      // Response structure: { page, size, totalElements, totalPages, data: [...] }
      return response.data.data || []
    },
    placeholderData: initialData,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled,
  })
}

/**
 * Query hook for fetching phone clicks by listing ID with pagination
 */
export const usePhoneClicksByListing = (
  listingId: string | number,
  page: number = 1,
  size: number = 10,
) => {
  return useQuery({
    queryKey: phoneClickDetailKeys.byListing(listingId, page, size),
    queryFn: async () => {
      const response = await PhoneClickDetailService.getByListing(
        listingId,
        page,
        size,
      )

      if (!response.data || response.code !== '999999') {
        throw new Error(
          response.message || 'Failed to fetch phone click details',
        )
      }

      return response.data.data || []
    },
    enabled: !!listingId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Query hook for fetching user's own phone click history
 */
export const useMyClicks = () => {
  return useQuery({
    queryKey: phoneClickDetailKeys.myClicks(),
    queryFn: async () => {
      const response = await PhoneClickDetailService.getMyClicks()

      if (!response.data || response.code !== '999999') {
        throw new Error(
          response.message || 'Failed to fetch phone click history',
        )
      }

      return response.data || []
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Query hook for fetching phone click statistics for a listing
 */
export const usePhoneClickStats = (listingId: string | number) => {
  return useQuery({
    queryKey: phoneClickDetailKeys.stats(listingId),
    queryFn: async () => {
      const response = await PhoneClickDetailService.getListingStats(listingId)

      if (!response.data || response.code !== '999999') {
        throw new Error(response.message || 'Failed to fetch phone click stats')
      }

      return response.data
    },
    enabled: !!listingId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Query hook for fetching users who clicked on my listings (for seller dashboard)
 * Returns paginated UserPhoneClickDetail with their clicked listings
 */
export const useUsersForMyListings = (page: number = 1, size: number = 10) => {
  return useQuery({
    queryKey: phoneClickDetailKeys.myListingsUsers(page, size),
    queryFn: async () => {
      const response = await PhoneClickDetailService.getUsersForMyListings(
        page,
        size,
      )

      if (!response.data || response.code !== '999999') {
        throw new Error(
          response.message || 'Failed to fetch users for my listings',
        )
      }

      return response.data
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Query hook for fetching users who clicked on a specific listing
 */
export const useUsersWhoClickedListing = (
  listingId: string | number,
  page: number = 1,
  size: number = 10,
) => {
  return useQuery({
    queryKey: phoneClickDetailKeys.listingUsers(listingId, page, size),
    queryFn: async () => {
      const response = await PhoneClickDetailService.getUsersWhoClickedListing(
        listingId,
        page,
        size,
      )

      if (!response.data || response.code !== '999999') {
        throw new Error(
          response.message || 'Failed to fetch users who clicked listing',
        )
      }

      return response.data
    },
    enabled: !!listingId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
