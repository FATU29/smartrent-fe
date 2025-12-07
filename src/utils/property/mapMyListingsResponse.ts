import {
  ListingOwnerDetail,
  ListingSearchResponse,
  MyListingBackendItem,
  MyListingsBackendResponse,
  POST_STATUS,
  VipType,
  PropertyType,
  PriceUnit,
  Direction,
  Furnishing,
  PriceType,
} from '@/api/types/property.type'

/**
 * Map a single my-listings backend item to ListingOwnerDetail (UI-friendly)
 */
export function mapMyListingItem(
  item: MyListingBackendItem,
): ListingOwnerDetail {
  return {
    listingId: item.listingId,
    title: item.title,
    description: item.description || '',
    media: item.media || [],
    user: {
      userId: item.user?.userId || '',
      phoneCode: item.user?.phoneCode || '',
      phoneNumber:
        item.user?.phoneNumber || item.user?.contactPhoneNumber || '',
      email: item.user?.email || '',
      firstName: item.user?.firstName || '',
      lastName: item.user?.lastName || '',
      idDocument: '',
      taxNumber: '',
      contactPhoneNumber: item.user?.contactPhoneNumber || '',
      contactPhoneVerified: item.user?.contactPhoneVerified || false,
      avatarUrl: '',
    },
    postDate: item.postDate ? new Date(item.postDate) : new Date(),
    expiryDate: item.expiryDate || '',
    verified: item.verified || false,
    expired: item.expired || false,
    vipType: (item.vipType ?? 'NORMAL') as VipType,
    isDraft: item.isDraft || false,
    category: {
      id: item.categoryId || 0,
      name: '',
      slug: '',
      description: '',
      type: '',
      status: 0,
      created_at: item.createdAt || '',
      updated_at: item.updatedAt || '',
    },
    productType: (item.productType || 'APARTMENT') as PropertyType,
    price: item.price || 0,
    priceUnit: (item.priceUnit || 'MONTH') as PriceUnit,
    address: {
      fullAddress: item.address?.fullAddress,
      fullNewAddress:
        item.address?.fullNewAddress || item.address?.fullAddress || '',
      latitude: item.address?.latitude || 0,
      longitude: item.address?.longitude || 0,
    },
    area: item.area || 0,
    bedrooms: item.bedrooms || 0,
    bathrooms: item.bathrooms || 0,
    furnishing: (item.furnishing || 'UNFURNISHED') as Furnishing,
    direction: (item.direction || 'NORTH') as Direction,
    roomCapacity: item.roomCapacity || 0,
    waterPrice: item.waterPrice as PriceType,
    electricityPrice: item.electricityPrice as PriceType,
    internetPrice: item.internetPrice as PriceType,
    amenities: item.amenities || [],
    priceType: (item.waterPrice || 'NEGOTIABLE') as PriceType, // Use waterPrice as fallback for priceType
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
    durationDays: item.durationDays,
    // Owner view additions
    listingViews: item.statistics?.viewCount || 0,
    interested: item.statistics?.contactCount || 0,
    customers: 0,
    listingStatus: item.listingStatus || POST_STATUS.IN_REVIEW,
    rankOfVipType: item.rankOfVipType || 0,
    statistics: item.statistics
      ? {
          viewCount: item.statistics.viewCount || 0,
          contactCount: item.statistics.contactCount || 0,
          saveCount: item.statistics.saveCount || 0,
          reportCount: item.statistics.reportCount || 0,
          lastViewedAt: item.statistics.lastViewedAt || null,
        }
      : undefined,
  }
}

/**
 * Map my-listings backend response to ListContext-friendly response
 */
export function mapMyListingsBackendToFrontend(
  backend: MyListingsBackendResponse,
): ListingSearchResponse<ListingOwnerDetail> {
  const listings = (backend.listings || []).map(mapMyListingItem)
  return {
    listings,
    pagination: {
      totalCount: backend.totalCount || 0,
      currentPage: backend.currentPage || 0,
      pageSize: backend.pageSize || 0,
      totalPages: backend.totalPages || 0,
    },
  }
}
