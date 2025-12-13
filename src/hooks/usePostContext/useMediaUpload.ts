import { useState, useCallback } from 'react'
import { MediaService } from '@/api/services'
import type { MediaItem } from '@/api/types/property.type'

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

  const uploadPendingImages = useCallback(async (): Promise<
    Array<Partial<MediaItem>>
  > => {
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
  }, [
    pendingImagesState,
    startImagesUpload,
    updateImagesUploadProgress,
    setImagesUploadError,
  ])

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
