/**
 * Recently Viewed Listings Management
 * Stores up to 20 most recently viewed listings in localStorage
 */

import type { ListingApi } from '@/api/types'

export interface RecentlyViewedListing {
  listingId: string | number
  title: string
  description?: string
  price: number
  priceUnit: string
  area?: number
  address: {
    fullAddress?: string
    fullNewAddress: string
    latitude: number
    longitude: number
  }
  viewedAt: number // timestamp
  // Media
  media?: Array<{
    mediaId: number
    listingId: number
    mediaType: 'IMAGE' | 'VIDEO'
    sourceType: string
    url: string
    thumbnailUrl?: string | null
    isPrimary: boolean
    sortOrder: number
    status: string
    fileSize?: number
    mimeType?: string
    originalFilename?: string
    durationSeconds?: number | null
    createdAt: string
  }>
  thumbnail?: string // Keep for backward compatibility
  // User info
  user?: {
    userId?: string
    firstName?: string
    lastName?: string
    avatarUrl?: string
    phoneCode?: string
    phoneNumber?: string
    email?: string
  }
  // Property details
  bedrooms?: number
  bathrooms?: number
  verified?: boolean
  expired?: boolean
  vipType?: string
  isDraft?: boolean
  category?: {
    id: number
    name: string
    slug: string
    description: string
    type: string
    status: number
    created_at: string
    updated_at: string
  }
  productType?: string
  propertyType?: string
  furnishing?: string
  direction?: string
  roomCapacity?: number
  // Utilities
  waterPrice?: string
  electricityPrice?: string
  internetPrice?: string
  priceType?: string
  // Amenities
  amenities?: Array<{
    amenityId: number
    name: string
    icon: string
    description: string
    category: string
    isActive: boolean
  }>
  // Dates
  postDate?: string | Date
  expiryDate?: string
  createdAt?: string
  updatedAt?: string
  // Location pricing (optional, for price comparison)
  locationPricing?: {
    wardPricing?: {
      locationType: 'WARD'
      locationId: number
      locationName: string
      totalListings: number
      averagePrice: number
      minPrice: number
      maxPrice: number
      medianPrice: number
      priceUnit: string
      productType: string
      averageArea: number
      averagePricePerSqm: number
    }
    districtPricing?: {
      locationType: 'DISTRICT'
      locationId: number
      totalListings: number
      averagePrice: number
      priceUnit: string
    }
    provincePricing?: {
      locationType: 'PROVINCE'
      locationId: number
      totalListings: number
      averagePrice: number
      priceUnit: string
    }
    priceComparison?: string
    percentageDifferenceFromAverage?: number
  }
}

const STORAGE_KEY = 'smart-rent-recently-viewed'
const MAX_ITEMS = 20

/**
 * Get all recently viewed listings
 */
export const getRecentlyViewed = (): RecentlyViewedListing[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const items: RecentlyViewedListing[] = JSON.parse(stored)
    // Sort by viewedAt descending (newest first)
    return items.sort((a, b) => b.viewedAt - a.viewedAt)
  } catch (error) {
    console.error('Error reading recently viewed:', error)
    return []
  }
}

/**
 * Add a listing to recently viewed
 * - If listing already exists, update its timestamp and move to top
 * - Keep only the 20 most recent listings
 */
export const addToRecentlyViewed = (
  listing: Omit<RecentlyViewedListing, 'viewedAt'>,
): void => {
  try {
    const existing = getRecentlyViewed()

    // Remove if already exists
    const filtered = existing.filter(
      (item) => String(item.listingId) !== String(listing.listingId),
    )

    // Add to beginning with current timestamp
    const updated: RecentlyViewedListing[] = [
      {
        ...listing,
        viewedAt: Date.now(),
      },
      ...filtered,
    ]

    // Keep only last 20 items
    const limited = updated.slice(0, MAX_ITEMS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited))
  } catch (error) {
    console.error('Error saving to recently viewed:', error)
  }
}

/**
 * Remove a listing from recently viewed
 */
export const removeFromRecentlyViewed = (listingId: string | number): void => {
  try {
    const existing = getRecentlyViewed()
    const filtered = existing.filter(
      (item) => String(item.listingId) !== String(listingId),
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error removing from recently viewed:', error)
  }
}

/**
 * Clear all recently viewed listings
 */
export const clearRecentlyViewed = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing recently viewed:', error)
  }
}

/**
 * Check if a listing is in recently viewed
 */
export const isInRecentlyViewed = (listingId: string | number): boolean => {
  const items = getRecentlyViewed()
  return items.some((item) => String(item.listingId) === String(listingId))
}

/**
 * Check if a listing has complete information (not just listingId and viewedAt)
 * Relaxed validation - only check essential fields
 */
export const hasCompleteListingInfo = (
  listing: RecentlyViewedListing,
): boolean => {
  // Only check if we have listingId and some basic info
  // API may not always return all optional fields
  return !!(
    listing.listingId &&
    (listing.title || listing.description) && // At least title or description
    listing.address // Address object exists (even if fields are empty)
  )
}

/**
 * Update a specific listing in recently viewed with complete information
 * Preserves the viewedAt timestamp
 */
export const updateListingDetails = (
  listingId: string | number,
  details: Omit<RecentlyViewedListing, 'viewedAt' | 'listingId'>,
): void => {
  try {
    const existing = getRecentlyViewed()
    const existingItem = existing.find(
      (item) => String(item.listingId) === String(listingId),
    )

    const updated = existing.map((item) => {
      if (String(item.listingId) === String(listingId)) {
        return {
          ...item,
          ...details,
          listingId: item.listingId, // Preserve original listingId type
          viewedAt: item.viewedAt, // Preserve viewedAt
        } as RecentlyViewedListing
      }
      return item
    })

    // If item doesn't exist, add it
    if (!existingItem) {
      updated.push({
        listingId,
        ...details,
        viewedAt: Date.now(),
      } as RecentlyViewedListing)
    }

    // Sort and save
    const sorted = updated.sort((a, b) => b.viewedAt - a.viewedAt)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted))
  } catch (error) {
    console.error('Error updating listing details:', error)
  }
}

/**
 * Update recently viewed from server data
 * API returns full listing objects, so we can directly map them to localStorage format
 * @param serverData - Array of items from server with full listing details and viewedAt
 * @returns Array of listingIds that need to fetch detail (should be empty since API returns full details)
 */
export const updateRecentlyViewedFromServer = (
  serverData: Array<{ listing: ListingApi; viewedAt: number }>,
): number[] => {
  try {
    // Dynamic import to avoid circular dependency
    const {
      mapListingApiToRecentlyViewed,
    } = require('@/utils/recentlyViewed/mapper')

    // Map API response (full listing objects) to localStorage format
    const merged: RecentlyViewedListing[] = serverData
      .map((serverItem) => {
        // Map full listing object to RecentlyViewedListing format
        const mapped = mapListingApiToRecentlyViewed(
          serverItem.listing,
          serverItem.viewedAt,
        )

        // Check if we have complete info
        if (!hasCompleteListingInfo(mapped)) {
          // Log for debugging, but continue (API may not always return all fields)
          console.debug(
            'Partial listing info from API (listingId, title, address):',
            serverItem.listing.listingId,
            mapped.title,
            mapped.address?.fullNewAddress,
          )
        }

        return mapped
      })
      .filter((item) => item.listingId) // Only keep items with valid listingId

    // Sort by viewedAt descending (newest first)
    const sorted = merged.sort((a, b) => b.viewedAt - a.viewedAt)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted))

    // Return empty array since API provides full details
    return []
  } catch (error) {
    console.error('Error updating recently viewed from server:', error)
    return []
  }
}
