import { useState, useCallback } from 'react'
import { MediaService } from '@/api/services'
import type { MediaItem } from '@/api/types/property.type'
import type { MediaItem as ApiMediaItem } from '@/api/types/media.type'

export interface VideoUploadProgressState {
  isUploading: boolean
  progress: number
  error?: string | null
  fileName?: string | null
}

export interface ImagesUploadProgressState {
  isUploading: boolean
  uploadedCount: number
  totalCount: number
  error?: string | null
}

export interface PendingImage {
  file: File
  previewUrl: string
  isCover?: boolean
}

export const useMediaUpload = () => {
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

  const startVideoUpload = useCallback((fileName?: string) => {
    setVideoUploadProgress({
      isUploading: true,
      progress: 0,
      error: null,
      fileName: fileName || null,
    })
  }, [])

  const updateVideoUploadProgress = useCallback((progress: number) => {
    setVideoUploadProgress((prev) => ({ ...prev, progress }))
  }, [])

  const setVideoUploadError = useCallback((message: string) => {
    setVideoUploadProgress((prev) => ({
      ...prev,
      isUploading: false,
      error: message,
    }))
  }, [])

  const resetVideoUploadProgress = useCallback(() => {
    setVideoUploadProgress({
      isUploading: false,
      progress: 0,
      error: null,
      fileName: null,
    })
  }, [])

  const startImagesUpload = useCallback((totalCount: number) => {
    setImagesUploadProgress({
      isUploading: true,
      uploadedCount: 0,
      totalCount,
      error: null,
    })
  }, [])

  const updateImagesUploadProgress = useCallback((uploadedCount: number) => {
    setImagesUploadProgress((prev) => ({
      ...prev,
      uploadedCount,
    }))
  }, [])

  const setImagesUploadError = useCallback((message: string) => {
    setImagesUploadProgress((prev) => ({
      ...prev,
      isUploading: false,
      error: message,
    }))
  }, [])

  const resetImagesUploadProgress = useCallback(() => {
    setImagesUploadProgress({
      isUploading: false,
      uploadedCount: 0,
      totalCount: 0,
      error: null,
    })
  }, [])

  const addPendingImages = useCallback((images: PendingImage[]) => {
    setPendingImagesState((prev) => [...prev, ...images])
  }, [])

  const removePendingImage = useCallback((index: number, isCover?: boolean) => {
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
  }, [])

  const clearPendingImages = useCallback(() => {
    pendingImagesState.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    setPendingImagesState([])
  }, [pendingImagesState])

  const uploadPendingImages = useCallback(
    async (listingId?: number): Promise<Array<Partial<MediaItem>>> => {
      if (pendingImagesState.length === 0) return []

      const uploaded: Array<Partial<MediaItem>> = []
      let uploadedCount = 0

      startImagesUpload(pendingImagesState.length)

      for (const pending of pendingImagesState) {
        try {
          // Upload file directly to R2 via presigned URL (bypasses Vercel
          // 4.5MB body limit). listingId is optional for create-post flow —
          // BE associates the media with the listing on submit.
          const res = await MediaService.uploadViaPresign({
            file: pending.file,
            mediaType: 'IMAGE',
            purpose: 'LISTING',
            listingId,
            isPrimary: pending.isCover || false,
          })

          if (res?.success && res?.data?.url) {
            const data = res.data as ApiMediaItem
            // The legacy property MediaItem only carries the fields the
            // create-post UI actually consumes, so we explicitly project the
            // R2 response onto it (and coerce null -> undefined).
            const mediaItem: Partial<MediaItem> = {
              mediaId: Number(data.mediaId),
              listingId: data.listingId ?? undefined,
              mediaType: 'IMAGE',
              sourceType: data.sourceType,
              url: data.url,
              thumbnailUrl: data.thumbnailUrl ?? undefined,
              isPrimary: pending.isCover || false,
              sortOrder: data.sortOrder,
              fileSize: data.fileSize ?? undefined,
              mimeType: data.mimeType ?? undefined,
              originalFilename: data.originalFilename ?? undefined,
              durationSeconds: data.durationSeconds ?? undefined,
              createdAt: data.createdAt,
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
    },
    [
      pendingImagesState,
      startImagesUpload,
      updateImagesUploadProgress,
      setImagesUploadError,
    ],
  )

  return {
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
  }
}
