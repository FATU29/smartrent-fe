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

  // Track if we're currently loading address to prevent multiple API calls
  const isLoadingAddressRef = useRef(false)

  // Function to load listing data into form
  const loadListingIntoForm = async (listing: ListingDetail) => {
    // Prevent multiple simultaneous calls
    if (isLoadingAddressRef.current) {
      console.log('⚠️ Address loading already in progress, skipping...')
      return
    }

    isLoadingAddressRef.current = true
    console.log('🔄 Loading listing into form:', listing)

    // Extract amenity IDs from amenities array
    const amenityIds = listing.amenities?.map((a) => a.amenityId) || []

    // Extract media IDs from media array
    const mediaIds = listing.media?.map((m) => m.mediaId) || []

    // Map ListingDetail to CreateListingRequest format
    const mappedPropertyInfo: Partial<CreateListingRequest> = {
      title: listing.title,
      description: listing.description,
      listingType: 'RENT' as CreateListingRequest['listingType'],
      categoryId: listing.category?.id,
      productType: listing.productType as CreateListingRequest['productType'],
      price: listing.price,
      priceUnit: listing.priceUnit as CreateListingRequest['priceUnit'],
      area: listing.area,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      direction: listing.direction as CreateListingRequest['direction'],
      furnishing: listing.furnishing as CreateListingRequest['furnishing'],
      roomCapacity: listing.roomCapacity ?? undefined,
      waterPrice: listing.waterPrice as CreateListingRequest['waterPrice'],
      electricityPrice:
        listing.electricityPrice as CreateListingRequest['electricityPrice'],
      internetPrice:
        listing.internetPrice as CreateListingRequest['internetPrice'],
      serviceFee:
        'serviceFee' in listing
          ? (listing.serviceFee as
              | CreateListingRequest['serviceFee']
              | undefined)
          : undefined,
      amenityIds: amenityIds,
      mediaIds: mediaIds,
    }

    // Prepare fulltext address update
    const fulltextAddressUpdate: FulltextAddress = {
      newProvinceCode: '',
      newWardCode: '',
      legacyAddressId: '',
      legacyAddressText: '',
      propertyAddressEdited: false,
    }

    // Map address - ListingDetail has simplified address structure
    const addr = listing.address

    if (addr) {
      // Set coordinates
      const addressText = addr.fullNewAddress || addr.fullAddress || ''

      // Try to extract province code from address string using search
      // Note: The search API doesn't return ward codes, so we'll set province and let user re-select ward
      let provinceCode = ''
      let street = ''

      // Try to search for the address to get province code
      // Only search if we have a meaningful address text (at least 5 characters)
      if (addressText && addressText.trim().length >= 5) {
        try {
          const { AddressService } = await import(
            '@/api/services/address.service'
          )
          console.log('🔍 Searching address:', addressText)
          const searchResult = await AddressService.searchNewAddress(
            addressText.trim(),
            1,
            5,
          )

          if (
            searchResult?.success &&
            searchResult?.data &&
            Array.isArray(searchResult.data) &&
            searchResult.data.length > 0
          ) {
            // Find the best match - prefer matches that have the full address text
            const bestMatch =
              searchResult.data.find(
                (m) =>
                  m.full_address && addressText.includes(m.province_name || ''),
              ) || searchResult.data[0]

            provinceCode = bestMatch.province_code || ''

            // Try to extract street from the address text
            // Address format is usually: "street, ward name, province name"
            const provinceName = bestMatch.province_name || ''
            if (provinceName && addressText.includes(provinceName)) {
              // Remove province name from address to get street + ward
              const remaining = addressText
                .replace(`, ${provinceName}`, '')
                .replace(provinceName, '')
                .trim()

              // Try to extract street (everything before the last comma, which is usually the ward)
              const parts = remaining
                .split(',')
                .map((p) => p.trim())
                .filter(Boolean)
              if (parts.length > 1) {
                // Last part is likely the ward, everything before is the street
                street = parts.slice(0, -1).join(', ')
              } else {
                street = remaining
              }
            } else {
              street = addressText
            }

            console.log('📍 Found address match:', {
              provinceCode,
              provinceName,
              street,
            })
            console.log(
              '📍 Note: Ward code not available from search, user will need to re-select ward',
            )
          }
        } catch (error) {
          console.warn(
            '⚠️ Could not search address, will use text only:',
            error,
          )
        }
      }

      // Set address structure - prefer new address format
      // Since ward code is not available from search, we set province and let user re-select ward
      if (provinceCode) {
        // Set province code, but ward will need to be re-selected by user
        mappedPropertyInfo.address = {
          newAddress: {
            provinceCode,
            wardCode: '', // User will need to re-select ward
            street: street || undefined,
          },
          latitude: addr.latitude ?? 0,
          longitude: addr.longitude ?? 0,
        }

        fulltextAddressUpdate.newProvinceCode = provinceCode
        fulltextAddressUpdate.newWardCode = '' // Will be set when user selects ward
        fulltextAddressUpdate.legacyAddressId = ''
        fulltextAddressUpdate.legacyAddressText = ''
        // Set display address so user can see the full address text
        fulltextAddressUpdate.displayAddress = addressText
        fulltextAddressUpdate.propertyAddress = addressText
        fulltextAddressUpdate.fullAddressNew = addressText
        fulltextAddressUpdate.propertyAddressEdited = true // Mark as edited to prevent auto-update

        console.log(
          '📍 NEW address mapped - Province:',
          provinceCode,
          'Street:',
          street,
        )
        console.log('📍 User will need to re-select ward from the province')
      } else {
        // Fallback: Set coordinates and address text, user will need to re-select province and ward
        mappedPropertyInfo.address = {
          latitude: addr.latitude ?? 0,
          longitude: addr.longitude ?? 0,
        }

        fulltextAddressUpdate.displayAddress = addressText
        fulltextAddressUpdate.propertyAddress = addressText
        fulltextAddressUpdate.fullAddressNew = addressText
        fulltextAddressUpdate.propertyAddressEdited = true // Mark as edited to prevent auto-update

        console.log('📍 Address loaded as text (no codes found):', addressText)
      }

      console.log('📍 Coordinates:', addr.latitude, addr.longitude)
    }

    console.log('✅ Mapped property info:', mappedPropertyInfo)
    console.log('✅ Fulltext address update:', fulltextAddressUpdate)

    setFulltextAddress(fulltextAddressUpdate)
    setPropertyInfo(mappedPropertyInfo)

    // Load media
    if (listing.media && listing.media.length > 0) {
      console.log(
        '📷 Loading media from listing:',
        listing.media.length,
        'items',
      )

      const mediaItems: MediaItem[] = listing.media.map((m) => ({
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
      console.log('📷 No media in listing, clearing media')
      setMedia([])
    }

    // Reset loading flag
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
