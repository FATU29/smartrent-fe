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

interface CreatePostContextType {
  propertyInfo: Partial<CreateListingRequest>
  updatePropertyInfo: (updates: Partial<CreateListingRequest>) => void
  resetPropertyInfo: () => void
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
  const [propertyInfo, setPropertyInfo] = useState<
    Partial<CreateListingRequest>
  >({})
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

  // Video upload progress handlers
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
      updatePropertyInfo,
      resetPropertyInfo,
      videoUploadProgress,
      startVideoUpload,
      updateVideoUploadProgress,
      setVideoUploadError,
      resetVideoUploadProgress,
    }),
    [
      propertyInfo,
      videoUploadProgress,
      updatePropertyInfo,
      resetPropertyInfo,
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
