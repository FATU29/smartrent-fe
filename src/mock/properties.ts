import { ListingDetail } from '@/api/types'

/**
 * Mock properties data for properties listing page
 * Used for development and testing purposes
 */
export const generateMockProperties = (count: number = 20): ListingDetail[] => {
  const mockProperties: ListingDetail[] = []

  const propertyTypes: Array<'APARTMENT' | 'HOUSE' | 'ROOM'> = [
    'APARTMENT',
    'HOUSE',
    'ROOM',
  ]

  const directions = [
    'NORTH',
    'SOUTH',
    'EAST',
    'WEST',
    'SOUTHEAST',
    'SOUTHWEST',
  ]

  for (let i = 1; i <= count; i++) {
    const bedrooms = Math.floor(Math.random() * 5) + 1
    const area = 30 + Math.floor(Math.random() * 200)
    const basePrice = 5000000 + Math.floor(Math.random() * 50000000)
    const propertyType =
      propertyTypes[Math.floor(Math.random() * propertyTypes.length)]

    mockProperties.push({
      listingId: i,
      title: `Căn hộ ${bedrooms}PN đẹp, view đẹp tại Quận ${Math.floor(Math.random() * 12) + 1}`,
      description: `Căn hộ cao cấp ${bedrooms} phòng ngủ, diện tích ${area}m² tại trung tâm thành phố. Nội thất đầy đủ, tiện nghi hiện đại.`,
      assets: {
        images: [
          '/images/default-image.jpg',
          '/images/example.png',
          '/images/rental-auth-bg.jpg',
        ],
        video: undefined,
      },
      user: {
        userId: `user-${i}`,
        phoneCode: '+84',
        phoneNumber: `9${Math.floor(Math.random() * 100000000)}`,
        email: `user${i}@example.com`,
        password: '',
        firstName: 'Nguyễn',
        lastName: `Văn ${String.fromCharCode(65 + (i % 26))}`,
        idDocument: `${Math.floor(Math.random() * 1000000000)}`,
        taxNumber: '',
        avatar: undefined,
      },
      postDate: new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
      ),
      expiryDate: new Date(
        Date.now() + 180 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      listingType: 'RENT',
      verified: Math.random() > 0.3,
      expired: false,
      vipType:
        Math.random() > 0.7
          ? 'GOLD'
          : Math.random() > 0.5
            ? 'SILVER'
            : 'NORMAL',
      isDraft: false,
      category: {
        id: 1,
        name: 'Căn hộ cho thuê',
        slug: 'can-ho-cho-thue',
        description: 'Căn hộ cho thuê',
        type: 'RENT',
        status: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      productType: propertyType,
      price: basePrice,
      priceUnit: 'MONTH',
      address: {
        new: `${Math.floor(Math.random() * 200)} Đường Nguyễn Huệ, Quận ${Math.floor(Math.random() * 12) + 1}, TP.HCM`,
        legacy: `${Math.floor(Math.random() * 200)} Nguyễn Huệ, Q.${Math.floor(Math.random() * 12) + 1}, TP.HCM`,
        latitude: 10.7769 + (Math.random() - 0.5) * 0.1,
        longitude: 106.7009 + (Math.random() - 0.5) * 0.1,
      },
      area,
      bedrooms,
      bathrooms: Math.min(bedrooms, Math.floor(Math.random() * 3) + 1),
      direction: directions[Math.floor(Math.random() * directions.length)] as
        | 'NORTH'
        | 'SOUTH'
        | 'EAST'
        | 'WEST'
        | 'SOUTHEAST'
        | 'SOUTHWEST',
      furnishing: Math.random() > 0.5 ? 'FULLY_FURNISHED' : 'SEMI_FURNISHED',
      propertyType: propertyType,
      roomCapacity: bedrooms + 1,
      waterPrice: 'SET_BY_OWNER',
      electricityPrice: 'SET_BY_OWNER',
      internetPrice: 'SET_BY_OWNER',
      amenities: [],
      priceType: Math.random() > 0.7 ? 'NEGOTIABLE' : 'SET_BY_OWNER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return mockProperties
}
