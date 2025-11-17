import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from 'react'
import type { VipTierCode } from '@/api/types/vip-tier.type'
import type { PriceType } from '@/api/types/property.type'

// Property Information Types
export interface PropertyInfo {
  // Basic Info
  propertyAddress: string
  searchAddress: string
  coordinates: {
    lat: number
    lng: number
  }

  // Property Details
  propertyType: 'room' | 'apartment' | 'house' | 'office' | 'store' // Match PROPERTY_TYPES (excluding 'ALL')
  area: number
  price: number
  interiorCondition: 'furnished' | 'semi-furnished' | 'unfurnished'
  bedrooms: number
  bathrooms: number
  floors: number
  moveInDate: string

  // Utilities & Structure
  waterPrice: PriceType
  electricityPrice: PriceType
  internetPrice: PriceType
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

  // District and Ward (Legacy structure - 63 provinces)
  province?: string
  district: string
  ward: string

  // Street and Project (Legacy)
  streetId?: string
  projectId?: string

  // New structure (34 provinces)
  newProvinceCode?: string
  newWardCode?: string

  // Address structure type
  addressStructureType?: 'legacy' | 'new'

  // Address input mode
  addressMode?: 'structured' | 'freeText'

  // Whether user manually edited display address (to stop auto-overwrite)
  propertyAddressEdited?: boolean

  // Media
  images: MediaItem[]
  videoUrl: string

  // Package & Configuration
  selectedMembershipPlanId?: string
  selectedVoucherPackageId?: string
  selectedPackageType?: VipTierCode | string // VIP tier code (NORMAL, SILVER, GOLD, DIAMOND)
  selectedTierId?: number // VIP tier ID from API
  selectedDuration?: number // Duration in days (10, 15, 30)
  packageStartDate?: string

  // Applied promotion from membership benefits (free posting)
  appliedPromotionBenefitId?: number
  appliedPromotionType?: string
  appliedPromotionLabel?: string
}

export interface MediaItem {
  id: string
  url: string
  caption: string
  isCover: boolean
}

export interface VideoUploadProgress {
  isUploading: boolean
  progress: number
  fileName: string
  error: string | null
  uploadedUrl: string | null
}

export interface ImageUploadProgress {
  isUploading: boolean
  progress: number // 0-100 total across all selected images
  currentIndex: number // 1-based index of the file being uploaded
  total: number
  fileName?: string
  error: string | null
}

// Context Type
interface CreatePostContextType {
  propertyInfo: Partial<PropertyInfo>
  updatePropertyInfo: (updates: Partial<PropertyInfo>) => void
  resetPropertyInfo: () => void
  videoUploadProgress: VideoUploadProgress
  setVideoUploadProgress: (progress: Partial<VideoUploadProgress>) => void
  resetVideoUploadProgress: () => void
  imageUploadProgress: ImageUploadProgress
  setImageUploadProgress: (progress: Partial<ImageUploadProgress>) => void
  resetImageUploadProgress: () => void
}

// Create Context
const CreatePostContext = createContext<CreatePostContextType | undefined>(
  undefined,
)

// Provider Component
interface CreatePostProviderProps {
  children: ReactNode
}

const defaultVideoUploadProgress: VideoUploadProgress = {
  isUploading: false,
  progress: 0,
  fileName: '',
  error: null,
  uploadedUrl: null,
}

const defaultImageUploadProgress: ImageUploadProgress = {
  isUploading: false,
  progress: 0,
  currentIndex: 0,
  total: 0,
  fileName: '',
  error: null,
}

export const CreatePostProvider: React.FC<CreatePostProviderProps> = ({
  children,
}) => {
  const [propertyInfo, setPropertyInfo] = useState<Partial<PropertyInfo>>({
    amenities: [],
  })
  const [videoUploadProgress, setVideoUploadProgressState] =
    useState<VideoUploadProgress>(defaultVideoUploadProgress)
  const [imageUploadProgress, setImageUploadProgressState] =
    useState<ImageUploadProgress>(defaultImageUploadProgress)

  const updatePropertyInfo = (updates: Partial<PropertyInfo>) => {
    setPropertyInfo((prev) => ({ ...prev, ...updates }))
  }

  const resetPropertyInfo = () => {
    setPropertyInfo({
      amenities: [],
    })
  }

  const setVideoUploadProgress = (progress: Partial<VideoUploadProgress>) => {
    setVideoUploadProgressState((prev) => ({ ...prev, ...progress }))
  }

  const resetVideoUploadProgress = () => {
    setVideoUploadProgressState(defaultVideoUploadProgress)
  }

  const setImageUploadProgress = (progress: Partial<ImageUploadProgress>) => {
    setImageUploadProgressState((prev) => ({ ...prev, ...progress }))
  }

  const resetImageUploadProgress = () => {
    setImageUploadProgressState(defaultImageUploadProgress)
  }

  const contextValue = useMemo(
    () => ({
      propertyInfo,
      updatePropertyInfo,
      resetPropertyInfo,
      videoUploadProgress,
      setVideoUploadProgress,
      resetVideoUploadProgress,
      imageUploadProgress,
      setImageUploadProgress,
      resetImageUploadProgress,
    }),
    [
      propertyInfo,
      updatePropertyInfo,
      resetPropertyInfo,
      videoUploadProgress,
      setVideoUploadProgress,
      resetVideoUploadProgress,
      imageUploadProgress,
      setImageUploadProgress,
      resetImageUploadProgress,
    ],
  )

  return (
    <CreatePostContext.Provider value={contextValue}>
      {children}
    </CreatePostContext.Provider>
  )
}

export const useCreatePost = (): CreatePostContextType => {
  const context = useContext(CreatePostContext)
  if (context === undefined) {
    throw new Error('useCreatePost must be used within a CreatePostProvider')
  }
  return context
}

export default CreatePostContext
