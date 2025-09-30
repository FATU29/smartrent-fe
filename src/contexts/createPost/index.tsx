import React, { createContext, useContext, useState, ReactNode } from 'react'

// Property Information Types
export interface PropertyInfo {
  // Basic Info
  listingType: 'rent' | 'sale'
  propertyAddress: string
  searchAddress: string
  coordinates: {
    lat: number
    lng: number
  }

  // Property Details
  propertyType: 'apartment' | 'house' | 'villa' | 'studio'
  area: number
  price: number
  interiorCondition: 'furnished' | 'semi-furnished' | 'unfurnished'
  bedrooms: number
  bathrooms: number
  floors: number
  moveInDate: string

  // Utilities & Structure
  waterPrice: 'provider' | 'fixed' | 'negotiable'
  electricityPrice: 'provider' | 'fixed' | 'negotiable'
  internetPrice: 'landlord' | 'tenant' | 'included'
  houseDirection:
    | 'north'
    | 'south'
    | 'east'
    | 'west'
    | 'northeast'
    | 'northwest'
    | 'southeast'
    | 'southwest'
  balconyDirection:
    | 'north'
    | 'south'
    | 'east'
    | 'west'
    | 'northeast'
    | 'northwest'
    | 'southeast'
    | 'southwest'
  alleyWidth: number
  frontageWidth: number

  // Contact Information
  fullName: string
  email: string
  phoneNumber: string

  // AI Content
  listingTitle: string
  propertyDescription: string

  // Amenities
  amenities: string[]

  // District and Ward
  province?: string
  district: string
  ward: string

  // Address input mode
  addressMode?: 'structured' | 'freeText'

  // Media
  images: MediaItem[]
  videoUrl: string

  // Package & Configuration
  selectedMembershipPlanId?: string
  selectedVoucherPackageId?: string
}

export interface MediaItem {
  id: string
  url: string
  caption: string
  isCover: boolean
}

// Context Type
interface CreatePostContextType {
  propertyInfo: PropertyInfo
  updatePropertyInfo: (updates: Partial<PropertyInfo>) => void
  resetPropertyInfo: () => void
}

// Default Property Information
const defaultPropertyInfo: PropertyInfo = {
  // Basic Info
  listingType: 'rent',
  propertyAddress: '123 Đường Nguyễn Huệ, Quận 1, Thành phố Hồ Chí Minh',
  searchAddress: '123 Đường Nguyễn Huệ, Quận 1, Thành phố Hồ Chí Minh',
  coordinates: {
    lat: 10.7769,
    lng: 106.7009,
  },

  // Property Details
  propertyType: 'apartment',
  area: 85,
  price: 15000000,
  interiorCondition: 'furnished',
  bedrooms: 2,
  bathrooms: 2,
  floors: 1,
  moveInDate: '02/01/2024',

  // Utilities & Structure
  waterPrice: 'provider',
  electricityPrice: 'provider',
  internetPrice: 'landlord',
  houseDirection: 'south',
  balconyDirection: 'south',
  alleyWidth: 3.5,
  frontageWidth: 4.2,

  // Contact Information
  fullName: 'Nguyễn Văn A',
  email: 'nguyenvana@example.com',
  phoneNumber: '+84 123 456 789',

  // AI Content
  listingTitle: 'Căn Hộ Hiện Đại 2 Phòng Ngủ Tại Quận 1 - Trung Tâm Thành Phố',
  propertyDescription:
    'Căn hộ hiện đại đẹp nằm ngay trung tâm Thành phố Hồ Chí Minh với tầm nhìn thành phố tuyệt đẹp và tiện nghi cao cấp.',

  // Amenities
  amenities: [
    'furnished',
    'aircon',
    'toilet',
    'wifi',
    'elevator',
    'balcony',
    'kitchen',
  ],

  // District and Ward
  province: 'hcmc',
  district: 'quan1',
  ward: 'bennghe',

  // Address input mode
  addressMode: 'structured',

  // Media
  images: [
    {
      id: 'demo-1',
      url: '/images/example.png',
      caption: 'Phòng khách rộng rãi với nội thất hiện đại',
      isCover: true,
    },
  ],
  videoUrl: '',

  // Package & Configuration
  selectedMembershipPlanId: undefined,
  selectedVoucherPackageId: undefined,
}

// Create Context
const CreatePostContext = createContext<CreatePostContextType | undefined>(
  undefined,
)

// Provider Component
interface CreatePostProviderProps {
  children: ReactNode
}

export const CreatePostProvider: React.FC<CreatePostProviderProps> = ({
  children,
}) => {
  const [propertyInfo, setPropertyInfo] =
    useState<PropertyInfo>(defaultPropertyInfo)

  const updatePropertyInfo = (updates: Partial<PropertyInfo>) => {
    setPropertyInfo((prev) => ({ ...prev, ...updates }))
  }

  const resetPropertyInfo = () => {
    setPropertyInfo(defaultPropertyInfo)
  }

  return (
    <CreatePostContext.Provider
      value={{
        propertyInfo,
        updatePropertyInfo,
        resetPropertyInfo,
      }}
    >
      {children}
    </CreatePostContext.Provider>
  )
}

// Hook to use the context
export const useCreatePost = (): CreatePostContextType => {
  const context = useContext(CreatePostContext)
  if (context === undefined) {
    throw new Error('useCreatePost must be used within a CreatePostProvider')
  }
  return context
}

export default CreatePostContext
