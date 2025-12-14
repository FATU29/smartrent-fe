import { useState, useCallback, useEffect } from 'react'
import type { MediaItem } from '@/api/types/property.type'
import type { CreateListingRequest } from '@/api/types/property.type'

export const useMediaManagement = (
  propertyInfo: Partial<CreateListingRequest>,
  setPropertyInfo: (
    updater:
      | ((prev: Partial<CreateListingRequest>) => Partial<CreateListingRequest>)
      | Partial<CreateListingRequest>,
  ) => void,
) => {
  const [media, setMedia] = useState<Partial<MediaItem>[]>([])

  const updateMedia = useCallback((updates: Partial<MediaItem>) => {
    setMedia((prev) => {
      if (updates.mediaType === 'VIDEO') {
        return [...prev.filter((m) => m.mediaType !== 'VIDEO'), updates]
      }
      return [...prev, updates]
    })
  }, [])

  const removeMedia = useCallback((mediaId: number) => {
    setMedia((prev) => prev.filter((m) => m.mediaId !== mediaId))
  }, [])

  const resetMedia = useCallback(() => {
    setMedia((prev) => prev.filter((m) => m.mediaType !== 'VIDEO'))
  }, [])

  // Sync mediaIds to propertyInfo
  useEffect(() => {
    const mediaIds = media
      .filter((item) => item.mediaId !== undefined)
      .map((item) => Number(item.mediaId))
      .filter((id) => !isNaN(id) && id > 0)

    const currentIds = propertyInfo.mediaIds || []

    // Check if arrays are different (order-independent check)
    const sortedMediaIds = [...mediaIds].sort((a, b) => a - b)
    const sortedCurrentIds = [...currentIds].sort((a, b) => a - b)

    const hasChanged =
      sortedMediaIds.length !== sortedCurrentIds.length ||
      sortedMediaIds.some((id, index) => id !== sortedCurrentIds[index])

    if (hasChanged) {
      console.log('🔄 Syncing mediaIds:', {
        from: currentIds,
        to: mediaIds,
        mediaCount: media.length,
      })
      setPropertyInfo((prev) => ({
        ...prev,
        mediaIds,
      }))
    }
  }, [media, propertyInfo.mediaIds, setPropertyInfo])

  return {
    media,
    setMedia,
    updateMedia,
    removeMedia,
    resetMedia,
  }
}
