import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
} from 'react'
import { useRouter } from 'next/router'
import { useNewProvinces, useNewWards } from '@/hooks/useAddress'
import {
  CreateListingRequest,
  MediaItem,
  LISTING_TYPE,
} from '@/api/types/property.type'
import { useGetDraft } from '@/hooks/useListings/useGetDraft'
import type { DraftListingResponse } from '@/api/types/draft.type'
import { useMediaUpload } from '@/hooks/usePostContext/useMediaUpload'
import { useMediaManagement } from '@/hooks/usePostContext/useMediaManagement'
import {
  useAddressComposition,
  type FulltextAddress,
} from '@/hooks/usePostContext/useAddressComposition'
import type {
  VideoUploadProgressState,
  ImagesUploadProgressState,
  PendingImage,
} from '@/hooks/usePostContext/useMediaUpload'
import { mapDraftToFormData } from '@/utils/property/mapListingToFormData'

// Re-export types for backward compatibility
export type {
  VideoUploadProgressState,
  ImagesUploadProgressState,
  PendingImage,
  FulltextAddress,
}

interface CreatePostContextType {
  propertyInfo: CreateListingRequest
  fulltextAddress: FulltextAddress
  composedNewAddress: string
  composedLegacyAddress: string
  media: Partial<MediaItem>[]
  updatePropertyInfo: (updates: Partial<CreateListingRequest>) => void
  resetPropertyInfo: () => void
  updateFulltextAddress: (updates: Partial<FulltextAddress>) => void
  resetFulltextAddress: () => void
  setMedia: (media: Partial<MediaItem>[]) => void
  updateMedia: (updates: Partial<MediaItem>) => void
  removeMedia: (mediaId: number) => void
  resetMedia: () => void
  videoUploadProgress: VideoUploadProgressState
  startVideoUpload: (fileName?: string) => void
  updateVideoUploadProgress: (progress: number) => void
  setVideoUploadError: (message: string) => void
  resetVideoUploadProgress: () => void
  imagesUploadProgress: ImagesUploadProgressState
  startImagesUpload: (totalCount: number) => void
  updateImagesUploadProgress: (uploadedCount: number) => void
  setImagesUploadError: (message: string) => void
  resetImagesUploadProgress: () => void
  pendingImages: PendingImage[]
  addPendingImages: (images: PendingImage[]) => void
  removePendingImage: (index: number, isCover?: boolean) => void
  clearPendingImages: () => void
  uploadPendingImages: () => Promise<Array<Partial<MediaItem>>>
  isSubmitSuccess: boolean
  setIsSubmitSuccess: (value: boolean) => void
  // Draft editing
  draftId: string | null
  isDraftLoading: boolean
  loadDraftIntoForm: (draft: DraftListingResponse) => void
}

const CreatePostContext = createContext<CreatePostContextType | undefined>(
  undefined,
)

interface CreatePostProviderProps {
  children: ReactNode
}

export const CreatePostProvider: React.FC<CreatePostProviderProps> = ({
  children,
}) => {
  const router = useRouter()
  const draftIdFromQuery = router.query.draftId as string | undefined

  const [propertyInfo, setPropertyInfoState] = useState<
    Partial<CreateListingRequest>
  >({
    listingType: LISTING_TYPE.RENT,
  })
  const [fulltextAddress, setFulltextAddress] = useState<FulltextAddress>({})

  const { data: draftData, isLoading: isDraftLoading } = useGetDraft(
    draftIdFromQuery || null,
  )

  const { data: newProvinces = [] } = useNewProvinces()
  const provinceCodeForWards =
    fulltextAddress?.newProvinceCode ||
    (propertyInfo?.address?.newAddress?.provinceCode
      ? String(propertyInfo.address.newAddress.provinceCode)
      : undefined)
  const { data: newWards = [] } = useNewWards(provinceCodeForWards)

  const setPropertyInfo = (
    updater:
      | ((prev: Partial<CreateListingRequest>) => Partial<CreateListingRequest>)
      | Partial<CreateListingRequest>,
  ) => {
    if (typeof updater === 'function') {
      setPropertyInfoState(updater)
    } else {
      setPropertyInfoState(() => updater)
    }
  }

  const mediaUpload = useMediaUpload()
  const { media, setMedia, updateMedia, removeMedia, resetMedia } =
    useMediaManagement(propertyInfo, setPropertyInfo)
  const { composedNewAddress, composedLegacyAddress } = useAddressComposition(
    propertyInfo,
    fulltextAddress,
    setFulltextAddress,
    newProvinces,
    newWards,
  )

  const [isSubmitSuccess, setIsSubmitSuccess] = useState<boolean>(false)

  const loadDraftIntoForm = (draft: DraftListingResponse) => {
    const {
      propertyInfo: mappedPropertyInfo,
      fulltextAddress: fulltextAddressUpdate,
      media: mediaItems,
    } = mapDraftToFormData(draft)

    setFulltextAddress(fulltextAddressUpdate)
    setPropertyInfo(mappedPropertyInfo)
    setMedia(mediaItems)
  }

  useEffect(() => {
    if (draftData?.success && draftData.data) {
      loadDraftIntoForm(draftData.data)
    }
  }, [draftData])

  const updatePropertyInfo = (updates: Partial<CreateListingRequest>) => {
    setPropertyInfoState((prev) => ({ ...prev, ...updates }))
  }

  const resetPropertyInfo = () => {
    setPropertyInfoState({})
  }

  const updateFulltextAddress = (updates: Partial<FulltextAddress>) => {
    setFulltextAddress((prev) => ({ ...prev, ...updates }))
  }

  const resetFulltextAddress = () => {
    setFulltextAddress({})
  }

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
      setMedia,
      updateMedia,
      removeMedia,
      resetMedia,
      videoUploadProgress: mediaUpload.videoUploadProgress,
      startVideoUpload: mediaUpload.startVideoUpload,
      updateVideoUploadProgress: mediaUpload.updateVideoUploadProgress,
      setVideoUploadError: mediaUpload.setVideoUploadError,
      resetVideoUploadProgress: mediaUpload.resetVideoUploadProgress,
      imagesUploadProgress: mediaUpload.imagesUploadProgress,
      startImagesUpload: mediaUpload.startImagesUpload,
      updateImagesUploadProgress: mediaUpload.updateImagesUploadProgress,
      setImagesUploadError: mediaUpload.setImagesUploadError,
      resetImagesUploadProgress: mediaUpload.resetImagesUploadProgress,
      pendingImages: mediaUpload.pendingImages,
      addPendingImages: mediaUpload.addPendingImages,
      removePendingImage: mediaUpload.removePendingImage,
      clearPendingImages: mediaUpload.clearPendingImages,
      uploadPendingImages: mediaUpload.uploadPendingImages,
      isSubmitSuccess,
      setIsSubmitSuccess,
      draftId: draftIdFromQuery || null,
      isDraftLoading,
      loadDraftIntoForm,
    }),
    [
      propertyInfo,
      fulltextAddress,
      composedNewAddress,
      composedLegacyAddress,
      media,
      mediaUpload,
      isSubmitSuccess,
      draftIdFromQuery,
      isDraftLoading,
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
