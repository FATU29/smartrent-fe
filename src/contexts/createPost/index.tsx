import { CreateListingRequest } from '@/api/types'
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from 'react'

// Context Type
interface VideoUploadProgressState {
  isUploading: boolean
  progress: number // 0-100
  error?: string | null
  fileName?: string | null
}

interface FulltextAddress {
  // UI selection codes (NEW address system)
  newProvinceCode?: string
  newWardCode?: string
  // Selected legacy mapping id (when choosing from merge-history list)
  legacyAddressId?: string
  // Composed / editable address strings
  propertyAddress?: string // canonical composed address used for submission preview
  displayAddress?: string // address shown in UI (may diverge when edited)
  fullAddressNew?: string // convenience mirror for AI / preview modules
  propertyAddressEdited?: boolean // user manually edited display/property address; stop auto-composition
}

interface CreatePostContextType {
  propertyInfo: CreateListingRequest
  fulltextAddress: FulltextAddress
  // Update only API-facing listing fields
  updatePropertyInfo: (updates: Partial<CreateListingRequest>) => void
  resetPropertyInfo: () => void
  // Update only UI/fulltext address fields
  updateFulltextAddress: (updates: Partial<FulltextAddress>) => void
  resetFulltextAddress: () => void
  // Video upload state & handlers
  videoUploadProgress: VideoUploadProgressState
  startVideoUpload: (fileName?: string) => void
  updateVideoUploadProgress: (progress: number) => void
  setVideoUploadError: (message: string) => void
  resetVideoUploadProgress: () => void
}

// Create Context
const CreatePostContext = createContext<CreatePostContextType | undefined>(
  undefined,
)

interface CreatePostProviderProps {
  children: ReactNode
}

export const CreatePostProvider: React.FC<CreatePostProviderProps> = ({
  children,
}) => {
  const [propertyInfo, setPropertyInfo] = useState<CreateListingRequest>({})
  const [fulltextAddress, setFulltextAddress] = useState<FulltextAddress>({})

  const [videoUploadProgress, setVideoUploadProgress] =
    useState<VideoUploadProgressState>({
      isUploading: false,
      progress: 0,
      error: null,
      fileName: null,
    })

  const updatePropertyInfo = (updates: Partial<CreateListingRequest>) => {
    setPropertyInfo((prev) => ({ ...prev, ...updates }))
  }

  const resetPropertyInfo = () => {
    setPropertyInfo({})
  }

  const updateFulltextAddress = (updates: Partial<FulltextAddress>) => {
    setFulltextAddress((prev) => ({ ...prev, ...updates }))
  }

  const resetFulltextAddress = () => {
    setFulltextAddress({})
  }

  const startVideoUpload = (fileName?: string) => {
    setVideoUploadProgress({
      isUploading: true,
      progress: 0,
      error: null,
      fileName: fileName || null,
    })
  }

  const updateVideoUploadProgress = (progress: number) => {
    setVideoUploadProgress((prev) => ({ ...prev, progress }))
  }

  const setVideoUploadError = (message: string) => {
    setVideoUploadProgress((prev) => ({
      ...prev,
      isUploading: false,
      error: message,
    }))
  }

  const resetVideoUploadProgress = () => {
    setVideoUploadProgress({
      isUploading: false,
      progress: 0,
      error: null,
      fileName: null,
    })
  }

  const contextValue = useMemo(
    () => ({
      propertyInfo,
      fulltextAddress,
      updatePropertyInfo,
      resetPropertyInfo,
      updateFulltextAddress,
      resetFulltextAddress,
      videoUploadProgress,
      startVideoUpload,
      updateVideoUploadProgress,
      setVideoUploadError,
      resetVideoUploadProgress,
    }),
    [
      propertyInfo,
      fulltextAddress,
      videoUploadProgress,
      updatePropertyInfo,
      resetPropertyInfo,
      updateFulltextAddress,
      resetFulltextAddress,
      startVideoUpload,
      updateVideoUploadProgress,
      setVideoUploadError,
      resetVideoUploadProgress,
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
