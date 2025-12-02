import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
} from 'react'
import { useNewProvinces, useNewWards } from '@/hooks/useAddress'
import { MediaService } from '@/api/services'
import {
  CreateListingRequest,
  MediaItem,
  LISTING_TYPE,
} from '@/api/types/property.type'

// Context Type
interface VideoUploadProgressState {
  isUploading: boolean
  progress: number // 0-100
  error?: string | null
  fileName?: string | null
}

interface ImagesUploadProgressState {
  isUploading: boolean
  uploadedCount: number
  totalCount: number
  error?: string | null
}

interface FulltextAddress {
  newProvinceCode?: string
  newWardCode?: string
  // Selected legacy mapping id (when choosing from merge-history list)
  legacyAddressId?: string
  // Legacy address text for display and geocoding
  legacyAddressText?: string
  // Composed / editable address strings
  propertyAddress?: string // canonical composed address used for submission preview
  displayAddress?: string // address shown in UI (may diverge when edited)
  fullAddressNew?: string // convenience mirror for AI / preview modules
  propertyAddressEdited?: boolean // user manually edited display/property address; stop auto-composition
}

interface PendingImage {
  file: File
  previewUrl: string
  isCover?: boolean
}

interface CreatePostContextType {
  propertyInfo: CreateListingRequest
  fulltextAddress: FulltextAddress
  // Composed addresses
  composedNewAddress: string
  composedLegacyAddress: string
  // Media IDs for submission
  // Media URLs for UI display
  media: Partial<MediaItem>[]
  // Update only API-facing listing fields
  updatePropertyInfo: (updates: Partial<CreateListingRequest>) => void
  resetPropertyInfo: () => void
  // Update only UI/fulltext address fields
  updateFulltextAddress: (updates: Partial<FulltextAddress>) => void
  resetFulltextAddress: () => void
  // Update media
  updateMedia: (updates: Partial<MediaItem>) => void
  resetMedia: () => void
  // Video upload state & handlers
  videoUploadProgress: VideoUploadProgressState
  startVideoUpload: (fileName?: string) => void
  updateVideoUploadProgress: (progress: number) => void
  setVideoUploadError: (message: string) => void
  resetVideoUploadProgress: () => void
  // Images upload state & handlers
  imagesUploadProgress: ImagesUploadProgressState
  startImagesUpload: (totalCount: number) => void
  updateImagesUploadProgress: (uploadedCount: number) => void
  setImagesUploadError: (message: string) => void
  resetImagesUploadProgress: () => void
  // Pending images state
  pendingImages: PendingImage[]
  addPendingImages: (images: PendingImage[]) => void
  removePendingImage: (index: number, isCover?: boolean) => void
  clearPendingImages: () => void
  uploadPendingImages: () => Promise<Array<Partial<MediaItem>>>
  // Submit success state
  isSubmitSuccess: boolean
  setIsSubmitSuccess: (value: boolean) => void
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
  >({
    listingType: LISTING_TYPE.RENT,
  })
  const [fulltextAddress, setFulltextAddress] = useState<FulltextAddress>({})
  const [media, setMedia] = useState<Partial<MediaItem>[]>([])

  // Fetch provinces and wards for address composition
  const { data: newProvinces = [] } = useNewProvinces()
  const provinceCodeForWards =
    fulltextAddress?.newProvinceCode ||
    (propertyInfo?.address?.new?.provinceCode
      ? String(propertyInfo.address.new.provinceCode)
      : undefined)
  const { data: newWards = [] } = useNewWards(provinceCodeForWards)

  const [videoUploadProgress, setVideoUploadProgress] =
    useState<VideoUploadProgressState>({
      isUploading: false,
      progress: 0,
      error: null,
      fileName: null,
    })

  const [imagesUploadProgress, setImagesUploadProgress] =
    useState<ImagesUploadProgressState>({
      isUploading: false,
      uploadedCount: 0,
      totalCount: 0,
      error: null,
    })

  const [pendingImagesState, setPendingImagesState] = useState<PendingImage[]>(
    [],
  )

  const [isSubmitSuccess, setIsSubmitSuccess] = useState<boolean>(false)

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

  const updateMedia = (updates: Partial<MediaItem>) => {
    setMedia((prev) => {
      // If updating VIDEO, replace existing video (only 1 video allowed)
      if (updates.mediaType === 'VIDEO') {
        return [...prev.filter((m) => m.mediaType !== 'VIDEO'), updates]
      }
      // For images, just add to the array
      return [...prev, updates]
    })
  }

  const resetMedia = () => {
    // Remove only VIDEO from media array (keep images)
    setMedia((prev) => prev.filter((m) => m.mediaType !== 'VIDEO'))
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

  const startImagesUpload = (totalCount: number) => {
    setImagesUploadProgress({
      isUploading: true,
      uploadedCount: 0,
      totalCount,
      error: null,
    })
  }

  const updateImagesUploadProgress = (uploadedCount: number) => {
    setImagesUploadProgress((prev) => ({
      ...prev,
      uploadedCount,
    }))
  }

  const setImagesUploadError = (message: string) => {
    setImagesUploadProgress((prev) => ({
      ...prev,
      isUploading: false,
      error: message,
    }))
  }

  const resetImagesUploadProgress = () => {
    setImagesUploadProgress({
      isUploading: false,
      uploadedCount: 0,
      totalCount: 0,
      error: null,
    })
  }

  const addPendingImages = (images: PendingImage[]) => {
    setPendingImagesState((prev) => [...prev, ...images])
  }

  const removePendingImage = (index: number, isCover?: boolean) => {
    setPendingImagesState((prev) => {
      if (isCover) {
        const coverIndex = prev.findIndex((img) => img.isCover)
        if (coverIndex !== -1) {
          URL.revokeObjectURL(prev[coverIndex].previewUrl)
          return prev.filter((_, i) => i !== coverIndex)
        }
      }
      URL.revokeObjectURL(prev[index].previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  const clearPendingImages = () => {
    pendingImagesState.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    setPendingImagesState([])
  }

  const uploadPendingImages = async (): Promise<Array<Partial<MediaItem>>> => {
    if (pendingImagesState.length === 0) return []

    const uploaded: Array<Partial<MediaItem>> = []
    let uploadedCount = 0

    startImagesUpload(pendingImagesState.length)

    for (const pending of pendingImagesState) {
      try {
        const res = await MediaService.upload({
          file: pending.file,
          mediaType: 'IMAGE',
          isPrimary: pending.isCover || false,
        })

        if (res?.success && res?.data?.url) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { status, ...restData } = res.data
          const mediaItem: Partial<MediaItem> = {
            ...restData,
            mediaId: Number(res.data.mediaId),
            isPrimary: pending.isCover || false,
            mediaType: 'IMAGE',
          }
          uploaded.push(mediaItem)
          uploadedCount++
          updateImagesUploadProgress(uploadedCount)
        } else {
          throw new Error('Upload failed')
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Failed to upload ${pending.file.name}`
        setImagesUploadError(errorMessage)
        throw new Error(errorMessage)
      }
    }

    return uploaded
  }

  const composedNewAddress = useMemo(() => {
    const parts: string[] = []
    const street = propertyInfo?.address?.new?.street?.trim()
    if (street) parts.push(street)

    const wardCode =
      fulltextAddress?.newWardCode ||
      (propertyInfo?.address?.new?.wardCode
        ? String(propertyInfo.address.new.wardCode)
        : undefined)
    const ward = newWards.find((w) => w.code === wardCode)
    if (ward?.name) parts.push(ward.name)

    const provinceCode =
      fulltextAddress?.newProvinceCode ||
      (propertyInfo?.address?.new?.provinceCode
        ? String(propertyInfo.address.new.provinceCode)
        : undefined)
    const province = newProvinces.find((p) => p.id === provinceCode)
    if (province?.name) parts.push(province.name)

    return parts.join(', ')
  }, [
    propertyInfo?.address?.new?.street,
    propertyInfo?.address?.new?.wardCode,
    propertyInfo?.address?.new?.provinceCode,
    fulltextAddress?.newWardCode,
    fulltextAddress?.newProvinceCode,
    newWards,
    newProvinces,
  ])

  const legacyAddressText = fulltextAddress?.legacyAddressText || ''
  const composedLegacyAddress = useMemo(() => {
    if (!legacyAddressText) return ''
    const street = propertyInfo?.address?.new?.street?.trim()
    if (street) {
      return `${street}, ${legacyAddressText}`
    }
    return legacyAddressText
  }, [propertyInfo?.address?.new?.street, legacyAddressText])

  useEffect(() => {
    if (fulltextAddress?.propertyAddressEdited) return

    if (
      composedNewAddress &&
      composedNewAddress !== fulltextAddress?.displayAddress
    ) {
      setFulltextAddress((prev) => ({
        ...prev,
        displayAddress: composedNewAddress,
        propertyAddress: composedNewAddress,
        fullAddressNew: composedNewAddress,
      }))
    }
  }, [
    composedNewAddress,
    fulltextAddress?.propertyAddressEdited,
    fulltextAddress?.displayAddress,
  ])

  // Auto-sync mediaIds from media array to propertyInfo
  useEffect(() => {
    const mediaIds = media
      .filter((item) => item.mediaId !== undefined)
      .map((item) => Number(item.mediaId))
      .filter((id) => !isNaN(id) && id > 0)

    // Only update if mediaIds have changed
    const currentIds = propertyInfo.mediaIds || []
    const hasChanged =
      mediaIds.length !== currentIds.length ||
      mediaIds.some((id, index) => id !== currentIds[index])

    if (hasChanged) {
      setPropertyInfo((prev) => ({
        ...prev,
        mediaIds,
      }))
    }
  }, [media])

  const contextValue = useMemo(
    () => ({
      propertyInfo,
      fulltextAddress,
      composedNewAddress,
      composedLegacyAddress,
      media,
      updatePropertyInfo,
      resetPropertyInfo,
      updateFulltextAddress,
      resetFulltextAddress,
      updateMedia,
      resetMedia,
      videoUploadProgress,
      startVideoUpload,
      updateVideoUploadProgress,
      setVideoUploadError,
      resetVideoUploadProgress,
      imagesUploadProgress,
      startImagesUpload,
      updateImagesUploadProgress,
      setImagesUploadError,
      resetImagesUploadProgress,
      pendingImages: pendingImagesState,
      addPendingImages,
      removePendingImage,
      clearPendingImages,
      uploadPendingImages,
      isSubmitSuccess,
      setIsSubmitSuccess,
    }),
    [
      propertyInfo,
      fulltextAddress,
      composedNewAddress,
      composedLegacyAddress,
      media,
      videoUploadProgress,
      imagesUploadProgress,
      pendingImagesState,
      isSubmitSuccess,
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
