import type { ListingDetail, ListingApi } from '@/api/types'
import type { RecentlyViewedListing } from '@/utils/localstorage/recentlyViewed'
import { POST_STATUS } from '@/api/types/property.type'

/**
 * Convert ListingDetail to RecentlyViewedListing format
 * Saves ALL listing data to localStorage for complete information
 */
export const mapListingToRecentlyViewed = (
  listing: ListingDetail,
  thumbnail: string | null,
): Omit<RecentlyViewedListing, 'viewedAt'> => {
  return {
    listingId: listing.listingId,
    title: listing.title || '',
    description: listing.description || '',
    price: listing.price || 0,
    priceUnit: listing.priceUnit || '',
    area: listing.area,
    address: listing.address
      ? {
          fullAddress: listing.address.fullAddress,
          fullNewAddress: listing.address.fullNewAddress || '',
          latitude: listing.address.latitude || 0,
          longitude: listing.address.longitude || 0,
        }
      : {
          fullNewAddress: '',
          latitude: 0,
          longitude: 0,
        },
    // Save all media
    media: listing.media?.map((item) => ({
      mediaId: item.mediaId,
      listingId: item.listingId,
      mediaType: item.mediaType,
      sourceType: item.sourceType,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl,
      isPrimary: item.isPrimary,
      sortOrder: item.sortOrder,
      status: item.status,
      fileSize: item.fileSize,
      mimeType: item.mimeType,
      originalFilename: item.originalFilename,
      durationSeconds: item.durationSeconds,
      createdAt: item.createdAt,
    })),
    // Keep thumbnail for backward compatibility
    thumbnail: thumbnail || listing.media?.[0]?.url || '',
    // Save complete user info
    user: listing.user
      ? {
          userId: listing.user.userId,
          firstName: listing.user.firstName,
          lastName: listing.user.lastName,
          avatarUrl: listing.user.avatarUrl,
          phoneCode: listing.user.phoneCode,
          phoneNumber: listing.user.phoneNumber,
          email: listing.user.email,
        }
      : undefined,
    // Property details
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    verified: listing.verified,
    expired: listing.expired,
    vipType: listing.vipType,
    isDraft: listing.isDraft,
    category: listing.category
      ? {
          id: listing.category.id,
          name: listing.category.name,
          slug: listing.category.slug,
          description: listing.category.description,
          type: listing.category.type,
          status: listing.category.status,
          created_at: listing.category.created_at,
          updated_at: listing.category.updated_at,
        }
      : undefined,
    productType: listing.productType,
    propertyType: listing.propertyType,
    furnishing: listing.furnishing,
    direction: listing.direction,
    roomCapacity: listing.roomCapacity,
    // Utilities
    waterPrice: listing.waterPrice,
    electricityPrice: listing.electricityPrice,
    internetPrice: listing.internetPrice,
    priceType: listing.priceType,
    // Save all amenities
    amenities: listing.amenities?.map((amenity) => ({
      amenityId: amenity.amenityId,
      name: amenity.name,
      icon: amenity.icon,
      description: amenity.description,
      category: amenity.category,
      isActive: amenity.isActive,
    })),
    // Dates
    postDate: listing.postDate
      ? listing.postDate instanceof Date
        ? listing.postDate.toISOString()
        : new Date(listing.postDate).toISOString()
      : undefined,
    expiryDate: listing.expiryDate,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    // Location pricing (if available)
    locationPricing: listing.locationPricing
      ? {
          wardPricing: listing.locationPricing.wardPricing
            ? {
                locationType: listing.locationPricing.wardPricing.locationType,
                locationId: listing.locationPricing.wardPricing.locationId,
                locationName: listing.locationPricing.wardPricing.locationName,
                totalListings:
                  listing.locationPricing.wardPricing.totalListings,
                averagePrice: listing.locationPricing.wardPricing.averagePrice,
                minPrice: listing.locationPricing.wardPricing.minPrice,
                maxPrice: listing.locationPricing.wardPricing.maxPrice,
                medianPrice: listing.locationPricing.wardPricing.medianPrice,
                priceUnit: listing.locationPricing.wardPricing.priceUnit,
                productType: listing.locationPricing.wardPricing.productType,
                averageArea: listing.locationPricing.wardPricing.averageArea,
                averagePricePerSqm:
                  listing.locationPricing.wardPricing.averagePricePerSqm,
              }
            : undefined,
          districtPricing: listing.locationPricing.districtPricing
            ? {
                locationType:
                  listing.locationPricing.districtPricing.locationType,
                locationId: listing.locationPricing.districtPricing.locationId,
                totalListings:
                  listing.locationPricing.districtPricing.totalListings,
                averagePrice:
                  listing.locationPricing.districtPricing.averagePrice,
                priceUnit: listing.locationPricing.districtPricing.priceUnit,
              }
            : undefined,
          provincePricing: listing.locationPricing.provincePricing
            ? {
                locationType:
                  listing.locationPricing.provincePricing.locationType,
                locationId: listing.locationPricing.provincePricing.locationId,
                totalListings:
                  listing.locationPricing.provincePricing.totalListings,
                averagePrice:
                  listing.locationPricing.provincePricing.averagePrice,
                priceUnit: listing.locationPricing.provincePricing.priceUnit,
              }
            : undefined,
          priceComparison: listing.locationPricing.priceComparison,
          percentageDifferenceFromAverage:
            listing.locationPricing.percentageDifferenceFromAverage,
        }
      : undefined,
  }
}

/**
 * Convert ListingApi (from API response) to RecentlyViewedListing format
 * Used when syncing with server - API returns full listing objects
 */
export const mapListingApiToRecentlyViewed = (
  listing: ListingApi,
  viewedAt: number,
): RecentlyViewedListing => {
  // Get thumbnail from media
  const thumbnail =
    listing.media?.find((item) => item.mediaType === 'IMAGE' && item.url)
      ?.url || null

  // Convert ListingApi to RecentlyViewedListing format
  const base = mapListingToRecentlyViewed(listing as ListingDetail, thumbnail)

  return {
    ...base,
    viewedAt, // Use the viewedAt from API response
  }
}

/**
 * Convert RecentlyViewedListing back to partial ListingDetail format for display
 * Uses all saved data from localStorage
 */
export const mapRecentlyViewedToListing = (
  recentlyViewed: RecentlyViewedListing,
): Partial<ListingDetail> => {
  // Handle address - support both old string format and new object format
  const address =
    typeof recentlyViewed.address === 'string'
      ? {
          fullNewAddress: recentlyViewed.address,
          fullAddress: recentlyViewed.address,
          latitude: 0,
          longitude: 0,
        }
      : recentlyViewed.address

  return {
    listingId: Number(recentlyViewed.listingId),
    title: recentlyViewed.title,
    description: recentlyViewed.description || '',
    price: recentlyViewed.price,
    priceUnit: recentlyViewed.priceUnit as ListingDetail['priceUnit'],
    area: recentlyViewed.area,
    bedrooms: recentlyViewed.bedrooms,
    bathrooms: recentlyViewed.bathrooms,
    verified: recentlyViewed.verified,
    expired: recentlyViewed.expired,
    vipType: (recentlyViewed.vipType || 'NORMAL') as ListingDetail['vipType'],
    isDraft: recentlyViewed.isDraft,
    category: recentlyViewed.category as ListingDetail['category'],
    productType: (recentlyViewed.productType ||
      'HOUSE') as ListingDetail['productType'],
    propertyType: recentlyViewed.propertyType as ListingDetail['propertyType'],
    furnishing: recentlyViewed.furnishing as ListingDetail['furnishing'],
    direction: recentlyViewed.direction as ListingDetail['direction'],
    roomCapacity: recentlyViewed.roomCapacity,
    waterPrice: recentlyViewed.waterPrice as ListingDetail['waterPrice'],
    electricityPrice:
      recentlyViewed.electricityPrice as ListingDetail['electricityPrice'],
    internetPrice:
      recentlyViewed.internetPrice as ListingDetail['internetPrice'],
    priceType: recentlyViewed.priceType as ListingDetail['priceType'],
    amenities: recentlyViewed.amenities as ListingDetail['amenities'],
    address,
    // Use saved media if available, otherwise fallback to thumbnail
    media:
      recentlyViewed.media && recentlyViewed.media.length > 0
        ? (recentlyViewed.media as ListingDetail['media'])
        : recentlyViewed.thumbnail
          ? [
              {
                mediaId: 0,
                listingId: Number(recentlyViewed.listingId),
                mediaType: 'IMAGE' as const,
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
          email: recentlyViewed.user.email || '',
          phoneNumber: recentlyViewed.user.phoneNumber || '',
          phoneCode: recentlyViewed.user.phoneCode || '',
          idDocument: '',
          taxNumber: '',
          contactPhoneNumber: '',
          contactPhoneVerified: false,
          createdAt: '',
          updatedAt: '',
        } as ListingDetail['user'])
      : ({} as ListingDetail['user']),
    postDate: recentlyViewed.postDate
      ? typeof recentlyViewed.postDate === 'string'
        ? new Date(recentlyViewed.postDate)
        : recentlyViewed.postDate instanceof Date
          ? recentlyViewed.postDate
          : new Date()
      : new Date(),
    expiryDate: recentlyViewed.expiryDate || new Date().toISOString(),
    createdAt: recentlyViewed.createdAt || new Date().toISOString(),
    updatedAt: recentlyViewed.updatedAt || new Date().toISOString(),
    locationPricing:
      recentlyViewed.locationPricing as ListingDetail['locationPricing'],
  }
}
