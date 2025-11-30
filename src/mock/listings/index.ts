import {
  ListingApi,
  ListingDetail,
  ListingOwnerDetail,
  MediaItem,
  Amenity,
  LocationPricing,
  CategoryType,
  ListingSearchBackendResponse,
  ProvinceStatsItem,
  POST_STATUS,
  FURNISHING,
  PRICE_UNIT,
  SortKey,
} from '@/api/types/property.type'
import { UserApi } from '@/api/types/user.type'

// ============= MOCK USERS =============

export const mockUsers: UserApi[] = [
  {
    userId: 'user-001',
    phoneCode: '+84',
    phoneNumber: '0901234567',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    idDocument: '123456789',
    taxNumber: 'TAX123456',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    userId: 'user-002',
    phoneCode: '+84',
    phoneNumber: '0912345678',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    idDocument: '987654321',
    taxNumber: 'TAX654321',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    userId: 'user-003',
    phoneCode: '+84',
    phoneNumber: '0923456789',
    email: 'mike.johnson@example.com',
    firstName: 'Mike',
    lastName: 'Johnson',
    idDocument: '456789123',
    taxNumber: 'TAX789123',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
]

// ============= MOCK CATEGORIES =============

export const mockCategories: CategoryType[] = [
  {
    id: 1,
    name: 'For Rent',
    slug: 'for-rent',
    description: 'Properties available for rent',
    type: 'RENT',
    status: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'For Sale',
    slug: 'for-sale',
    description: 'Properties available for sale',
    type: 'SALE',
    status: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

// ============= MOCK AMENITIES =============

export const mockAmenities: Amenity[] = [
  {
    amenityId: 1,
    name: 'Air Conditioning',
    icon: '❄️',
    description: 'Centralized air conditioning system',
    category: 'BASIC',
    isActive: true,
  },
  {
    amenityId: 2,
    name: 'WiFi',
    icon: '📶',
    description: 'High-speed internet connection',
    category: 'BASIC',
    isActive: true,
  },
  {
    amenityId: 3,
    name: 'Parking',
    icon: '🚗',
    description: 'Designated parking space',
    category: 'CONVENIENCE',
    isActive: true,
  },
  {
    amenityId: 4,
    name: 'Swimming Pool',
    icon: '🏊',
    description: 'Shared swimming pool',
    category: 'ENTERTAINMENT',
    isActive: true,
  },
  {
    amenityId: 5,
    name: 'Gym',
    icon: '💪',
    description: 'Fitness center',
    category: 'ENTERTAINMENT',
    isActive: true,
  },
  {
    amenityId: 6,
    name: 'Security',
    icon: '🔒',
    description: '24/7 security service',
    category: 'SECURITY',
    isActive: true,
  },
  {
    amenityId: 7,
    name: 'Elevator',
    icon: '🛗',
    description: 'Building elevator',
    category: 'CONVENIENCE',
    isActive: true,
  },
  {
    amenityId: 8,
    name: 'Balcony',
    icon: '🏢',
    description: 'Private balcony',
    category: 'BASIC',
    isActive: true,
  },
]

// ============= MOCK MEDIA =============

export const mockMediaItems: MediaItem[][] = [
  [
    {
      mediaId: 1,
      listingId: 1,
      mediaType: 'IMAGE',
      sourceType: 'UPLOAD',
      url: '/images/default-image.jpg',
      isPrimary: true,
      sortOrder: 1,
      status: POST_STATUS.DISPLAYING,
      createdAt: '2024-11-01T00:00:00Z',
    },
    {
      mediaId: 2,
      listingId: 1,
      mediaType: 'IMAGE',
      sourceType: 'UPLOAD',
      url: '/images/default-image.jpg',
      isPrimary: false,
      sortOrder: 2,
      status: POST_STATUS.DISPLAYING,
      createdAt: '2024-11-01T00:00:00Z',
    },
    {
      mediaId: 3,
      listingId: 1,
      mediaType: 'IMAGE',
      sourceType: 'UPLOAD',
      url: '/images/default-image.jpg',
      isPrimary: false,
      sortOrder: 3,
      status: POST_STATUS.DISPLAYING,
      createdAt: '2024-11-01T00:00:00Z',
    },
  ],
  [
    {
      mediaId: 4,
      listingId: 2,
      mediaType: 'IMAGE',
      sourceType: 'UPLOAD',
      url: '/images/default-image.jpg',
      isPrimary: true,
      sortOrder: 1,
      status: POST_STATUS.DISPLAYING,
      createdAt: '2024-11-02T00:00:00Z',
    },
    {
      mediaId: 5,
      listingId: 2,
      mediaType: 'IMAGE',
      sourceType: 'UPLOAD',
      url: '/images/default-image.jpg',
      isPrimary: false,
      sortOrder: 2,
      status: POST_STATUS.DISPLAYING,
      createdAt: '2024-11-02T00:00:00Z',
    },
  ],
  [
    {
      mediaId: 6,
      listingId: 3,
      mediaType: 'IMAGE',
      sourceType: 'UPLOAD',
      url: '/images/default-image.jpg',
      isPrimary: true,
      sortOrder: 1,
      status: POST_STATUS.DISPLAYING,
      createdAt: '2024-11-03T00:00:00Z',
    },
    {
      mediaId: 7,
      listingId: 3,
      mediaType: 'VIDEO',
      sourceType: 'UPLOAD',
      url: 'https://www.youtube.com/watch?v=sample',
      isPrimary: false,
      sortOrder: 2,
      status: POST_STATUS.DISPLAYING,
      createdAt: '2024-11-03T00:00:00Z',
    },
  ],
]

// ============= MOCK LOCATION PRICING =============

export const mockLocationPricing: LocationPricing = {
  wardPricing: {
    locationType: 'WARD',
    locationId: 1,
    locationName: 'Ward 1, District 1',
    totalListings: 150,
    averagePrice: 15000000,
    minPrice: 8000000,
    maxPrice: 30000000,
    medianPrice: 14000000,
    priceUnit: PRICE_UNIT.MONTH,
    productType: 'APARTMENT',
    averageArea: 75,
    averagePricePerSqm: 200000,
  },
  districtPricing: {
    locationType: 'DISTRICT',
    locationId: 1,
    totalListings: 500,
    averagePrice: 12000000,
    priceUnit: PRICE_UNIT.MONTH,
  },
  provincePricing: {
    locationType: 'PROVINCE',
    locationId: 79,
    totalListings: 5000,
    averagePrice: 10000000,
    priceUnit: PRICE_UNIT.MONTH,
  },
  similarListingsInWard: [
    {
      listingId: 101,
      title: 'Similar Apartment 1',
      price: 14500000,
      priceUnit: PRICE_UNIT.MONTH,
      area: 70,
      pricePerSqm: 207142,
      bedrooms: 2,
      bathrooms: 2,
      productType: 'APARTMENT',
      vipType: 'SILVER',
      verified: true,
    },
    {
      listingId: 102,
      title: 'Similar Apartment 2',
      price: 15500000,
      priceUnit: PRICE_UNIT.MONTH,
      area: 80,
      pricePerSqm: 193750,
      bedrooms: 2,
      bathrooms: 2,
      productType: 'APARTMENT',
      vipType: 'NORMAL',
      verified: false,
    },
  ],
  priceComparison: 'AVERAGE',
  percentageDifferenceFromAverage: 2.5,
}

// ============= MOCK LISTINGS =============

export const mockListings: ListingApi[] = [
  {
    listingId: 1,
    title: 'Luxury Apartment in Downtown - City View',
    description:
      'Beautiful 2-bedroom apartment with stunning city views. Modern design with high-end appliances. Located in the heart of District 1, close to shopping centers, restaurants, and public transportation.',
    media: mockMediaItems[0],
    user: mockUsers[0],
    postDate: new Date('2024-11-15T00:00:00Z'),
    expiryDate: '2024-12-15T00:00:00Z',
    verified: true,
    expired: false,
    vipType: 'GOLD',
    isDraft: false,
    category: mockCategories[0],
    productType: 'APARTMENT',
    price: 15000000,
    priceUnit: PRICE_UNIT.MONTH,
    address: {
      fullAddress:
        '123 Nguyen Hue Street, Ward 1, District 1, Ho Chi Minh City',
      fullNewAddress:
        '123 Nguyen Hue Street, Ward 1, District 1, Ho Chi Minh City',
      latitude: 10.7769,
      longitude: 106.7009,
    },
    area: 75,
    bedrooms: 2,
    bathrooms: 2,
    direction: 'EAST',
    furnishing: FURNISHING.FULLY_FURNISHED,
    propertyType: 'APARTMENT',
    amenities: [
      mockAmenities[0],
      mockAmenities[1],
      mockAmenities[2],
      mockAmenities[6],
    ],
    priceType: 'SET_BY_OWNER',
    waterPrice: 'SET_BY_OWNER',
    electricityPrice: 'SET_BY_OWNER',
    internetPrice: 'PROVIDER_RATE',
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-11-15T00:00:00Z',
  },
  {
    listingId: 2,
    title: 'Modern Studio near University - Perfect for Students',
    description:
      'Cozy studio apartment perfect for students or young professionals. Fully furnished with all essential amenities. Walking distance to universities and local markets.',
    media: mockMediaItems[1],
    user: mockUsers[1],
    postDate: new Date('2024-11-20T00:00:00Z'),
    expiryDate: '2024-12-20T00:00:00Z',
    verified: false,
    expired: false,
    vipType: 'NORMAL',
    isDraft: false,
    category: mockCategories[0],
    productType: 'STUDIO',
    price: 6000000,
    priceUnit: PRICE_UNIT.MONTH,
    address: {
      fullAddress:
        '456 Le Van Sy Street, Ward 10, Phu Nhuan District, Ho Chi Minh City',
      fullNewAddress:
        '456 Le Van Sy Street, Ward 10, Phu Nhuan District, Ho Chi Minh City',
      latitude: 10.7982,
      longitude: 106.6826,
    },
    area: 35,
    bedrooms: 1,
    bathrooms: 1,
    direction: 'NORTH',
    furnishing: FURNISHING.FULLY_FURNISHED,
    propertyType: 'STUDIO',
    roomCapacity: 2,
    amenities: [mockAmenities[0], mockAmenities[1]],
    priceType: 'NEGOTIABLE',
    waterPrice: 'PROVIDER_RATE',
    electricityPrice: 'PROVIDER_RATE',
    internetPrice: 'PROVIDER_RATE',
    createdAt: '2024-11-05T00:00:00Z',
    updatedAt: '2024-11-20T00:00:00Z',
  },
  {
    listingId: 3,
    title: 'Spacious House with Garden - Family Paradise',
    description:
      'Beautiful 4-bedroom house with a large garden and parking space. Ideal for families. Located in a quiet neighborhood with good security. Close to international schools and supermarkets.',
    media: mockMediaItems[2],
    user: mockUsers[2],
    postDate: new Date('2024-11-10T00:00:00Z'),
    expiryDate: '2024-12-10T00:00:00Z',
    verified: true,
    expired: false,
    vipType: 'DIAMOND',
    isDraft: false,
    category: mockCategories[0],
    productType: 'HOUSE',
    price: 35000000,
    priceUnit: PRICE_UNIT.MONTH,
    address: {
      fullAddress:
        '789 Tran Hung Dao Street, Ward 2, District 5, Ho Chi Minh City',
      fullNewAddress:
        '789 Tran Hung Dao Street, Ward 2, District 5, Ho Chi Minh City',
      latitude: 10.7543,
      longitude: 106.6668,
    },
    area: 200,
    bedrooms: 4,
    bathrooms: 3,
    direction: 'SOUTH',
    furnishing: FURNISHING.SEMI_FURNISHED,
    propertyType: 'HOUSE',
    amenities: [
      mockAmenities[0],
      mockAmenities[1],
      mockAmenities[2],
      mockAmenities[3],
      mockAmenities[5],
      mockAmenities[7],
    ],
    priceType: 'SET_BY_OWNER',
    waterPrice: 'SET_BY_OWNER',
    electricityPrice: 'SET_BY_OWNER',
    internetPrice: 'SET_BY_OWNER',
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-11-10T00:00:00Z',
  },
  {
    listingId: 4,
    title: 'Affordable Room in Shared Apartment',
    description:
      'Clean and comfortable room in a shared apartment. Perfect for budget-conscious students. Shared kitchen and bathroom facilities. Friendly housemates.',
    media: mockMediaItems[0],
    user: mockUsers[0],
    postDate: new Date('2024-11-25T00:00:00Z'),
    expiryDate: '2024-12-25T00:00:00Z',
    verified: false,
    expired: false,
    vipType: 'NORMAL',
    isDraft: false,
    category: mockCategories[0],
    productType: 'ROOM',
    price: 3000000,
    priceUnit: PRICE_UNIT.MONTH,
    address: {
      fullAddress:
        '321 Vo Van Tan Street, Ward 5, District 3, Ho Chi Minh City',
      fullNewAddress:
        '321 Vo Van Tan Street, Ward 5, District 3, Ho Chi Minh City',
      latitude: 10.7825,
      longitude: 106.6895,
    },
    area: 20,
    bedrooms: 1,
    bathrooms: 1,
    direction: 'WEST',
    furnishing: FURNISHING.SEMI_FURNISHED,
    propertyType: 'ROOM',
    roomCapacity: 1,
    amenities: [mockAmenities[0], mockAmenities[1]],
    priceType: 'NEGOTIABLE',
    waterPrice: 'PROVIDER_RATE',
    electricityPrice: 'PROVIDER_RATE',
    internetPrice: 'PROVIDER_RATE',
    createdAt: '2024-11-08T00:00:00Z',
    updatedAt: '2024-11-25T00:00:00Z',
  },
  {
    listingId: 5,
    title: 'Premium Penthouse with Rooftop Terrace',
    description:
      'Exclusive penthouse on the top floor with a private rooftop terrace. Panoramic city views, luxury finishes, and premium amenities including a private gym and entertainment area.',
    media: mockMediaItems[1],
    user: mockUsers[1],
    postDate: new Date('2024-11-18T00:00:00Z'),
    expiryDate: '2024-12-18T00:00:00Z',
    verified: true,
    expired: false,
    vipType: 'DIAMOND',
    isDraft: false,
    category: mockCategories[0],
    productType: 'APARTMENT',
    price: 80000000,
    priceUnit: PRICE_UNIT.MONTH,
    address: {
      fullAddress:
        '555 Hai Ba Trung Street, Ward 8, District 1, Ho Chi Minh City',
      fullNewAddress:
        '555 Hai Ba Trung Street, Ward 8, District 1, Ho Chi Minh City',
      latitude: 10.7821,
      longitude: 106.6988,
    },
    area: 250,
    bedrooms: 4,
    bathrooms: 4,
    direction: 'SOUTHEAST',
    furnishing: FURNISHING.FULLY_FURNISHED,
    propertyType: 'APARTMENT',
    amenities: mockAmenities,
    priceType: 'SET_BY_OWNER',
    waterPrice: 'SET_BY_OWNER',
    electricityPrice: 'SET_BY_OWNER',
    internetPrice: 'SET_BY_OWNER',
    createdAt: '2024-11-03T00:00:00Z',
    updatedAt: '2024-11-18T00:00:00Z',
  },
]

// ============= MOCK LISTING DETAILS =============

export const mockListingDetails: ListingDetail[] = mockListings.map(
  (listing) => ({
    ...listing,
    locationPricing: mockLocationPricing,
  }),
)

// ============= MOCK LISTING OWNER DETAILS =============

export const mockListingOwnerDetails: ListingOwnerDetail[] = mockListings.map(
  (listing, index) => ({
    ...listing,
    listingViews: 1000 + index * 500,
    interested: 50 + index * 20,
    customers: 10 + index * 5,
    status: POST_STATUS.DISPLAYING,
    rankOfVipType: index + 1,
  }),
)

// ============= MOCK SEARCH RESPONSE =============

export const mockListingSearchResponse: ListingSearchBackendResponse = {
  listings: mockListingDetails,
  totalCount: mockListingDetails.length,
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  recommendations: mockListingDetails.slice(0, 3),
  filterCriteria: {
    provinceId: 79,
    page: 1,
    size: 10,
    verified: false,
    sortBy: SortKey.NEWEST,
  },
}

// ============= MOCK PROVINCE STATS =============

export const mockProvinceStats: ProvinceStatsItem[] = [
  {
    provinceId: 79,
    provinceCode: '79',
    provinceName: 'Ho Chi Minh City',
    totalListings: 5000,
    verifiedListings: 3500,
    vipListings: 1200,
  },
  {
    provinceId: 1,
    provinceCode: '01',
    provinceName: 'Ha Noi',
    totalListings: 4200,
    verifiedListings: 3000,
    vipListings: 1000,
  },
  {
    provinceId: 48,
    provinceCode: '48',
    provinceName: 'Da Nang',
    totalListings: 1500,
    verifiedListings: 1000,
    vipListings: 400,
  },
  {
    provinceId: 31,
    provinceCode: '31',
    provinceName: 'Hai Phong',
    totalListings: 800,
    verifiedListings: 550,
    vipListings: 200,
  },
  {
    provinceId: 92,
    provinceCode: '92',
    provinceName: 'Can Tho',
    totalListings: 600,
    verifiedListings: 400,
    vipListings: 150,
  },
]

// ============= EXPORT ALL =============

const mockListingsData = {
  users: mockUsers,
  categories: mockCategories,
  amenities: mockAmenities,
  mediaItems: mockMediaItems,
  locationPricing: mockLocationPricing,
  listings: mockListings,
  listingDetails: mockListingDetails,
  listingOwnerDetails: mockListingOwnerDetails,
  searchResponse: mockListingSearchResponse,
  provinceStats: mockProvinceStats,
}

export default mockListingsData
