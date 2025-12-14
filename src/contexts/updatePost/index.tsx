import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useRef,
} from 'react'
import { useRouter } from 'next/router'
import { useNewProvinces, useNewWards } from '@/hooks/useAddress'
import {
  CreateListingRequest,
  MediaItem,
  LISTING_TYPE,
} from '@/api/types/property.type'
import type { ListingDetail } from '@/api/types/property.type'
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
import { mapListingToFormData } from '@/utils/property/mapListingToFormData'

// Re-export types for backward compatibility
export type {
  VideoUploadProgressState,
  ImagesUploadProgressState,
  PendingImage,
  FulltextAddress,
}

interface UpdatePostContextType {
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
  // Update editing
  listingId: string | null
  isListingLoading: boolean
  loadListingIntoForm: (listing: ListingDetail) => Promise<void>
}

const UpdatePostContext = createContext<UpdatePostContextType | undefined>(
  undefined,
)

interface UpdatePostProviderProps {
  children: ReactNode
}

export const UpdatePostProvider: React.FC<UpdatePostProviderProps> = ({
  children,
}) => {
  const router = useRouter()
  const listingIdFromQuery = router.query.id as string | undefined

  const [propertyInfo, setPropertyInfoState] = useState<
    Partial<CreateListingRequest>
  >({
    listingType: LISTING_TYPE.RENT,
  })
  const [fulltextAddress, setFulltextAddress] = useState<FulltextAddress>({})
  const [isListingLoading] = useState(false)

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

  const isLoadingAddressRef = useRef(false)

  const loadListingIntoForm = async (listing: ListingDetail) => {
    if (isLoadingAddressRef.current) {
      return
    }

    isLoadingAddressRef.current = true

    const {
      propertyInfo: mappedPropertyInfo,
      fulltextAddress: fulltextAddressUpdate,
      media: mediaItems,
    } = mapListingToFormData(listing)

    setFulltextAddress(fulltextAddressUpdate)
    setPropertyInfo(mappedPropertyInfo)
    setMedia(mediaItems)

    isLoadingAddressRef.current = false
  }

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
      // Update editing
      listingId: listingIdFromQuery || null,
      isListingLoading,
      loadListingIntoForm,
    }),
    [
      propertyInfo,
      fulltextAddress,
      composedNewAddress,
      composedLegacyAddress,
      media,
      mediaUpload,
      isSubmitSuccess,
      listingIdFromQuery,
      isListingLoading,
    ],
  )

  return (
    <UpdatePostContext.Provider value={contextValue}>
      {children}
    </UpdatePostContext.Provider>
  )
}

export const useUpdatePost = (): UpdatePostContextType => {
  const context = useContext(UpdatePostContext)
  if (context === undefined) {
    throw new Error('useUpdatePost must be used within an UpdatePostProvider')
  }
  return context
}

export default UpdatePostContext
