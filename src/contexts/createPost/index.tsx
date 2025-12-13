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

  // Draft loading
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

  // Function to load draft data into form
  const loadDraftIntoForm = (draft: DraftListingResponse) => {
    console.log('🔄 Loading draft into form:', draft)

    // Extract amenity IDs from amenities array
    const amenityIds = draft.amenities?.map((a) => a.amenityId) || []

    // Extract media IDs from media array
    const mediaIds = draft.media?.map((m) => m.mediaId) || []

    // Map backend draft to CreateListingRequest format
    const mappedPropertyInfo: Partial<CreateListingRequest> = {
      title: draft.title,
      description: draft.description,
      listingType: draft.listingType as CreateListingRequest['listingType'],
      vipType: draft.vipType ?? undefined,
      categoryId: draft.categoryId,
      productType: draft.productType as CreateListingRequest['productType'],
      price: draft.price,
      priceUnit: draft.priceUnit as CreateListingRequest['priceUnit'],
      area: draft.area,
      bedrooms: draft.bedrooms,
      bathrooms: draft.bathrooms,
      direction: draft.direction as CreateListingRequest['direction'],
      furnishing: draft.furnishing as CreateListingRequest['furnishing'],
      roomCapacity: draft.roomCapacity ?? undefined,
      waterPrice: draft.waterPrice as CreateListingRequest['waterPrice'],
      electricityPrice:
        draft.electricityPrice as CreateListingRequest['electricityPrice'],
      internetPrice:
        draft.internetPrice as CreateListingRequest['internetPrice'],
      serviceFee: draft.serviceFee as CreateListingRequest['serviceFee'],
      amenityIds: amenityIds,
      mediaIds: mediaIds,
    }

    // Prepare fulltext address update - explicitly reset all fields
    const fulltextAddressUpdate: FulltextAddress = {
      newProvinceCode: '',
      newWardCode: '',
      legacyAddressId: '',
      legacyAddressText: '',
      propertyAddressEdited: false,
    }

    // Map address based on addressType from the nested address object
    const addr = draft.address

    if (
      addr.addressType === 'NEW' &&
      addr.newProvinceCode &&
      addr.newWardCode
    ) {
      mappedPropertyInfo.address = {
        newAddress: {
          provinceCode: addr.newProvinceCode,
          wardCode: addr.newWardCode,
          street: addr.newStreet || undefined,
        },
        latitude: addr.latitude ?? 0,
        longitude: addr.longitude ?? 0,
      }

      // Set fulltext address for NEW type
      fulltextAddressUpdate.newProvinceCode = addr.newProvinceCode
      fulltextAddressUpdate.newWardCode = addr.newWardCode
      fulltextAddressUpdate.legacyAddressId = ''
      fulltextAddressUpdate.legacyAddressText = ''

      console.log(
        '📍 NEW address - Province:',
        addr.newProvinceCode,
        'Ward:',
        addr.newWardCode,
        'Street:',
        addr.newStreet,
      )
    } else if (
      addr.addressType === 'OLD' &&
      addr.legacyProvinceId &&
      addr.legacyDistrictId &&
      addr.legacyWardId
    ) {
      mappedPropertyInfo.address = {
        legacy: {
          provinceId: addr.legacyProvinceId,
          districtId: addr.legacyDistrictId,
          wardId: addr.legacyWardId,
          street: addr.legacyStreet || undefined,
        },
        latitude: addr.latitude ?? 0,
        longitude: addr.longitude ?? 0,
      }

      // For OLD type, clear NEW type fields
      fulltextAddressUpdate.newProvinceCode = ''
      fulltextAddressUpdate.newWardCode = ''

      console.log(
        '📍 OLD/LEGACY address - Province:',
        addr.legacyProvinceId,
        'District:',
        addr.legacyDistrictId,
        'Ward:',
        addr.legacyWardId,
      )
    }

    console.log('✅ Mapped property info:', mappedPropertyInfo)
    console.log('✅ Fulltext address update:', fulltextAddressUpdate)

    // IMPORTANT: Replace fulltextAddress entirely, don't merge with previous state
    setFulltextAddress(fulltextAddressUpdate)
    setPropertyInfo(mappedPropertyInfo)

    // Load media - now we have full media objects, not just IDs
    if (draft.media && draft.media.length > 0) {
      console.log('📷 Loading media from draft:', draft.media.length, 'items')

      // Map from backend MediaItem to context MediaItem format
      const mediaItems: MediaItem[] = draft.media.map((m) => ({
        mediaId: m.mediaId,
        listingId: m.listingId,
        mediaType: m.mediaType as MediaItem['mediaType'],
        sourceType: m.sourceType,
        url: m.url,
        isPrimary: m.isPrimary,
        sortOrder: m.sortOrder,
        status: m.status as MediaItem['status'],
        createdAt: m.createdAt,
      }))

      setMedia(mediaItems)
      console.log('✅ Loaded', mediaItems.length, 'media items')
    } else {
      console.log('📷 No media in draft, clearing media')
      setMedia([])
    }
  }

  useEffect(() => {
    if (draftData?.success && draftData.data) {
      console.log('🎯 Draft data received, loading into form...')
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
      // Draft editing
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
