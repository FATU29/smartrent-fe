import { useMemo } from 'react'
import type { ListingDetail } from '@/api/types'

interface UseMediaThumbnailProps {
  media?: ListingDetail['media']
  fallbackUrl?: string
}

interface UseMediaThumbnailReturn {
  thumbnail: string | null
  primaryImage: ListingDetail['media'][number] | null
  hasVideo: boolean
  hasImage: boolean
  videoThumbnail: string | null
  imageThumbnail: string | null
}

/**
 * Custom hook to get thumbnail from media items
 * Priority: Video thumbnail > Primary image > First image > Fallback
 */
export const useMediaThumbnail = ({
  media,
  fallbackUrl,
}: UseMediaThumbnailProps): UseMediaThumbnailReturn => {
  const result = useMemo(() => {
    if (!media || media.length === 0) {
      return {
        thumbnail: fallbackUrl || null,
        primaryImage: null,
        hasVideo: false,
        hasImage: false,
        videoThumbnail: null,
        imageThumbnail: null,
      }
    }

    // Find video and image items
    const videoItem = media.find((item) => item.mediaType === 'VIDEO')
    const imageItems = media.filter((item) => item.mediaType === 'IMAGE')

    // Find primary image or first image
    const primaryImage =
      imageItems.find((item) => item.isPrimary) || imageItems[0] || null

    // Get video thumbnail (video URL itself can be used as thumbnail source)
    const videoThumbnail = videoItem?.url || null

    // Get image thumbnail
    const imageThumbnail = primaryImage?.url || null

    // Priority: video thumbnail > image thumbnail > fallback
    const thumbnail = videoThumbnail || imageThumbnail || fallbackUrl || null

    return {
      thumbnail,
      primaryImage,
      hasVideo: !!videoItem,
      hasImage: imageItems.length > 0,
      videoThumbnail,
      imageThumbnail,
    }
  }, [media, fallbackUrl])

  return result
}

export default useMediaThumbnail
