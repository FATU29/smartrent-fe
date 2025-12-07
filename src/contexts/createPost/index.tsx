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
import { MediaService } from '@/api/services'
import {
  CreateListingRequest,
  MediaItem,
  LISTING_TYPE,
} from '@/api/types/property.type'
import { useGetDraft } from '@/hooks/useListings/useGetDraft'
import type { DraftListingResponse } from '@/api/types/draft.type'

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

  const [propertyInfo, setPropertyInfo] = useState<
    Partial<CreateListingRequest>
  >({
    listingType: LISTING_TYPE.RENT,
  })
  const [fulltextAddress, setFulltextAddress] = useState<FulltextAddress>({})
  const [media, setMedia] = useState<Partial<MediaItem>[]>([])

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
      if (updates.mediaType === 'VIDEO') {
        return [...prev.filter((m) => m.mediaType !== 'VIDEO'), updates]
      }
      return [...prev, updates]
    })
  }

  const removeMedia = (mediaId: number) => {
    setMedia((prev) => prev.filter((m) => m.mediaId !== mediaId))
  }

  const resetMedia = () => {
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
    const street = propertyInfo?.address?.newAddress?.street?.trim()
    if (street) parts.push(street)

    const wardCode =
      fulltextAddress?.newWardCode ||
      (propertyInfo?.address?.newAddress?.wardCode
        ? String(propertyInfo.address.newAddress.wardCode)
        : undefined)
    const ward = newWards.find((w) => w.code === wardCode)
    if (ward?.name) parts.push(ward.name)

    const provinceCode =
      fulltextAddress?.newProvinceCode ||
      (propertyInfo?.address?.newAddress?.provinceCode
        ? String(propertyInfo.address.newAddress.provinceCode)
        : undefined)
    const province = newProvinces.find((p) => p.id === provinceCode)
    if (province?.name) parts.push(province.name)

    return parts.join(', ')
  }, [
    propertyInfo?.address?.newAddress?.street,
    propertyInfo?.address?.newAddress?.wardCode,
    propertyInfo?.address?.newAddress?.provinceCode,
    fulltextAddress?.newWardCode,
    fulltextAddress?.newProvinceCode,
    newWards,
    newProvinces,
  ])

  const legacyAddressText = fulltextAddress?.legacyAddressText || ''
  const composedLegacyAddress = useMemo(() => {
    if (!legacyAddressText) return ''
    const street = propertyInfo?.address?.newAddress?.street?.trim()
    if (street) {
      return `${street}, ${legacyAddressText}`
    }
    return legacyAddressText
  }, [propertyInfo?.address?.newAddress?.street, legacyAddressText])

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

  useEffect(() => {
    const mediaIds = media
      .filter((item) => item.mediaId !== undefined)
      .map((item) => Number(item.mediaId))
      .filter((id) => !isNaN(id) && id > 0)

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
      removeMedia,
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
      videoUploadProgress,
      imagesUploadProgress,
      pendingImagesState,
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
