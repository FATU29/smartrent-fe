import type { ListingDetail } from '@/api/types'
import type { RecentlyViewedListing } from '@/utils/localstorage/recentlyViewed'
import { POST_STATUS } from '@/api/types/property.type'

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
    // Additional fields for better display
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    verified: listing.verified,
    vipType: listing.vipType,
    productType: listing.productType,
    furnishing: listing.furnishing,
    direction: listing.direction,
    roomCapacity: listing.roomCapacity,
    description: listing.description,
    postDate: listing.postDate
      ? new Date(listing.postDate).toISOString()
      : undefined,
    user: listing.user
      ? {
          userId: listing.user.userId,
          firstName: listing.user.firstName,
          lastName: listing.user.lastName,
          avatarUrl: listing.user.avatarUrl,
        }
      : undefined,
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
  description: recentlyViewed.description || '',
  price: recentlyViewed.price,
  priceUnit: recentlyViewed.priceUnit as ListingDetail['priceUnit'],
  area: recentlyViewed.area,
  bedrooms: recentlyViewed.bedrooms,
  bathrooms: recentlyViewed.bathrooms,
  verified: recentlyViewed.verified,
  vipType: (recentlyViewed.vipType || 'NORMAL') as ListingDetail['vipType'],
  productType: (recentlyViewed.productType ||
    'HOUSE') as ListingDetail['productType'],
  furnishing: recentlyViewed.furnishing as ListingDetail['furnishing'],
  direction: recentlyViewed.direction as ListingDetail['direction'],
  roomCapacity: recentlyViewed.roomCapacity,
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
          status: POST_STATUS.DISPLAYING,
          createdAt: new Date().toISOString(),
        },
      ]
    : [],
  user: recentlyViewed.user
    ? ({
        userId: recentlyViewed.user.userId || '',
        firstName: recentlyViewed.user.firstName || '',
        lastName: recentlyViewed.user.lastName || '',
        avatarUrl: recentlyViewed.user.avatarUrl,
        email: '',
        phoneNumber: '',
        phoneCode: '',
        idDocument: '',
        taxNumber: '',
        contactPhoneNumber: '',
        contactPhoneVerified: false,
        createdAt: '',
        updatedAt: '',
      } as ListingDetail['user'])
    : ({} as ListingDetail['user']),
  postDate: recentlyViewed.postDate
    ? new Date(recentlyViewed.postDate)
    : new Date(),
  expiryDate: new Date().toISOString(),
  category: 'ROOM_FOR_RENT' as unknown as ListingDetail['category'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})
