/**
 * Recently Viewed Listings Management
 * Stores up to 5 most recently viewed listings in localStorage
 */

export interface RecentlyViewedListing {
  listingId: string | number
  title: string
  price: number
  priceUnit: string
  area: number
  address: string
  thumbnail?: string
  viewedAt: number // timestamp
  // Additional fields for better display
  bedrooms?: number
  bathrooms?: number
  verified?: boolean
  vipType?: string
  productType?: string
  furnishing?: string
  direction?: string
  roomCapacity?: number
  description?: string
  postDate?: string
  user?: {
    userId?: string
    firstName?: string
    lastName?: string
    avatarUrl?: string
  }
}

const STORAGE_KEY = 'smart-rent-recently-viewed'
const MAX_ITEMS = 5

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
 * - Keep only the 5 most recent listings
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

    // Keep only last 5 items
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
