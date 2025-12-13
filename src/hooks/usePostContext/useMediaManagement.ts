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
    const hasChanged =
      mediaIds.length !== currentIds.length ||
      mediaIds.some((id, index) => id !== currentIds[index])

    if (hasChanged) {
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
