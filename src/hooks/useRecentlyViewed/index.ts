import { useState, useEffect, useCallback } from 'react'
import {
  getRecentlyViewed,
  addToRecentlyViewed,
  removeFromRecentlyViewed,
  clearRecentlyViewed,
  isInRecentlyViewed,
  type RecentlyViewedListing,
} from '@/utils/localstorage/recentlyViewed'

/**
 * Hook to manage recently viewed listings
 */
export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedListing[]>(
    [],
  )

  // Load initial data
  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed())
  }, [])

  // Add listing to recently viewed
  const addListing = useCallback(
    (listing: Omit<RecentlyViewedListing, 'viewedAt'>) => {
      addToRecentlyViewed(listing)
      setRecentlyViewed(getRecentlyViewed())
    },
    [],
  )

  // Remove listing from recently viewed
  const removeListing = useCallback((listingId: string | number) => {
    removeFromRecentlyViewed(listingId)
    setRecentlyViewed(getRecentlyViewed())
  }, [])

  // Clear all recently viewed
  const clearAll = useCallback(() => {
    clearRecentlyViewed()
    setRecentlyViewed([])
  }, [])

  // Check if listing is in recently viewed
  const isViewed = useCallback((listingId: string | number) => {
    return isInRecentlyViewed(listingId)
  }, [])

  // Refresh data (useful after navigation)
  const refresh = useCallback(() => {
    setRecentlyViewed(getRecentlyViewed())
  }, [])

  return {
    recentlyViewed,
    addListing,
    removeListing,
    clearAll,
    isViewed,
    refresh,
  }
}
