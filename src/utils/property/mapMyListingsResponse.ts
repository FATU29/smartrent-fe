import {
  ListingOwnerDetail,
  ListingSearchResponse,
  MyListingBackendItem,
  MyListingsBackendResponse,
  POST_STATUS,
  VipType,
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
    description: '',
    media: item.media || [],
    user: {
      userId: item.user?.userId || '',
      phoneCode: '',
      phoneNumber: item.user?.contactPhoneNumber || '',
      email: item.user?.email || '',
      firstName: item.user?.firstName || '',
      lastName: item.user?.lastName || '',
      idDocument: '',
      taxNumber: '',
      avatar: '',
    },
    postDate: new Date(),
    expiryDate: '',
    verified: item.verified || false,
    expired: false,
    vipType: (item.vipType ?? 'NORMAL') as VipType,
    isDraft: false,
    category: {
      id: 0,
      name: '',
      slug: '',
      description: '',
      type: '',
      status: 0,
      created_at: '',
      updated_at: '',
    },
    productType: 'APARTMENT',
    price: 0,
    priceUnit: 'MONTH',
    address: {
      fullAddress: item.address?.fullAddress,
      fullNewAddress:
        item.address?.fullNewAddress || item.address?.fullAddress || '',
      latitude: item.address?.latitude || 0,
      longitude: item.address?.longitude || 0,
    },
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
    furnishing: 'UNFURNISHED',
    direction: 'NORTH',
    roomCapacity: 0,
    priceType: 'NEGOTIABLE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Owner view additions
    listingViews: item.statistics?.viewCount || 0,
    interested: item.statistics?.contactCount || 0,
    customers: 0,
    listingStatus: POST_STATUS.IN_REVIEW,
    rankOfVipType: 0,
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
