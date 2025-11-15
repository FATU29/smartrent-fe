/**
 * React Query hooks for Phone Click Details
 * @module hooks/usePhoneClickDetails
 */

import { useQuery } from '@tanstack/react-query'
import { PhoneClickDetailService } from '@/api/services'
import {
  transformToCustomers,
  transformToListingsWithCustomers,
} from '@/utils/phoneClickDetailTransform'
import type { Customer, ListingWithCustomers } from '@/api/types/customer.type'
import type { PhoneClickDetail } from '@/api/types/phone-click-detail.type'

// Query keys
export const phoneClickDetailKeys = {
  all: ['phoneClickDetails'] as const,
  myListings: () => [...phoneClickDetailKeys.all, 'myListings'] as const,
  byListing: (listingId: string | number) =>
    [...phoneClickDetailKeys.all, 'listing', listingId] as const,
  myClicks: () => [...phoneClickDetailKeys.all, 'myClicks'] as const,
  stats: (listingId: string | number) =>
    [...phoneClickDetailKeys.all, 'stats', listingId] as const,
}

interface UseMyCustomersOptions {
  initialData?: Customer[]
  enabled?: boolean
}

interface UseMyListingsOptions {
  initialData?: ListingWithCustomers[]
  enabled?: boolean
}

/**
 * Query hook for fetching customers from phone clicks
 * Returns only customers data
 */
export const useMyCustomers = (options: UseMyCustomersOptions = {}) => {
  const { initialData, enabled = true } = options

  return useQuery({
    queryKey: [...phoneClickDetailKeys.myListings(), 'customers'],
    queryFn: async () => {
      const response = await PhoneClickDetailService.getMyListingsClicks()

      if (!response.data || response.code !== '999999') {
        throw new Error(
          response.message || 'Failed to fetch phone click details',
        )
      }

      const phoneClicks: PhoneClickDetail[] = response.data || []

      // Transform to Customer format
      const customers = transformToCustomers(phoneClicks)

      return customers
    },
    placeholderData: initialData,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled,
  })
}

/**
 * Query hook for fetching listings from phone clicks
 * Returns only listings data
 * Only fetches when enabled (e.g., when listings tab is active)
 */
export const useMyListings = (options: UseMyListingsOptions = {}) => {
  const { initialData, enabled = false } = options

  return useQuery({
    queryKey: [...phoneClickDetailKeys.myListings(), 'listings'],
    queryFn: async () => {
      const response = await PhoneClickDetailService.getMyListingsClicks()

      if (!response.data || response.code !== '999999') {
        throw new Error(
          response.message || 'Failed to fetch phone click details',
        )
      }

      const phoneClicks: PhoneClickDetail[] = response.data || []

      // Transform to ListingWithCustomers format
      const listings = transformToListingsWithCustomers(phoneClicks)

      return listings
    },
    placeholderData: initialData,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled,
  })
}

/**
 * Query hook for fetching phone clicks by listing ID
 */
export const usePhoneClicksByListing = (listingId: string | number) => {
  return useQuery({
    queryKey: phoneClickDetailKeys.byListing(listingId),
    queryFn: async () => {
      const response = await PhoneClickDetailService.getByListing(listingId)

      if (!response.data || response.code !== '999999') {
        throw new Error(
          response.message || 'Failed to fetch phone click details',
        )
      }

      return response.data || []
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
