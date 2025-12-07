import type { ListingDetail } from '@/api/types'
import type { RecentlyViewedListing } from '@/utils/localstorage/recentlyViewed'

/**
 * Convert ListingDetail to RecentlyViewedListing format with thumbnail
 */
export const mapListingToRecentlyViewed = (
  listing: ListingDetail,
  thumbnail: string | null,
): Omit<RecentlyViewedListing, 'viewedAt'> => {
  const { fullNewAddress, fullAddress } = listing.address || {}

  return {
    listingId: listing.listingId,
    title: listing.title || '',
    price: listing.price || 0,
    priceUnit: listing.priceUnit || '',
    area: listing.area || 0,
    address: fullNewAddress || fullAddress || '',
    thumbnail: thumbnail || '',
  }
}

/**
 * Convert RecentlyViewedListing back to partial ListingDetail format for display
 */
export const mapRecentlyViewedToListing = (
  recentlyViewed: RecentlyViewedListing,
): Partial<ListingDetail> => ({
  listingId: Number(recentlyViewed.listingId),
  title: recentlyViewed.title,
  description: '',
  price: recentlyViewed.price,
  priceUnit: recentlyViewed.priceUnit as ListingDetail['priceUnit'],
  area: recentlyViewed.area,
  address: {
    fullNewAddress: recentlyViewed.address,
    fullAddress: recentlyViewed.address,
    latitude: 0,
    longitude: 0,
  },
  media: recentlyViewed.thumbnail
    ? [
        {
          mediaId: 0,
          listingId: Number(recentlyViewed.listingId),
          mediaType: 'IMAGE',
          sourceType: 'UPLOADED',
          url: recentlyViewed.thumbnail,
          isPrimary: true,
          sortOrder: 0,
          status: 3, // DISPLAYING
          createdAt: new Date().toISOString(),
        },
      ]
    : [],
  user: {} as ListingDetail['user'],
  postDate: new Date(),
  expiryDate: new Date().toISOString(),
  vipType: 'NORMAL',
  category: 'ROOM_FOR_RENT' as unknown as ListingDetail['category'],
  productType: 'HOUSE',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})
