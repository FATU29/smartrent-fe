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
import { CreateListingRequest } from '@/api/types/property.type'

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

interface MediaIds {
  videoMediaId?: number // index 0 in mediaIds array
  thumbnailMediaId?: number // index 1 in mediaIds array
}

interface MediaUrls {
  video?: string // Video URL for UI display
  images?: string[] // Image URLs for UI display
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
  mediaIds: MediaIds
  // Media URLs for UI display
  mediaUrls: MediaUrls
  // Update only API-facing listing fields
  updatePropertyInfo: (updates: Partial<CreateListingRequest>) => void
  resetPropertyInfo: () => void
  // Update only UI/fulltext address fields
  updateFulltextAddress: (updates: Partial<FulltextAddress>) => void
  resetFulltextAddress: () => void
  // Update media IDs
  updateMediaIds: (updates: Partial<MediaIds>) => void
  resetMediaIds: () => void
  // Update media URLs
  updateMediaUrls: (updates: Partial<MediaUrls>) => void
  resetMediaUrls: () => void
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
  uploadPendingImages: () => Promise<Array<{ url: string; mediaId?: string }>>
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
  const [fulltextAddress, setFulltextAddress] = useState<FulltextAddress>({})
  const [mediaIds, setMediaIds] = useState<MediaIds>({})
  const [mediaUrls, setMediaUrls] = useState<MediaUrls>({})

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

  const updateMediaIds = (updates: Partial<MediaIds>) => {
    setMediaIds((prev) => ({ ...prev, ...updates }))
  }

  const resetMediaIds = () => {
    setMediaIds({})
  }

  const updateMediaUrls = (updates: Partial<MediaUrls>) => {
    setMediaUrls((prev) => ({ ...prev, ...updates }))
  }

  const resetMediaUrls = () => {
    setMediaUrls({})
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

  const uploadPendingImages = async (): Promise<
    Array<{ url: string; mediaId?: string }>
  > => {
    if (pendingImagesState.length === 0) return []

    // Sort: cover images first, then others
    const sortedPending = [
      ...pendingImagesState.filter((img) => img.isCover),
      ...pendingImagesState.filter((img) => !img.isCover),
    ]

    const uploaded: Array<{ url: string; mediaId?: string }> = []
    let uploadedCount = 0

    startImagesUpload(sortedPending.length)

    for (const pending of sortedPending) {
      try {
        const res = await MediaService.upload({
          file: pending.file,
          mediaType: 'IMAGE',
        })
        if (res?.success && res?.data?.url) {
          const mediaId = res.data.mediaId
          uploaded.push({
            url: res.data.url,
            mediaId: mediaId ? String(mediaId) : undefined,
          })
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

  const buildMediaIdsArray = useMemo(() => {
    const ids: number[] = []
    if (mediaIds.videoMediaId) {
      ids.push(mediaIds.videoMediaId)
    }
    if (mediaIds.thumbnailMediaId) {
      ids.push(mediaIds.thumbnailMediaId)
    }
    return ids
  }, [mediaIds.videoMediaId, mediaIds.thumbnailMediaId])

  useEffect(() => {
    if (buildMediaIdsArray.length > 0) {
      setPropertyInfo((prev) => ({
        ...prev,
        mediaIds: buildMediaIdsArray,
      }))
    } else {
      setPropertyInfo((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { mediaIds, ...rest } = prev
        return rest
      })
    }
  }, [buildMediaIdsArray])

  const contextValue = useMemo(
    () => ({
      propertyInfo,
      fulltextAddress,
      composedNewAddress,
      composedLegacyAddress,
      mediaIds,
      mediaUrls,
      updatePropertyInfo,
      resetPropertyInfo,
      updateFulltextAddress,
      resetFulltextAddress,
      updateMediaIds,
      resetMediaIds,
      updateMediaUrls,
      resetMediaUrls,
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
    }),
    [
      propertyInfo,
      fulltextAddress,
      composedNewAddress,
      composedLegacyAddress,
      mediaIds,
      mediaUrls,
      videoUploadProgress,
      updatePropertyInfo,
      resetPropertyInfo,
      updateFulltextAddress,
      resetFulltextAddress,
      updateMediaIds,
      resetMediaIds,
      updateMediaUrls,
      resetMediaUrls,
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
